import { Response as re } from 'express';
import { UserAllDatainterfce } from './userInterfaces';
export interface JSONObjectKeyAndTypeValidator {
  key: string;
  required: boolean;
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'function'
    | 'object'
    | 'symbol'
    | 'symbol'
    | 'any'
    | 'bigint';
  regex?: RegExp;
  Extra?: JSONObjectKeyAndTypeValidator[];
}
export interface Response extends re {
  locals: {
    user: UserAllDatainterfce;
  };
}
