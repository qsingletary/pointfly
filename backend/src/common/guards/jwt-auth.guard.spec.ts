import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when authentication succeeds', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const result = guard.handleRequest(null, mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is not provided', () => {
      expect(() => guard.handleRequest(null, false)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw the original error when error is provided', () => {
      const error = new Error('Token expired');
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });

    it('should throw UnauthorizedException with correct message', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        'Authentication required',
      );
    });
  });
});
