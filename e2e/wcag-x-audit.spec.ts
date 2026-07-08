import { test, expect, type Page } from "@playwright/test";

/**
 * Verifica los criterios WCAG que la auditoría manual marcó con X.
 * Cada test prueba el criterio de forma concreta y medible.
 */

// ── Utilidades de contraste (WCAG 2.x) ────────────────────────────────
function parseRgb(str: string): [number, number, number] {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`Color no parseable: ${str}`);
  const [r, g, b] = m[1].split(",").map((n) => parseFloat(n.trim()));
  return [r, g, b];
}
function relLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string): number {
  const la = relLuminance(parseRgb(a));
  const lb = relLuminance(parseRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const TEST_USER = { email: "justinalejandro996@gmail.com", password: "Brujula2026!" };

async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#email", TEST_USER.email);
  await page.fill("#password", TEST_USER.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
}

async function setPref(page: Page, key: string, value: string) {
  await page.evaluate(
    ([k, v]) => {
      const stored = JSON.parse(localStorage.getItem("ov:a11y") || "{}");
      stored[k] = v;
      localStorage.setItem("ov:a11y", JSON.stringify(stored));
    },
    [key, value]
  );
  await page.reload();
}

// ── 1.4.11 Contraste no textual (bordes de controles ≥3:1) ────────────
test("1.4.11 — borde de inputs con contraste ≥3:1", async ({ page }) => {
  await page.goto("/login");
  const input = page.locator("#email");
  await expect(input).toBeVisible();
  const { border, bg } = await input.evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: s.borderTopColor, bg: s.backgroundColor };
  });
  const ratio = contrast(border, bg);
  console.log(`1.4.11 borde=${border} fondo=${bg} → ${ratio.toFixed(2)}:1`);
  expect(ratio).toBeGreaterThanOrEqual(3);
});

// ── 1.4.12 Espaciado de texto: opción de interlineado 1.5 / doble ─────
test("1.4.12 — opción de interlineado aplica 1.5 y doble", async ({ page }) => {
  await page.goto("/");

  await setPref(page, "lineSpacing", "wide");
  const wide = await page.locator("p").first().evaluate((el) => {
    const s = getComputedStyle(el);
    return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
  });
  console.log(`1.4.12 interlineado wide → ${wide.toFixed(2)}`);
  expect(wide).toBeGreaterThan(1.45);
  expect(wide).toBeLessThan(1.6);

  await setPref(page, "lineSpacing", "double");
  const dbl = await page.locator("p").first().evaluate((el) => {
    const s = getComputedStyle(el);
    return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
  });
  console.log(`1.4.12 interlineado double → ${dbl.toFixed(2)}`);
  expect(dbl).toBeGreaterThan(1.9);
});

test("1.4.12 — el control 'Interlineado' existe en el menú", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Accesibilidad/i }).first().click();
  await expect(page.getByText("Interlineado")).toBeVisible();
});

test("1.4.12 — el contenido sobrevive al espaciado del usuario", async ({ page }) => {
  await page.goto("/");
  // Espaciado de texto exigido por 1.4.12 (bookmarklet oficial).
  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  console.log(`1.4.12 overflow horizontal tras espaciado = ${overflow}px`);
  expect(overflow).toBeLessThanOrEqual(2);
});

// ── 1.4.10 Reajuste de elementos (reflow a 320px, ~400% zoom) ─────────
test("1.4.10 — reflow sin scroll horizontal a 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 512 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  console.log(`1.4.10 overflow a 320px = ${overflow}px`);
  expect(overflow).toBeLessThanOrEqual(2);
});

// ── 1.3.4 Orientación (sin bloqueo) ───────────────────────────────────
test("1.3.4 — funciona en vertical y horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.setViewportSize({ width: 800, height: 400 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

// ── 2.2.2 Pausar/detener/ocultar (mecanismo "Calma") ──────────────────
test("2.2.2 — la cinta se mueve y 'Calma' la detiene", async ({ page }) => {
  await page.goto("/");
  const marquee = page.locator(".animate-marquee").first();
  await expect(marquee).toBeVisible();

  // Con animaciones activas la cinta se está moviendo.
  const running = await marquee.evaluate((el) => getComputedStyle(el).animationName);
  console.log(`2.2.2 cinta sin Calma → ${running}`);
  expect(running).toBe("marquee");

  // 2.2.2: el mecanismo "Calma" la detiene por completo.
  await setPref(page, "calm", "on");
  const stopped = await marquee.evaluate((el) => getComputedStyle(el).animationName);
  console.log(`2.2.2 cinta con Calma → ${stopped}`);
  expect(stopped).toBe("none");
});

// ── 1.2.1 / 1.2.2 / 1.2.5 Video con transcripción y audiodescripción ──
test("1.2.x — video muestra transcripción precisa y audiodescripción", async ({
  page,
}) => {
  await login(page);
  await page.goto("/videos-vocacionales");

  // Abrir el primer video (Autoconocimiento → srt S7nO_Cg50Hc).
  const open = page.getByRole("button", { name: /Abrir .* transcripción/i }).first();
  await expect(open).toBeVisible({ timeout: 15_000 });
  await open.click();

  // 1.2.1 / 1.2.2: transcripción sincronizada con texto CORREGIDO visible.
  await expect(
    page.getByRole("button", { name: /test vocacionales/i })
  ).toBeVisible({ timeout: 15_000 });

  // 1.2.5: audiodescripción textual presente.
  await expect(page.getByText("Audiodescripción (1.2.5)")).toBeVisible();
});

test("1.2.2 — el .srt servido está corregido (sin errores del auto-generado)", async ({
  request,
}) => {
  const res = await request.get("/transcripciones/S7nO_Cg50Hc.srt");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).toContain("test vocacionales"); // corregido
  expect(body).not.toContain("test vocacional son"); // error viejo
  expect(body).not.toContain("después, tus fortal"); // basura duplicada eliminada
});
