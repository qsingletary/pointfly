import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateFavoriteTeamDto {
  @IsString()
  @IsNotEmpty()
  favoriteTeam: string;
}
