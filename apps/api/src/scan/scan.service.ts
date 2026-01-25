import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { CreateScanDto } from './dto/create-scan.dto'
import { PrismaService } from '../prisma/prisma.service'
import { randomUUID } from 'crypto'

@Injectable()
export class ScanService {
  constructor(
    @InjectQueue('repo-analysis') private analysisQueue: Queue,
    private prisma: PrismaService
  ) {}

  async createScan(createScanDto: CreateScanDto, userId?: string) {
    const scanId = randomUUID()

    // Create scan in database
    const scan = await this.prisma.scan.create({
      data: {
        id: scanId,
        userId: userId || null,
        repoUrl: createScanDto.repoUrl,
        branch: createScanDto.branch || 'main',
        status: 'QUEUED',
      },
    })

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
      scanId: scan.id,
      status: 'queued',
      message: 'Repository scan has been queued for analysis',
    }
  }

  async getScanStatus(scanId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
    })

    if (!scan) {
      return {
        scanId,
        status: 'not_found',
        error: 'Scan not found',
      }
    }

    // Also check job queue for progress
    const job = await this.analysisQueue.getJob(scanId)
    const progress = job ? job.progress : null

    const response: any = {
      scanId: scan.id,
      status: scan.status.toLowerCase(),
      progress,
      createdAt: scan.createdAt,
      repoUrl: scan.repoUrl,
      branch: scan.branch,
    }

    // Include results if scan is completed
    if (scan.status === 'COMPLETED' && scan.results) {
      response.results = scan.results
      response.completedAt = scan.completedAt
    }

    // Include error if scan failed
    if (scan.status === 'FAILED' && scan.errorMessage) {
      response.error = scan.errorMessage
    }

    return response
  }

  async getScanResults(scanId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
    })

    if (!scan) {
      return {
        scanId,
        error: 'Scan not found',
      }
    }

    if (scan.status !== 'COMPLETED') {
      return {
        scanId,
        status: scan.status.toLowerCase(),
        error: 'Scan is not yet complete',
      }
    }

    return {
      scanId: scan.id,
      status: 'completed',
      repoUrl: scan.repoUrl,
      branch: scan.branch,
      createdAt: scan.createdAt,
      completedAt: scan.completedAt,
      results: scan.results,
    }
  }

  async updateScanStatus(scanId: string, status: string, results?: any, error?: string) {
    const updateData: any = {
      status: status.toUpperCase(),
    }

    if (status === 'COMPLETED' || status.toUpperCase() === 'COMPLETED') {
      updateData.completedAt = new Date()
      if (results) {
        updateData.results = results
        // Map specific diagnostic fields for specialized queries
        updateData.languageStats = results.languages || null
        updateData.dependencies = results.dependencies || null
        updateData.riskScores = results.riskScores || null
        updateData.readmeAnalysis = results.readmeAnalysis || null
        updateData.circularDeps = results.circularDependencies || null
        updateData.deadCode = results.deadCode || null
        
        if (results.processingTime) {
          updateData.processingTime = results.processingTime
        }
      }
    }

    if (status === 'PROCESSING' || status.toUpperCase() === 'PROCESSING') {
      updateData.startedAt = new Date()
    }

    if (status === 'FAILED' || status.toUpperCase() === 'FAILED') {
      updateData.errorMessage = error
    }

    return this.prisma.scan.update({
      where: { id: scanId },
      data: updateData,
    })
  }

  async getUserScans(userId: string, limit = 50, offset = 0) {
    const scans = await this.prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await this.prisma.scan.count({
      where: { userId },
    })

    return {
      scans,
      total,
      limit,
      offset,
    }
  }
}
