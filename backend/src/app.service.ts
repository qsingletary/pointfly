import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'live' | 'degraded' | 'down';
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
}

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getHealth(): HealthStatus {
    return {
      status: 'live',
      version: process.env.npm_package_version || '0.0.1',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
