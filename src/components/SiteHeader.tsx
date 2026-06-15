import Link from "next/link";
import { Logo } from "./Brand";
import { AccessibilityMenu } from "./AccessibilityMenu";

interface Props {
  /** Acción a la derecha cuando NO hay sesión (marketing). */
  authed?: boolean;
}

/** Encabezado global con marca, navegación y menú de accesibilidad. */
export function SiteHeader({ authed = false }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Principal">
          {authed ? (
            <>
              <Link
                href="/carreras"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg sm:inline-block"
              >
                Carreras
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg"
              >
                Mi panel
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg"
            >
              Iniciar sesión
            </Link>
          )}
          <AccessibilityMenu />
        </nav>
      </div>
    </header>
  );
}
