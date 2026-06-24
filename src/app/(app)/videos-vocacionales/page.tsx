import Link from "next/link";
import { VocationalVideoExamples } from "@/components/VocationalVideoExamples";

export const metadata = { title: "Videos vocacionales · Brújula" };

export default function VideosVocacionalesPage() {
  return (
    <div className="relative left-1/2 w-[min(calc(100vw-2rem),88rem)] -translate-x-1/2 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex text-sm font-semibold text-primary underline underline-offset-4"
      >
        ← Volver a mi panel
      </Link>

      <VocationalVideoExamples variant="gallery" />
    </div>
  );
}
