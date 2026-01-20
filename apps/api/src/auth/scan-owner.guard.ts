import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Guard to ensure users can only access their own scans.
 * The scan ID is expected in the route params as 'id'.
 */
@Injectable()
export class ScanOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const scanId = request.params.id

    if (!user) {
      throw new ForbiddenException('Authentication required')
    }

    if (!scanId) {
      return true // Let the controller handle missing scan ID
    }

    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      select: { userId: true },
    })

    if (!scan) {
      throw new NotFoundException('Scan not found')
    }

    // Allow access if scan has no owner (public scans) or user is the owner
    if (scan.userId === null || scan.userId === user.id) {
      return true
    }

    throw new ForbiddenException('You do not have access to this scan')
  }
}
