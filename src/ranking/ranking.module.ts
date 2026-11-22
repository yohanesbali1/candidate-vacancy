import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../candidates/candidate.entity';
import { VacanciesModule } from '../vacancies/vacancies.module';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { AgeEvaluator } from './evaluators/age.evaluator';
import { GenderEvaluator } from './evaluators/gender.evaluator';
import { SalaryEvaluator } from './evaluators/salary.evaluator';
import { CRITERIA_EVALUATORS } from './evaluators/evaluator.interface';
@Module({
  imports: [TypeOrmModule.forFeature([Candidate]), VacanciesModule],
  controllers: [RankingController],
  providers: [AgeEvaluator, GenderEvaluator, SalaryEvaluator, RankingService, {
    provide: CRITERIA_EVALUATORS,
    useFactory: (age: AgeEvaluator, gender: GenderEvaluator, salary: SalaryEvaluator) => [age, gender, salary],
    inject: [AgeEvaluator, GenderEvaluator, SalaryEvaluator],
  }],
})
export class RankingModule {}
