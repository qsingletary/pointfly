import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

export type GameStatus = 'upcoming' | 'finished';

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ required: true })
  homeTeam: string;

  @Prop({ required: true })
  awayTeam: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  spread: number;

  @Prop({ required: true })
  spreadTeam: string;

  @Prop({ required: true, enum: ['upcoming', 'finished'], default: 'upcoming' })
  status: GameStatus;

  @Prop()
  finalHomeScore?: number;

  @Prop()
  finalAwayScore?: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
