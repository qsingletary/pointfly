import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas';
import { OddsApiService } from './odds-api.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  providers: [OddsApiService],
  exports: [MongooseModule, OddsApiService],
})
export class GamesModule {}
