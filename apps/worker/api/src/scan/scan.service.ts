import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { CreateScanDto } from './dto/create-scan.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class ScanService {
  constructor(
    @InjectQueue('repo-analysis') private analysisQueue: Queue
  ) {}

  async createScan(createScanDto: CreateScanDto) {
    const scanId = randomUUID()

    // Add job to queue
    const job = await this.analysisQueue.add(
      'analyze-repo',
      {
        scanId,
        repoUrl: createScanDto.repoUrl,
        branch: createScanDto.branch || 'main',
      },
      {
        jobId: scanId,
        removeOnComplete: false,
        removeOnFail: false,
      }
    )

    return {
      scanId,
      status: 'queued',
      message: 'Repository scan has been queued for analysis',
    }
  }

  async getScanStatus(scanId: string) {
    const job = await this.analysisQueue.getJob(scanId)

    if (!job) {
      return {
        scanId,
        status: 'not_found',
        error: 'Scan not found',
      }
    }

    const state = await job.getState()
    const progress = job.progress

    return {
      scanId,
      status: state,
      progress,
      createdAt: job.timestamp,
    }
  }

  async getScanResults(scanId: string) {
    const job = await this.analysisQueue.getJob(scanId)

    if (!job) {
      return {
        scanId,
        error: 'Scan not found',
      }
    }

    const state = await job.getState()

    if (state !== 'completed') {
      return {
        scanId,
        status: state,
        error: 'Scan is not yet complete',
      }
    }

    return {
      scanId,
      status: 'completed',
      results: job.returnvalue,
    }
  }
}
