import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios, { AxiosInstance } from 'axios';
import { Game, GameDocument } from './schemas/game.schema';

interface OddsApiOutcome {
  name: string;
  price: number;
  point: number;
}

interface OddsApiMarket {
  key: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  markets: OddsApiMarket[];
}

interface OddsApiGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface NextGameResponse {
  game: GameDocument | null;
  remainingRequests?: number;
}

@Injectable()
export class OddsApiService {
  private readonly logger = new Logger(OddsApiService.name);
  private readonly client: AxiosInstance;
  private readonly favoriteTeam: string;
  private readonly sport: string;

  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private configService: ConfigService,
  ) {
    const baseUrl = this.configService.getOrThrow<string>('oddsApi.baseUrl');
    const apiKey = this.configService.getOrThrow<string>('oddsApi.key');

    this.client = axios.create({
      baseURL: baseUrl,
      params: { apiKey },
    });

    this.favoriteTeam = this.configService.getOrThrow<string>('favoriteTeam');
    this.sport = this.configService.get<string>(
      'oddsApi.sport',
      'basketball_nba',
    );
  }

  /**
   * Fetch games from The Odds API and upsert favorite team games.
   * Returns the next upcoming game for the favorite team.
   */
  async fetchAndUpsertGames(): Promise<NextGameResponse> {
    this.logger.log(
      `Fetching odds for ${this.sport}, favorite team: ${this.favoriteTeam}`,
    );

    const response = await this.client.get<OddsApiGame[]>(
      `/sports/${this.sport}/odds`,
      {
        params: {
          regions: 'us',
          markets: 'spreads',
          oddsFormat: 'american',
        },
      },
    );

    const remainingRequests = this.parseRemainingRequests(response.headers);
    const games = response.data;

    this.logger.log(
      `Received ${games.length} games, remaining API requests: ${remainingRequests}`,
    );

    // Filter for games involving the favorite team
    const favoriteTeamGames = games.filter(
      (game) =>
        game.home_team === this.favoriteTeam ||
        game.away_team === this.favoriteTeam,
    );

    this.logger.log(
      `Found ${favoriteTeamGames.length} games involving ${this.favoriteTeam}`,
    );

    // Upsert each game
    for (const game of favoriteTeamGames) {
      await this.upsertGame(game);
    }

    // Return the next upcoming game
    const nextGame = await this.getNextUpcomingGame();

    return {
      game: nextGame,
      remainingRequests,
    };
  }

  /**
   * Get the next upcoming game from the database (without fetching from API).
   */
  async getNextUpcomingGame(): Promise<GameDocument | null> {
    return this.gameModel
      .findOne({
        status: 'upcoming',
        startTime: { $gt: new Date() },
      })
      .sort({ startTime: 1 })
      .exec();
  }

  /**
   * Upsert a game from The Odds API into MongoDB.
   */
  private async upsertGame(apiGame: OddsApiGame): Promise<GameDocument> {
    const spread = this.parseSpread(apiGame);

    const gameData = {
      gameId: apiGame.id,
      homeTeam: apiGame.home_team,
      awayTeam: apiGame.away_team,
      startTime: new Date(apiGame.commence_time),
      spread: spread.point,
      spreadTeam: spread.team,
      status: 'upcoming' as const,
    };

    this.logger.debug(
      `Upserting game: ${gameData.awayTeam} @ ${gameData.homeTeam}, spread: ${gameData.spreadTeam} ${gameData.spread > 0 ? '+' : ''}${gameData.spread}`,
    );

    return this.gameModel.findOneAndUpdate(
      { gameId: apiGame.id },
      {
        $set: gameData,
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  /**
   * Parse the spread for the favorite team from bookmakers data.
   * Uses the first available bookmaker's spreads market.
   */
  private parseSpread(apiGame: OddsApiGame): { team: string; point: number } {
    // Find the first bookmaker with spreads market
    for (const bookmaker of apiGame.bookmakers) {
      const spreadsMarket = bookmaker.markets.find((m) => m.key === 'spreads');
      if (!spreadsMarket) continue;

      // Find the outcome for the favorite team
      const favoriteOutcome = spreadsMarket.outcomes.find(
        (o) => o.name === this.favoriteTeam,
      );

      if (favoriteOutcome) {
        return {
          team: this.favoriteTeam,
          point: favoriteOutcome.point,
        };
      }
    }

    // Fallback: if no spread found, use home team with 0 spread
    this.logger.warn(
      `No spread found for ${this.favoriteTeam} in game ${apiGame.id}, using 0`,
    );
    return {
      team: this.favoriteTeam,
      point: 0,
    };
  }

  /**
   * Parse remaining API requests from response headers.
   */
  private parseRemainingRequests(
    headers: Record<string, unknown>,
  ): number | undefined {
    const remaining = headers['x-requests-remaining'];
    if (typeof remaining === 'string') {
      return parseInt(remaining, 10);
    }
    return undefined;
  }
}
