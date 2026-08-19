import { test, expect } from "@playwright/test";

// Flujo crítico: registro -> queda logueado -> cerrar sesión -> volver a
// entrar con las mismas credenciales. Crea una cuenta real (correo único por
// timestamp) en la base conectada.
test("registro, logout y login con la misma cuenta", async ({ page }) => {
  const correo = `e2e-${Date.now()}@example.com`;
  const password = "claveDePrueba123";

  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.getByRole("button", { name: "Regístrate" }).click();

  await page.getByPlaceholder("Nombre").fill("E2E Test");
  await page.getByPlaceholder("Correo").fill(correo);
  await page.getByPlaceholder("Contraseña (mínimo 8 caracteres)").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByText("E2E Test")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();

  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.getByPlaceholder("Correo").fill(correo);
  await page.getByPlaceholder("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByText("E2E Test")).toBeVisible({ timeout: 10_000 });
});
