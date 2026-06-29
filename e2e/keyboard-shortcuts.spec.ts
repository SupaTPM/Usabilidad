import { test, expect } from "@playwright/test";

test.describe("Atajos de teclado (WCAG 2.1.4)", () => {
  test("Alt+Shift+? abre la guía de atajos", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Alt+Shift+?");
    await expect(page.getByRole("dialog", { name: "Atajos de teclado" })).toBeVisible();
    await expect(page.getByText("General")).toBeVisible();
  });

  test("Alt+Shift+A abre el menú de accesibilidad", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Alt+Shift+A");
    await expect(page.locator("#a11y-panel")).toBeVisible();
  });

  test("Alt+Shift+H navega a ayuda", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Alt+Shift+H");
    await expect(page).toHaveURL(/\/ayuda/);
  });

  test("Alt+Shift+= aumenta el texto", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Alt+Shift+=");
    await expect(page.locator("html")).toHaveAttribute("data-text", "large");
  });

  test("Alt+Shift+J activa más ayuda en formularios", async ({ page }) => {
    await page.goto("/login");
    await page.keyboard.press("Alt+Shift+J");
    await expect(page.locator("html")).toHaveAttribute("data-show-hints", "on");
  });

  test("Escape cierra la guía de atajos", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Alt+Shift+?");
    await expect(page.getByRole("dialog", { name: "Atajos de teclado" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Atajos de teclado" })).toBeHidden();
  });
});
