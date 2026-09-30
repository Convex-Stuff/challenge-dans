import "server-only";

import { prisma } from "@/lib/prisma";

export type OsuProfile = {
  osuId: number;
  osuUsername: string;
  image: string | null;
};

/**
 * Copies the player's current osu! username and avatar onto their user. The
 * Auth.js adapter only writes them when it first creates the user, and both
 * can change upstream between sign-ins.
 */
export async function updateOsuProfile(userId: string, profile: OsuProfile) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      osuId: profile.osuId,
      osuUsername: profile.osuUsername,
      name: profile.osuUsername,
      // A missing avatar in one sign-in keeps the stored one.
      ...(profile.image !== null && { image: profile.image }),
    },
  });
}
