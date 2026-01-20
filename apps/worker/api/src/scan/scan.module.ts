import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ScanController } from './scan.controller'
import { ScanService } from './scan.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'repo-analysis',
    }),
  ],
  controllers: [ScanController],
  providers: [ScanService],
})
export class ScanModule {}
