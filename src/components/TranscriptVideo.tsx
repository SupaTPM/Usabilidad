"use client";

import { useEffect, useRef, useState } from "react";
import { A11Y_CHANGE_EVENT } from "@/lib/accessibility/apply";

type Cue = { start: number; end: number; text: string };

type YouTubePlayer = {
  getCurrentTime?: () => number;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo?: () => void;
  mute?: () => void;
  unMute?: () => void;
  setOption?: (module: string, option: string, value: unknown) => void;
  destroy?: () => void;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string;
    playerVars: Record<string, string | number>;
    events?: {
      onReady?: () => void;
    };
  }
) => YouTubePlayer;

type YouTubeWindow = typeof window & {
  YT?: { Player: YouTubePlayerConstructor };
  onYouTubeIframeAPIReady?: () => void;
};

interface VideoData {
  id: string;
  title: string;
  source: string;
  wcag: string[];
}

/** Convierte "00:00:03,899" en segundos. */
function toSeconds(stamp: string): number {
  const [hms, ms] = stamp.trim().split(",");
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + s + (Number(ms) || 0) / 1000;
}

/** Parsea SRT a cues. Ignora bloques sin línea de tiempo o sin texto. */
function parseSrt(srt: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of srt.replace(/\r/g, "").trim().split(/\n\n+/)) {
    const lines = block.split("\n");
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [a, b] = timeLine.split("-->");
    const text = lines
      .slice(lines.indexOf(timeLine) + 1)
      .join(" ")
      .trim();
    if (text) cues.push({ start: toSeconds(a), end: toSeconds(b), text });
  }
  return cues;
}

// ponytail: carga el script de la IFrame API una sola vez para toda la app.
let ytReady: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as YouTubeWindow;
  if (w.YT?.Player) return Promise.resolve();
  if (ytReady) return ytReady;
  ytReady = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytReady;
}

export function TranscriptVideo({
  video,
  onClose,
}: {
  video: VideoData;
  onClose: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const cuesRef = useRef<Cue[]>([]);
  const cueRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [cues, setCues] = useState<Cue[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [error, setError] = useState(false);

  // Cargar y parsear la transcripción.
  useEffect(() => {
    let cancelled = false;
    fetch(`/transcripciones/${video.id}.srt`)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => {
        if (cancelled) return;
        const parsed = parseSrt(t);
        cuesRef.current = parsed;
        setCues(parsed);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [video.id]);

  // Crear el player y seguir el tiempo de reproducción.
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval>;
    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current) return;
      const YT = (window as YouTubeWindow).YT;
      if (!YT?.Player) return;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId: video.id,
        playerVars: {
          cc_load_policy: 1,
          cc_lang_pref: "es",
          hl: "es",
          rel: 0,
        },
        events: {
          onReady: () => {
            interval = setInterval(() => {
              const p = playerRef.current;
              if (!p?.getCurrentTime) return;
              const t = p.getCurrentTime();
              const idx = cuesRef.current.findIndex(
                (c) => t >= c.start && t < c.end
              );
              if (idx !== -1) setActiveIdx(idx);
            }, 250);
          },
        },
      });
    });
    return () => {
      cancelled = true;
      clearInterval(interval);
      playerRef.current?.destroy?.();
    };
  }, [video.id]);

  useEffect(() => {
    function syncPlayerPrefs() {
      const player = playerRef.current;
      if (!player) return;
      const captionsOn = document.documentElement.dataset.captions === "on";
      const muteOn = document.documentElement.dataset.mute === "on";

      if (muteOn) player.mute?.();
      else player.unMute?.();

      if (captionsOn) {
        player.setOption?.("captions", "track", { languageCode: "es" });
      }
    }

    syncPlayerPrefs();
    window.addEventListener(A11Y_CHANGE_EVENT, syncPlayerPrefs);
    return () => window.removeEventListener(A11Y_CHANGE_EVENT, syncPlayerPrefs);
  }, [video.id]);

  // Auto-scroll de la línea activa.
  useEffect(() => {
    if (activeIdx < 0) return;
    const container = transcriptRef.current;
    const activeCue = cueRefs.current[activeIdx];
    if (!container || !activeCue) return;

    const containerRect = container.getBoundingClientRect();
    const cueRect = activeCue.getBoundingClientRect();
    const targetTop =
      container.scrollTop + cueRect.top - containerRect.top - 8;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth",
    });
  }, [activeIdx]);

  const seek = (cue: Cue) => {
    const p = playerRef.current;
    p?.seekTo?.(cue.start, true);
    p?.playVideo?.();
  };

  return (
    <div className="transcript-video-layout grid gap-0 transition-all duration-500 ease-out lg:grid-cols-[minmax(0,2.35fr)_minmax(320px,0.65fr)]">
      <div
        className="transcript-video-player aspect-video bg-surface-2 lg:min-h-[560px]"
        role="region"
        aria-label={`Reproductor de video: ${video.title}`}
      >
        {/* YT.Player reemplaza este div por el iframe. */}
        <div ref={hostRef} className="h-full w-full" />
      </div>

      <aside
        className="transcript-video-panel border-t border-border bg-bg p-6 animate-fade-up-slow lg:border-l lg:border-t-0 lg:p-8"
        data-a11y-transcript-panel
        aria-labelledby={`transcript-title-${video.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Transcripción sincronizada
            </p>
            <h4
              id={`transcript-title-${video.id}`}
              className="mt-2 font-display text-xl font-bold leading-tight tracking-tight"
            >
              {video.title}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-border px-3 py-1 text-sm font-semibold text-muted hover:bg-surface-2"
          >
            Cerrar
          </button>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-muted">
            No se pudo cargar la transcripción. Usa el botón{" "}
            <strong className="text-fg">CC</strong> del reproductor para los
            subtítulos en español.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Sigue el video leyendo el texto sincronizado. Cada línea salta al momento correspondiente
              al hacer clic.
            </p>
            <div
              ref={transcriptRef}
              className="transcript-video-list mt-5 max-h-[400px] space-y-1 overflow-y-auto overscroll-contain pr-2"
              role="list"
              data-a11y-transcript
              aria-label="Transcripción y audiodescripción textual del video. Clic en una línea para saltar a ese momento."
            >
            {cues.map((cue, i) => (
              <button
                key={i}
                type="button"
                ref={(el) => {
                  cueRefs.current[i] = el;
                }}
                onClick={() => seek(cue)}
                aria-current={i === activeIdx}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm leading-relaxed transition focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  i === activeIdx
                    ? "bg-primary font-medium text-primary-fg"
                    : "text-muted hover:bg-surface-2"
                }`}
              >
                {cue.text}
              </button>
            ))}
            </div>
          </>
        )}

        <div className="mt-5 border-t border-border pt-4">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            className="inline-flex text-sm font-semibold text-primary underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Abrir video en YouTube
          </a>
        </div>
      </aside>
    </div>
  );
}
