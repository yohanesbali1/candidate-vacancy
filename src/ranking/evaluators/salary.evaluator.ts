import { Injectable } from '@nestjs/common';
import { Candidate } from '../../candidates/candidate.entity';
import { CriteriaEvaluator } from './evaluator.interface';
@Injectable()
export class SalaryEvaluator implements CriteriaEvaluator {
  readonly type = 'salary';
  evaluate(candidate: Candidate, details: { min: number; max: number }): boolean {
    const salary = Number(candidate.currentSalary);
    return salary >= Number(details.min) && salary <= Number(details.max);
  }
}
