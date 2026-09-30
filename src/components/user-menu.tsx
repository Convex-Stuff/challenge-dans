"use client";

import { LogOutIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutOfOsu } from "@/lib/auth-actions";

/**
 * The signed-in player's avatar (with their name on wide screens), opening a
 * menu of account actions. Used at every screen size.
 */
export function UserMenu({
  username,
  image,
}: {
  username: string;
  image: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${username}`}
        render={
          <Button variant="ghost" className="h-auto gap-2 px-1 py-1 lg:pr-2" />
        }
      >
        <Avatar className="size-8">
          <AvatarImage src={image ?? undefined} alt="" />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium lg:inline">{username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          {/* Server actions can be called straight from an event handler; its
              redirect back to the home page still navigates. */}
          <DropdownMenuItem onClick={() => void signOutOfOsu()}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
