import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenExchangeDto } from './dto/token-exchange.dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import type { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Exchange OAuth user info for a backend JWT.
   * Called by the frontend after successful Google OAuth sign-in.
   */
  @Post('token')
  async exchangeToken(@Body() dto: TokenExchangeDto) {
    return this.authService.exchangeToken(dto);
  }

  /**
   * Get the current authenticated user's profile.
   * Useful for refreshing user data (e.g., points) without re-authenticating.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    const userData = await this.authService.getCurrentUser(user.sub);
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    return userData;
  }
}
