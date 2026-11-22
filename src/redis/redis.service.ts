import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl = 60): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  async getOrCreateVersion(key: string): Promise<string> {
    await this.redis.set(key, '1', 'NX');
    return (await this.redis.get(key)) ?? '1';
  }

  async invalidateRanking(): Promise<number> {
    return this.incr('ranking:version');
  }
}