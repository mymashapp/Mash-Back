import { HttpException, Injectable } from '@nestjs/common';
import { QueryExec } from 'query-builder-mysql';
import { GetTimeStamp } from '../General/GeneralFunctions';
import {
  chatMainInterface,
  ChatMainUserReqInterface,
  chatMainUsersInterface,
} from '../interfaces/chat.interface';
import { databaseService } from './database.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class ChatService {
  constructor(
    private dbService: databaseService,
    private fireSerivce: FirebaseService
  ) {}

  async chatMainUsers(chatReqObj: ChatMainUserReqInterface) {
    const db = await this.dbService.pool.get_connection();
    try {
      if (chatReqObj) {
        if (chatReqObj.chat_main_users_list_id) {
          db.where(
            'cms.chat_main_users_list_id',
            chatReqObj.chat_main_users_list_id
          );
        }
        if (chatReqObj.chat_main_users_chat_id) {
          db.where(
            'cms.chat_main_users_chat_id',
            chatReqObj.chat_main_users_chat_id
          );
        }
        if (chatReqObj.chat_main_users_id) {
          db.where('cms.chat_main_users_id', chatReqObj.chat_main_users_id);
        }
        if (chatReqObj.stream && chatReqObj.limit) {
          db.limit(
            +chatReqObj.limit,
            +chatReqObj.limit * (+chatReqObj.stream - 1)
          );
        }
        if (chatReqObj.self_join_for_user_specific) {
          db.join(
            'chat_main_users as cms1',
            `cms.chat_main_users_chat_id = cms1.chat_main_users_chat_id and cms1.chat_main_users_id = ${chatReqObj.self_join_for_user_specific.user_id} `
          );
          db.join('users_main as um', 'cms.chat_main_users_id = um.user_id');
          db.select('cms.*', false);
          if (chatReqObj.self_join_for_user_specific.get_user_data === true) {
            db.select(['um.full_name']);
          }
        }
        if (chatReqObj.get_all_detils_of_row_with_all_joins) {
          db.join(
            'chat_main as cm',
            'cm.chat_main_id = cms.chat_main_users_chat_id'
          );
          db.join('mash_event as me', 'me.event_id = cm.chat_main_event_id');
          db.select('cms.*, cm.*,me.event_extra', false);
        }
        if (chatReqObj.order_by) {
          db.order_by('cm.chat_main_last_update_at', chatReqObj.order_by);
        }
      }
      db.from('chat_main_users as cms');
      return db.get().finally(() => {
        db.release();
      });
    } catch (e) {
      db.release();
      throw e;
    }
  }
  async InsertUpdateChatMainUsers(
    chatReqObj: chatMainUsersInterface,
    update = false,
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.dbService.pool.get_connection());
    try {
      const p: Promise<any>[] = [];
      if (update) {
        p.push(
          db.update('chat_main_users', chatReqObj, {
            chat_main_users_list_id: chatReqObj.chat_main_users_list_id,
          })
        );
      } else {
        p.push(db.insert('chat_main_users', chatReqObj));
        db.set_for_update(
          'chat_main_total_joined_people',
          'chat_main_total_joined_people + 1',
          false
        );
        db.where('chat_main_id', chatReqObj.chat_main_users_chat_id);
        // await db.update('mash_event');
        p.push(db.update('chat_main'));
      }

      if (!update) {
        const db_ref = this.fireSerivce.RealTimeDatabase.ref('messages').child(
          chatReqObj.chat_main_users_chat_id
        );
        db_ref
          .child('users')
          .child(chatReqObj.chat_main_users_id.toString())
          .set(true);
        db_ref
          .child('total_joined_people')
          .set(
            this.fireSerivce._RealTimeDatavase_Obj_ref.ServerValue.increment(1)
          );
      }

      return Promise.all(p).finally(() => {
        if (typeof dbInstance === 'undefined') {
          db.release();
        }
      });
    } catch (error) {
      if (typeof dbInstance === 'undefined') {
        db.release();
      }
      throw new HttpException(error.text, 400);
    }
  }

  async InsertUpdateChatMain(
    chatMainReqObj: chatMainInterface,
    update = false,
    dbInstance?: QueryExec
  ) {
    const db = dbInstance || (await this.dbService.pool.get_connection());
    try {
      let p: Promise<any>;
      if (update) {
        p = db.update('chat_main', chatMainReqObj, {
          chat_main_users_list_id: chatMainReqObj.chat_main_id,
        });
      } else {
        chatMainReqObj.chat_created_at = GetTimeStamp();
        p = db.insert('chat_main', chatMainReqObj);
      }

      if (!update) {
        this.fireSerivce.RealTimeDatabase.ref('messages')
          .child(chatMainReqObj.chat_main_id)
          .set({
            total_joined_people:
              chatMainReqObj.chat_main_total_joined_people || 0,
            event_id: chatMainReqObj.chat_main_event_id,
            last_updated_at:
              this.fireSerivce._RealTimeDatavase_Obj_ref.ServerValue.TIMESTAMP,
            name: chatMainReqObj.chat_main_name,
          });
      }

      return p.finally(() => {
        if (typeof dbInstance === 'undefined') {
          db.release();
        }
      });
    } catch (error) {
      if (typeof dbInstance === 'undefined') {
        db.release();
        throw new HttpException(error.text || error.messages, 400);
      } else {
        throw error;
      }
    }
  }

  async sendMessage(text: string, chat_id: string, user_id: number) {
    const db_ref =
      this.fireSerivce.RealTimeDatabase.ref('messages').child(chat_id);
    const db = await this.dbService.pool.get_connection();
    db.update(
      'chat_main',
      {
        chat_main_last_update_at: GetTimeStamp(),
      },
      {
        chat_main_id: chat_id,
      }
    ).finally(() => {
      db.release();
    });
    db_ref
      .child('last_updated_at')
      .set(this.fireSerivce._RealTimeDatavase_Obj_ref.ServerValue.TIMESTAMP);
    return await db_ref.child('msgs').push().ref.set({
      msg: text,
      timestamp:
        this.fireSerivce._RealTimeDatavase_Obj_ref.ServerValue.TIMESTAMP,
      user_id: user_id,
    });
  }
  async chatOpened(chat_id: string, user_id: string) {
    const db = await this.dbService.pool.get_connection();
    return db
      .update(
        'chat_main_users',
        {
          last_opened_at: GetTimeStamp(),
        },
        {
          chat_main_users_chat_id: chat_id,
          chat_main_users_id: user_id,
        }
      )
      .finally(() => {
        db.release();
      });
  }
}
