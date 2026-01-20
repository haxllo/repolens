import { Controller, Get, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { Public } from '../auth/public.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('scans')
  async getUserScans(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50
    const offsetNum = offset ? parseInt(offset, 10) : 0
    return this.userService.getUserScans(userId || 'guest', limitNum, offsetNum)
  }

  @Public()
  @Get('stats')
  async getUserStats(@Query('userId') userId?: string) {
    return this.userService.getUserStats(userId || 'guest')
  }
}
