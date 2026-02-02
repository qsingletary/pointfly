import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  JwtAuthGuard,
  CurrentUser,
  SPORTS_CONFIG,
  getTeamsForSport,
  getSupportedSports,
} from '../common';
import { UpdateFavoriteTeamDto } from './dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get the list of supported sports.
   * Public endpoint - no authentication required.
   */
  @Get('sports')
  getSports() {
    const sports = Object.values(SPORTS_CONFIG).map((config) => ({
      key: config.key,
      name: config.name,
    }));
    return { sports };
  }

  /**
   * Get the list of teams for a specific sport.
   * Public endpoint - no authentication required.
   */
  @Get('sports/:sport/teams')
  getTeamsForSport(@Param('sport') sport: string) {
    const supportedSports = getSupportedSports();
    if (!supportedSports.includes(sport)) {
      throw new NotFoundException(
        `Sport '${sport}' not found. Supported sports: ${supportedSports.join(', ')}`,
      );
    }
    return { sport, teams: getTeamsForSport(sport) };
  }

  @Patch('favorite-team')
  @UseGuards(JwtAuthGuard)
  async updateFavoriteTeam(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateFavoriteTeamDto,
  ) {
    const updatedUser = await this.usersService.updateFavoriteTeam(
      user.sub,
      dto.sport,
      dto.favoriteTeam,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      favoriteSport: updatedUser.favoriteSport,
      favoriteTeam: updatedUser.favoriteTeam,
    };
  }

  @Get('favorite-team')
  @UseGuards(JwtAuthGuard)
  async getFavoriteTeam(@CurrentUser() user: JwtPayload) {
    const { sport, team } = await this.usersService.getFavoriteTeam(user.sub);
    return { favoriteSport: sport, favoriteTeam: team };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    const result = await this.usersService.deleteAccount(user.sub);

    if (!result.userDeleted) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Account deleted successfully',
      deletedBets: result.deletedBets,
    };
  }
}
