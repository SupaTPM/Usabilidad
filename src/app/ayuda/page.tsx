import Link from "next/link";
import { ShortcutsReference } from "@/components/ShortcutsReference";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = { title: "Ayuda y soporte · Brújula" };

const SECTIONS = [
  {
    title: "Cómo usar Brújula",
    body: [
      "Regístrate con tu correo y completa tu perfil breve.",
      "Responde el test vocacional en bloques cortos; puedes pausar entre bloques.",
      "Revisa tus resultados, explora carreras y compara opciones desde tu panel.",
    ],
  },
  {
    title: "Menú de accesibilidad",
    body: [
      "Abre el botón Accesibilidad en la barra superior para ajustar tema (claro, oscuro o sistema), contraste, tamaño de texto, subtítulos, transcripciones, cursor grande, animaciones y opciones cognitivas.",
      "Atajos principales: Alt+Shift+A (menú), Alt+Shift+? (guía de atajos). Hay más de 25 combinaciones Alt+Shift documentadas abajo.",
      "Tus preferencias se guardan en este dispositivo y se aplican sin recargar la página.",
      "Usa Restablecer preferencias para volver a los valores predeterminados.",
    ],
  },
  {
    title: "Formularios y errores",
    body: [
      "Activa Más ayuda en formularios para ver instrucciones junto a cada campo.",
      "Activa Errores más claros para resaltar campos con error con borde y texto descriptivo.",
      "Activa Pedir confirmación al enviar si prefieres revisar antes de registrar datos o enviar el test.",
    ],
  },
  {
    title: "Multimedia",
    body: [
      "En Videos vocacionales encontrarás ejemplos con transcripción sincronizada y subtítulos en español.",
      "El menú puede mostrar transcripciones y activar subtítulos cuando la página incluye medios compatibles.",
    ],
  },
];

export default function AyudaPage() {
  return (
    <>
      <SiteHeader authed={false} />
      <main id="contenido" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Ayuda / Soporte
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance">
          Centro de ayuda
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Recursos para usar el sistema de orientación vocacional y sus opciones de accesibilidad.
          Este enlace está siempre disponible desde el menú flotante.
        </p>

        <div className="mt-10 space-y-6">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <h2 className="font-display text-xl font-bold tracking-tight">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                {section.body.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <ShortcutsReference />

        <div className="mt-10 rounded-2xl border border-border bg-bg/80 p-5">
          <h2 className="text-sm font-bold text-fg">Contacto</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Si necesitas asistencia adicional con el test o la plataforma, escribe a{" "}
            <a
              href="mailto:soporte@brujula.app"
              className="font-semibold text-primary underline underline-offset-4"
            >
              soporte@brujula.app
            </a>
            . Tiempo de respuesta estimado: 1–2 días hábiles.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition hover:bg-surface-2"
          >
            Volver al inicio
          </Link>
          <Link
            href={"/videos-vocacionales" as never}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition hover:opacity-90"
          >
            Ver videos con transcripción
          </Link>
        </div>
      </main>
    </>
  );
}
