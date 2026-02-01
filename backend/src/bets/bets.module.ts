import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from './schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }])],
  exports: [MongooseModule],
})
export class BetsModule {}
