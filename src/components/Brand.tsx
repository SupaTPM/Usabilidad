import Link from "next/link";
import { RIASEC, RIASEC_ORDER } from "@/lib/vocational/riasec";

/** Marca: hexágono RIASEC en miniatura + wordmark. */
export function Logo({ href = "/" as const }: { href?: string }) {
  const size = 30;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const points = RIASEC_ORDER.map((_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");

  return (
    <Link
      href={href as never}
      className="inline-flex items-center gap-2 rounded-md"
      aria-label="Brújula, inicio"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <polygon
          points={points}
          fill="rgb(var(--primary) / 0.1)"
          stroke="rgb(var(--primary))"
          strokeWidth={1.5}
        />
        {RIASEC_ORDER.map((dim, i) => {
          const a = (-90 + i * 60) * (Math.PI / 180);
          return (
            <circle
              key={dim}
              cx={cx + r * Math.cos(a)}
              cy={cy + r * Math.sin(a)}
              r={2.6}
              fill={`rgb(var(${RIASEC[dim].colorVar}))`}
            />
          );
        })}
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">
        Brújula
      </span>
    </Link>
  );
}
