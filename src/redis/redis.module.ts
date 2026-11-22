import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService, REDIS_CLIENT } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT || 6379),
          lazyConnect: false,
          maxRetriesPerRequest: 2,
        }),
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}