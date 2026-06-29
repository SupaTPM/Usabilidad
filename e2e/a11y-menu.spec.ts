import { test, expect } from "@playwright/test";

async function openMenu(page: import("@playwright/test").Page) {
  const trigger = page.getByRole("button", { name: "Accesibilidad" });
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  await expect(page.locator("#a11y-panel")).toBeVisible();
}

test.describe("Menú cognitivo y ayuda (WCAG 3.2.6, 3.3.x)", () => {
  test("Enlace Ayuda / Soporte visible y navegable", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);
    await page.getByRole("link", { name: "Centro de ayuda" }).click();
    await expect(page).toHaveURL(/\/ayuda/);
    await expect(page.getByRole("heading", { level: 1, name: "Centro de ayuda" })).toBeVisible();
  });

  test("Toggle instrucciones expandidas aplica data-show-hints", async ({ page }) => {
    await page.goto("/ayuda");
    await openMenu(page);
    const toggle = page.getByRole("button", { name: "Más ayuda en formularios" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-show-hints", "on");
  });

  test("Toggle validación visible aplica data-validation-visible", async ({ page }) => {
    await page.goto("/ayuda");
    await openMenu(page);
    const toggle = page.getByRole("button", { name: "Errores más claros" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-validation-visible", "on");
  });

  test("Toggle confirmar envíos aplica data-confirm-submit", async ({ page }) => {
    await page.goto("/ayuda");
    await openMenu(page);
    const toggle = page.getByRole("button", { name: "Pedir confirmación al enviar" });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-confirm-submit", "on");
  });

  test("Atajo Alt+Shift+A abre el menú", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Alt+Shift+A");
    await expect(page.locator("#a11y-panel")).toBeVisible();
  });

  test("Tema sistema y colores suaves aplican data-*", async ({ page }) => {
    await page.goto("/");
    await openMenu(page);
    await page.getByRole("button", { name: "Sistema", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "auto");
    const soft = page.getByRole("button", { name: "Colores más suaves" });
    await soft.scrollIntoViewIfNeeded();
    await soft.click();
    await expect(page.locator("html")).toHaveAttribute("data-soft-colors", "on");
  });
});
