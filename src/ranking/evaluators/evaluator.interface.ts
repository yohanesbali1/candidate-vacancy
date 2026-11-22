import { Candidate } from '../../candidates/candidate.entity';
export interface CriteriaEvaluator {
  type: string;
  evaluate(candidate: Candidate, details: Record<string, any>): boolean;
}
export const CRITERIA_EVALUATORS = 'CRITERIA_EVALUATORS';
