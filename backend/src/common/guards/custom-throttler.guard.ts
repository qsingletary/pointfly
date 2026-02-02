import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // Skip throttling for OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
