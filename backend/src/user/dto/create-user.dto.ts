import { IsString, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsString()
  username: string = ''

  @IsString()
  password: string = ''

  @IsOptional()
  @IsString()
  nickname: string = ''
}

export class LoginDto {
  @IsString()
  username: string = ''

  @IsString()
  password: string = ''
}
