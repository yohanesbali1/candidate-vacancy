import { IsArray, IsOptional, IsString, MaxLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CriterionDto } from './criterion.dto';
export class UpdateVacancyDto {
  @IsOptional() @IsString() @MaxLength(150) name?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CriterionDto) criteria?: CriterionDto[];
}
