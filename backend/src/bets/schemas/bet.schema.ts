import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Game } from '../../games/schemas/game.schema';

export type BetDocument = HydratedDocument<Bet>;

export type BetSelection = 'favorite' | 'opponent';
export type BetStatus = 'pending' | 'won' | 'lost' | 'push';

@Schema({ timestamps: true })
export class Bet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Game | Types.ObjectId;

  @Prop({ required: true, enum: ['favorite', 'opponent'] })
  selection: BetSelection;

  @Prop({
    required: true,
    enum: ['pending', 'won', 'lost', 'push'],
    default: 'pending',
  })
  status: BetStatus;

  @Prop({ required: true })
  spreadAtBet: number;
}

export const BetSchema = SchemaFactory.createForClass(Bet);

// Compound unique index: one bet per game per user
BetSchema.index({ userId: 1, gameId: 1 }, { unique: true });
