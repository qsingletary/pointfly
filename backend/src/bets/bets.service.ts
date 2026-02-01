import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet, BetDocument } from './schemas/bet.schema';
import { Game, GameDocument } from '../games/schemas/game.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { PlaceBetDto } from './dto';

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Place a bet on a game.
   * Validates that the game exists, hasn't started, user hasn't already bet,
   * and user has set a favorite team that is playing in the game.
   */
  async placeBet(userId: string, dto: PlaceBetDto): Promise<BetDocument> {
    // Validate gameId format
    if (!Types.ObjectId.isValid(dto.gameId)) {
      throw new BadRequestException('Invalid game ID');
    }

    // Find the user and check favorite team
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.favoriteTeam) {
      throw new BadRequestException(
        'You must set a favorite team before placing bets',
      );
    }

    // Find the game
    const game = await this.gameModel.findById(dto.gameId).exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Validate game involves user's favorite team
    if (
      game.homeTeam !== user.favoriteTeam &&
      game.awayTeam !== user.favoriteTeam
    ) {
      throw new BadRequestException(
        'You can only bet on games involving your favorite team',
      );
    }

    // Check if game has already started
    if (game.startTime <= new Date()) {
      throw new BadRequestException(
        'Cannot place bet on a game that has already started',
      );
    }

    // Check if game is finished
    if (game.status === 'finished') {
      throw new BadRequestException('Cannot place bet on a finished game');
    }

    // Try to create the bet (compound unique index will prevent duplicates)
    try {
      const bet = await this.betModel.create({
        userId: new Types.ObjectId(userId),
        gameId: new Types.ObjectId(dto.gameId),
        selection: dto.selection,
        status: 'pending',
        spreadAtBet: game.spread,
        favoriteTeamAtBet: user.favoriteTeam,
      });

      return bet;
    } catch (error: unknown) {
      // Handle duplicate key error (MongoDB error code 11000)
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictException(
          'You have already placed a bet on this game',
        );
      }
      throw error;
    }
  }

  /**
   * Get all bets for a user, populated with game details.
   */
  async getUserBets(userId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('gameId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a specific bet by ID.
   */
  async getBetById(betId: string): Promise<BetDocument | null> {
    if (!Types.ObjectId.isValid(betId)) {
      return null;
    }
    return this.betModel.findById(betId).populate('gameId').exec();
  }
}
