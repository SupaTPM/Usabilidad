import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Criterios WCAG 2.0, 2.1 y 2.2 niveles A y AA.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const TEST_USER = {
  email: "justinalejandro996@gmail.com",
  password: "Brujula2026!",
};

/** Corre axe sobre la página actual y devuelve las violaciones. */
async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const v = results.violations;
  if (v.length) {
    console.log(`\n── ${label}: ${v.length} tipo(s) de violación ──`);
    for (const item of v) {
      console.log(
        `  [${item.impact}] ${item.id} — ${item.help} (${item.nodes.length} nodo/s)`
      );
      console.log(`     ${item.helpUrl}`);
      item.nodes.slice(0, 3).forEach((n) => console.log(`     · ${n.target}`));
    }
  } else {
    console.log(`✓ ${label}: sin violaciones`);
  }
  return v;
}

async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#email", TEST_USER.email);
  await page.fill("#password", TEST_USER.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
}

test.describe("Accesibilidad WCAG 2.2 A/AA", () => {
  for (const [path, label] of [
    ["/", "Landing"],
    ["/login", "Login"],
    ["/register", "Registro"],
  ] as const) {
    test(`Página pública: ${label}`, async ({ page }) => {
      await page.goto(path);
      const violations = await audit(page, label);
      expect(violations, `Violaciones en ${label}`).toEqual([]);
    });
  }

  test("Flujo autenticado: panel", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const violations = await audit(page, "Panel");
    expect(violations).toEqual([]);
  });

  test("Test vocacional y resultados", async ({ page }) => {
    await login(page);
    await page.goto("/test");

    // Responder los 5 bloques (6 preguntas c/u) eligiendo una opción por ítem.
    for (let block = 0; block < 5; block++) {
      const groups = page.locator("fieldset");
      const count = await groups.count();
      for (let i = 0; i < count; i++) {
        await groups.nth(i).locator("label").nth(3).click(); // "Bastante"
      }
      if (block === 0) await audit(page, "Test (bloque 1)");
      const next = page.getByRole("button", { name: "Siguiente" });
      if (await next.isVisible()) {
        await next.click();
      } else {
        await page.getByRole("button", { name: "Ver mis resultados" }).click();
      }
    }

    await page.waitForURL(/\/resultados\//, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const violations = await audit(page, "Resultados");
    expect(violations).toEqual([]);
  });
});
