import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { PrismaService } from '../prisma/prisma.service';

export interface GitHubRepository {
  fullName: string;
  url: string;
  description?: string;
  stars: number;
  language?: string;
  isPrivate: boolean;
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);

  constructor(private prisma: PrismaService) {}

  async getOctokit(userId: string): Promise<Octokit> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true, tokenExpiry: true },
    });

    if (!user?.githubToken) {
      throw new UnauthorizedException('GitHub token not found');
    }

    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      throw new UnauthorizedException('GitHub token expired');
    }

    return new Octokit({
      auth: user.githubToken,
    });
  }

  async getRepository(
    userId: string,
    owner: string,
    repo: string,
  ): Promise<GitHubRepository> {
    try {
      const octokit = await this.getOctokit(userId);
      
      const { data } = await octokit.repos.get({
        owner,
        repo,
      });

      return {
        fullName: data.full_name,
        url: data.html_url,
        description: data.description || undefined,
        stars: data.stargazers_count,
        language: data.language || undefined,
        isPrivate: data.private,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error fetching repository ${owner}/${repo}: ${errorMessage}`);
      throw error;
    }
  }

  async getAuthenticatedCloneUrl(
    userId: string,
    owner: string,
    repo: string,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true },
    });

    if (!user?.githubToken) {
      throw new UnauthorizedException('GitHub token not found');
    }

    return `https://x-access-token:${user.githubToken}@github.com/${owner}/${repo}.git`;
  }
}
