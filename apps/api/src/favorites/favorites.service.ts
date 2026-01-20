import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, repositoryId: string) {
    const repository = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    return this.prisma.favoriteRepository.create({
      data: {
        userId,
        repositoryId,
      },
      include: {
        repository: true,
      },
    });
  }

  async removeFavorite(userId: string, repositoryId: string) {
    return this.prisma.favoriteRepository.delete({
      where: {
        userId_repositoryId: {
          userId,
          repositoryId,
        },
      },
    });
  }

  async listFavorites(userId: string) {
    return this.prisma.favoriteRepository.findMany({
      where: { userId },
      include: {
        repository: {
          include: {
            scans: {
              where: { status: 'COMPLETED' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isFavorite(userId: string, repositoryId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteRepository.findUnique({
      where: {
        userId_repositoryId: {
          userId,
          repositoryId,
        },
      },
    });

    return !!favorite;
  }
}
