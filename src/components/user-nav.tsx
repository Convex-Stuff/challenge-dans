import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { signInWithOsu } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/data/session";

/**
 * Right-hand side of the header: the osu! sign-in button when signed out, or
 * the signed-in player's avatar, which opens a menu with Sign out.
 *
 * Below `lg` signed-out visitors sign in from the mobile menu (MobileNav)
 * instead, to keep the header on one line.
 */
export async function UserNav() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    return (
      <form action={signInWithOsu} className="hidden lg:block">
        <Button type="submit" size="sm">
          Sign in with osu!
        </Button>
      </form>
    );
  }

  return <UserMenu username={viewer.username} image={viewer.image} />;
}
