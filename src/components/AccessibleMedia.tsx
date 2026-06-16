interface MediaTrack {
  src: string;
  kind: "captions" | "descriptions" | "subtitles" | "chapters";
  srcLang?: string;
  label: string;
  default?: boolean;
}

interface AccessibleMediaProps {
  /** URL del archivo de video o audio. */
  src: string;
  /** "video" (default) o "audio". */
  mediaType?: "video" | "audio";
  mimeType?: string;
  /** Imagen de portada (solo video). */
  poster?: string;
  /** Pistas de subtítulos / audiodescripción (archivos .vtt). */
  tracks?: MediaTrack[];
  /** Transcripción textual completa (WCAG 1.2.1 / 1.2.3). */
  transcript?: React.ReactNode;
  /** Título descriptivo del contenido — se usa como aria-label. */
  title: string;
  className?: string;
}

/**
 * Reproductor multimedia accesible.
 * Cubre: 1.2.1 (transcripción), 1.2.2 (subtítulos grabados),
 * 1.2.3 y 1.2.5 (audiodescripción vía pista "descriptions"),
 * 1.4.2 (controles de pausa/silencio nativos con `controls`).
 *
 * Uso:
 *   <AccessibleMedia
 *     src="/videos/instrucciones-test.mp4"
 *     title="Cómo funciona el test vocacional"
 *     tracks={[
 *       { src: "/captions/instrucciones-es.vtt", kind: "captions", label: "Español" },
 *       { src: "/descriptions/instrucciones-es.vtt", kind: "descriptions", label: "Audiodescripción" },
 *     ]}
 *     transcript={<p>Texto completo de la transcripción aquí.</p>}
 *   />
 */
export function AccessibleMedia({
  src,
  mediaType = "video",
  mimeType,
  poster,
  tracks = [],
  transcript,
  title,
  className,
}: AccessibleMediaProps) {
  const fallback = (
    <p>
      Tu navegador no puede reproducir este contenido.{" "}
      <a href={src} className="text-primary underline">
        Descargar archivo
      </a>
      .
    </p>
  );

  return (
    <figure className={className}>
      {mediaType === "video" ? (
        <video
          controls
          poster={poster}
          preload="metadata"
          aria-label={title}
          className="w-full rounded-lg"
        >
          <source src={src} type={mimeType ?? "video/mp4"} />
          {tracks.map((t, i) => (
            <track
              key={i}
              src={t.src}
              kind={t.kind}
              srcLang={t.srcLang ?? "es"}
              label={t.label}
              default={t.default}
            />
          ))}
          {fallback}
        </video>
      ) : (
        <audio
          controls
          preload="metadata"
          aria-label={title}
          className="w-full"
        >
          <source src={src} type={mimeType ?? "audio/mpeg"} />
          {tracks.map((t, i) => (
            <track
              key={i}
              src={t.src}
              kind={t.kind}
              srcLang={t.srcLang ?? "es"}
              label={t.label}
              default={t.default}
            />
          ))}
          {fallback}
        </audio>
      )}

      <figcaption className="mt-1 text-center text-sm text-muted">
        {title}
      </figcaption>

      {transcript && (
        <details className="mt-3 rounded-lg border border-border">
          <summary className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-primary hover:bg-surface-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring">
            Ver transcripción completa
          </summary>
          <div className="px-4 py-3 text-sm leading-relaxed">{transcript}</div>
        </details>
      )}
    </figure>
  );
}
