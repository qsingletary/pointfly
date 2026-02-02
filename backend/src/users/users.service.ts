import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
}
