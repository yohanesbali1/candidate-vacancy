import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../candidate.entity';
export class CreateCandidateDto {
  @IsString() @IsNotEmpty() @MaxLength(150) name: string;
  @IsEmail() @MaxLength(255) email: string;
  @IsDateString() birthday: string;
  @IsEnum(Gender) gender: Gender;
  @Type(() => Number) @IsNumber() @IsPositive() currentSalary: number;
}
