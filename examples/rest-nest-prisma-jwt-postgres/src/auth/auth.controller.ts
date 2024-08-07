import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.signup(createUserDto);

    res.cookie(this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME'), refresh_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_COOKIE_MAX_AGE'),
    });

    res.cookie(this.configService.get<string>('ACCESS_TOKEN_COOKIE_NAME'), access_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_COOKIE_MAX_AGE'),
    });

    return { access_token };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.login(loginDto);

    res.cookie(this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME'), refresh_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_COOKIE_MAX_AGE'),
    });

    res.cookie(this.configService.get<string>('ACCESS_TOKEN_COOKIE_NAME'), access_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_COOKIE_MAX_AGE'),
    });

    return { access_token };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const old_refresh_token: string = req.cookies[this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME')];

    if (!old_refresh_token) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized!' });
    }

    const { access_token, refresh_token: new_refresh_token } = await this.authService.refresh(old_refresh_token);

    res.cookie(this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME'), new_refresh_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_COOKIE_MAX_AGE'),
    });

    res.cookie(this.configService.get<string>('ACCESS_TOKEN_COOKIE_NAME'), access_token, {
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_COOKIE_MAX_AGE'),
    });

    return { access_token };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res
      .clearCookie(this.configService.get<string>('ACCESS_TOKEN_COOKIE_NAME'))
      .clearCookie(this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME'))
      .end();
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Req() req: Request) {
    const { id, email, name } = await this.usersService.findUserById(req.user.id);

    return { id, email, name };
  }
}
