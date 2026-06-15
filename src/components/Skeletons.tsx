// Skeletons por bloque. Cada uno imita la forma de su contenido real para que
// el cambio (skeleton → datos) no mueva el layout. Se usan como `fallback` de
// <Suspense>, de modo que cada sección aparece de forma independiente.

/** Bloque base con efecto shimmer. `aria-hidden` para no ensuciar el lector. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** Contenedor accesible: anuncia "cargando" mientras se muestra el skeleton. */
function Loading({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function GreetingSkeleton() {
  return (
    <Loading label="Cargando tu panel…">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />
    </Loading>
  );
}

export function AssessmentsSkeleton() {
  return (
    <Loading label="Cargando tus evaluaciones…">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </Loading>
  );
}

export function ProfileResultSkeleton() {
  return (
    <Loading label="Calculando tu perfil…">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-3 h-10 w-72 max-w-full" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid gap-8 rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:grid-cols-2">
        <Skeleton className="mx-auto h-[300px] w-[300px] max-w-full rounded-full" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-4 w-32" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

export function CareerCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="w-full">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-12" />
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-1.5 h-4 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <Loading label="Buscando carreras para ti…">
      <Skeleton className="h-7 w-72" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-6 space-y-5">
        <CareerCardSkeleton />
        <CareerCardSkeleton />
        <CareerCardSkeleton />
      </div>
    </Loading>
  );
}

export function CareersListSkeleton() {
  return (
    <Loading label="Cargando carreras…">
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-5">
        <CareerCardSkeleton />
        <CareerCardSkeleton />
      </div>
    </Loading>
  );
}
