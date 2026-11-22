import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly service: CandidatesService) {}
  @Post() create(@Body() dto: CreateCandidateDto) { return this.service.create(dto); }
  @Get() async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    const safePage = Math.max(page, 1); const safeLimit = Math.min(Math.max(limit, 1), 100);
    const [data, total] = await this.service.findAll(safePage, safeLimit);
    return { data, meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCandidateDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
