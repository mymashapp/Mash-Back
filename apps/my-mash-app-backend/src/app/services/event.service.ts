/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException, Injectable } from '@nestjs/common';
import { QueryExec } from 'query-builder-mysql';
import { GetTimeStamp } from '../General/GeneralFunctions';
import {
  DefaultEventConf,
  EventActivityInterface,
  EventCategoryInterface,
  EventGetReqObjInterface,
  EventJoinedPeopleInterface,
  EventPartyInterface,
  MasheventReqInterface,
  MasheventInterface,
  EventSwipeInterface,
} from '../interfaces/eventInterface';
import { databaseService } from './database.service';
import { FirebaseService } from './firebase.service';
import { firestore } from 'firebase-admin';
import { ChatService } from './chat.service';
@Injectable()
export class EventService {
  private EventDefaultConf: DefaultEventConf;
  private configKeys: string[];

  constructor(
    private dbService: databaseService,
    private fire: FirebaseService,
    private chat: ChatService
  ) {
    this.init();
  }
  private init() {
    this.fire.firestore
      .collection('default_config')
      .doc('event_conf')
      .onSnapshot((a) => {
        this.EventDefaultConf = a.data() as any;
        this.configKeys = Object.keys(this.EventDefaultConf);
      });
  }
  async getEventsData(eventData?: EventGetReqObjInterface) {
    // Released
    const db = await this.dbService.pool.get_connection();
    try {
      if (eventData) {
        if (eventData.event_id) {
          if (Array.isArray(eventData.event_id)) {
            db.where_in('me.event_id', eventData.event_id);
          } else {
            db.where('me.event_id', eventData.event_id);
          }
        }
        if (eventData.user_id) {
          if (Array.isArray(eventData.user_id)) {
            db.where_in('me.user_id', eventData.user_id);
          } else {
            db.where('me.user_id', eventData.user_id);
          }
        }
        if (eventData.event_name) {
          db.where('me.event_name', eventData.event_name);
        }
        if (eventData.event_lat && eventData.event_log) {
          db.where('me.event_lat', eventData.event_lat);
          db.where('me.event_log', eventData.event_log);
        }
        if (eventData.place_name) {
          db.where('me.place_name', eventData.place_name);
        }
        if (eventData.category) {
          if (Array.isArray(eventData.category)) {
            db.where_in('me.category', eventData.category);
          } else {
            db.where('me.category', eventData.category);
          }
        }
        if (eventData.activity) {
          if (Array.isArray(eventData.activity)) {
            db.where_in('me.activity', eventData.activity);
          } else {
            db.where('me.activity', eventData.activity);
          }
        }
        if (eventData.event_date_timestamp) {
          db.where(
            'me.event_date_timestamp >=',
            eventData.event_date_timestamp
          );
        }
        if (eventData.party) {
          if (Array.isArray(eventData.party)) {
            db.where_in('me.party', eventData.party);
          } else {
            db.where('me.party', eventData.party);
          }
        }
        if (eventData.total_allowed_people) {
          if (Array.isArray(eventData.total_allowed_people)) {
            db.where_in(
              'me.total_allowed_people',
              eventData.total_allowed_people
            );
          } else {
            db.where('me.total_allowed_people', eventData.total_allowed_people);
          }
        }
        if (eventData.total_allowed_people) {
          if (Array.isArray(eventData.total_allowed_people)) {
            db.where_in(
              'me.total_allowed_people',
              eventData.total_allowed_people
            );
          } else {
            db.where('me.total_allowed_people', eventData.total_allowed_people);
          }
        }
        if (eventData.dating) {
          db.where('me.dating', eventData.dating);
        }
        if (eventData.status) {
          if (Array.isArray(eventData.status)) {
            db.where_in('me.status', eventData.status);
          } else {
            db.where('me.status', eventData.status);
          }
        }

        if (
          eventData.event_activity_id ||
          eventData.event_activity_name ||
          eventData.send_all_details
        ) {
          db.join('event_activity as ea', 'ea.event_activity_id = me.activity');
          if (eventData.event_activity_id) {
            if (Array.isArray(eventData.event_activity_id)) {
              db.where_in('ea.event_activity_id', eventData.event_activity_id);
            } else {
              db.where('ea.event_activity_id', eventData.event_activity_id);
            }
          }
          if (eventData.event_activity_name) {
            if (Array.isArray(eventData.event_activity_name)) {
              db.where_in(
                'ea.event_activity_name',
                eventData.event_activity_name
              );
            } else {
              db.where('ea.event_activity_name', eventData.event_activity_name);
            }
          }
        }
        if (
          eventData.event_cat_id ||
          eventData.event_cat_name ||
          eventData.send_all_details
        ) {
          db.join('event_cat as ec', 'ec.event_cat_id = me.category');
          if (eventData.event_cat_id) {
            if (Array.isArray(eventData.event_cat_id)) {
              db.where_in('ec.event_cat_id', eventData.event_cat_id);
            } else {
              db.where('ec.event_cat_id', eventData.event_cat_id);
            }
          }
          if (eventData.event_cat_name) {
            if (Array.isArray(eventData.event_cat_name)) {
              db.where_in('ec.event_cat_name', eventData.event_cat_name);
            } else {
              db.where('ec.event_cat_name', eventData.event_cat_name);
            }
          }
        }
        if (
          eventData.event_part_id ||
          eventData.event_party_name ||
          eventData.event_party_peoples ||
          eventData.send_all_details
        ) {
          db.join('event_party as ep', 'ep.event_part_id = ep.party');
          if (eventData.event_part_id) {
            if (Array.isArray(eventData.event_part_id)) {
              db.where_in('ep.event_part_id', eventData.event_part_id);
            } else {
              db.where('ep.event_part_id', eventData.event_part_id);
            }
          }
          if (eventData.event_party_name) {
            if (Array.isArray(eventData.event_party_name)) {
              db.where_in('ep.event_party_name', eventData.event_party_name);
            } else {
              db.where('ep.event_party_name', eventData.event_party_name);
            }
          }
          if (eventData.event_party_peoples) {
            if (Array.isArray(eventData.event_party_peoples)) {
              db.where_in(
                'ep.event_party_peoples',
                eventData.event_party_peoples
              );
            } else {
              db.where('ep.event_party_peoples', eventData.event_party_peoples);
            }
          }
        }
        if (
          eventData.get_all === false &&
          eventData.limit &&
          eventData.stream
        ) {
          db.limit(
            +eventData.limit,
            +eventData.limit * (+eventData.stream - 1)
          );
        }
        if (
          eventData.user_specific_events &&
          eventData.user_specific_events !== null
        ) {
          if (eventData.user_specific_events.join_swipes === true) {
            db.join(
              'event_swipes as es',
              ` es.event_swipes_user_id = ${eventData.user_specific_events.user_id} and es.event_swipes_event_id = me.event_id `,
              'left'
            );
            db.where('es.event_swipes_event_id', null);
          }
          if (
            typeof eventData.user_specific_events.user_lat === 'number' &&
            typeof eventData.user_specific_events.user_log === 'number'
          ) {
            // console.log('jj');
            db.select(
              `69* DEGREES(ACOS(LEAST(1.0, COS(RADIANS(latpoint))
            * COS(RADIANS(event_lat))
            * COS(RADIANS(longpoint) - RADIANS(event_log))
            + SIN(RADIANS(latpoint))
            * SIN(RADIANS(event_lat))))) AS distance_in_miles`,
              false
            );
            if (eventData.user_specific_events.random) {
              db.order_by('RAND()', false);
            }
            db.join(
              `(SELECT  ${eventData.user_specific_events.user_lat}  AS latpoint, ${eventData.user_specific_events.user_log} AS longpoint) AS p`,
              '1=1',
              '',
              false
            );
            if (typeof eventData.user_specific_events.radius !== 'undefined') {
              db.having(
                'distance_in_miles <=',
                +eventData.user_specific_events.radius || 10
              );
            }
            /* 
      <!-- For future Improvements -->
SELECT  *
  FROM (
 SELECT 
z.*,
 p.radius,
        p.distance_unit
                 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(p.latpoint))
                 * COS(RADIANS(z.event_lat))
                 * COS(RADIANS(p.longpoint - z.event_log))
                 + SIN(RADIANS(p.latpoint))
                 * SIN(RADIANS(z.event_lat))))) AS distance
  FROM mash_event AS z
  JOIN (   
        SELECT  42.34784169448538  AS latpoint, -71.07124328613281 AS longpoint,
                10.0 AS radius,      69.0 AS distance_unit
    ) AS p ON 1=1
  WHERE z.event_lat
     BETWEEN p.latpoint  - (p.radius / p.distance_unit)
         AND p.latpoint  + (p.radius / p.distance_unit)
    AND z.event_log
     BETWEEN p.longpoint - (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))
         AND p.longpoint + (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))
 ) AS d
 WHERE distance <= radius
 LIMIT 15 */
          }
        }
        if (eventData.get_only_count === true) {
          // db.select_array = [];
          db.select('me.event_id', false);
        } else {
          db.select('me.*', false);
        }
      }
      console.time('Get Event Time');
      db.from('mash_event as me');
      return db.get().finally(() => {
        console.timeEnd('Get Event Time');
        // console.log(db.last_query_string);
        db.release();
      });
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async InsertSwipe(
    data: {
      event_id: number;
      user_id: number;
      swipe: 0 | 1;
    },
    batch?: firestore.WriteBatch,
    dbInstance?: QueryExec
  ) {
    // Released
    const db = dbInstance || (await this.dbService.pool.get_connection());
    const time = GetTimeStamp();
    try {
      if (typeof dbInstance === 'undefined') {
        db.startTransaction();
      }
      // eslint-disable-next-line prefer-const
      let p = [];
      let event: MasheventInterface;
      if (data.swipe === 1) {
        db.where('event_id', data.event_id);
        const e = await db.get('mash_event');
        event = e[0];
        if (typeof event === 'undefined') {
          throw new HttpException('Invalid Event ID', 400);
        }
        if (
          event.event_type === 'USER' &&
          event.total_allowed_people < event.total_joined_people
        ) {
          throw new HttpException('Event Is Full', 400);
        }
      }
      p.push(
        db.insert('event_swipes', {
          event_swipes_user_id: data.user_id,
          event_swipes_event_id: data.event_id,
          swiped: data.swipe,
          swiped_on: time,
        })
      );

      if (data.swipe === 1) {
        if (
          typeof event.mash_event_chat_id === 'undefined' ||
          event.mash_event_chat_id === null ||
          (event.event_type === 'SYS' &&
            +event.total_joined_people % event.total_allowed_people === 0)
        ) {
          const key = this.fire.RealTimeDatabase.ref().push().key;
          p.push(
            db.update(
              'mash_event',
              {
                mash_event_chat_id: key,
              },
              {
                event_id: data.event_id,
              }
            )
          );

          event.mash_event_chat_id = key;
          p.push(
            this.chat.InsertUpdateChatMain(
              {
                chat_main_event_id: data.event_id,
                chat_main_name: event.event_name,
                chat_main_id: key,
                chat_main_last_update_at: time,
              },
              false,
              db
            )
          );
          p.push(
            db.insert('chat_event_map', {
              chat_event_chat_main_id: event.mash_event_chat_id,
              chat_event_map_event_id: data.event_id,
            })
          );
        }

        p.push(
          this.chat.InsertUpdateChatMainUsers(
            {
              chat_main_users_chat_id: event.mash_event_chat_id,
              chat_main_users_id: data.user_id,
              last_opened_at: time,
            },
            false,
            db
          )
        );
        p.push(
          this.InsertUpdateEventJoindPeople(
            {
              event_joined_people_event_id: data.event_id,
              event_joined_people_extra: '{}',
              event_joined_people_user_id: data.user_id,
            },
            'Ins',
            db
          )
        );
        db.set_for_update(
          'total_joined_people',
          'total_joined_people + 1',
          false
        );
        db.where('event_id', data.event_id);
        // await db.update('mash_event');
        p.push(db.update('mash_event'));
      }
      await Promise.all(p);
      if (typeof dbInstance === 'undefined') {
        db.commitTransaction();
        db.release();
      }
      const batchFirestore = batch || this.fire.firestore.batch();
      batchFirestore.create(
        this.fire.firestore.collection('event_swipes').doc(),
        {
          event_id: this.fire.firestore.doc(`event/${data.event_id}`),
          swiped: data.swipe === 0 ? false : true,
          user_id: this.fire.firestore.doc(`users/${data.user_id}`),
          swiped_on: this.fire.GetFireStoreTimeStampCurrent(),
        }
      );
      this.fire.RealTimeDatabase.ref('events')
        .child('user_swipes')
        .child(data.user_id.toString())
        .set(this.fire.admin.database.ServerValue.increment(1));
      if (data.swipe === 1) {
        const id = data.user_id.toString();
        const temp = {};
        temp[id] = this.fire.firestore
          .collection('users')
          .doc(data.user_id.toString());
        this.fire.RealTimeDatabase.ref('events')
          .child('event_right_swiped')
          .child(data.event_id.toString())
          .child(id)
          .set(true);
        // Batch Undefined Is For Create
        if (typeof batch === 'undefined' && event.event_type === 'USER') {
          batchFirestore.update(
            this.fire.firestore
              .collection('users_per_event')
              .doc(data.event_id.toString()),
            temp
          );
        }
      }
      if (typeof batch === 'undefined') {
        batchFirestore.commit();
      }
      return {
        chat_id: event.mash_event_chat_id,
        total_joinde_people:
          (+event.total_joined_people % event.total_allowed_people) + 1,
      };
    } catch (error) {
      console.log(error);
      if (typeof dbInstance === 'undefined') {
        db.rollupTransaction();
        db.release();
      }
      throw new HttpException(error.text || error.message, 400);
    }
  }
  async getEventsActivity(activityObj: EventActivityInterface) {
    // Released

    const db = await this.dbService.pool.get_connection();
    try {
      if (activityObj) {
        if (activityObj.event_activity_id) {
          if (Array.isArray(activityObj.event_activity_id)) {
            db.where_in('event_activity_id', activityObj.event_activity_id);
          } else {
            db.where('event_activity_id', activityObj.event_activity_id);
          }
        }
        if (activityObj.event_activity_name) {
          if (Array.isArray(activityObj.event_activity_name)) {
            db.where_in('event_activity_name', activityObj.event_activity_name);
          } else {
            db.where('event_activity_name', activityObj.event_activity_name);
          }
        }
      }
      return db.get('event_activity').finally(() => db.release());
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async getEventCategory(categoryObj: EventCategoryInterface) {
    // Released
    const db = await this.dbService.pool.get_connection();
    try {
      if (categoryObj) {
        if (categoryObj.event_cat_id) {
          if (Array.isArray(categoryObj.event_cat_id)) {
            db.where_in('event_cat_id', categoryObj.event_cat_id);
          } else {
            db.where('event_cat_id', categoryObj.event_cat_id);
          }
        }
        if (categoryObj.event_cat_name) {
          if (Array.isArray(categoryObj.event_cat_name)) {
            db.where_in('event_cat_name', categoryObj.event_cat_name);
          } else {
            db.where('event_cat_name', categoryObj.event_cat_name);
          }
        }
      }
      return db.get('event_cat').finally(() => db.release());
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async getEventParty(partyObj: EventPartyInterface) {
    // Released
    const db = await this.dbService.pool.get_connection();
    try {
      if (partyObj) {
        if (partyObj.event_part_id) {
          if (Array.isArray(partyObj.event_part_id)) {
            db.where_in('event_part_id', partyObj.event_part_id);
          } else {
            db.where('event_part_id', partyObj.event_part_id);
          }
        }
        if (partyObj.event_party_name) {
          if (Array.isArray(partyObj.event_party_name)) {
            db.where_in('event_party_name', partyObj.event_party_name);
          } else {
            db.where('event_party_name', partyObj.event_party_name);
          }
        }
        if (partyObj.event_party_peoples) {
          if (Array.isArray(partyObj.event_party_peoples)) {
            db.where_in('event_party_peoples', partyObj.event_party_peoples);
          } else {
            db.where('event_party_peoples', partyObj.event_party_peoples);
          }
        }
      }
      return db.get('event_party').finally(() => db.release());
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async InsertUpdateEvent(
    eventData: MasheventReqInterface,
    where: MasheventReqInterface = {},
    update = false,
    ignore_firebase = false,
    insert_update = false
  ) {
    // Released
    const db = await this.dbService.pool.get_connection();
    try {
      eventData.edited_on = GetTimeStamp();
      if (eventData.event_date_timestamp) {
        eventData.event_date_time = new Date(
          eventData.event_date_timestamp * 1000
        )
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
      }
      const batchFireStore = this.fire.firestore.batch();

      let p: any;
      if (update) {
        // Event Update In Mysq; Database
        this.AddDbWhereForEventTable(db, where);
        p = await db.update('mash_event', eventData);
      } else {
        // Event create In Mysq; Database
        eventData.mash_event_chat_id =
          eventData.mash_event_chat_id ||
          this.fire.RealTimeDatabase.ref().push().key;
        if (insert_update) {
          const updateset = JSON.parse(JSON.stringify(eventData));
          try {
            delete updateset.third_party_unique_id;
          } catch (e) {
            console.log(e);
          }
          p = await db.insert_update('mash_event', eventData, updateset);
        } else {
          p = await db.insert('mash_event', eventData);
        }
        if (eventData.user_id) {
          await this.InsertSwipe(
            {
              event_id: p.insertId,
              swipe: 1,
              user_id: +eventData.user_id,
            },
            batchFireStore,
            db
          );
        }
      }
      db.release();
      if (ignore_firebase === false) {
        const docRef = this.fire.firestore
          .collection('event')
          .doc((update ? eventData.event_id : p.insertId).toString());
        const EventdataToSet = {
          activity: this.fire.firestore.doc(
            `event_activity/${eventData.activity}`
          ),
          allowed_gender: eventData.allowed_gender,
          dating: eventData.dating === 1 ? true : false,
          edited_on: this.fire.firestore_obj_ref.FieldValue.serverTimestamp(),
          event_cat: this.fire.firestore.doc(`event_cat/${eventData.category}`),
          event_Date: eventData.event_date_timestamp
            ? this.fire.firestore_obj_ref.Timestamp.fromMillis(
                +eventData.event_date_timestamp * 1000
              )
            : null,
          event_location: new this.fire.firestore_obj_ref.GeoPoint(
            eventData.event_lat,
            eventData.event_log
          ),
          event_name: eventData.event_name,
          party: this.fire.firestore.doc(`event_party/${eventData.party}`),
          place_name: eventData.place_name,
          status: eventData.status === 1 ? true : false,
          total_allowed_people: eventData.total_allowed_people,
          user_id: this.fire.firestore.doc(`users/${eventData.user_id}`),
        };
        // batchFireStore.set(docRef, EventdataToSet, { merge: true });
        if (update) {
          batchFireStore.update(docRef, EventdataToSet);
        } else {
          batchFireStore.create(docRef, EventdataToSet);
          if (eventData.user_id) {
            const id = eventData.user_id.toString();
            const temp = {};
            temp[id] = this.fire.firestore
              .collection('users')
              .doc(eventData.user_id.toString());
            batchFireStore.create(
              this.fire.firestore.collection('users_per_event').doc(docRef.id),
              temp
            );
            this.fire.RealTimeDatabase.ref('events')
              .child('user_event_create_count')
              .child(eventData.user_id.toString())
              .set(this.fire.admin.database.ServerValue.increment(1));
          }
        }
        batchFireStore.commit();
      }
      return p;
    } catch (e) {
      console.log(e);

      db.release();
      throw e;
    }
  }
  async InsertUpdateEventsActivity(
    activityObj: EventActivityInterface,
    update = false
  ) {
    // Released
    const db = await this.dbService.pool.get_connection();
    try {
      let p: any;
      if (update) {
        p = await db
          .update('event_activity', activityObj, {
            event_activity_id: activityObj.event_activity_id,
          })
          .finally(() => db.release());
      } else {
        p = await db
          .insert('event_activity', activityObj)
          .finally(() => db.release());
      }

      const docRef = this.fire.firestore
        .collection('event_activity')
        .doc((update ? activityObj.event_activity_id : p.insertId).toString());
      const data = {
        event_activity_extra: activityObj.event_activity_extra
          ? activityObj.event_activity_extra
          : null,
        event_activity_name: activityObj.event_activity_name,
      };
      if (update) {
        await docRef.update(data).catch((e) => {
          throw e;
        });
      } else {
        await docRef.create(data).catch((e) => {
          throw e;
        });
      }
      return p;
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async InsertUpdateEventCategory(
    categoryObj: EventCategoryInterface,
    update = false
  ) {
    // Released
    const db = await this.dbService.pool.get_connection();
    try {
      let p: any;
      if (update) {
        p = await db
          .update('event_cat', categoryObj, {
            event_activity_id: categoryObj.event_cat_id,
          })
          .finally(() => db.release());
      } else {
        p = await db
          .insert('event_cat', categoryObj)
          .finally(() => db.release());
      }

      const docRef = this.fire.firestore
        .collection('event_cat')
        .doc((update ? categoryObj.event_cat_id : p.insertId).toString());
      const data = {
        event_cat_extra: categoryObj.event_cat_extra
          ? categoryObj.event_cat_extra
          : null,
        event_cat_name: categoryObj.event_cat_name,
      };
      if (update) {
        await docRef.update(data).catch((e) => {
          throw e;
        });
      } else {
        await docRef.create(data).catch((e) => {
          throw e;
        });
      }
      return p;
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async InsertUpdateEventParty(partyObj: EventPartyInterface, update = false) {
    const db = await this.dbService.pool.get_connection();
    try {
      let p: any;
      if (update) {
        p = await db
          .update('event_party', partyObj, {
            event_part_id: partyObj.event_part_id,
          })
          .finally(() => db.release());
      } else {
        p = await db
          .insert('event_party', partyObj)
          .finally(() => db.release());
      }
      const docRef = this.fire.firestore
        .collection('event_party')
        .doc((update ? partyObj.event_part_id : p.insertId).toString());
      const data = {
        event_party_extra: partyObj.event_party_extra
          ? partyObj.event_party_extra
          : null,
        event_party_name: partyObj.event_party_name,
        event_party_people: partyObj.event_party_peoples,
      };
      if (update) {
        await docRef.update(data).catch((e) => {
          throw e;
        });
      } else {
        await docRef.create(data).catch((e) => {
          throw e;
        });
      }
      return p;
    } catch (e) {
      db.release();
      throw e;
    }
  }
  setDefaultValuesInEventObject(eventObj: MasheventReqInterface) {
    if (eventObj) {
      this.configKeys.forEach((configKey) => {
        if (typeof eventObj[configKey] === 'undefined') {
          eventObj[configKey] = this.EventDefaultConf[configKey];
        }
      });
    }

    return eventObj;
  }
  private AddDbWhereForEventTable(db: QueryExec, data: MasheventReqInterface) {
    if (data.category) {
      if (Array.isArray(data.category)) {
        db.where_in('category', data.category);
      } else {
        db.where('category', data.category);
      }
    }
    if (data.user_id) {
      if (Array.isArray(data.user_id)) {
        db.where_in('use.user_id', data.user_id);
      } else {
        db.where('use.user_id', data.user_id);
      }
    }
    if (data.event_id) {
      if (Array.isArray(data.event_id)) {
        db.where_in('event_id', data.event_id);
      } else {
        db.where('event_id', data.event_id);
      }
    }
  }
  async InsertUpdateEventJoindPeople(
    eventJoined: EventJoinedPeopleInterface,
    type: 'Ins' | 'Del' | 'Upd',
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.dbService.pool.get_connection());
    try {
      let p: Promise<any>;
      if (type === 'Upd') {
        p = db.update('event_joined_people', eventJoined, {
          event_joined_people_id: eventJoined.event_joined_people_id,
        });
      } else if (type === 'Ins') {
        p = db.insert('event_joined_people', eventJoined);
      } else if (type === 'Del') {
        p = db.delete('event_joined_people', eventJoined);
      }
      return p.finally(() => {
        if (typeof dbInstance === 'undefined') {
          db.release();
        }
      });
    } catch (e) {
      if (typeof dbInstance === 'undefined') {
        db.release();
      }
      throw e;
    }
  }

  async undoSwipe(data: { user_id: number; event_id: number }) {
    const db = await this.dbService.pool.get_connection();
    // const time = GetTimeStamp();
    try {
      db.startTransaction();
      // eslint-disable-next-line prefer-const
      let p = [];

      db.where({
        event_joined_people_event_id: data.event_id,
        event_joined_people_user_id: data.user_id,
      });
      const joined_to_event = await db.get('event_joined_people');
      if (joined_to_event.length === 0) {
        throw new HttpException('User Not Allowed', 401);
      }
      p.push(
        db.delete('event_joined_people', {
          event_joined_people_event_id: data.event_id,
          event_joined_people_user_id: data.user_id,
        })
      );
      p.push(
        db.update(
          'event_swipes',
          {
            swiped: 0,
          },
          {
            event_swipes_event_id: data.event_id,
            event_swipes_user_id: data.user_id,
          }
        )
      );
      p.push(
        db.delete('event_swipes', {
          event_swipes_user_id: data.user_id,
          event_swipes_event_id: data.event_id,
        })
      );
      db.set_for_update(
        'total_joined_people',
        'total_joined_people - 1',
        false
      );
      p.push(db.update('mash_event'));

      db.join(
        'chat_main as cm',
        `cmu.chat_main_users_chat_id = cm.chat_main_id`
      );
      db.where('cmu.chat_main_users_id', data.user_id);
      db.where('cm.chat_main_event_id', data.event_id);
      db.select('cmu.chat_main_users_chat_id');
      const msgs = await db.get('chat_main_users as cmu');
      // db.join(
      //   'chat_main as cm',
      //   `cmu.chat_main_users_chat_id = cm.chat_main_id and cmu.chat_main_users_id = ${data.user_id}`
      // );
      // const msgs = await db.get('chat_main_users as cmu');
      if (
        msgs.length === 0 ||
        typeof msgs[0].chat_main_users_chat_id === 'undefined'
      ) {
        throw new HttpException('Something Went Wrong', 500);
      }
      const msgid = msgs[0].chat_main_users_chat_id;
      p.push(
        db.delete('chat_main_users', {
          chat_main_users_id: data.user_id,
          chat_main_users_chat_id: msgid,
        })
      );
      await Promise.all(p);
      db.commitTransaction();
      db.release();
      this.fire.RealTimeDatabase.ref('events')
        .child('event_right_swiped')
        .child(data.event_id.toString())
        .child(data.user_id.toString())
        .set(null);
      this.fire.RealTimeDatabase.ref('messages')
        .child(msgid)
        .child('users')
        .child(data.user_id.toString())
        .set(null);
      this.fire.firestore
        .collection('remash')
        .doc()
        .create({
          event_id: this.fire.firestore.doc(`event/${data.event_id}`),
          user_id: this.fire.firestore.doc(`users/${data.user_id}`),
          remashed_on: this.fire.GetFireStoreTimeStampCurrent(),
        });
      this.fire.RealTimeDatabase.ref('events')
        .child('user_remashes')
        .child(data.user_id.toString())
        .set(this.fire._RealTimeDatavase_Obj_ref.ServerValue.increment(1));
    } catch (error) {
      // console.log(error);
      db.rollupTransaction();
      db.release();
      throw new HttpException(error.text || error.message, error.status || 400);
    }
  }

  private async getEventSwipeData(
    eventSwipeObj: EventSwipeInterface,
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.dbService.pool.get_connection());
    try {
      if (eventSwipeObj) {
        if (eventSwipeObj.event_swipes_event_id) {
          db.where(
            'event_swipes_event_id',
            eventSwipeObj.event_swipes_event_id
          );
        }
        if (eventSwipeObj.event_swipes_id) {
          db.where('event_swipes_id', eventSwipeObj.event_swipes_id);
        }
        if (eventSwipeObj.event_swipes_user_id) {
          db.where('event_swipes_user_id', eventSwipeObj.event_swipes_user_id);
        }
        if (eventSwipeObj.swiped) {
          db.where('swiped', eventSwipeObj.swiped);
        }
      }
      db.from('event_swipes');
      return db.get().finally(() => {
        if (typeof dbInstance === 'undefined') {
          db.release();
        }
      });
    } catch (e) {
      if (typeof dbInstance === 'undefined') {
        db.release();
      }
      throw new HttpException(e.text || e.message, 400);
    }
  }
}
