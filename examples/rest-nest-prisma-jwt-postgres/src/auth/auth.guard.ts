import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const refreshTokenCookieName = this.configService.get<string>('ACCESS_TOKEN_COOKIE_NAME');

    const token: string = request.cookies[refreshTokenCookieName];
    try {
      const deodedPayload = jwt.verify(
        token,
        this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      ) as Request['user'];

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      // 💡 and to make it typesafe we extended express request type in 'src/types/global.d.ts"
      request.user = deodedPayload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
