
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { VacancyCriterion, CriterionType } from './vacancy-criterion.entity';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepo: Repository<Vacancy>,

    @InjectRepository(VacancyCriterion)
    private readonly criterionRepo: Repository<VacancyCriterion>,

    private readonly dataSource: DataSource,

    private readonly redis: RedisService,
  ) {}

  validateCriteria(
    criteria: { type: CriterionType; details: any; weight?: number }[],
  ) {
    for (const item of criteria) {
      if (
        !Number.isInteger(item.weight ?? 1) ||
        (item.weight ?? 1) < 1
      ) {
        throw new BadRequestException(
          'Criterion weight must be a positive integer',
        );
      }

      const d = item.details;

      if (item.type === CriterionType.AGE) {
        if (
          !Number.isInteger(d?.min) ||
          !Number.isInteger(d?.max) ||
          d.min < 0 ||
          d.max < d.min
        ) {
          throw new BadRequestException(
            'Age details must contain valid min and max',
          );
        }
      } else if (item.type === CriterionType.SALARY) {
        if (
          !Number.isFinite(Number(d?.min)) ||
          !Number.isFinite(Number(d?.max)) ||
          Number(d.min) < 0 ||
          Number(d.max) < Number(d.min)
        ) {
          throw new BadRequestException(
            'Salary details must contain valid min and max',
          );
        }
      } else if (item.type === CriterionType.GENDER) {
        if (!['male', 'female', 'any'].includes(d?.value)) {
          throw new BadRequestException(
            'Gender value must be male, female, or any',
          );
        }
      }
    }
  }

  async create(dto: CreateVacancyDto) {
    this.validateCriteria(dto.criteria);

    const vacancy = this.vacancyRepo.create({
      name: dto.name,
      criteria: dto.criteria.map((c) =>
        this.criterionRepo.create({
          type: c.type,
          details: c.details,
          weight: c.weight ?? 1,
        }),
      ),
    });

    const saved = await this.vacancyRepo.save(vacancy);

    await this.redis.invalidateRanking();

    return saved;
  }

  async findAll(page = 1, limit = 20) {
    return this.vacancyRepo.findAndCount({
      relations: { criteria: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    const vacancy = await this.vacancyRepo.findOne({
      where: { id },
      relations: { criteria: true },
    });

    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    return vacancy;
  }

  async update(id: string, dto: UpdateVacancyDto) {
    const saved = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Vacancy);
      const criteriaRepo = manager.getRepository(VacancyCriterion);

      const vacancy = await repo.findOne({
        where: { id },
        relations: { criteria: true },
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      if (dto.name !== undefined) {
        vacancy.name = dto.name;
      }

      if (dto.criteria !== undefined) {
        this.validateCriteria(dto.criteria);

        await criteriaRepo.delete({ vacancyId: id });

        vacancy.criteria = dto.criteria.map((c) =>
          criteriaRepo.create({
            vacancyId: id,
            type: c.type,
            details: c.details,
            weight: c.weight ?? 1,
          }),
        );
      }

      return repo.save(vacancy);
    });

    await this.redis.del(this.criteriaCacheKey(id));
    await this.redis.invalidateRanking();

    return saved;
  }

  async remove(id: string) {
    const vacancy = await this.findOne(id);

    await this.vacancyRepo.remove(vacancy);

    await this.redis.del(this.criteriaCacheKey(id));
    await this.redis.invalidateRanking();

    return { message: 'Vacancy deleted' };
  }

  criteriaCacheKey(id: string) {
    return `vacancy:${id}:criteria`;
  }

  async getCriteria(id: string) {
    const key = this.criteriaCacheKey(id);

    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached) as VacancyCriterion[];
    }

    const vacancy = await this.findOne(id);

    await this.redis.set(
      key,
      JSON.stringify(vacancy.criteria),
      Number(process.env.REDIS_TTL || 300),
    );

    return vacancy.criteria;
  }
}
