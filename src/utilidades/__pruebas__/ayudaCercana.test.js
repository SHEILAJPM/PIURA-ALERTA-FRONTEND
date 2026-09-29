import { describe, it, expect, vi, beforeEach } from "vitest";
import { obtenerPuntosAyuda } from "../ayudaCercana";

function mockFetchOnce(status, body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("obtenerPuntosAyuda", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("manda la consulta a Overpass por POST con el body codificado", async () => {
    mockFetchOnce(200, { elements: [] });
    await obtenerPuntosAyuda();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url).toBe("https://overpass-api.de/api/interpreter");
    expect(opciones.method).toBe("POST");
    expect(opciones.body).toContain("amenity");
  });

  it("un nodo (hospital) usa lat/lon directo", async () => {
    mockFetchOnce(200, {
      elements: [
        {
          type: "node",
          id: 1,
          lat: -5.19,
          lon: -80.63,
          tags: { amenity: "hospital", name: "Hospital Regional" },
        },
      ],
    });
    const puntos = await obtenerPuntosAyuda();

    expect(puntos).toEqual([
      {
        id: "node/1",
        tipo: "hospital",
        etiqueta: "Posta médica / hospital",
        letra: "H",
        color: "#c1272d",
        nombre: "Hospital Regional",
        lat: -5.19,
        lon: -80.63,
      },
    ]);
  });

  it("un way (comisaría) usa el centro que calcula Overpass, no lat/lon", async () => {
    mockFetchOnce(200, {
      elements: [{ type: "way", id: 2, center: { lat: -5.2, lon: -80.6 }, tags: { amenity: "police" } }],
    });
    const puntos = await obtenerPuntosAyuda();

    expect(puntos).toEqual([
      {
        id: "way/2",
        tipo: "police",
        etiqueta: "Comisaría",
        letra: "P",
        color: "#0a2f52",
        nombre: "Comisaría",
        lat: -5.2,
        lon: -80.6,
      },
    ]);
  });

  it("ignora elementos con un amenity que no es hospital/police/fire_station", async () => {
    mockFetchOnce(200, {
      elements: [
        { type: "node", id: 3, lat: -5.19, lon: -80.63, tags: { amenity: "school", name: "Colegio" } },
      ],
    });
    const puntos = await obtenerPuntosAyuda();
    expect(puntos).toEqual([]);
  });

  it("ignora un way sin centro (no se puede ubicar en el mapa)", async () => {
    mockFetchOnce(200, {
      elements: [{ type: "way", id: 4, tags: { amenity: "fire_station" } }],
    });
    const puntos = await obtenerPuntosAyuda();
    expect(puntos).toEqual([]);
  });

  it("si Overpass responde con error HTTP y no hay caché, lanza una excepción", async () => {
    mockFetchOnce(503, {});
    await expect(obtenerPuntosAyuda()).rejects.toThrow("Overpass respondió 503");
  });

  it("una segunda llamada usa la caché en vez de volver a consultar Overpass", async () => {
    mockFetchOnce(200, {
      elements: [{ type: "node", id: 1, lat: -5.19, lon: -80.63, tags: { amenity: "hospital" } }],
    });
    const primera = await obtenerPuntosAyuda();
    const segunda = await obtenerPuntosAyuda();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(segunda).toEqual(primera);
  });

  it("si Overpass falla (ej. 429) pero ya había datos en caché, devuelve los datos viejos en vez de fallar", async () => {
    mockFetchOnce(200, {
      elements: [{ type: "node", id: 1, lat: -5.19, lon: -80.63, tags: { amenity: "hospital" } }],
    });
    const primera = await obtenerPuntosAyuda();

    // Vence la caché a mano (sin esperar 24h de verdad) para forzar que la
    // siguiente llamada intente consultar Overpass de nuevo.
    const guardado = JSON.parse(sessionStorage.getItem("piura-alerta-ayuda-cercana"));
    guardado.guardadoEn = Date.now() - 25 * 60 * 60 * 1000;
    sessionStorage.setItem("piura-alerta-ayuda-cercana", JSON.stringify(guardado));

    mockFetchOnce(429, {});
    const segunda = await obtenerPuntosAyuda();

    expect(segunda).toEqual(primera);
  });
});
