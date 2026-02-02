import { IsString, IsNotEmpty, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  getSupportedSports,
  isValidTeamForSport,
  getTeamsForSport,
} from '../../common';

@ValidatorConstraint({ name: 'isValidSport', async: false })
class IsValidSportConstraint implements ValidatorConstraintInterface {
  validate(sport: string) {
    return getSupportedSports().includes(sport);
  }

  defaultMessage() {
    return `sport must be one of: ${getSupportedSports().join(', ')}`;
  }
}

@ValidatorConstraint({ name: 'isValidTeamForSport', async: false })
class IsValidTeamForSportConstraint implements ValidatorConstraintInterface {
  validate(team: string, args: ValidationArguments) {
    const dto = args.object as UpdateFavoriteTeamDto;
    if (!dto.sport) return false;
    return isValidTeamForSport(dto.sport, team);
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as UpdateFavoriteTeamDto;
    const teams = getTeamsForSport(dto.sport);
    if (teams.length === 0) {
      return `Invalid sport selected`;
    }
    return `favoriteTeam must be a valid team for ${dto.sport}. Valid teams: ${teams.join(', ')}`;
  }
}

export class UpdateFavoriteTeamDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidSportConstraint)
  sport: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTeamForSportConstraint)
  favoriteTeam: string;
}
