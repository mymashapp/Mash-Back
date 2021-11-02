export interface MasheventInterface extends MasheventReqInterface {
  total_joined_people: number;
  total_allowed_people: number;
}
export interface MasheventReqInterface {
  event_id?: number | number[];
  user_id?: number | number[];
  third_party_unique_id?: string;
  event_type?: 'SYS' | 'USER';
  event_name?: string;
  event_lat?: number;
  event_log?: number;
  place_name?: string;
  category?: number | number[];
  activity?: number | number[];
  event_date_time?: string;
  event_date_timestamp?: number;
  party?: number | number[];
  total_allowed_people?: number | number[];
  total_joined_people?: number | number[];
  allowed_gender?: 'M' | 'F' | 'A' | ['M' | 'F', 'A'];
  dating?: number;
  mash_event_chat_id?: string;
  status?: number | number[];
  event_extra?: any;
  edited_on?: number;
}

export interface DefaultEventConf {
  activity: number;
  party: number;
  category: number;
  dating: 0 | 1;
  allowed_gender?: 'M' | 'F' | 'A';
}

export interface EventActivityInterface {
  event_activity_id?: number | number[];
  event_activity_name?: string | string[];
  event_activity_extra?: any;
}

export interface EventCategoryInterface {
  event_cat_id?: number | number[];
  event_cat_name?: string | string[];
  event_cat_extra?: any;
}

export interface EventPartyInterface {
  event_part_id?: number | number[];
  event_party_name?: string | string[];
  event_party_peoples?: number | number[];
  event_party_extra?: any;
}

export interface EventGetReqObjInterface
  extends MasheventReqInterface,
    EventActivityInterface,
    EventCategoryInterface,
    EventPartyInterface {
  ignore_swipes?: 'true' | 'false';
  ignore_user_specific?: 'true' | 'false';
  calling_again?: 'true' | 'false';
  send_all_details?: boolean;
  limit?: number;
  stream?: number;
  random?:'true'|'false';
  get_all?: boolean;
  user_lat?: number;
  user_log?: number;
  get_only_count?:boolean;
  user_specific_events?: userspecificEvents;
}
export interface userspecificEvents {
  join_swipes?: boolean;
  random?: boolean;
  radius: number;
  user_id: number;
  user_lat?: number;
  user_log?: number;
}
export interface EventJoinedPeopleInterface {
  event_joined_people_id?: number;
  event_joined_people_event_id?: number;
  event_joined_people_user_id?: number;
  event_joined_people_extra?: any;
}

export interface EventSwipeInterface {
  event_swipes_id?: number;
  event_swipes_user_id?: number;
  event_swipes_event_id?: number;
  swiped?: number;
  swiped_on?: number;
}
