import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BetsService } from './bets.service';
import { JwtAuthGuard, AdminApiKeyGuard, CurrentUser } from '../common';
import { PlaceBetDto } from './dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('bets')
export class BetsController {
  constructor(private betsService: BetsService) {}

  /**
   * Get all bets (admin only).
   * Returns all bets with user and game details populated.
   */
  @Get('all')
  @UseGuards(AdminApiKeyGuard)
  async getAllBets() {
    return this.betsService.getAllBets();
  }

  /**
   * Place a bet on a game.
   * Only one bet per user per game is allowed.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async placeBet(@CurrentUser() user: JwtPayload, @Body() dto: PlaceBetDto) {
    const bet = await this.betsService.placeBet(user.sub, dto);
    return bet;
  }

  /**
   * Get all bets for the authenticated user.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserBets(@CurrentUser() user: JwtPayload) {
    const bets = await this.betsService.getUserBets(user.sub);
    return bets;
  }
}
