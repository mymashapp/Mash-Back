import { Injectable } from '@nestjs/common';
import { GetTimeStamp } from '../General/GeneralFunctions';
import { MasheventReqInterface } from '../interfaces/eventInterface';
import { YelpResponsed } from '../interfaces/yelp.scrape.interfaces';
import { databaseService } from './database.service';
import { EventService } from './event.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class YelpScrapeService {
  api_count = 0;
  YelpScrapConf: YelpConfFirestore;
  constructor(
    private dbservices: databaseService,
    private firebase: FirebaseService,
    private event_service: EventService
  ) {
    this.init();
  }
  private async init() {
    this.firebase.RealTimeDatabase.ref('node_server')
      .child('yelp_api_count')
      .on('value', (a) => {
        this.api_count = a.val();
      });
    // const YelpScrapConf: YelpConfFirestore = (
    this.firebase.firestore
      .collection('default_config')
      .doc('yelp_scrap')
      .onSnapshot((a) => {
        this.YelpScrapConf = a.data() as any;
      });
    // ).data() as any;
  }
  CallYelpBuisnessApi(
    data: {
      categories?: string;
      limit: string;
      offset: string;
      location?: string;
      latitude?: string | number;
      longitude?: string | number;
    },
    api_key: string
  ): Promise<YelpResponsed> {
    this.firebase.RealTimeDatabase.ref('node_server')
      .child('yelp_api_count')
      .set(this.firebase._RealTimeDatavase_Obj_ref.ServerValue.increment(-1));
    return this.dbservices
      .get<any>('https://api.yelp.com/v3/businesses/search', {
        params: data,
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
      })
      .then((a) => a.data);
  }
  async scrapeFromRestApi() {
    const YelpScrapConf: YelpConfFirestore = this.YelpScrapConf;
    const api_calls_per_cat =
      Math.ceil(YelpScrapConf.total_allowed_to_beScrapedPerCat / 50) *
      YelpScrapConf.cat.length;

    const LocationJSON = (
      await this.firebase.RealTimeDatabase.ref('yelp_scrap')
        .child('to_be_scraped')
        .get()
    ).val();
    if (typeof LocationJSON === 'undefined' || LocationJSON === null) {
      return;
    }
    const Locations = Object.keys(LocationJSON);
    for (const locatoin of Locations) {
      if (this.api_count - api_calls_per_cat <= 0) {
        return;
      }
      const p = YelpScrapConf.cat.map((cat) => {
        return this.ScrapeDetailesAndUpdateDatabaseForCat(
          cat,
          locatoin,
          YelpScrapConf.total_allowed_to_beScrapedPerCat
        );
      });
      await Promise.all(p);
      console.log(`${locatoin} Scraped`);

      this.firebase.RealTimeDatabase.ref('yelp_scrap')
        .child('to_be_scraped')
        .child(locatoin)
        .set(null);
      this.firebase.RealTimeDatabase.ref('yelp_scrap')
        .child('scraped')
        .child(locatoin)
        .set(true);
    }
  }
  async ScrapForCatAndLatLong(
    cat: string[],
    locatoin: {
      latitude?: string | number;
      longitude?: string | number;
    }
  ) {
    cat.map((cat) => {
      return this.ScrapeDetailesAndUpdateDatabaseForCat(
        cat,
        locatoin,
        this.YelpScrapConf.total_allowed_to_beScrapedPerCat
      );
    });
  }
  private async ScrapeDetailesAndUpdateDatabaseForCat(
    cat: string,
    locatoin:
      | string
      | {
          latitude?: string | number;
          longitude?: string | number;
        },
    total: number
  ) {
    const returnPromise = [];
    const limit = 50;
    let offset = 0;
    const params_for_api: any = {
      categories: cat,
      limit: limit.toString(),
      // location: locatoin,
      offset: offset.toString(),
    };
    if (typeof locatoin === 'string') {
      params_for_api.location = locatoin;
    } else {
      params_for_api.latitude = locatoin.latitude;
      params_for_api.longitude = locatoin.longitude;
    }
    while (limit + offset <= total) {
      const data = await this.CallYelpBuisnessApi(
        Object.assign(params_for_api, {
          limit: limit.toString(),
          offset: offset.toString(),
        }),
        this.YelpScrapConf.api_key
      ).catch(() => {
        return {
          total: 0,
          businesses: [],
        };
      });
      console.log(`${cat} ${limit + offset} Scraped For ${locatoin}`);
      if (total > data.total) {
        total = data.total;
      }
      // const db = await this.dbservices.pool.get_connection();
      const p = this.InsertYelpDataToDatabase(data, cat);
      try {
        returnPromise.push(Promise.all(p));
      } catch (error) {
        console.log(error);
      }
      offset = offset + limit;
    }
    try {
      await Promise.all(returnPromise);
      console.log(`${cat} Scraped For ${locatoin}`);
    } catch (error) {
      console.log(error);
    }
  }
  InsertYelpDataToDatabase(data: YelpResponsed, cat: string) {
    const time = GetTimeStamp();
    return data.businesses.map((a) => {
      if (a.is_closed === true) {
        return Promise.resolve(true);
      }
      const event: MasheventReqInterface = {
        allowed_gender: 'A',
        category: +this.YelpScrapConf.cat_json[cat],
        dating: 0,
        activity: 0,
        edited_on: time,
        event_lat: a.coordinates.latitude,
        event_log: a.coordinates.longitude,
        party: 0,
        place_name: a.name,
        third_party_unique_id: a.id,
        status: 1,
        event_type: 'SYS',
        total_allowed_people: 3,
        total_joined_people: 0,
        event_name: a.name,
        event_extra: JSON.stringify(a),
      };
      return this.event_service.InsertUpdateEvent(event, {}, false, true, true);
    });
  }
}
export interface YelpConfFirestore {
  cat_json: {
    [key: string]: string;
  };
  total_allowed_to_beScrapedPerCat: number;
  cat: string[];
  api_key: string;
}
