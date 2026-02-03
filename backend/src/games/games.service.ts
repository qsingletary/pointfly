import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { Bet, BetDocument } from '../bets/schemas/bet.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SettleGameDto } from './dto';

const POINTS_FOR_WIN = 100;

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get all games, sorted by start time (newest first).
   * Admin-only method.
   */
  async getAllGames(): Promise<GameDocument[]> {
    return this.gameModel.find().sort({ startTime: -1 }).exec();
  }

  /**
   * Get a game by its MongoDB ObjectId.
   */
  async getGameById(gameId: string): Promise<GameDocument | null> {
    if (!Types.ObjectId.isValid(gameId)) {
      return null;
    }
    return this.gameModel.findById(gameId).exec();
  }

  /**
   * Settle a game with final scores and update all associated bets.
   */
  async settleGame(
    gameId: string,
    dto: SettleGameDto,
  ): Promise<{
    game: GameDocument;
    settledBets: number;
    pointsAwarded: number;
  }> {
    const game = await this.getGameById(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status === 'finished') {
      throw new BadRequestException('Game has already been settled');
    }

    if (game.startTime > new Date()) {
      throw new BadRequestException(
        'Cannot settle a game that has not started',
      );
    }

    // Update game with final scores
    game.finalHomeScore = dto.finalHomeScore;
    game.finalAwayScore = dto.finalAwayScore;
    game.status = 'finished';
    await game.save();

    this.logger.log(
      `Settling game ${gameId}: ${game.awayTeam} ${dto.finalAwayScore} @ ${game.homeTeam} ${dto.finalHomeScore}`,
    );

    // Get all pending bets for this game
    const pendingBets = await this.betModel
      .find({ gameId: game._id, status: 'pending' })
      .exec();

    let settledBets = 0;
    let pointsAwarded = 0;

    for (const bet of pendingBets) {
      const result = this.determineBetResult(
        game,
        bet.selection,
        bet.spreadAtBet,
        dto.finalHomeScore,
        dto.finalAwayScore,
        bet.favoriteTeamAtBet,
      );

      bet.status = result;
      await bet.save();
      settledBets++;

      if (result === 'won') {
        // Award points to the user
        await this.userModel.updateOne(
          { _id: bet.userId },
          { $inc: { points: POINTS_FOR_WIN } },
        );
        pointsAwarded += POINTS_FOR_WIN;
      }
    }

    this.logger.log(
      `Settled ${settledBets} bets, awarded ${pointsAwarded} points`,
    );

    return { game, settledBets, pointsAwarded };
  }

  /**
   * Determine the result of a bet based on the game outcome.
   *
   * Settlement logic:
   * - The spread (e.g., -5.5) applies to the SPREAD TEAM (game.spreadTeam), not the user's team
   * - If user's favorite team IS the spread team, they must win by more than |spread|
   * - If user's favorite team is NOT the spread team, they're the underdog and can lose by up to |spread|
   *
   * For 'favorite' bets: user wins if their favorite team covers the spread
   * For 'opponent' bets: user wins if their favorite team's opponent covers the spread
   */
  private determineBetResult(
    game: GameDocument,
    selection: 'favorite' | 'opponent',
    spreadAtBet: number,
    finalHomeScore: number,
    finalAwayScore: number,
    favoriteTeamAtBet: string,
  ): 'won' | 'lost' | 'push' {
    // Get scores for the user's favorite team and their opponent
    const userFavoriteScore =
      game.homeTeam === favoriteTeamAtBet ? finalHomeScore : finalAwayScore;
    const opponentScore =
      game.homeTeam === favoriteTeamAtBet ? finalAwayScore : finalHomeScore;

    // The spread is defined from the spread team's perspective (negative means they're favored)
    // Adjust the spread based on whether the user's favorite team is the spread team or not
    // - If user's favorite IS the spread team: use spread as-is (negative, they need to win by that margin)
    // - If user's favorite is NOT the spread team: flip the spread (positive, they're the underdog)
    const adjustedSpread =
      favoriteTeamAtBet === game.spreadTeam ? spreadAtBet : -spreadAtBet;

    const actualMargin = userFavoriteScore - opponentScore;
    const adjustedMargin = actualMargin + adjustedSpread;

    this.logger.debug(
      `Bet result calculation: userFavorite=${favoriteTeamAtBet}(${userFavoriteScore}), ` +
        `opponent=${opponentScore}, spreadTeam=${game.spreadTeam}, rawSpread=${spreadAtBet}, ` +
        `adjustedSpread=${adjustedSpread}, margin=${actualMargin}, adjustedMargin=${adjustedMargin}, selection=${selection}`,
    );

    if (selection === 'favorite') {
      // User bet on their favorite team - they win if adjustedMargin is positive
      if (adjustedMargin > 0) return 'won';
      if (adjustedMargin < 0) return 'lost';
      return 'push';
    } else {
      // User bet against their favorite team - they win if adjustedMargin is negative
      if (adjustedMargin < 0) return 'won';
      if (adjustedMargin > 0) return 'lost';
      return 'push';
    }
  }
}
