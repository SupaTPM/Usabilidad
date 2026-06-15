import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <>
      <AppHeader />
      <main id="contenido" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </>
  );
}
