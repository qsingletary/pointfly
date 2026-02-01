import { IsNotEmpty, IsString } from 'class-validator';

export class TokenExchangeDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
