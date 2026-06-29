import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible,
  Bricolage_Grotesque,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { AccessibilityScript } from "@/components/AccessibilityScript";
import { AccessibilityConfirmProvider } from "@/components/AccessibilityConfirmProvider";
import { AccessibilityRuntime } from "@/components/AccessibilityRuntime";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcutsProvider";
import "./globals.css";

const readable = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-readable",
  display: "swap",
});
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brújula · Orientación Vocacional",
  description:
    "Descubre las carreras que encajan contigo. Un test breve, un perfil claro y un plan para dar el siguiente paso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${readable.variable}`}
      suppressHydrationWarning
    >
      <head>
        <AccessibilityScript />
      </head>
      <body className="min-h-dvh">
        <AccessibilityConfirmProvider>
          <AccessibilityRuntime />
          <KeyboardShortcutsProvider />
          <a href="#contenido" className="skip-link">
            Saltar al contenido
          </a>
          {children}
        </AccessibilityConfirmProvider>
      </body>
    </html>
  );
}
