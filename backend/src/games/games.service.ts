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
   * - favoriteScore = score of the user's favorite team at bet time
   * - opponentScore = score of the other team
   * - actualMargin = favoriteScore - opponentScore
   * - adjustedMargin = actualMargin + spread (spread is typically negative for favorites)
   *
   * For 'favorite' bets: adjustedMargin > 0 = WIN, < 0 = LOSE, = 0 = PUSH
   * For 'opponent' bets: adjustedMargin < 0 = WIN, > 0 = LOSE, = 0 = PUSH
   */
  private determineBetResult(
    game: GameDocument,
    selection: 'favorite' | 'opponent',
    spreadAtBet: number,
    finalHomeScore: number,
    finalAwayScore: number,
    favoriteTeamAtBet: string,
  ): 'won' | 'lost' | 'push' {
    // Determine which score belongs to the favorite team (at bet time)
    const favoriteScore =
      game.homeTeam === favoriteTeamAtBet ? finalHomeScore : finalAwayScore;
    const opponentScore =
      game.homeTeam === favoriteTeamAtBet ? finalAwayScore : finalHomeScore;

    // Calculate the margin with spread adjustment
    const actualMargin = favoriteScore - opponentScore;
    const adjustedMargin = actualMargin + spreadAtBet;

    this.logger.debug(
      `Bet result calculation: favorite=${favoriteScore}, opponent=${opponentScore}, ` +
        `margin=${actualMargin}, spread=${spreadAtBet}, adjusted=${adjustedMargin}, selection=${selection}`,
    );

    if (selection === 'favorite') {
      // Favorite bet wins if adjusted margin is positive
      if (adjustedMargin > 0) return 'won';
      if (adjustedMargin < 0) return 'lost';
      return 'push';
    } else {
      // Opponent bet wins if adjusted margin is negative
      if (adjustedMargin < 0) return 'won';
      if (adjustedMargin > 0) return 'lost';
      return 'push';
    }
  }
}
