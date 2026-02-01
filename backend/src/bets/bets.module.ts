import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from './schemas';
import { Game, GameSchema } from '../games/schemas';
import { User, UserSchema } from '../users/schemas';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bet.name, schema: BetSchema },
      { name: Game.name, schema: GameSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [MongooseModule, BetsService],
})
export class BetsModule {}
