import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Osu from "next-auth/providers/osu";

import { updateOsuProfile } from "@/lib/data/users";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    osuId?: number | null;
    osuUsername?: string | null;
  }

  interface Session {
    user: {
      id: string;
      osuId: number | null;
      osuUsername: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The adapter's types are pinned to the `@prisma/client` package export,
  // while this project generates its client to `src/generated/prisma`. The
  // shapes are identical, so the instance is cast to satisfy the signature.
  // This is the one place outside `src/lib/data` that uses the raw client.
  adapter: PrismaAdapter(prisma as never),
  providers: [
    Osu({
      clientId: process.env.AUTH_OSU_ID,
      clientSecret: process.env.AUTH_OSU_SECRET,
      // osu! exposes no email address, so `email` is left null and the osu!
      // numeric id and username are carried onto the User record instead.
      // These extra fields are forwarded by the adapter into `user.create`.
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.username,
          email: null,
          image: profile.avatar_url,
          osuId: profile.id,
          osuUsername: profile.username,
        };
      },
    }),
  ],
  // Self-hosted behind a reverse proxy / container network, so Auth.js has to
  // trust the incoming Host header rather than refusing it as UntrustedHost.
  // Set `AUTH_URL` to the public origin in production so callback URLs match
  // the one registered with osu!; the proxy must set Host/X-Forwarded-Host.
  trustHost: true,
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      // Expose the osu! identity to the app through `session.user`.
      session.user.id = user.id;
      session.user.osuId = user.osuId ?? null;
      session.user.osuUsername = user.osuUsername ?? null;
      return session;
    },
  },
  events: {
    // Keep the stored osu! username and avatar fresh: they can change
    // upstream between sign-ins, and the adapter only writes the profile when
    // first creating the user.
    async signIn({ user, profile, isNewUser }) {
      if (!profile || !user.id || isNewUser) return;

      // Provider profile claims are typed `unknown`: check them at runtime
      // rather than trusting whatever osu! sent.
      const osuId = Number(profile.id);
      const osuUsername = profile.username;
      if (
        !Number.isFinite(osuId) ||
        typeof osuUsername !== "string" ||
        osuUsername === ""
      ) {
        return;
      }

      await updateOsuProfile(user.id, {
        osuId,
        osuUsername,
        image:
          typeof profile.avatar_url === "string" ? profile.avatar_url : null,
      });
    },
  },
});
