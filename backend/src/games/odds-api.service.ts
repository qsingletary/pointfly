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

// Response from /events endpoint (no odds data)
interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
}

// Response from /odds endpoint (includes bookmakers)
interface OddsApiGame extends OddsApiEvent {
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
  }

  /**
   * Fetch games from The Odds API and upsert favorite team games.
   * Returns the next upcoming game for the favorite team.
   * @param sport - The Odds API sport key (e.g., 'basketball_nba')
   * @param favoriteTeam - The user's favorite team name
   */
  async fetchAndUpsertGames(
    sport: string,
    favoriteTeam: string,
  ): Promise<NextGameResponse> {
    this.logger.log(
      `Fetching events for ${sport}, favorite team: ${favoriteTeam}`,
    );

    // Step 1: Fetch ALL upcoming events (doesn't count against quota)
    const eventsResponse = await this.client.get<OddsApiEvent[]>(
      `/sports/${sport}/events`,
    );

    const allEvents = eventsResponse.data;
    this.logger.log(`Received ${allEvents.length} total events from /events`);

    // Log all unique team names for debugging
    const allTeams = new Set<string>();
    allEvents.forEach((event) => {
      allTeams.add(event.home_team);
      allTeams.add(event.away_team);
    });
    this.logger.log(`Teams from API: ${[...allTeams].sort().join(', ')}`);

    // Filter for events involving the favorite team
    const favoriteTeamEvents = allEvents.filter(
      (event) =>
        event.home_team === favoriteTeam || event.away_team === favoriteTeam,
    );

    this.logger.log(
      `Found ${favoriteTeamEvents.length} events involving ${favoriteTeam}`,
    );

    if (favoriteTeamEvents.length === 0) {
      this.logger.warn(
        `No events found for "${favoriteTeam}". Check team name spelling.`,
      );
      return { game: null };
    }

    // Step 2: Fetch odds to get spread data (counts against quota)
    const oddsResponse = await this.client.get<OddsApiGame[]>(
      `/sports/${sport}/odds`,
      {
        params: {
          regions: 'us',
          markets: 'spreads',
          oddsFormat: 'american',
        },
      },
    );

    const remainingRequests = this.parseRemainingRequests(oddsResponse.headers);
    const gamesWithOdds = oddsResponse.data;

    this.logger.log(
      `Received ${gamesWithOdds.length} games with odds, remaining API requests: ${remainingRequests}`,
    );

    // Create a map of game IDs to odds data
    const oddsMap = new Map<string, OddsApiGame>();
    gamesWithOdds.forEach((game) => oddsMap.set(game.id, game));

    // Step 3: Upsert each favorite team event, using odds if available
    for (const event of favoriteTeamEvents) {
      const gameWithOdds = oddsMap.get(event.id);
      await this.upsertGameFromEvent(event, gameWithOdds, favoriteTeam);
    }

    // Return the next upcoming game
    const nextGame = await this.getNextUpcomingGame(favoriteTeam);

    return {
      game: nextGame,
      remainingRequests,
    };
  }

  /**
   * Get the next upcoming game from the database for the user's favorite team.
   */
  async getNextUpcomingGame(
    favoriteTeam: string,
  ): Promise<GameDocument | null> {
    return this.gameModel
      .findOne({
        status: 'upcoming',
        startTime: { $gt: new Date() },
        $or: [{ homeTeam: favoriteTeam }, { awayTeam: favoriteTeam }],
      })
      .sort({ startTime: 1 })
      .exec();
  }

  /**
   * Upsert a game from an event, optionally using odds data if available.
   */
  private async upsertGameFromEvent(
    event: OddsApiEvent,
    gameWithOdds: OddsApiGame | undefined,
    favoriteTeam: string,
  ): Promise<GameDocument> {
    let spread = { team: favoriteTeam, point: 0 };

    if (gameWithOdds) {
      spread = this.parseSpread(gameWithOdds, favoriteTeam);
    } else {
      this.logger.debug(
        `No odds available yet for game ${event.id}, using spread 0`,
      );
    }

    const gameData = {
      gameId: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      startTime: new Date(event.commence_time),
      spread: spread.point,
      spreadTeam: spread.team,
      status: 'upcoming' as const,
    };

    this.logger.debug(
      `Upserting game: ${gameData.awayTeam} @ ${gameData.homeTeam}, spread: ${gameData.spreadTeam} ${gameData.spread > 0 ? '+' : ''}${gameData.spread}`,
    );

    return this.gameModel.findOneAndUpdate(
      { gameId: event.id },
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
  private parseSpread(
    apiGame: OddsApiGame,
    favoriteTeam: string,
  ): { team: string; point: number } {
    // Find the first bookmaker with spreads market
    for (const bookmaker of apiGame.bookmakers) {
      const spreadsMarket = bookmaker.markets.find((m) => m.key === 'spreads');
      if (!spreadsMarket) continue;

      // Find the outcome for the favorite team
      const favoriteOutcome = spreadsMarket.outcomes.find(
        (o) => o.name === favoriteTeam,
      );

      if (favoriteOutcome) {
        return {
          team: favoriteTeam,
          point: favoriteOutcome.point,
        };
      }
    }

    // Fallback: if no spread found, use favorite team with 0 spread
    this.logger.warn(
      `No spread found for ${favoriteTeam} in game ${apiGame.id}, using 0`,
    );
    return {
      team: favoriteTeam,
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
