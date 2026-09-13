import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useResource } from "../useResource";

function diferir() {
  let resolver;
  const promesa = new Promise((r) => (resolver = r));
  return { promesa, resolver };
}

describe("useResource", () => {
  it("carga los datos y expone loading/error", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useResource(fetchFn, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ok: true });
    expect(result.current.error).toBe(null);
  });

  it("un error deja data en null y llena error con el mensaje", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useResource(fetchFn, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("network error");
  });

  it("una respuesta vieja no pisa una más nueva cuando cambian las deps antes de que resuelva", async () => {
    const primeraLlamada = diferir();
    const segundaLlamada = diferir();
    const fetchFn = vi.fn().mockReturnValueOnce(primeraLlamada.promesa).mockReturnValueOnce(segundaLlamada.promesa);

    const { result, rerender } = renderHook(({ dep }) => useResource(fetchFn, [dep]), {
      initialProps: { dep: "a" },
    });

    rerender({ dep: "b" });
    expect(fetchFn).toHaveBeenCalledTimes(2);

    // La segunda (más nueva) resuelve primero...
    await act(async () => segundaLlamada.resolver("respuesta-b"));
    // ...y la primera (vieja) resuelve después, pero no debería pisar "b".
    await act(async () => primeraLlamada.resolver("respuesta-a"));

    expect(result.current.data).toBe("respuesta-b");
  });

  it("recargar() llamado dos veces seguidas deja el resultado de la última", async () => {
    const primeraLlamada = diferir();
    const segundaLlamada = diferir();
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce("inicial")
      .mockReturnValueOnce(primeraLlamada.promesa)
      .mockReturnValueOnce(segundaLlamada.promesa);

    const { result } = renderHook(() => useResource(fetchFn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.recargar();
      result.current.recargar();
    });

    await act(async () => segundaLlamada.resolver("segunda"));
    await act(async () => primeraLlamada.resolver("primera"));

    expect(result.current.data).toBe("segunda");
  });
});
