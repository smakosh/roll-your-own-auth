import jwt from "jsonwebtoken";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env
      .JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function generateMagicLinkToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.MAGIC_LINK_SECRET!, {
    expiresIn: "15m",
  });
}

export function verifyToken(token: string, secret: string): unknown {
  return jwt.verify(token, secret);
}
