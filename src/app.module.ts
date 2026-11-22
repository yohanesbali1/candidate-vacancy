import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesModule } from './candidates/candidates.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { RankingModule } from './ranking/ranking.module';
import { RedisModule } from './redis/redis.module';
import { databaseConfig } from './config/database.config';
@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    RedisModule, CandidatesModule, VacanciesModule, RankingModule,
  ],
})
export class AppModule {}
