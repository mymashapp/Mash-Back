import { HttpException } from '@nestjs/common';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import { environment } from '../../environments/environment';
import { JSONObjectKeyAndTypeValidator } from '../interfaces/generalInterface';

export function AuthenticateJwtToken(token: string) {
  return VerifyJwtToken(token, environment.accessToken);
}

export function VerifyJwtToken(token: string, key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    verify(token, key, (err, user) => {
      if (err) reject(err);
      resolve(user);
    });
  });
}
export function SignDataJWT(
  data: any,
  key: string,
  options?: SignOptions
): string {
  return sign(data, key, options);
}
export function GetTimeStamp() {
  return Math.floor(Date.now() / 1000);
}

export function ValidateJSONObject(
  data: any,
  Validator: JSONObjectKeyAndTypeValidator[],
  data_striping = false
): boolean | any {
  const temp: any = {};
  Validator.forEach((a) => {
    if (a.required || typeof data[a.key] !== 'undefined') {
      let e = `Value of Key ${a.key} Not Found`;
      if (typeof data[a.key] !== a.type && a.type !== 'any') {
        throw Create400Error(e);
      }
      if (a.regex) {
        let dataCC = data[a.key];
        if (typeof dataCC !== 'string') {
          dataCC = String(dataCC);
        }
        if (a.regex.test(dataCC) === false) {
          e = a.key + ' Regexp MisMAtch';
          throw Create400Error(e);
        }
      }
      if (a.Extra && Array.isArray(a.Extra)) {
        temp[a.key] = ValidateJSONObject(data[a.key], a.Extra, data_striping);
      } else {
        temp[a.key] = data[a.key];
      }
    }
  });

  return data_striping ? temp : true;
}

function Create400Error(msg: string) {
  return new HttpException(msg, 400);
}

export function fillterData(data: any) {
  if (data) {
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });
  }
  return data;
}

export const DailyRemash = 1;
export const DailySwipes = 25;