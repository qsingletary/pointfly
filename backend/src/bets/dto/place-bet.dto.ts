import { IsMongoId, IsIn } from 'class-validator';

export class PlaceBetDto {
  @IsMongoId()
  gameId: string;

  @IsIn(['favorite', 'opponent'])
  selection: 'favorite' | 'opponent';
}
