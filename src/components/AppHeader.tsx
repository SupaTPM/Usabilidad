import Link from "next/link";
import { Logo } from "./Brand";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { SignOutButton } from "./SignOutButton";

const LINKS = [
  { href: "/dashboard", label: "Mi panel" },
  { href: "/carreras", label: "Carreras" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <AccessibilityMenu />
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
