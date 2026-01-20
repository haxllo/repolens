import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Public } from '../auth/public.decorator';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Public()
  @Get()
  async listFavorites(@Query('userId') userId?: string) {
    return this.favoritesService.listFavorites(userId || 'guest');
  }

  @Public()
  @Post(':repositoryId')
  async addFavorite(
    @Query('userId') userId: string,
    @Param('repositoryId') repositoryId: string
  ) {
    return this.favoritesService.addFavorite(userId || 'guest', repositoryId);
  }

  @Public()
  @Delete(':repositoryId')
  async removeFavorite(
    @Query('userId') userId: string,
    @Param('repositoryId') repositoryId: string
  ) {
    return this.favoritesService.removeFavorite(userId || 'guest', repositoryId);
  }

  @Public()
  @Get(':repositoryId/check')
  async checkFavorite(
    @Query('userId') userId: string,
    @Param('repositoryId') repositoryId: string
  ) {
    const isFavorite = await this.favoritesService.isFavorite(userId || 'guest', repositoryId);
    return { isFavorite };
  }
}
