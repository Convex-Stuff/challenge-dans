import "server-only";

import { cache } from "react";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/lib/errors";
import { displayName } from "@/lib/data/shared";

/**
 * The signed-in user, as the rest of the app sees them.
 *
 * Deliberately a small object rather than the Auth.js session or a database
 * row, so it can be passed to any component without leaking fields the UI
 * doesn't need.
 */
export type Viewer = {
  id: string;
  osuId: number | null;
  username: string;
  image: string | null;
};

/**
 * The current viewer, or null when signed out.
 *
 * Wrapped in React's `cache` so every call within one request shares a single
 * session lookup: the header and the page can both ask without a second
 * database round trip.
 */
export const getCurrentUser = cache(async (): Promise<Viewer | null> => {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    osuId: user.osuId,
    username: displayName(user),
    image: user.image ?? null,
  };
});

/**
 * The current viewer, for code paths that must not run signed out. Use this in
 * mutations: a page-level check does not protect the server actions on it.
 */
export async function requireUser(): Promise<Viewer> {
  const viewer = await getCurrentUser();
  if (!viewer) throw new UnauthorizedError();
  return viewer;
}
