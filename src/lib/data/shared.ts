import "server-only";

export function displayName(user: {
  osuUsername?: string | null;
  name?: string | null;
}): string {
  return user.osuUsername ?? user.name ?? "Player";
}
