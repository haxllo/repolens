import { IsString, IsUrl, IsOptional } from 'class-validator'

export class CreateScanDto {
  @IsUrl()
  repoUrl: string

  @IsOptional()
  @IsString()
  branch?: string
}
