import { Injectable } from '@nestjs/common';
import { Candidate } from '../../candidates/candidate.entity';
import { CriteriaEvaluator } from './evaluator.interface';
@Injectable()
export class AgeEvaluator implements CriteriaEvaluator {
  readonly type = 'age';
  evaluate(candidate: Candidate, details: { min: number; max: number }): boolean {
    const birth = new Date(`${candidate.birthday}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) age--;
    return age >= details.min && age <= details.max;
  }
}
