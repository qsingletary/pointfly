import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-admin-api-key'];
    const validApiKey = this.configService.get<string>('adminApiKey');

    if (!apiKey || typeof apiKey !== 'string' || !validApiKey) {
      throw new ForbiddenException('Invalid or missing admin API key');
    }

    // Use timing-safe comparison to prevent timing attacks
    const apiKeyBuffer = Buffer.from(apiKey);
    const validKeyBuffer = Buffer.from(validApiKey);

    // Keys must be same length for timingSafeEqual
    if (apiKeyBuffer.length !== validKeyBuffer.length) {
      throw new ForbiddenException('Invalid or missing admin API key');
    }

    if (!timingSafeEqual(apiKeyBuffer, validKeyBuffer)) {
      throw new ForbiddenException('Invalid or missing admin API key');
    }

    return true;
  }
}
