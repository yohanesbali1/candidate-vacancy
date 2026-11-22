import { Injectable } from '@nestjs/common';
import { Candidate } from '../../candidates/candidate.entity';
import { CriteriaEvaluator } from './evaluator.interface';
@Injectable()
export class GenderEvaluator implements CriteriaEvaluator {
  readonly type = 'gender';
  evaluate(candidate: Candidate, details: { value: string }): boolean {
    return details.value === 'any' || candidate.gender === details.value;
  }
}
