import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from './vacancy.entity';
import { VacancyCriterion } from './vacancy-criterion.entity';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
@Module({ imports: [TypeOrmModule.forFeature([Vacancy, VacancyCriterion])], controllers: [VacanciesController], providers: [VacanciesService], exports: [VacanciesService] })
export class VacanciesModule {}
