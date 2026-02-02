import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Skip throttling for OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return true;
    }
    return false;
  }
}
