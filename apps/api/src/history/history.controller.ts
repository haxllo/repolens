import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { Public } from '../auth/public.decorator';

@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Public()
  @Get()
  async getScanHistory(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('repositoryId') repositoryId?: string,
    @Query('status') status?: string,
  ) {
    return this.historyService.getScanHistory({
      userId: userId || 'guest',
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      repositoryId,
      status,
    });
  }

  @Public()
  @Get('repository/:repositoryId')
  async getRepositoryHistory(
    @Query('userId') userId: string,
    @Param('repositoryId') repositoryId: string,
  ) {
    return this.historyService.getRepositoryHistory(userId || 'guest', repositoryId);
  }

  @Public()
  @Get('compare/:scanId1/:scanId2')
  async compareScans(
    @Query('userId') userId: string,
    @Param('scanId1') scanId1: string,
    @Param('scanId2') scanId2: string,
  ) {
    return this.historyService.compareScans(userId || 'guest', scanId1, scanId2);
  }

  @Public()
  @Get('trends/:repositoryId')
  async getRepositoryTrends(
    @Query('userId') userId: string,
    @Param('repositoryId') repositoryId: string,
  ) {
    return this.historyService.getRepositoryTrends(userId || 'guest', repositoryId);
  }
}
