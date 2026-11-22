import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly service: VacanciesService) {}
  @Post() create(@Body() dto: CreateVacancyDto) { return this.service.create(dto); }
  @Get() async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    const safePage = Math.max(1, page); const safeLimit = Math.min(Math.max(limit, 1), 100);
    const [data, total] = await this.service.findAll(safePage, safeLimit);
    return { data, meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVacancyDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
