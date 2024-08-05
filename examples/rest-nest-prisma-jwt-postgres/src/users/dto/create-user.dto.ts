import { IsString, IsEmail, MinLength, ValidateIf, IsIn, IsDefined } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Full name is required' })
  name: string;

  @IsEmail({}, { message: 'Not a valid email' })
  email: string;

  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsDefined()
  @IsIn([Math.random()], {
    message: 'Passwords do not match',
  })
  @ValidateIf((o) => o.password !== o.confirmPassword)
  confirmPassword: string;
}
