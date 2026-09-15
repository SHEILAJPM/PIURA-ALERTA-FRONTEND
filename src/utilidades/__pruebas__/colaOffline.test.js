import { describe, it, expect, vi, beforeEach } from "vitest";
import { encolarReporte, contarPendientes, reintentarColaReportes } from "../colaOffline";

describe("colaOffline", () => {
  beforeEach(() => localStorage.clear());

  it("encolarReporte suma a contarPendientes", () => {
    encolarReporte({ descripcion: "a" });
    encolarReporte({ descripcion: "b" });
    expect(contarPendientes()).toBe(2);
  });

  it("reintentarColaReportes: si todos se envían bien, vacía la cola", async () => {
    encolarReporte({ descripcion: "a" });
    encolarReporte({ descripcion: "b" });
    const crearReporte = vi.fn().mockResolvedValue({ id: "r1" });

    await reintentarColaReportes(crearReporte);

    expect(crearReporte).toHaveBeenCalledTimes(2);
    expect(contarPendientes()).toBe(0);
  });

  it("reintentarColaReportes: manda todos en paralelo, no uno por uno", async () => {
    encolarReporte({ descripcion: "a" });
    encolarReporte({ descripcion: "b" });
    let simultaneos = 0;
    let maxSimultaneos = 0;
    const crearReporte = vi.fn().mockImplementation(async () => {
      simultaneos += 1;
      maxSimultaneos = Math.max(maxSimultaneos, simultaneos);
      await new Promise((resolve) => setTimeout(resolve, 10));
      simultaneos -= 1;
    });

    await reintentarColaReportes(crearReporte);

    expect(maxSimultaneos).toBe(2);
  });

  it("reintentarColaReportes: solo deja en la cola los que fallaron", async () => {
    encolarReporte({ descripcion: "ok" });
    encolarReporte({ descripcion: "falla" });
    const crearReporte = vi.fn().mockImplementation(async (datos) => {
      if (datos.descripcion === "falla") throw new Error("sin conexión");
      return { id: "r1" };
    });

    await reintentarColaReportes(crearReporte);

    expect(contarPendientes()).toBe(1);
  });

  it("reintentarColaReportes: con la cola vacía, no llama a crearReporte", async () => {
    const crearReporte = vi.fn();
    await reintentarColaReportes(crearReporte);
    expect(crearReporte).not.toHaveBeenCalled();
  });
});
