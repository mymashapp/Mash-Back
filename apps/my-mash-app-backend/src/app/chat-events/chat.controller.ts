import {
  Body,
  Controller,
  Get,
  HttpException,
  Optional,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ChatMainUserReqInterface } from '../interfaces/chat.interface';
import { Response } from '../interfaces/generalInterface';
import { ChatService } from '../services/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Post('send_message')
  async sendMessage(
    @Body('text') text: string,
    @Body('chat_id') chat_id: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const user_id = res.locals.user.user_id;
    if (typeof text === 'undefined' || typeof chat_id === 'undefined') {
      throw new HttpException('Please send text and chat_id!', 400);
    }

    const userAccess = await this.chatService.chatMainUsers({
      chat_main_users_id: user_id,
      chat_main_users_chat_id: chat_id,
    });
    if (userAccess.length === 1) {
      await this.chatService
        .sendMessage(text, chat_id, user_id)
        .then(() => {
          return {
            success: 1,
          };
        })
        .catch((e) => {
          new HttpException(e, 400);
        });
      return {
        success: 1,
      };
    } else {
      throw new HttpException('User does not have rights for Chat!', 401);
    }
  }

  @Get('get_chat_ids')
  async GetChatIds(
    @Res({ passthrough: true }) res: Response,
    @Query()
    ReqData: {
      order_by?: string;
      limit?: string;
      stream?: string;
      msg_id?: string;
    },
    @Optional() ignore_order_by = false,
    @Optional() ignore_stream = false
  ) {
    const users_id = res.locals.user.user_id;
    if (
      ignore_order_by === false &&
      typeof ReqData.order_by !== 'undefined' &&
      ['ASC', 'DESC'].includes(ReqData.order_by) === false
    ) {
      throw new HttpException('Please Send Valid Order By Value', 400);
    }
    if (
      ignore_stream === false &&
      (typeof ReqData.stream === 'undefined' ||
        typeof ReqData.limit === 'undefined' ||
        isNaN(+ReqData.stream) ||
        isNaN(+ReqData.limit))
    ) {
      throw new HttpException('steam, limit or token not found!', 400);
    }
    const ReqForChat: ChatMainUserReqInterface = {
      chat_main_users_id: users_id,
      stream: +ReqData.stream,
      limit: +ReqData.limit,
      chat_main_users_chat_id: ReqData.msg_id,
      get_all_detils_of_row_with_all_joins: true,
      order_by: ReqData.order_by as any,
    };
    return this.chatService.chatMainUsers(ReqForChat).then((a) => {
      if (a) {
        return a;
      }
    });
  }
  @Post('chat_opened')
  async chatOpended(
    @Body('chat_id') chat_id: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const user_id = res.locals.user.user_id;
    if (typeof chat_id === 'undefined') {
      throw new HttpException('Please send chat_id!', 400);
    }
    return await this.chatService
      .chatOpened(chat_id, user_id.toString())
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
  }
  @Get('chat_id_details')
  async GetUsersChatIdDetials(
    @Res({ passthrough: true }) res: Response,
    @Query('msg_id') msg_id: string
  ) {
    return this.GetChatIds(
      res,
      {
        limit: '1',
        stream: '1',
        msg_id: msg_id,
      },
      true,
      false
    ).then((a) => {
      if (a.length === 0) {
        throw new HttpException('User Not Authorised For Chat', 401);
      } else {
        return a[0];
      }
    });
  }
  @Get('chat_id_user_list')
  async ChatUsersListOfUser(
    @Res({ passthrough: true }) res: Response,
    @Query('msg_id') msg_id: string
  ) {
    const user_id = res.locals.user.user_id;
    if (typeof msg_id !== 'string') {
      throw new HttpException('Please Send Valid Message Id', 400);
    }
    return this.chatService
      .chatMainUsers({
        chat_main_users_chat_id: msg_id,
        self_join_for_user_specific: {
          get_user_data: true,
          user_id,
        },
      })
      .then((a) => {
        if (a.length > 0) {
          return {
            success: 1,
            list: a,
          };
        } else {
          throw new HttpException('User Not Authorised For Chat', 401);
        }
      });
  }
}
