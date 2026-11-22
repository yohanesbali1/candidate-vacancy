
import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Candidate } from '../candidates/candidate.entity';
import { VacanciesService } from '../vacancies/vacancies.service';

import {
  CRITERIA_EVALUATORS,
  CriteriaEvaluator,
} from './evaluators/evaluator.interface';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  private readonly cacheTTL = Number(process.env.REDIS_TTL || 60);
  private readonly batchSize = 1000;

  constructor(
    @InjectRepository(Candidate)
    private readonly candidates: Repository<Candidate>,

    private readonly vacancies: VacanciesService,

    private readonly redis: RedisService,

    @Inject(CRITERIA_EVALUATORS)
    private readonly evaluators: CriteriaEvaluator[],
  ) {}

  async rank(vacancyId: string, page = 1, limit = 20) {
    const startedAt = Date.now();

    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 20));

    this.logger.log(`Ranking started | vacancyId=${vacancyId}`);

    try {
      const version = await this.redis.getOrCreateVersion('ranking:version');

      const cacheKey =
        `ranking:v${version}:vacancy:${vacancyId}:page:${page}:limit:${limit}`;

      const cached = await this.redis.get(cacheKey);

      if (cached) {
        this.logger.log(`Ranking cache hit | vacancyId=${vacancyId}`);

        return JSON.parse(cached);
      }

      this.logger.log(`Ranking cache miss | vacancyId=${vacancyId}`);

      const vacancy = await this.vacancies.findOne(vacancyId);

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      const criteria = await this.vacancies.getCriteria(vacancyId);

      const maxScore = criteria.reduce(
        (sum, criterion) => sum + criterion.weight,
        0,
      );

      const total = await this.candidates.count();

      const topK = page * limit;
      let offset = 0;
      let ranked: any[] = [];

      while (offset < total) {
        const candidateRows = await this.candidates.find({
          select: [
            'id',
            'name',
            'email',
            'birthday',
            'gender',
            'currentSalary',
          ],
          order: {
            id: 'ASC',
          },
          skip: offset,
          take: this.batchSize,
        });

        if (candidateRows.length === 0) break;

        const batchRanked = candidateRows.map((candidate) => {
          let score = 0;

          const criteriaDetails = criteria.map((criterion) => {
            const evaluator = this.evaluators.find(
              (item) => item.type === criterion.type,
            );

            const matched = evaluator
              ? evaluator.evaluate(candidate, criterion.details)
              : false;

            const earnedScore = matched ? criterion.weight : 0;

            score += earnedScore;

            return {
              type: criterion.type,
              weight: criterion.weight,
              candidateValue: this.getCandidateValue(
                candidate,
                criterion.type,
              ),
              requirement: criterion.details,
              matched,
              earnedScore,
            };
          });

          return {
            candidateId: candidate.id,
            name: candidate.name,
            email: candidate.email,
            score,
            maxScore,
            percentage:
              maxScore > 0
                ? Number(((score / maxScore) * 100).toFixed(2))
                : 0,
            criteriaDetails,
          };
        });

        ranked = [...ranked, ...batchRanked]
          .sort(
            (a, b) =>
              b.score - a.score ||
              a.candidateId.localeCompare(b.candidateId),
          )
          .slice(0, topK);

        offset += candidateRows.length;
      }


      const start = (page - 1) * limit;

      const response = {
        vacancyId,
        vacancyName: vacancy.name,
        maxScore,
        data: ranked.slice(start, start + limit),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      await this.redis.set(
        cacheKey,
        JSON.stringify(response),
        this.cacheTTL,
      );

      const durationMs = Date.now() - startedAt;

      this.logger.log(
        `Ranking completed | vacancyId=${vacancyId} | candidates=${total} | durationMs=${durationMs}`,
      );

      return response;
    } catch (error: any) {
      this.logger.error(
        `Ranking failed | vacancyId=${vacancyId} | ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  private getCandidateValue(candidate: Candidate, type: string) {
    switch (type) {
      case 'age':
        return this.calculateAge(candidate.birthday);

      case 'gender':
        return candidate.gender;

      case 'salary':
        return candidate.currentSalary;

      default:
        return null;
    }
  }

  private calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) age--;

    return age;
  }
}
