import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super();
  }

  async validate(token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // Check session in DB
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  }
}
