import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FirebaseService } from '../services/firebase.service';
import { UserService } from '../services/user.service';
import { Response } from '../interfaces/generalInterface';
import { environment } from '../../environments/environment';
import { EventService } from '../services/event.service';
import { userReqInterface } from '../interfaces/userInterfaces';
import { FileInterceptor } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private fire: FirebaseService,
    private event: EventService
  ) {}

  @Get()
  async getData() {
    if (environment.production) {
      return 'NOOÒOÒOÒ';
    } else {
      return await this.userService.getUserData({ send_all_data: true });
    }
  }
  @Get('me')
  GetMeData(@Res({ passthrough: true }) res: Response) {
    // return 'aosodiao';
    // res.send(res.locals);
    return res.locals;
  }

  @Post('update_preferance')
  async updateUserPreferance(
    @Body() userData: userReqInterface,
    @Res({ passthrough: true }) res: Response
  ) {
    userData.user_id = res.locals.user.user_id;
    if (userData && userData.user_id) {
      return this.userService
        .updateUserData(userData)
        .then((a: any) => {
          if (a) {
            return {
              success: 1,
            };
          }
        })
        .catch((e) => {
          throw new HttpException(e, 400);
        });
    } else {
      throw new HttpException('Please send user data!', 400);
    }
  }
  // @Post('add_cat')
  // AddCate(@Body('cat_name') cat_name:string,@Body('cat_extra') cat_extra:any){
  //   this.event.InsertUpdateEventCategory({
  //     event_cat_extra:cat_extra|| {},
  //     event_cat_name:cat_name
  //   });
  //   return;
  // }

  @Post('update_profile_pic')
  @UseInterceptors(FileInterceptor('profile'))
  async updateUserProfilePic(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any
  ) {
    const user_id = res.locals.user.user_id;
    file.originalname = 'profile_pic.png';
    const path = `users/${user_id}/${req.file.originalname}`;
    return this.userService
      .updateProfilePic(path, req.file)
      .then((a) => {
        if (a) {
          return a;
        }
      })
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
  }
}
