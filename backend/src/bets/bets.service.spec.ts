/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BetsService } from './bets.service';
import { Bet } from './schemas/bet.schema';
import { Game } from '../games/schemas/game.schema';
import { User } from '../users/schemas/user.schema';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('BetsService', () => {
  let service: BetsService;
  let mockBetModel: any;
  let mockGameModel: any;
  let mockUserModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    favoriteTeam: 'Los Angeles Lakers',
  };

  const mockGame = {
    _id: '507f1f77bcf86cd799439012',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    startTime: new Date(Date.now() + 86400000), // tomorrow
    spread: -4.5,
    status: 'upcoming',
  };

  beforeEach(async () => {
    mockBetModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockGameModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockUserModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetsService,
        { provide: getModelToken(Bet.name), useValue: mockBetModel },
        { provide: getModelToken(Game.name), useValue: mockGameModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<BetsService>(BetsService);
  });

  describe('placeBet', () => {
    it('should create a bet successfully', async () => {
      mockUserModel.exec.mockResolvedValue(mockUser);
      mockGameModel.exec.mockResolvedValue(mockGame);
      mockBetModel.create.mockResolvedValue({
        _id: 'bet123',
        userId: mockUser._id,
        gameId: mockGame._id,
        selection: 'favorite',
        status: 'pending',
      });

      const result = await service.placeBet(mockUser._id, {
        gameId: mockGame._id,
        selection: 'favorite',
      });

      expect(result).toBeDefined();
      expect(mockBetModel.create).toHaveBeenCalled();
    });

    it('should reject bet on game that has already started', async () => {
      const startedGame = {
        ...mockGame,
        startTime: new Date(Date.now() - 1000),
      };
      mockUserModel.exec.mockResolvedValue(mockUser);
      mockGameModel.exec.mockResolvedValue(startedGame);

      await expect(
        service.placeBet(mockUser._id, {
          gameId: mockGame._id,
          selection: 'favorite',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate bets', async () => {
      mockUserModel.exec.mockResolvedValue(mockUser);
      mockGameModel.exec.mockResolvedValue(mockGame);
      const duplicateError = new Error('Duplicate key error') as Error & {
        code: number;
      };
      duplicateError.code = 11000;
      mockBetModel.create.mockRejectedValue(duplicateError);

      await expect(
        service.placeBet(mockUser._id, {
          gameId: mockGame._id,
          selection: 'favorite',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject bet if user has no favorite team', async () => {
      mockUserModel.exec.mockResolvedValue({ ...mockUser, favoriteTeam: null });

      await expect(
        service.placeBet(mockUser._id, {
          gameId: mockGame._id,
          selection: 'favorite',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
