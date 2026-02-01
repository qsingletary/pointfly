import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas';
import { Bet, BetSchema } from '../bets/schemas';
import { User, UserSchema } from '../users/schemas';
import { UsersModule } from '../users/users.module';
import { OddsApiService } from './odds-api.service';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Bet.name, schema: BetSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [GamesController],
  providers: [OddsApiService, GamesService],
  exports: [MongooseModule, OddsApiService, GamesService],
})
export class GamesModule {}
