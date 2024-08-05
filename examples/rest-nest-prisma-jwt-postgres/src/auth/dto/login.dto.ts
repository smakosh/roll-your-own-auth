import { IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Not a valid email' })
  email: string;

  @IsString({ message: 'Password is required' })
  password: string;
}
