import { test, expect } from "@playwright/test";

// Frontera de seguridad crítica: entrar directo a una URL de /admin/* sin
// sesión no debe mostrar el panel — tiene que mandar a "/" y pedir login
// (ver ProtectedRoute.jsx). No usa credenciales reales: lo que se prueba es
// que la ruta protegida rechaza a quien no tiene sesión.
test("entrar a /admin sin sesión redirige a inicio y pide login", async ({ page }) => {
  await page.goto("/admin/usuarios");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
});
