import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BetsService } from './bets.service';
import { JwtAuthGuard, CurrentUser } from '../common';
import { PlaceBetDto } from './dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private betsService: BetsService) {}

  /**
   * Place a bet on a game.
   * Only one bet per user per game is allowed.
   */
  @Post()
  async placeBet(@CurrentUser() user: JwtPayload, @Body() dto: PlaceBetDto) {
    const bet = await this.betsService.placeBet(user.sub, dto);
    return bet;
  }

  /**
   * Get all bets for the authenticated user.
   */
  @Get()
  async getUserBets(@CurrentUser() user: JwtPayload) {
    const bets = await this.betsService.getUserBets(user.sub);
    return bets;
  }
}
