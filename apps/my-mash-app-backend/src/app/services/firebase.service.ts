import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { environment } from '../../environments/environment.prod';
@Injectable()
export class FirebaseService {
  private app: admin.app.App;
  admin = admin;
  firestore: admin.firestore.Firestore;
  firestore_obj_ref = admin.firestore;
  _RealTimeDatavase_Obj_ref = admin.database;
  RealTimeDatabase: admin.database.Database;
  fireStorage: admin.storage.Storage;
  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(
        environment.firebase_config as admin.ServiceAccount
      ),
      databaseURL: environment.firebase_config.database_url,
      storageBucket: environment.firebase_config.storageBucket,
    });
    this.RealTimeDatabase = admin.database(this.app);
    this.firestore = admin.firestore(this.app);
    this.fireStorage = admin.storage();

    this.RealTimeDatabase.ref('node_server')
      .child('server_refresh')
      .set(admin.database.ServerValue.increment(1));
    // console.log();
  }
  GetFireStoreTimeStampCurrent() {
    return admin.firestore.Timestamp.now();
  }
  async validateFirebaseLoginTokan(token: string) {
    return await admin
      .auth()
      .verifyIdToken(token)
      .catch(() => {
        throw new HttpException(
          'firebase token not valid!',
          HttpStatus.BAD_REQUEST
        );
      });
  }
  async getUserDataFormUserId(userId: string) {
    return await admin
      .auth()
      .getUser(userId)
      .catch(() => {
        throw new HttpException('User ID not valid!', HttpStatus.BAD_REQUEST);
      });
  }

  async createCustomFirebaseToken(userId: string, additionalData = {}) {
    return admin.auth().createCustomToken(userId.toString(), additionalData);
  }
}
