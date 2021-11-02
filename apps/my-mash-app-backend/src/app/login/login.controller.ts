import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Res,
} from '@nestjs/common';
import { environment } from '../../environments/environment.prod';
import {
  SignDataJWT,
  ValidateJSONObject,
  VerifyJwtToken,
} from '../General/GeneralFunctions';
import { Response } from '../interfaces/generalInterface';
import { userMainInterface } from '../interfaces/userInterfaces';
import { EventService } from '../services/event.service';

import { FirebaseService } from '../services/firebase.service';
import { UserService } from '../services/user.service';
import { InsertUserValidationObject } from './LoginReq.validator';

@Controller('login')
export class LoginController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService,
    private readonly event: EventService,
    // consumer: MiddlewareConsumer
  ) {
  }

  @Post()
  async firebaselogin(@Body('firebase_token') firebase_token: string) {
    let token_data: any = await this.firebaseService.validateFirebaseLoginTokan(
      firebase_token
    );
      // return token_data;
    if (typeof token_data.email === 'undefined' || token_data.email===null) {
      token_data = await this.firebaseService.getUserDataFormUserId(
        token_data.user_id
      );
    }
    if (
      typeof token_data.email !== 'undefined' ||
      typeof token_data.phone !== 'undefined'
    ) {
      const userData = await this.userService
        .getUserData({
          email: token_data.email ? token_data.email : undefined,
          phone: token_data.phone ? token_data.phone : undefined,
          send_all_data:true
        })
        .catch(() => {
          throw new HttpException('User not Found!', 400);
        });

      if (userData.length === 0) {
        return {
          success: -1,
        };
      } else if (userData.length > 1) {
        throw new HttpException('User not Found!', 400);
      } else {
        const firebaseCustomToken =
          await this.firebaseService.createCustomFirebaseToken(
            userData[0].user_id,
            {
              user_id: userData[0].user_id,
            },
          
          );
        return {
          success: 1,
          accessToken: SignDataJWT(userData[0], environment.accessToken),
          refressToken: SignDataJWT(
            { user_id: userData[0].user_id },
            environment.refreshToken
          ),
          firebaseCustomToken,
        };
      }
    } else {
      return 'asdasd';
    }
  }
  @Post('signup')
  async userSignUp(
    @Body('user_data') userData: userMainInterface,
    @Body('firebase_token') firebase_token: string
  ) {
    if (firebase_token && userData) {
      ValidateJSONObject(userData, InsertUserValidationObject, true);
      const token_data: any = await this.firebaseService
        .validateFirebaseLoginTokan(firebase_token)
        .catch(() => {
          throw new HttpException('Invalid  firebase token', 400);
        });
      if(typeof token_data.phone_number === 'undefined'){
        throw new HttpException('Please Verify Number With Firebase',400)
      }   
      if(typeof token_data.email === 'undefined'){
        throw new HttpException('Please Add Email With Firebase',400)
      }     
      await this.userService
        .InsertUpdateUserMain({
          dob: new Date(userData.dob_timestamp * 1000)
            .toISOString()
            .split('T')[0],
          dob_timestamp: userData.dob_timestamp,
          email: token_data.email || userData.email,
          full_name: userData.full_name,
          phone: token_data.phone_number,
          pronoun: userData.pronoun,
          gender: userData.gender,
        })
        .catch((e) => {
          console.log('error ', e.text||e.message);
          throw new HttpException(e.text||e.message, 400);
        });
      return this.firebaselogin(firebase_token);
    } else {
      throw new HttpException(
        'Please provide firebase token and user data!',
        400
      );
    }
  }
  @Post('refresh_token')
  async getAccessTOkenByRefreshToken(@Body('token') refreshToken: string) {
    if (typeof refreshToken === 'undefined') {
      throw new HttpException('Plz Send Valid Refresh Token', 401);
    }
    const user = await VerifyJwtToken(refreshToken, environment.refreshToken);
    if (typeof user.user_id === 'undefined') {
      throw new HttpException('Plz Send Valid Refresh Token', 401);
    }
    const users = await this.userService.getUserData({
      user_id: user.user_id,
      send_all_data: true,
    });
    if (users.length === 0) {
      throw new HttpException('Plz Send Valid Refresh Token', 401);
    }
    return {
      accessToken: SignDataJWT(users[0], environment.accessToken),
    };
  }
  @Get('is_login')
  isLogin(@Res({ passthrough: true }) res: Response) {
    // return 'aosodiao';
    // res.send(res.locals);
    return res.locals;
  }
}
