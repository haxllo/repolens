import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { BearerStrategy } from './bearer.strategy'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'bearer' }),
  ],
  providers: [BearerStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
