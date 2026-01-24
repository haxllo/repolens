import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ExecuteCodeDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, string>;
}
