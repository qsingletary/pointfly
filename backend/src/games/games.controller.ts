import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OddsApiService } from './odds-api.service';
import { GamesService } from './games.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard, AdminApiKeyGuard, CurrentUser } from '../common';
import { SettleGameDto } from './dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('games')
export class GamesController {
  constructor(
    private oddsApiService: OddsApiService,
    private gamesService: GamesService,
    private usersService: UsersService,
  ) {}

  /**
   * Get the next upcoming game from the database.
   * Does not call the external Odds API.
   */
  @Get('next')
  @UseGuards(JwtAuthGuard)
  async getNextGame(@CurrentUser() user: JwtPayload) {
    const { sport, team } = await this.usersService.getFavoriteTeam(user.sub);

    if (!sport || !team) {
      throw new BadRequestException(
        'You must set a favorite team before viewing games',
      );
    }

    const game = await this.oddsApiService.getNextUpcomingGame(team);

    if (!game) {
      throw new NotFoundException('No upcoming games found');
    }

    return game;
  }

  /**
   * Fetch games from the Odds API and return the next upcoming game.
   * Updates the database with any new or changed games.
   * Returns game: null if no upcoming games are found.
   */
  @Post('next')
  @UseGuards(JwtAuthGuard)
  async fetchNextGame(@CurrentUser() user: JwtPayload) {
    const { sport, team } = await this.usersService.getFavoriteTeam(user.sub);

    if (!sport || !team) {
      throw new BadRequestException(
        'You must set a favorite team before fetching games',
      );
    }

    const result = await this.oddsApiService.fetchAndUpsertGames(sport, team);

    return {
      game: result.game,
      remainingRequests: result.remainingRequests,
    };
  }

  /**
   * Settle a game with final scores.
   * Admin-only endpoint protected by API key.
   * Updates all pending bets and awards points to winners.
   */
  @Post(':gameId/settle')
  @UseGuards(AdminApiKeyGuard)
  async settleGame(
    @Param('gameId') gameId: string,
    @Body() dto: SettleGameDto,
  ) {
    const result = await this.gamesService.settleGame(gameId, dto);

    return {
      game: result.game,
      settledBets: result.settledBets,
      pointsAwarded: result.pointsAwarded,
    };
  }
}
