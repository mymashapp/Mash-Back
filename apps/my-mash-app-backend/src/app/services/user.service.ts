import { Injectable } from '@nestjs/common';
import { Pool, QueryExec } from 'query-builder-mysql';
import { fillterData, GetTimeStamp } from '../General/GeneralFunctions';
import {
  DefaultUserBasicConfig,
  DefaultUserPreferanceConfig,
  userBasicInterface,
  userMainInterface,
  userPreferaceInterface,
  userReqInterface,
} from '../interfaces/userInterfaces';
import { databaseService } from './database.service';
import { FirebaseService } from './firebase.service';
import { environment } from '../../environments/environment';
import { format } from 'util';
@Injectable()
export class UserService {
  private UserBasicDefaultConf: DefaultUserBasicConfig;
  private userBaiscKeys: string[];
  private pool: Pool;
  private UserPreferanceDefaultConfig: DefaultUserPreferanceConfig;
  private userPreKeys: string[];
  constructor(
    private dbService: databaseService,
    private fire: FirebaseService
  ) {
    this.pool = dbService.pool;
    this.init();
  }
  private init() {
    this.fire.firestore
      .collection('default_config')
      .doc('user_basic_conf')
      .onSnapshot((a) => {
        this.UserBasicDefaultConf = a.data() as any;
        this.userBaiscKeys = Object.keys(this.UserBasicDefaultConf);
      });
    this.fire.firestore
      .collection('default_config')
      .doc('user_pref_conf')
      .onSnapshot((a) => {
        this.UserPreferanceDefaultConfig = a.data() as any;
        this.userPreKeys = Object.keys(this.UserPreferanceDefaultConfig);
      });
  }
  setDefaultUserBasicConfig(userBasic: userBasicInterface) {
    if (userBasic) {
      this.userBaiscKeys.forEach((configKey) => {
        if (typeof userBasic[configKey] === 'undefined') {
          userBasic[configKey] = this.UserBasicDefaultConf[configKey];
        }
      });
    }

    return userBasic;
  }
  async GetUserSwipes(user_id: string):Promise<number|null> {
    return (await this.fire.RealTimeDatabase.ref('events')
      .child('user_swipes')
      .child(user_id)
      .get()).val();
  }
  setDefaultUserPrefConfig(userPref: userPreferaceInterface) {
    if (userPref) {
      this.userPreKeys.forEach((configKey) => {
        if (typeof userPref[configKey] === 'undefined') {
          userPref[configKey] = this.UserPreferanceDefaultConfig[configKey];
        }
      });
    }

    return userPref;
  }
  async getUserData(userData?: userReqInterface) {
    const db = await this.pool.get_connection();
    try {
      if (userData) {
        if (userData.email) {
          if (Array.isArray(userData.email)) {
            db.where_in('u.email', userData.email);
          } else {
            db.where('u.email', userData.email);
          }
        }
        if (userData.user_id) {
          if (Array.isArray(userData.user_id)) {
            db.where_in('u.user_id', userData.user_id);
          } else {
            db.where('u.user_id', userData.user_id);
          }
        }
        if (userData.school) {
          db.where('u.school', userData.school);
        }
        if (userData.pronoun) {
          db.where('u.pronoun', userData.pronoun);
        }
        if (userData.gender) {
          if (Array.isArray(userData.gender)) {
            db.where_in('u.gender', userData.gender);
          } else {
            db.where('u.gender', userData.gender);
          }
        }
        if (userData.height) {
          db.where('u.height <=', userData.height);
        }
        if (userData.phone) {
          if (Array.isArray(userData.phone)) {
            db.where_in('u.phone', userData.phone);
          } else {
            db.where('u.phone', userData.phone);
          }
        }
        if (userData.dob_timestamp) {
          db.where('u.dob_timestamp <=', userData.dob_timestamp);
        }
        if (userData.full_name) {
          db.where('u.full_name', userData.full_name);
        }
        if (
          userData.user_basic_id ||
          userData.user_basic_premium_stauts ||
          userData.user_basic_review ||
          userData.user_basic_user_id ||
          userData.send_all_data
        ) {
          db.join('user_basic as ub', ' ub.user_basic_user_id =u.user_id');
          if (userData.user_basic_id) {
            if (Array.isArray(userData.user_basic_id)) {
              db.where_in('ub.user_basic_id', userData.user_basic_id);
            } else {
              db.where('ub.user_basic_id', userData.user_basic_id);
            }
          }
          if (userData.user_basic_premium_stauts) {
            db.where(
              'ub.user_basic_premium_stauts',
              userData.user_basic_premium_stauts
            );
          }
          if (userData.user_basic_review) {
            db.where('ub.user_basic_review >=', userData.user_basic_review);
          }
          if (userData.user_basic_user_id) {
            db.where('ub.user_basic_user_id', userData.user_basic_user_id);
          }
        }
        if (
          userData.user_pref_id ||
          userData.distance ||
          userData.min_age ||
          userData.max_age ||
          userData.user_pref_user_id ||
          userData.send_all_data
        ) {
          db.join('user_pref as up', 'up.user_pref_user_id = u.user_id');
          if (userData.user_pref_id) {
            if (Array.isArray(userData.user_pref_id)) {
              db.where_in('up.user_pref_id', userData.user_pref_id);
            } else {
              db.where('up.user_pref_id', userData.user_pref_id);
            }
          }
          if (userData.distance) {
            db.where('up.distance <=', userData.distance);
          }
          if (userData.min_age) {
            db.where('up.min_age <=', userData.min_age);
          }
          if (userData.max_age) {
            db.where('up.max_age <=', userData.max_age);
          }
          if (userData.geneder_pre) {
            db.where('up.geneder_pre ', userData.geneder_pre);
          }
          if (userData.user_pref_edited_on) {
            db.where('up.user_pref_edited_on', userData.user_pref_edited_on);
          }
        }
        if (
          userData.stream_get_all === false &&
          userData.limit &&
          userData.stream
        ) {
          db.limit(+userData.limit, +userData.limit * (+userData.stream - 1));
        }
      }
      return db.get('users_main as u').finally(() => db.release());
    } catch (e) {
      db.release();
      return [];
    } finally {
      // console.log(db.last_query_string);
    }
  }
  async InsertUpdateUserMain(
    userData: userMainInterface,
    update = false,
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.pool.get_connection());
    try {
      userData.edited_on = GetTimeStamp();
      let p: any;
      let promiArr: Promise<any>[] = [];
      if (update && userData.user_id) {
        p = await db.update('users_main', userData, {
          user_id: userData.user_id,
        });
      } else {
        p = await db.insert('users_main', userData);
        promiArr.push(
          this.InsertUpdateUserBasic(
            {
              user_basic_user_id: +p.insertId,
            },
            false,
            db
          )
        );
        promiArr.push(
          this.InsertUpdateUserPreferance(
            {
              user_pref_user_id: +p.insertId,
            },
            false,
            db
          ).catch((e) => {
            throw e;
          })
        );
      }
      await Promise.all(promiArr);
      promiArr = [];
      if (typeof dbInstance === 'undefined') {
        db.release();
      }
      const docRef = this.fire.firestore
        .collection('users')
        .doc((update ? userData.user_id : p.insertId).toString());
      const dataToSet = {
        dob: this.fire.firestore_obj_ref.Timestamp.fromMillis(
          +userData.dob_timestamp * 1000
        ),
        email: userData.email,
        full_name: userData.full_name,
        gender: userData.gender,
        phone: +userData.phone,
      };
      if (!update) {
        dataToSet['user_review'] = 0;
        promiArr.push(
          docRef.create(dataToSet).catch((e) => {
            throw e;
          })
        );
        userData = fillterData(userData);
        promiArr.push(
          await this.fire.RealTimeDatabase.ref()
            .child('users')
            .child(docRef.id)
            .set(userData)
        );
      }
      return p;
    } catch (e) {
      if (typeof dbInstance === 'undefined') {
        db.release();
      }
      throw e;
    }
  }
  async InsertUpdateUserBasic(
    userBasic: userBasicInterface,
    update = false,
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.pool.get_connection());
    try {
      let p: Promise<any>;
      if (update && userBasic.user_basic_id) {
        p = db.update('user_basic', userBasic, {
          user_basic_id: userBasic.user_basic_id,
        });
      } else {
        userBasic = this.setDefaultUserBasicConfig(userBasic);
        p = db.insert('user_basic', userBasic);
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
  async InsertUpdateUserPreferance(
    userPref: userPreferaceInterface,
    update = false,
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.pool.get_connection());
    const time = GetTimeStamp();
    userPref.user_pref_edited_on = time;
    try {
      let p: Promise<any>;
      if (update && userPref.user_pref_id) {
        p = db.update('user_pref', userPref, {
          user_pref_id: userPref.user_pref_id,
        });
      } else {
        userPref = this.setDefaultUserPrefConfig(userPref);
        p = db.insert('user_pref', userPref);
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
  async updateUserData(userData: userReqInterface) {
    const db = await this.pool.get_connection();
    try {
      if (userData) {
        if (userData.user_id) {
          await this.InsertUpdateUserMain(userData, true, db);
        }
        if (
          userData.user_pref_id &&
          userData.user_id === userData.user_pref_user_id
        ) {
          await this.InsertUpdateUserPreferance(userData, true, db);
        }
        db.release();
      }
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async updateProfilePic(path: string, fileObj: any) {
    //todo
    return new Promise<{
      message: string;
      url?: string;
      bucket_path?: string;
    }>((res, rej) => {
      try {
        const bucket = this.fire.fireStorage.bucket(
          environment.firebase_config.storageBucket
        );
        const file = bucket.file(path);

        const stream = file.createWriteStream({
          resumable: false,
        });
        stream.on('error', (err) => {
          console.log('error->', err.message);

          rej(err);
        });

        stream.on('finish', async () => {
          // Create URL for directly file access via HTTP.
          const publicUrl = format(
            `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.name}`
          );
          try {
            // Make the file public
            // const uel = await bucket.getSignedUrl({
            //   action:'list',
            //   expires:Date.now() + 200
            // })
            // // console.log(uel);
            // await bucket.file(path).makePublic();
          } catch (error) {
            console.log(error);
            res({
              message: `Uploaded the file successfully: ${fileObj.originalname}, but public access is denied!`,
              url: publicUrl,
              bucket_path: file.name,
            });
          }
          res({
            message: 'Uploaded the file successfully: ' + fileObj.originalname,
            url: publicUrl,
            bucket_path: file.name,
          });
        });
        stream.end(fileObj.buffer);
      } catch (err) {
        res({
          message: `Could not upload the file: ${fileObj.originalname}. ${err}`,
        });
      }
    });
  }
}
