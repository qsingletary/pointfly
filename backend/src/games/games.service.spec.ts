/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GamesService } from './games.service';
import { Game } from './schemas/game.schema';
import { Bet } from '../bets/schemas/bet.schema';
import { User } from '../users/schemas/user.schema';
import { BadRequestException } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let mockGameModel: any;
  let mockBetModel: any;
  let mockUserModel: any;

  const mockGame = {
    _id: '507f1f77bcf86cd799439012',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    startTime: new Date(Date.now() - 86400000), // yesterday (already started)
    spread: -4.5,
    status: 'upcoming',
    finalHomeScore: undefined,
    finalAwayScore: undefined,
    save: jest.fn(),
  };

  beforeEach(async () => {
    mockGameModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockBetModel = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockUserModel = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getModelToken(Game.name), useValue: mockGameModel },
        { provide: getModelToken(Bet.name), useValue: mockBetModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  describe('settleGame', () => {
    it('should settle a game and mark winning bets', async () => {
      const game = { ...mockGame, save: jest.fn().mockResolvedValue(mockGame) };
      mockGameModel.exec.mockResolvedValue(game);

      const winningBet = {
        _id: 'bet1',
        userId: 'user1',
        selection: 'favorite',
        spreadAtBet: -4.5,
        favoriteTeamAtBet: 'Los Angeles Lakers',
        status: 'pending',
        save: jest.fn(),
      };
      mockBetModel.exec.mockResolvedValue([winningBet]);

      // Lakers win 110-100, covering the -4.5 spread
      const result = await service.settleGame(mockGame._id, {
        finalHomeScore: 110,
        finalAwayScore: 100,
      });

      expect(result.game.status).toBe('finished');
      expect(result.settledBets).toBe(1);
      expect(winningBet.status).toBe('won');
      expect(result.pointsAwarded).toBe(100);
    });

    it('should mark losing bets correctly', async () => {
      const game = { ...mockGame, save: jest.fn().mockResolvedValue(mockGame) };
      mockGameModel.exec.mockResolvedValue(game);

      const losingBet = {
        _id: 'bet1',
        userId: 'user1',
        selection: 'favorite',
        spreadAtBet: -4.5,
        favoriteTeamAtBet: 'Los Angeles Lakers',
        status: 'pending',
        save: jest.fn(),
      };
      mockBetModel.exec.mockResolvedValue([losingBet]);

      // Lakers win 102-100, NOT covering the -4.5 spread
      const result = await service.settleGame(mockGame._id, {
        finalHomeScore: 102,
        finalAwayScore: 100,
      });

      expect(losingBet.status).toBe('lost');
      expect(result.pointsAwarded).toBe(0);
    });

    it('should mark push correctly when margin equals spread', async () => {
      const game = { ...mockGame, save: jest.fn().mockResolvedValue(mockGame) };
      mockGameModel.exec.mockResolvedValue(game);

      // Use a spread of -4 for cleaner push scenario
      const pushBet = {
        _id: 'bet1',
        userId: 'user1',
        selection: 'favorite',
        spreadAtBet: -4,
        favoriteTeamAtBet: 'Los Angeles Lakers',
        status: 'pending',
        save: jest.fn(),
      };
      mockBetModel.exec.mockResolvedValue([pushBet]);

      // Lakers win by exactly 4 points (push on -4 spread)
      const result = await service.settleGame(mockGame._id, {
        finalHomeScore: 104,
        finalAwayScore: 100,
      });

      expect(pushBet.status).toBe('push');
      expect(result.pointsAwarded).toBe(0);
    });

    it('should reject settling an already finished game', async () => {
      const finishedGame = { ...mockGame, status: 'finished' };
      mockGameModel.exec.mockResolvedValue(finishedGame);

      await expect(
        service.settleGame(mockGame._id, {
          finalHomeScore: 100,
          finalAwayScore: 90,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
