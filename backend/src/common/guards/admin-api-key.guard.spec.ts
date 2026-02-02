import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminApiKeyGuard } from './admin-api-key.guard';

describe('AdminApiKeyGuard', () => {
  let guard: AdminApiKeyGuard;
  let mockConfigService: Partial<ConfigService>;

  const createMockContext = (apiKey?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: apiKey ? { 'x-admin-api-key': apiKey } : {},
        }),
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('valid-admin-api-key-12345'),
    };
    guard = new AdminApiKeyGuard(mockConfigService as ConfigService);
  });

  it('should allow request with valid API key', () => {
    const context = createMockContext('valid-admin-api-key-12345');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException for missing API key', () => {
    const context = createMockContext();
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for invalid API key', () => {
    const context = createMockContext('wrong-api-key');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for API key with different length', () => {
    const context = createMockContext('short');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
