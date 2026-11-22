import { Controller, Get, Param, Query, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RankingService } from './ranking.service';
@Controller('vacancies')
export class RankingController {
  constructor(private readonly ranking: RankingService) {}
  @Get(':id/ranking') rank(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const safePage = Math.max(1, page); const safeLimit = Math.min(Math.max(1, limit), 100);
    return this.ranking.rank(id, safePage, safeLimit);
  }
}
