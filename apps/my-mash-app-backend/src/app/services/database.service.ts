import { Injectable } from '@nestjs/common';
import { Pool } from 'query-builder-mysql';
import * as axios from 'axios';
import { environment } from '../../environments/environment';
@Injectable()
export class databaseService {
  db_config = environment.db_config;
  pool: Pool;
  get = axios.default.get;
  post = axios.default.post;
  constructor() {
    this.pool = new Pool(this.db_config);
  }
}
