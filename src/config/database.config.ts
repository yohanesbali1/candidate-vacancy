import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Candidate } from '../candidates/candidate.entity';
import { Vacancy } from '../vacancies/vacancy.entity';
import { VacancyCriterion } from '../vacancies/vacancy-criterion.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'candidate_db',
  entities: [Candidate, Vacancy, VacancyCriterion],
  synchronize: process.env.DB_SYNC === 'true',
};