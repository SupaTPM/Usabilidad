import type { RiasecDim } from "@/lib/supabase/database.types";
import { RIASEC, RIASEC_ORDER } from "@/lib/vocational/riasec";

interface Props {
  /** Puntajes 0-100 por dimensión. Si se omite, se dibuja en modo ambiente. */
  scores?: Partial<Record<RiasecDim, number>>;
  size?: number;
  /** Muestra etiquetas (letra + nombre) en cada vértice. */
  showLabels?: boolean;
  /** Animación de respiración suave (hero). */
  ambient?: boolean;
  className?: string;
}

const PAD = 64; // espacio para etiquetas
function vertex(i: number, radius: number, cx: number, cy: number) {
  const angle = (-90 + i * 60) * (Math.PI / 180);
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
}

/**
 * Hexágono de Holland: el instrumento del modelo RIASEC convertido en la
 * firma visual del sistema. Con `scores` grafica el perfil del estudiante;
 * sin ellos, sirve de elemento de marca.
 */
export function HollandHexagon({
  scores,
  size = 320,
  showLabels = true,
  ambient = false,
  className,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - PAD;

  const outer = RIASEC_ORDER.map((_, i) => vertex(i, R, cx, cy));
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = scores
    ? RIASEC_ORDER.map((dim, i) =>
        vertex(i, (R * (scores[dim] ?? 0)) / 100, cx, cy)
      )
    : null;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`h-auto max-w-full ${className ?? ""}`}
      role="img"
      aria-label={
        scores
          ? "Gráfico hexagonal de tu perfil de intereses RIASEC."
          : "Hexágono del modelo vocacional RIASEC con sus seis dimensiones."
      }
    >
      <g className={ambient ? "animate-breathe" : undefined} style={{ transformOrigin: "center" }}>
        {/* anillos de referencia */}
        {rings.map((r, idx) => (
          <polygon
            key={idx}
            points={RIASEC_ORDER.map((_, i) => vertex(i, R * r, cx, cy).join(","))
              .join(" ")}
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth={1}
          />
        ))}
        {/* radios */}
        {outer.map(([x, y], i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgb(var(--border))"
            strokeWidth={1}
          />
        ))}

        {/* polígono de datos */}
        {dataPoints && (
          <polygon
            points={dataPoints.map((p) => p.join(",")).join(" ")}
            fill="rgb(var(--primary) / 0.18)"
            stroke="rgb(var(--primary))"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}
      </g>

      {/* vértices con color de cada dimensión */}
      {RIASEC_ORDER.map((dim, i) => {
        const [x, y] = dataPoints ? dataPoints[i] : outer[i];
        return (
          <circle
            key={dim}
            cx={x}
            cy={y}
            r={dataPoints ? 5 : 6}
            fill={`rgb(var(${RIASEC[dim].colorVar}))`}
            stroke="rgb(var(--surface))"
            strokeWidth={2}
          />
        );
      })}

      {/* etiquetas */}
      {showLabels &&
        RIASEC_ORDER.map((dim, i) => {
          const [x, y] = vertex(i, R + 26, cx, cy);
          return (
            <text
              key={dim}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono"
              fontSize={13}
              fontWeight={700}
              fill={`rgb(var(${RIASEC[dim].colorVar}))`}
            >
              {dim}
              <tspan
                x={x}
                dy={15}
                fontSize={10}
                fontWeight={500}
                fill="rgb(var(--muted))"
              >
                {RIASEC[dim].name}
              </tspan>
            </text>
          );
        })}
    </svg>
  );
}
