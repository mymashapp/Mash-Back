import {
  Body,
  Controller,
  Get,
  HttpException,
  Optional,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  DailyRemash,
  DailySwipes,
  ValidateJSONObject,
} from '../General/GeneralFunctions';
import {
  EventGetReqObjInterface,
  MasheventReqInterface,
} from '../interfaces/eventInterface';
import {
  EventSwipeValidationObject,
  InsertMashValidationObject,
} from './EventReq.validator';
import { EventService } from '../services/event.service';
import { Response } from '../interfaces/generalInterface';
import { UserService } from '../services/user.service';
import { UserAllDatainterfce } from '../interfaces/userInterfaces';
import { FirebaseService } from '../services/firebase.service';
import { YelpScrapeService } from '../services/yelp.scrape.service';

@Controller('event')
export class EventController {
  constructor(
    private readonly userService: UserService,
    private eventService: EventService,
    private fireService: FirebaseService,
    private yelpService: YelpScrapeService
  ) {
    // eventService
    //   .getEventsData({
    //     user_specific_events: {
    //       user_id: 0,
    //     },
    //   })
    //   .then((a) => {
    //     if (a.length > 0) {
    //       // console.log(a);
    //     }
    //     // console.log(data);
    //   });
  }
  @Put('insert_update_event')
  async CreateEvent(
    @Body() eventData: MasheventReqInterface,
    @Res({ passthrough: true }) res: Response
  ) {
    eventData.user_id = res.locals.user.user_id;
    if (eventData.event_date_timestamp * 1000 < new Date().getTime()) {
      throw new HttpException('Can not create event in past!', 400);
    }

    if (ValidateJSONObject(eventData, InsertMashValidationObject)) {
      eventData = this.eventService.setDefaultValuesInEventObject(eventData);
      if (typeof eventData.party !== 'undefined') {
        eventData.total_allowed_people = (
          await this.eventService.getEventParty({
            event_part_id: eventData.party,
          })
        )[0].event_party_peoples;
      }
      eventData.event_type = 'USER';
      try {
        const result = await this.eventService.InsertUpdateEvent(eventData);
        if (result) {
          return {
            success: 1,
          };
        }
      } catch (e) {
        console.log('--');
        throw new HttpException(e, 400);
      }
    }
  }

  @Put('user_event_swiped')
  async UserSwiped(
    @Body('event_id') event_id: number,
    @Body('swiped') swiped: boolean,
    @Res({ passthrough: true }) res: Response
  ) {
    const user: UserAllDatainterfce = res.locals.user;
    const user_id = user.user_id;
    if (user.user_basic_premium_stauts === 0) {
      const totalSwipes = await this.userService.GetUserSwipes(
        user_id.toString()
      );
      if (
        typeof totalSwipes !== 'undefined' &&
        totalSwipes !== null &&
        totalSwipes >= DailySwipes
      ) {
        throw new HttpException('Daily Quota exceeded', 400);
      }
    }
    if (ValidateJSONObject({ event_id, swiped }, EventSwipeValidationObject)) {
      const result = await this.eventService.InsertSwipe({
        event_id: event_id,
        swipe: swiped ? 1 : 0,
        user_id: user_id,
      });
      return {
        success: 1,
        extra:result,
      };
    }
  }
  @Get(['neighbourhood'])
  async GetneighbourhoodEvents(
    @Query('user_lat') user_lat: number,
    @Query('user_log') user_log: number,
    @Query() eventReq: EventGetReqObjInterface,
    @Res({ passthrough: true }) res: Response
  ) {
    eventReq.limit = +eventReq.limit;
    eventReq.limit = eventReq.limit < 50 ? eventReq.limit : 50;
    eventReq.random = 'false';
    return this.getEvents(user_lat, user_log, eventReq, res, true);
  }
  @Get([''])
  async getEvents(
    @Query('user_lat') user_lat: number,
    @Query('user_log') user_log: number,
    @Query() eventReq: EventGetReqObjInterface,
    @Res({ passthrough: true }) res: Response,
    @Optional() ignore_limitation = false
  ) {
    if (
      eventReq.ignore_user_specific !== 'true' &&
      (typeof user_lat === 'undefined' ||
        typeof user_log === 'undefined' ||
        !user_lat ||
        !user_log ||
        isNaN(+user_lat) ||
        isNaN(+user_log))
    ) {
      throw new HttpException('Pass users lat and log!', 400);
    }
    if (typeof eventReq.limit === 'undefined' || isNaN(+eventReq.limit)) {
      throw new HttpException('Please Use Streaming to get Events', 400);
    }
    eventReq.get_all = false;
    eventReq.stream = 1;
    const user: UserAllDatainterfce = res.locals.user;
    const user_id = user.user_id;
    if (user.user_basic_premium_stauts === 0 && ignore_limitation === false) {
      const totalSwipes = await this.userService.GetUserSwipes(
        user_id.toString()
      );
      if (
        typeof totalSwipes !== 'undefined' &&
        totalSwipes !== null &&
        totalSwipes >= DailySwipes
      ) {
        throw new HttpException('Daily Quota exceeded', 601);
      }
      eventReq.limit =
        DailySwipes - totalSwipes < +eventReq.limit
          ? DailySwipes - totalSwipes
          : +eventReq.limit;
    }
    if (eventReq.ignore_user_specific === 'true') {
      eventReq.user_specific_events = null;
    } else {
      eventReq.user_specific_events = {
        // radius: +res.locals.user.distance,
        radius: 19,
        user_id: user_id,
        user_lat: +user_lat,
        user_log: +user_log,
      };
      eventReq.user_specific_events.join_swipes =
        eventReq.ignore_swipes === 'true' ? false : !ignore_limitation;
      eventReq.user_specific_events.random =
        eventReq.random === 'true' ? true : false;
    }
    const events = await this.eventService.getEventsData(eventReq);
    if (events.length > 0) {
      return {
        success: 1,
        data: events,
        total: events.length,
      };
    } else {
      if (eventReq.calling_again === 'true') {
        eventReq.user_specific_events.join_swipes = false;
        eventReq.user_specific_events.radius = 100;
        eventReq.user_specific_events.random = false;
        eventReq.get_only_count = true;
        delete eventReq.limit;
        const total_event: number = (
          await this.eventService.getEventsData(eventReq)
        ).length;
        if (total_event > 0) {
          throw new HttpException('No Places Found For You', 600);
        }
      }
      if (this.yelpService.api_count <= 10) {
        throw new HttpException('Daily Quota Finished For Yelp', 500);
      } else {
        const result = await this.yelpService.CallYelpBuisnessApi(
          {
            offset: '0',
            limit: '50',
            categories: this.yelpService.YelpScrapConf.cat[0],
            latitude: user_lat,
            longitude: user_log,
          },
          this.yelpService.YelpScrapConf.api_key
        );
        if (result.total < 10) {
          throw new HttpException('We Are Coming Soon At This Location', 602);
        } else {
          this.yelpService.InsertYelpDataToDatabase(
            result,
            this.yelpService.YelpScrapConf.cat[0]
          );
        }
        this.yelpService.ScrapForCatAndLatLong(
          this.yelpService.YelpScrapConf.cat,
          {
            latitude: +user_lat,
            longitude: +user_log,
          }
        );
        throw new HttpException(
          'Please Wait For 10 Seconds We Are Updating Database Fot Your Locatoin',
          603
        );
      }
      // throw new HttpException('Not data found', 400);
    }
  }

  @Put('remash')
  async remash(
    @Body('event_id') event_id: number,
    @Res({ passthrough: true }) res: Response
  ) {
    const user_id = res.locals.user.user_id;
    if (typeof event_id === 'undefined') {
      throw new HttpException('please pass event_id', 400);
    }
    if (res.locals.user.user_basic_premium_stauts === 0) {
      const temp = (
        await this.fireService.RealTimeDatabase.ref('events')
          .child('user_remashes')
          .child(user_id.toString())
          .get()
      ).val();
      // console.log(temp.val());

      if (temp !== null && temp >= DailyRemash) {
        throw new HttpException('Daily quota exosted', 403);
      }
    }
    return this.eventService.undoSwipe({ event_id, user_id }).then(() => {
      return {
        success: 1,
      };
    });
  }
}
