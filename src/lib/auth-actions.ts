"use server";

import { signIn, signOut } from "@/auth";

/**
 * Shared server actions so every entry point into osu! sign-in behaves the
 * same, rather than each component defining its own inline action.
 */

/**
 * Signs in with osu!, returning to the path in the form's optional
 * `redirectTo` field, or the home page without one.
 */
export async function signInWithOsu(formData: FormData) {
  await signIn("osu", { redirectTo: localPath(formData.get("redirectTo")) });
}

export async function signOutOfOsu() {
  await signOut({ redirectTo: "/" });
}

// The field comes from the client, so only same-site paths are honoured:
// "//host" and "/\host" would both be read as another origin.
function localPath(value: FormDataEntryValue | null) {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : "/";
}
