import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Bet, BetDocument } from '../bets/schemas/bet.schema';

export interface DeleteAccountResult {
  deletedBets: number;
  userDeleted: boolean;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
  ) {}

  async getUserById(userId: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return this.userModel.findById(userId).exec();
  }

  async updateFavoriteTeam(
    userId: string,
    sport: string,
    favoriteTeam: string,
  ): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { favoriteSport: sport, favoriteTeam },
        { new: true },
      )
      .exec();
  }

  async getFavoriteTeam(
    userId: string,
  ): Promise<{ sport: string | null; team: string | null }> {
    const user = await this.getUserById(userId);
    return {
      sport: user?.favoriteSport ?? null,
      team: user?.favoriteTeam ?? null,
    };
  }

  async deleteAccount(userId: string): Promise<DeleteAccountResult> {
    if (!Types.ObjectId.isValid(userId)) {
      return { deletedBets: 0, userDeleted: false };
    }

    this.logger.log(`Deleting account for user ${userId}`);

    // Delete all bets associated with the user
    const betsResult = await this.betModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
    this.logger.log(
      `Deleted ${betsResult.deletedCount} bets for user ${userId}`,
    );

    // Delete the user
    const userResult = await this.userModel.deleteOne({
      _id: new Types.ObjectId(userId),
    });
    this.logger.log(`User ${userId} deleted: ${userResult.deletedCount > 0}`);

    return {
      deletedBets: betsResult.deletedCount,
      userDeleted: userResult.deletedCount > 0,
    };
  }
}
