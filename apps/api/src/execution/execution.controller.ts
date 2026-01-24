import { Controller, Post, Body, UseGuards, Sse, MessageEvent } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Observable, interval, map, switchMap, from } from 'rxjs';
import { ExecuteCodeDto } from './execution.dto';

@Controller('execution')
export class ExecutionController {
  constructor(
    @InjectQueue('code-execution') private executionQueue: Queue
  ) {}

  @Post()
  async execute(@Body() dto: ExecuteCodeDto) {
    const job = await this.executionQueue.add('execute', dto);
    return { jobId: job.id, status: 'queued' };
  }

  // Polling endpoint for results (Simple MVP)
  @Post('result')
  async getResult(@Body() body: { jobId: string }) {
    const job = await this.executionQueue.getJob(body.jobId);
    if (!job) return { status: 'not_found' };

    const state = await job.getState();
    const result = await job.returnvalue;
    const failedReason = job.failedReason;

    return { 
        id: job.id, 
        status: state, 
        result,
        error: failedReason
    };
  }
}
