import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import {
    Strategy,
    ExtractJwt,
    StrategyOptionsWithoutRequest,
} from "passport-jwt";

const fromCookie = (cookieName: string) => (req: Request) => {
    return req.cookies[cookieName];
};

const JWT_STRATEGY_OPTIONS: StrategyOptionsWithoutRequest = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string,
};

const JWT_REFRESH_STRATEGY_OPTIONS: StrategyOptionsWithoutRequest = {
    jwtFromRequest: fromCookie(process.env.REFRESH_TOKEN_COOKIE_NAME!),
    secretOrKey: process.env.JWT_REFRESH_SECRET as string,
};

export const jwtStrategy = new Strategy(
    JWT_STRATEGY_OPTIONS,
    (payload: JwtPayload, done) => {
        if (payload.exp && new Date(payload.exp * 1000) < new Date())
            return done(null, false);
        return done(null, payload);
    }
);

export const jwtRefreshStrategy = new Strategy(
    JWT_REFRESH_STRATEGY_OPTIONS,
    (payload: JwtPayload, done) => {
        if (payload.exp && new Date(payload.exp * 1000) < new Date())
            return done(null, false);
        return done(null, payload);
    }
);
