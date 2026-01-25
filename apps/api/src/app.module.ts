import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { ScanModule } from './scan/scan.module'
import { UserModule } from './user/user.module'
import { GitHubModule } from './github/github.module'
import { FavoritesModule } from './favorites/favorites.module'
import { HistoryModule } from './history/history.module'
import { ExecutionModule } from './execution/execution.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        return {
          connection: {
            host,
            port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
            password: configService.get<string>('REDIS_PASSWORD'),
            tls: host.includes('upstash.io')
              ? {
                  rejectUnauthorized: false,
                }
              : undefined,
          },
        };
      },
    }),
    PrismaModule,
    AuthModule,
    ScanModule,
    UserModule,
    GitHubModule,
    FavoritesModule,
    HistoryModule,
    ExecutionModule,
  ],
  controllers: [HealthController],
  providers: [
    // Apply JWT auth guard globally - use @Public() to opt-out
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
