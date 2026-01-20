import { IsString, IsOptional } from 'class-validator'
import { IsSafeRepositoryUrl } from '../../validators'

export class CreateScanDto {
  @IsSafeRepositoryUrl({
    message: 'Repository URL must be a valid public Git repository URL (e.g., https://github.com/user/repo)',
  })
  repoUrl: string

  @IsOptional()
  @IsString()
  branch?: string
}
