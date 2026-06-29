import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", name: "landing" },
  { path: "/ayuda", name: "ayuda" },
  { path: "/login", name: "login" },
] as const;

async function openMenu(page: import("@playwright/test").Page) {
  const trigger = page.getByRole("button", { name: "Accesibilidad" });
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  await expect(page.locator("#a11y-panel")).toBeVisible();
}

test.describe("Capturas de evidencia WCAG", () => {
  for (const { path, name } of PAGES) {
    test(`captura ${name}`, async ({ page }) => {
      await page.goto(path);
      await page.screenshot({
        path: `docs/evidencia/${name}.png`,
        fullPage: true,
      });
    });
  }

  test("captura menu accesibilidad abierto", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);
    await page.locator("#a11y-panel").screenshot({
      path: "docs/evidencia/menu-accesibilidad.png",
    });
  });

  test("captura menu cognitivo toggles", async ({ page }) => {
    await page.goto("/ayuda");
    await openMenu(page);
    const hints = page.getByRole("button", { name: "Más ayuda en formularios" });
    await hints.scrollIntoViewIfNeeded();
    await hints.click();
    const validation = page.getByRole("button", { name: "Errores más claros" });
    await validation.scrollIntoViewIfNeeded();
    await validation.click();
    await page.locator("#a11y-panel").screenshot({
      path: "docs/evidencia/menu-cognitivo.png",
    });
  });

  test("captura videos en landing", async ({ page }) => {
    await page.goto("/#videos-vocacionales");
    await page.locator("#videos-vocacionales").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: "docs/evidencia/videos-vocacionales.png",
      fullPage: false,
    });
  });
});
