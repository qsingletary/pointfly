import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { User, UserDocument } from '../users/schemas/user.schema';
import { TokenExchangeDto } from './dto/token-exchange.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface TokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    points: number;
    favoriteSport?: string;
    favoriteTeam?: string;
  };
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.getOrThrow<string>('google.clientId');
    this.googleClient = new OAuth2Client(clientId);
  }

  /**
   * Exchange a Google ID token for a backend JWT.
   * Verifies the token with Google, then creates/updates the user.
   */
  async exchangeToken(dto: TokenExchangeDto): Promise<TokenResponse> {
    // Verify the Google ID token
    const payload = await this.verifyGoogleToken(dto.idToken);

    // Extract user info from verified token
    const { sub: providerId, email, name, picture } = payload;

    if (!email) {
      throw new UnauthorizedException('Email not provided in Google token');
    }

    // Upsert user by providerId (create if not exists, update if exists)
    const user = await this.userModel.findOneAndUpdate(
      { providerId },
      {
        $set: {
          email,
          name: name || email.split('@')[0],
          image: picture,
        },
        $setOnInsert: {
          providerId,
          points: 0,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Create JWT payload
    const jwtPayload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    // Sign and return the token
    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        points: user.points,
        favoriteSport: user.favoriteSport,
        favoriteTeam: user.favoriteTeam,
      },
    };
  }

  /**
   * Verify a Google ID token and return the payload.
   * Throws UnauthorizedException if verification fails.
   */
  private async verifyGoogleToken(idToken: string) {
    try {
      const clientId = this.configService.getOrThrow<string>('google.clientId');
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }

  /**
   * Get current user by ID (used to refresh user data)
   */
  async getCurrentUser(userId: string): Promise<TokenResponse['user'] | null> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      points: user.points,
      favoriteSport: user.favoriteSport,
      favoriteTeam: user.favoriteTeam,
    };
  }
}
