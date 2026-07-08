import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración de Playwright para auditorías de accesibilidad (WCAG).
 * Levanta el dev server de Next automáticamente (toma .env.local).
 */
const TEST_PORT = process.env.PW_PORT ?? "3015";
const BASE = process.env.PW_BASE_URL ?? `http://localhost:${TEST_PORT}`;
const PM = process.env.PM ?? "bun";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // distDir aislado (.next-test) para no compartir `.next` con el dev del 3000
    // y evitar la corrupción de caché por dos Next dev simultáneos.
    command: `${PM} run dev -- -p ${TEST_PORT}`,
    env: { NEXT_DIST_DIR: ".next-test" },
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
