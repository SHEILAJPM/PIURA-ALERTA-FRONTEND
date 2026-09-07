import { test, expect } from "@playwright/test";

// Flujo crítico: un ciudadano SIN sesión reporta una situación y el reporte
// aparece en el feed público (llega por WebSocket, ver useReportes.js). Este
// test crea un reporte real en la base conectada — el texto incluye un
// timestamp único para no chocar con corridas anteriores.
test("un ciudadano puede reportar sin iniciar sesión y el reporte aparece en el feed", async ({ page }) => {
  const descripcion = `[e2e] reporte de prueba ${Date.now()}`;

  await page.goto("/reportes");
  await expect(page.getByRole("heading", { name: "Reportes y mapa de riesgo en vivo" })).toBeVisible();

  await page.getByPlaceholder("¿Qué está pasando? (obligatorio)").fill(descripcion);
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(page.getByText(descripcion)).toBeVisible({ timeout: 10_000 });
});
