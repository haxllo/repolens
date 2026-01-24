import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExecutionController } from './execution.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'code-execution',
    }),
  ],
  controllers: [ExecutionController],
})
export class ExecutionModule {}
