import { IsEnum, IsInt, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CriterionType } from '../vacancy-criterion.entity';
export class CriterionDto {
  @IsEnum(CriterionType) type: CriterionType;
  @IsObject() details: Record<string, any>;
  @Type(() => Number) @IsInt() @Min(1) weight = 1;
}
