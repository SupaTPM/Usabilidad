import { SiteHeader } from "@/components/SiteHeader";

/** Layout de auth con header global (menú de accesibilidad incluido). */
export function AuthPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main
        id="contenido"
        className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-10 sm:py-12"
      >
        {children}
      </main>
    </>
  );
}
