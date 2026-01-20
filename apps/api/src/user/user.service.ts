import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserScans(userId: string, limit = 50, offset = 0) {
    const scans = await this.prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        repoUrl: true,
        branch: true,
        status: true,
        createdAt: true,
        completedAt: true,
        startedAt: true,
        errorMessage: true,
      },
    })

    const total = await this.prisma.scan.count({
      where: { userId },
    })

    return {
      scans,
      total,
      limit,
      offset,
      hasMore: offset + scans.length < total,
    }
  }

  async getUserStats(userId: string) {
    const totalScans = await this.prisma.scan.count({
      where: { userId },
    })

    const completedScans = await this.prisma.scan.count({
      where: { userId, status: 'COMPLETED' },
    })

    const failedScans = await this.prisma.scan.count({
      where: { userId, status: 'FAILED' },
    })

    const processingScans = await this.prisma.scan.count({
      where: { userId, status: { in: ['QUEUED', 'PROCESSING'] } },
    })

    return {
      totalScans,
      completedScans,
      failedScans,
      processingScans,
    }
  }
}
