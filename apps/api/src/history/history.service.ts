import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ScanHistoryQuery {
  userId: string;
  limit?: number;
  offset?: number;
  repositoryId?: string;
  status?: string;
}

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getScanHistory(query: ScanHistoryQuery) {
    const { userId, limit = 20, offset = 0, repositoryId, status } = query;

    const where: any = { userId };
    if (repositoryId) {
      where.repositoryId = repositoryId;
    }
    if (status) {
      where.status = status;
    }

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          repository: true,
        },
      }),
      this.prisma.scan.count({ where }),
    ]);

    return {
      scans,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getRepositoryHistory(userId: string, repositoryId: string) {
    const scans = await this.prisma.scan.findMany({
      where: {
        userId,
        repositoryId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { versionNumber: 'asc' },
        },
      },
    });

    return scans;
  }

  async createScanVersion(scanId: string, data: any) {
    const lastVersion = await this.prisma.scanVersion.findFirst({
      where: { scanId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    return this.prisma.scanVersion.create({
      data: {
        scanId,
        versionNumber,
        commitSha: data.commitSha,
        results: data.results,
        riskScores: data.riskScores,
        dependencies: data.dependencies,
      },
    });
  }

  async compareScans(userId: string, scanId1: string, scanId2: string) {
    // Fetch both scans
    const [scan1, scan2] = await Promise.all([
      this.prisma.scan.findUnique({ where: { id: scanId1 } }),
      this.prisma.scan.findUnique({ where: { id: scanId2 } }),
    ]);

    if (!scan1 || !scan2) {
      throw new NotFoundException('One or both scans not found');
    }

    // Verify ownership
    if (scan1.userId !== userId || scan2.userId !== userId) {
      throw new ForbiddenException('Access denied to one or both scans');
    }

    // Parse results
    const results1 = scan1.results as any || {};
    const results2 = scan2.results as any || {};

    // Calculate deltas
    const riskScores1 = results1.riskScores || {};
    const riskScores2 = results2.riskScores || {};

    const comparison = {
      scan1: { id: scan1.id, createdAt: scan1.createdAt, branch: scan1.branch },
      scan2: { id: scan2.id, createdAt: scan2.createdAt, branch: scan2.branch },
      deltas: {
        overallRisk: (riskScores2.overall || 0) - (riskScores1.overall || 0),
        complexity: (riskScores2.complexity || 0) - (riskScores1.complexity || 0),
        security: (riskScores2.security || 0) - (riskScores1.security || 0),
        maintainability: (riskScores2.maintainability || 0) - (riskScores1.maintainability || 0),
      },
      changes: {
        filesAdded: this.countFileDiff(results1.ast?.files, results2.ast?.files, 'added'),
        filesRemoved: this.countFileDiff(results1.ast?.files, results2.ast?.files, 'removed'),
        dependenciesAdded: this.countDependencyDiff(results1.dependencies, results2.dependencies, 'added'),
        dependenciesRemoved: this.countDependencyDiff(results1.dependencies, results2.dependencies, 'removed'),
      },
      improved: (riskScores2.overall || 0) < (riskScores1.overall || 0),
    };

    return comparison;
  }

  async getRepositoryTrends(userId: string, repositoryId: string) {
    const scans = await this.prisma.scan.findMany({
      where: {
        userId,
        repositoryId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'asc' },
      take: 20, // Last 20 scans for trends
    });

    if (scans.length === 0) {
      return { trends: [], summary: null };
    }

    const trends = scans.map(scan => {
      const results = scan.results as any || {};
      const riskScores = results.riskScores || {};
      
      return {
        scanId: scan.id,
        date: scan.createdAt,
        overallRisk: riskScores.overall || 0,
        complexity: riskScores.complexity || 0,
        security: riskScores.security || 0,
        maintainability: riskScores.maintainability || 0,
        readmeScore: results.readmeAnalysis?.score || 0,
      };
    });

    // Calculate summary stats
    const latest = trends[trends.length - 1];
    const oldest = trends[0];
    const avgRisk = trends.reduce((sum, t) => sum + t.overallRisk, 0) / trends.length;

    return {
      trends,
      summary: {
        totalScans: trends.length,
        riskChange: latest.overallRisk - oldest.overallRisk,
        avgRisk: Math.round(avgRisk),
        trend: latest.overallRisk < oldest.overallRisk ? 'improving' : 
               latest.overallRisk > oldest.overallRisk ? 'declining' : 'stable',
        latestScan: latest,
      },
    };
  }

  private countFileDiff(files1: any[], files2: any[], type: 'added' | 'removed'): number {
    if (!files1 || !files2) return 0;
    const paths1 = new Set(files1.map((f: any) => f.path));
    const paths2 = new Set(files2.map((f: any) => f.path));
    
    if (type === 'added') {
      return [...paths2].filter(p => !paths1.has(p)).length;
    } else {
      return [...paths1].filter(p => !paths2.has(p)).length;
    }
  }

  private countDependencyDiff(deps1: any, deps2: any, type: 'added' | 'removed'): number {
    const packages1 = new Set((deps1?.packages || []).map((p: any) => p.name));
    const packages2 = new Set((deps2?.packages || []).map((p: any) => p.name));
    
    if (type === 'added') {
      return [...packages2].filter(p => !packages1.has(p)).length;
    } else {
      return [...packages1].filter(p => !packages2.has(p)).length;
    }
  }
}
