import { IsNumber, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsUUID()
  ownerId: string;
}
