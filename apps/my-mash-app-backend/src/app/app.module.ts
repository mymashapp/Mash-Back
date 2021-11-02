import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { AppController } from './app.controller';
import { ChatController } from './chat-events/chat.controller';
import { AuthenticateTokenMiddle } from './General/middlewares';
import { LoginController } from './login/login.controller';
import { EventController } from './Mash-event/event.controller';
import { AppService } from './services/app.service';
import { ChatService } from './services/chat.service';
import { databaseService } from './services/database.service';
import { EventService } from './services/event.service';
import { FirebaseService } from './services/firebase.service';
import { UserService } from './services/user.service';
import { YelpScrapeService } from './services/yelp.scrape.service';
import { UserController } from './user/user.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    UserController,
    LoginController,
    EventController,
    ChatController,
  ],
  providers: [
    AppService,
    FirebaseService,
    databaseService,
    UserService,
    EventService,
    YelpScrapeService,
    ChatService,
  ],
})
export class AppModule {
  constructor(private yelp: YelpScrapeService, chat: FirebaseService) {
    // chat
    //   .InsertUpdateChatMainUsers({
    //     chat_main_users_id: 2,
    //     chat_main_id: '-Mjitb_Pv6Pt-DZSzP51',
    //     last_opened_at: GetTimeStamp(),
    //   })
    //   .then((s) => {
    //     console.log(s);
    //   });
    // setTimeout(() => {
      // yelp.scrapeFromRestApi();
    // }, 5000);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateTokenMiddle).forRoutes(EventController);
    consumer.apply(AuthenticateTokenMiddle).forRoutes(ChatController);
    consumer.apply(AuthenticateTokenMiddle).forRoutes(UserController);
    consumer
      .apply(AuthenticateTokenMiddle)
      .forRoutes({ path: '/login/is_login', method: RequestMethod.ALL });
  }
}
