import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(201)
  async signup(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.signup(createUserDto);

    res.cookie('__refresh_token__', refresh_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_COOKIE_MAX_AGE'),
    });

    res.cookie('__access_token__', access_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_COOKIE_MAX_AGE'),
    });

    return { access_token };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.login(loginDto);

    res.cookie('__refresh_token__', refresh_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_COOKIE_MAX_AGE'),
    });

    res.cookie('__access_token__', access_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_COOKIE_MAX_AGE'),
    });

    return { access_token };
  }
}
