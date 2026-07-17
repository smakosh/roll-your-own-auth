import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

import { prisma } from "@/config";

passport.use(
  new GitHubStrategy(
    {
      clientID: String(process.env.GITHUB_CLIENT_ID),
      clientSecret: String(process.env.GITHUB_CLIENT_SECRET),
      callbackURL: String(process.env.GITHUB_CALLBACK_URL),
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: (error: Error | null, user?: any) => void,
    ) => {
      try {
        const githubId = String(profile.id);
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.username || null;

        if (!email) {
          return done(new Error("GitHub account has no public email."));
        }

        const user = await prisma.user.upsert({
          where: { githubId },
          update: { name },
          create: { githubId, email, name },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

export { passport };
