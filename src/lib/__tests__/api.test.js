import { describe, it, expect, vi, beforeEach } from "vitest";

const { obtenerTokenGuardado, dispararSesionExpirada } = vi.hoisted(() => ({
  obtenerTokenGuardado: vi.fn(),
  dispararSesionExpirada: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({ obtenerTokenGuardado, dispararSesionExpirada }));

const { iniciarSesion, getUsuarios, getSensores } = await import("../api.js");

function mockFetchOnce(status, body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("apiFetch (a través de getSensores/darLike)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("401 sin token adjunto (login fallido) no dispara sesión expirada", async () => {
    obtenerTokenGuardado.mockReturnValue(null);
    mockFetchOnce(401, { error: "Correo o contraseña incorrectos" });

    await expect(iniciarSesion({ correo: "x@x.com", password: "mal" })).rejects.toThrow(
      "Correo o contraseña incorrectos"
    );
    expect(dispararSesionExpirada).not.toHaveBeenCalled();
  });

  it("401 con token adjunto (sesión expirada/inválida) dispara el evento", async () => {
    obtenerTokenGuardado.mockReturnValue("token-viejo");
    mockFetchOnce(401, { error: "Sesión inválida o expirada" });

    await expect(getUsuarios()).rejects.toThrow("Sesión inválida o expirada");
    expect(dispararSesionExpirada).toHaveBeenCalledTimes(1);
  });

  it("otros códigos de error (ej. 403) no disparan sesión expirada", async () => {
    obtenerTokenGuardado.mockReturnValue("token-valido");
    mockFetchOnce(403, { error: "No tenés permiso para esta acción" });

    await expect(getUsuarios()).rejects.toThrow("No tenés permiso para esta acción");
    expect(dispararSesionExpirada).not.toHaveBeenCalled();
  });

  it("respuesta ok devuelve el JSON normalmente", async () => {
    obtenerTokenGuardado.mockReturnValue("token-valido");
    mockFetchOnce(200, [{ id: "s1", codigo: "RIO-PIURA-01" }]);

    await expect(getSensores()).resolves.toEqual([{ id: "s1", codigo: "RIO-PIURA-01" }]);
  });
});
