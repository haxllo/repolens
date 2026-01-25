import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':scanId')
  async askQuestion(
    @Param('scanId') scanId: string,
    @Body('question') question: string,
  ) {
    return this.chatService.ask(scanId, question);
  }
}
