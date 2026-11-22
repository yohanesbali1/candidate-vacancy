import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
@Injectable()
export class CandidatesService {
  constructor(@InjectRepository(Candidate) private readonly repo: Repository<Candidate>) {}
  async create(dto: CreateCandidateDto) {
    const exists = await this.repo.exists({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');
    return this.repo.save(this.repo.create(dto));
  }
  findAll(page = 1, limit = 20) {
    return this.repo.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
  }
  async findOne(id: string) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Candidate not found');
    return item;
  }
  async update(id: string, dto: UpdateCandidateDto) {
    const item = await this.findOne(id);
    if (dto.email && dto.email !== item.email && await this.repo.exists({ where: { email: dto.email } })) {
      throw new ConflictException('Email already exists');
    }
    Object.assign(item, dto);
    return this.repo.save(item);
  }
  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { message: 'Candidate deleted' };
  }
}
