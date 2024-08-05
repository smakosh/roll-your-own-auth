import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async signup(userDetails: CreateUserDto) {
    const user = await this.usersService.createUser(userDetails);

    const access_token = jwt.sign({ id: user.id }, this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'), {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refresh_token = jwt.sign({ id: user.id }, this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'), {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return { access_token, refresh_token };
  }

  async login(credentials: LoginDto) {
    const user = await this.usersService.findUserByEmail(credentials.email);

    await argon2.verify(user.password, credentials.password).catch();

    const access_token = jwt.sign({ id: user.id }, this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'), {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refresh_token = jwt.sign({ id: user.id }, this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'), {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return { access_token, refresh_token };
  }
}
