"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg"
    >
      Salir
    </button>
  );
}
