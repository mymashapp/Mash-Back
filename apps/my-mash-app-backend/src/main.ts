/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
// import * as  io from '@pm2/io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // const globalPrefix = '';
  // app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  const isGreenLock =  process.env.EnableGreenLock ==='true'?true:false;
  if(isGreenLock === false){

    await app.listen(port, () => {
      Logger.log('Listening at http://localhost:' + port + '/' );
    });
  }else{
      console.log('iugiasd');
      
  }
}

bootstrap();
