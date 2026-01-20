import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ScanService } from './scan.service'
import { CreateScanDto } from './dto/create-scan.dto'

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async createScan(@Body() createScanDto: CreateScanDto) {
    return this.scanService.createScan(createScanDto)
  }

  @Get(':id')
  async getScanStatus(@Param('id') id: string) {
    return this.scanService.getScanStatus(id)
  }

  @Get(':id/results')
  async getScanResults(@Param('id') id: string) {
    return this.scanService.getScanResults(id)
  }
}
