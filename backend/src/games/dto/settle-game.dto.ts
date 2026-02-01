import { IsNumber, IsInt, Min } from 'class-validator';

export class SettleGameDto {
  @IsNumber()
  @IsInt()
  @Min(0)
  finalHomeScore: number;

  @IsNumber()
  @IsInt()
  @Min(0)
  finalAwayScore: number;
}
