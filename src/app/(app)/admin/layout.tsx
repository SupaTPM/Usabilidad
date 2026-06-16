import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/cuestionarios", label: "Cuestionarios" },
  { href: "/admin/usuarios", label: "Asignaciones" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login" as never);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard" as never);

  return (
    <div className="space-y-6">
      <nav aria-label="Administración" className="flex gap-1 border-b border-border pb-0">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href as never}
            className="rounded-t-lg border border-b-0 border-transparent px-4 py-2 text-sm font-medium text-muted transition hover:text-fg [&.active]:border-border [&.active]:bg-surface [&.active]:text-fg"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
