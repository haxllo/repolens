import { Controller, Post, Get, Body, Param, UseGuards, Put } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ScanService } from './scan.service'
import { CreateScanDto } from './dto/create-scan.dto'
import { Public } from '../auth/public.decorator'
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator'
import { ScanOwnerGuard } from '../auth/scan-owner.guard'

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @Public() // Allow unauthenticated scans (userId will be null)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async createScan(
    @Body() createScanDto: CreateScanDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.scanService.createScan(createScanDto, user?.id)
  }

  @Get(':id')
  @Public() // Allow viewing scan status without auth (for polling)
  async getScanStatus(@Param('id') id: string) {
    return this.scanService.getScanStatus(id)
  }

  @Get(':id/results')
  @Public() // Allow viewing results without auth (shareable links)
  async getScanResults(@Param('id') id: string) {
    return this.scanService.getScanResults(id)
  }

  @Put(':id/status')
  @Public() // Worker needs to update status without auth
  async updateScanStatus(
    @Param('id') id: string,
    @Body() body: { status: string; results?: any; error?: string }
  ) {
    return this.scanService.updateScanStatus(id, body.status, body.results, body.error)
  }
}
