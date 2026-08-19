import { defineConfig, devices } from "@playwright/test";

// E2E manual/local (no corre en CI): a diferencia de los tests de Vitest
// (unit/componente, con mocks), estos prenden el stack real — frontend +
// backend + la base de Neon de desarrollo — para probar los flujos de punta
// a punta tal como los usaría alguien real. Igual que scripts/loadtest.js en
// el backend, necesita el backend arriba (o lo levanta solo, ver webServer).
//
// Uso: npx playwright test        (levanta lo que falte, reusa lo que ya está corriendo)
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev",
      cwd: "../PIURA-ALERTA-BACKEND",
      url: "http://localhost:4000/health",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
