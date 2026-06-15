import { test, expect, type Page } from "@playwright/test";

const TEST_USER = {
  email: "justinalejandro996@gmail.com",
  password: "Brujula2026!",
};

async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#email", TEST_USER.email);
  await page.fill("#password", TEST_USER.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
}

test.describe("Operabilidad por teclado y foco (WCAG 2.1.1, 2.4.1, 2.4.7)", () => {
  test("El skip-link recibe foco y es visible al tabular", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    // Debe quedar visible dentro del viewport (no oculto fuera de pantalla).
    await expect(skip).toBeInViewport();
  });

  test("El foco es visible (outline) al navegar con teclado", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab"); // skip-link
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(outline.style).not.toBe("none");
    expect(parseFloat(outline.width)).toBeGreaterThan(0);
  });

  test("El login se completa y envía solo con teclado", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").focus();
    await page.keyboard.type(TEST_USER.email);
    await page.keyboard.press("Tab");
    await page.keyboard.type(TEST_USER.password);
    await page.keyboard.press("Enter"); // enviar con Enter, sin ratón
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Los grupos Likert se navegan con flechas (radios nativos)", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/test");

    const radios = page.locator('input[type="radio"]');
    await radios.first().focus();
    await expect(radios.first()).toBeFocused();

    // ArrowRight mueve al siguiente radio del grupo y lo selecciona.
    await page.keyboard.press("ArrowRight");
    await expect(radios.nth(1)).toBeChecked();
    await expect(radios.nth(1)).toBeFocused();

    // ArrowLeft vuelve al anterior.
    await page.keyboard.press("ArrowLeft");
    await expect(radios.first()).toBeChecked();
  });
});
