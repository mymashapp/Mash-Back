export interface ChatMainUserReqInterface extends chatMainUsersInterface {
  get_all_detils_of_row_with_all_joins?: boolean;
  stream?: number;
  limit?: number;
  order_by?: 'DESC' | 'ASC';
  self_join_for_user_specific?:{
    user_id:number,
    get_user_data:boolean
  }
}
export interface chatMainUsersInterface {
  chat_main_users_list_id?: number;
  chat_main_users_chat_id?: string;
  chat_main_users_id?: number;
  last_opened_at?: number;
}

export interface chatMainInterface {
  chat_main_id?: string;
  chat_main_event_id?: number;
  chat_main_name?: string;
  chat_main_last_update_at?: number;
  chat_created_at?: number;
  chat_main_total_joined_people?: number;
}
