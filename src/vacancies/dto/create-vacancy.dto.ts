import { ArrayMinSize, IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CriterionDto } from './criterion.dto';
export class CreateVacancyDto {
  @IsString() @IsNotEmpty() @MaxLength(150) name: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CriterionDto) criteria: CriterionDto[];
}
