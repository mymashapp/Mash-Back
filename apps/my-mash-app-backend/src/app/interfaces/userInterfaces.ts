export interface UserAllDatainterfce extends userMainInterface,userBasicInterface,userBasicInterface,userPreferaceInterface{
  user_id?: number;
}
export interface userMainInterface {
  user_id?: number[] | number;
  full_name?: string;
  dob?: string;
  dob_timestamp?: number;
  email?: string[];
  password?: string;
  phone?: number[];
  gender?: 'M' | 'F' | 'O' | ['M' | 'F' | 'O'];
  pronoun?: string;
  height?: number;
  school?: string;
  edited_on?: number;
}

export interface userBasicInterface {
  user_basic_id?: number | number[];
  user_basic_user_id?: number;
  user_basic_premium_stauts?: number;
  user_basic_review?: number;
}

export interface userPreferaceInterface {
  user_pref_id?: number | number[];
  user_pref_user_id?: number;
  distance?: number;
  min_age?: number;
  max_age?: number;
  geneder_pre?: string;
  user_pref_edited_on?: number;
}
export interface userReqInterface
  extends userMainInterface,
    userBasicInterface,
    userPreferaceInterface {
  send_all_data?: boolean;
  limit?: number;
  stream?: number;
  
  stream_get_all?: boolean;
}
export interface DefaultUserBasicConfig {
  user_basic_premium_stauts?: number;
  user_basic_review?: number;
}

export interface DefaultUserPreferanceConfig {
  distance?: number;
  geneder_pre?: 'M' | 'F' | 'A';
  max_age?: number;
  min_age?: number;
}
