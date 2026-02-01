import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, CurrentUser } from '../common';
import { UpdateFavoriteTeamDto } from './dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch('favorite-team')
  async updateFavoriteTeam(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateFavoriteTeamDto,
  ) {
    const updatedUser = await this.usersService.updateFavoriteTeam(
      user.sub,
      dto.favoriteTeam,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return { favoriteTeam: updatedUser.favoriteTeam };
  }

  @Get('favorite-team')
  async getFavoriteTeam(@CurrentUser() user: JwtPayload) {
    const favoriteTeam = await this.usersService.getFavoriteTeam(user.sub);
    return { favoriteTeam };
  }
}
