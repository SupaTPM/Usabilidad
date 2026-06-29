"use client";

import Link from "next/link";
import { useState } from "react";
import { TranscriptVideo } from "@/components/TranscriptVideo";

const VIDEOS = [
  {
    id: "AfB_7F5773Y",
    title: "La orientación vocacional y sus efectos en las universidades",
    source: "Mirador Universitario UNAM",
    tag: "Universidad",
    text: "Explica cómo la orientación vocacional puede ayudar a que el estudiante conecte intereses, habilidades y contexto antes de escoger una carrera universitaria.",
    wcag: ["1.2.2 Subtítulos grabados", "1.2.1 Alternativa textual", "1.2.3 Audiodescripción", "1.2.5 Audiodescripción grabada"],
  },
  {
    id: "bfp3vN2B5zo",
    title: "Aprender a elegir qué carrera estudiar",
    source: "TEDx Talks",
    tag: "Vocación",
    text: "Presenta la elección de carrera como un proceso de reflexión: conocerse, comparar opciones, escuchar experiencias y decidir con menos presión externa.",
    wcag: ["1.2.2 Subtítulos grabados", "1.2.1 Alternativa textual", "1.2.3 Audiodescripción", "1.4.1 Uso del color"],
  },
  {
    id: "QvdEulHTKr8",
    title: "Cómo elegir una carrera que te apasione",
    source: "CuriosaMente",
    tag: "Carreras",
    text: "Resume ideas para identificar intereses personales, probar actividades y cruzar la vocación con oportunidades reales de estudio y trabajo.",
    wcag: ["1.2.2 Subtítulos grabados", "1.2.1 Alternativa textual", "1.2.5 Audiodescripción", "1.4.10 Reajuste de elementos"],
  },
];

interface VocationalVideoExamplesProps {
  variant?: "section" | "sidebar" | "gallery";
}

function embedSrc(videoId: string, autoplay = false) {
  const params = new URLSearchParams({
    cc_load_policy: "1",
    cc_lang_pref: "es",
    hl: "es",
    rel: "0",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function VocationalVideoExamples({
  variant = "section",
}: VocationalVideoExamplesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isSidebar = variant === "sidebar";
  const isGallery = variant === "gallery";

  return (
    <section
      id="videos-vocacionales"
      aria-labelledby="videos-vocacionales-titulo"
      className={
        isSidebar
          ? "rounded-2xl border border-border bg-surface p-4 shadow-sm lg:sticky lg:top-24"
          : isGallery
            ? ""
            : "border-y border-border bg-surface"
      }
    >
      <div className={isSidebar ? "" : isGallery ? "" : "mx-auto max-w-6xl px-4 py-16 sm:px-6"}>
        <div className={isSidebar ? "" : isGallery ? "max-w-3xl" : "max-w-2xl"}>
          <span className="inline-flex rounded-full border border-border bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {isSidebar ? "Orientación" : "Ejemplos multimedia accesibles"}
          </span>
          <h2
            id="videos-vocacionales-titulo"
            className={
              isSidebar
                ? "mt-3 font-display text-xl font-bold tracking-tight"
                : isGallery
                  ? "mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
                  : "mt-4 font-display text-3xl font-bold tracking-tight"
            }
          >
            Videos sobre universidad y vocación
          </h2>
          <p className={isSidebar ? "mt-2 text-sm text-muted" : isGallery ? "mt-3 max-w-2xl text-lg text-muted" : "mt-2 text-muted"}>
            Videos de YouTube sobre orientación vocacional con subtítulos en
            español solicitados automáticamente y un resumen textual al lado.
          </p>
          {isSidebar && (
            <Link
              href={"/videos-vocacionales" as never}
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition hover:opacity-90"
            >
              Ver videos en grande
            </Link>
          )}
        </div>

        <div
          className={
            isSidebar
              ? "mt-5 space-y-4"
              : isGallery
                ? "mt-10 space-y-8"
                : "mt-10 grid gap-5 lg:grid-cols-3"
          }
        >
          {VIDEOS.map((video) => {
            const expanded = isGallery && expandedId === video.id;

            return (
              <article
                key={video.id}
                className={
                  isGallery
                    ? "overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-500 ease-out"
                    : "overflow-hidden rounded-2xl border border-border bg-bg shadow-sm"
                }
              >
                {isGallery && expanded ? (
                  <TranscriptVideo
                    video={video}
                    onClose={() => setExpandedId(null)}
                  />
                ) : (
                  <div className="grid gap-0 transition-all duration-500 ease-out">
                    {isGallery ? (
                      <button
                        type="button"
                        onClick={() => setExpandedId(video.id)}
                        className="group relative block aspect-video w-full overflow-hidden bg-surface-2 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring"
                        aria-label={`Abrir ${video.title} con transcripción sincronizada`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                          alt=""
                          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/35" aria-hidden />
                        <span className="absolute left-5 top-5 max-w-[85%] text-sm font-bold text-white drop-shadow sm:text-base">
                          {video.title}
                        </span>
                        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-red-600 text-white shadow-xl transition duration-500 group-hover:scale-125" aria-hidden>
                          ▶
                        </span>
                        <span className="absolute bottom-5 left-5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                          Clic para ver con transcripción
                        </span>
                      </button>
                    ) : (
                      <div className="aspect-video bg-surface-2">
                        <iframe
                          className="h-full w-full"
                          src={embedSrc(video.id)}
                          title={`${video.title} — ${video.source}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    )}

                    <div className={isSidebar ? "p-4" : isGallery ? "p-6 sm:p-7" : "p-5"}>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-primary px-2.5 py-1 text-primary-fg">
                          {video.tag}
                        </span>
                        <span className="text-muted">Fuente: {video.source}</span>
                      </div>

                      <h3
                        className={
                          isSidebar
                            ? "mt-3 font-display text-base font-semibold leading-tight"
                            : isGallery
                              ? "mt-4 font-display text-2xl font-bold leading-tight"
                              : "mt-3 font-display text-lg font-semibold leading-tight"
                        }
                      >
                        {video.title}
                      </h3>

                      {!isGallery && (
                        <VideoDetails video={video} shortLabel={isSidebar} />
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VideoDetails({
  video,
  shortLabel,
}: {
  video: (typeof VIDEOS)[number];
  shortLabel: boolean;
}) {
  return (
    <details className="mt-4 rounded-xl border border-border bg-surface" data-a11y-transcript>
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-primary hover:bg-surface-2">
        {shortLabel ? "Ver resumen" : "Ver resumen, subtítulos y transcripción"}
      </summary>
      <div className="space-y-3 px-4 pb-4 text-sm leading-relaxed text-muted">
        <p>{video.text}</p>
        <p>
          El video intenta cargar subtítulos en español desde YouTube. Si no aparecen, usa el botón{" "}
          <strong className="text-fg">CC</strong> del reproductor.
        </p>
        <p>
          En la vista ampliada encontrarás la transcripción sincronizada como alternativa textual
          al contenido del video.
        </p>
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          className="inline-flex font-semibold text-primary underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Abrir video en YouTube
        </a>
      </div>
    </details>
  );
}
