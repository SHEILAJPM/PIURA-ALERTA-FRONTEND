// Hospitales, comisarías y bomberos reales cerca de Piura, vía Overpass
// (la API de consultas de OpenStreetMap) -- gratis, sin clave. A propósito
// NO se hardcodean direcciones a mano: inventar o adivinar la ubicación de un
// puesto de salud o una comisaría es justo el tipo de dato que no se puede
// permitir estar mal en una app de emergencias.
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Caja alrededor de Piura (sur, oeste, norte, este) -- con margen de sobra
// sobre el área que ya cubren los sensores/albergues/zonas de riesgo.
const BBOX = "-5.24,-80.68,-5.15,-80.58";

const TIPOS = {
  hospital: { etiqueta: "Posta médica / hospital", letra: "H", color: "#c1272d" },
  police: { etiqueta: "Comisaría", letra: "P", color: "#0a2f52" },
  fire_station: { etiqueta: "Bomberos", letra: "B", color: "#e8580c" },
};

// Overpass es un servicio público y gratuito compartido por muchísimas apps:
// sin cachear, cada vez que alguien abre el mapa (o navega entre páginas
// dentro de la misma pestaña) se manda una consulta nueva, y basta con unas
// pocas visitas seguidas para chocar con su límite de uso (429). Los
// hospitales/comisarías/bomberos no cambian de un día a otro, así que 24h de
// caché no le cuesta nada a la app y libera bastante presión sobre el
// servicio. sessionStorage (no localStorage) a propósito: se limpia sola al
// cerrar la pestaña, así una app de emergencias nunca muestra ubicaciones de
// hace semanas sin que quede ningún rastro que limpiar a mano.
const CLAVE_CACHE = "piura-alerta-ayuda-cercana";
const CACHE_VIGENTE_MS = 24 * 60 * 60 * 1000;

function leerCache() {
  try {
    const guardado = sessionStorage.getItem(CLAVE_CACHE);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function guardarCache(puntos) {
  try {
    sessionStorage.setItem(CLAVE_CACHE, JSON.stringify({ puntos, guardadoEn: Date.now() }));
  } catch {
    // sessionStorage llena o no disponible (modo privado, etc.): no es
    // crítico, la próxima llamada simplemente vuelve a consultar Overpass.
  }
}

function construirConsulta() {
  const amenities = Object.keys(TIPOS);
  const clausulas = amenities
    .flatMap((amenity) => [`node["amenity"="${amenity}"](${BBOX});`, `way["amenity"="${amenity}"](${BBOX});`])
    .join("\n");
  return `[out:json][timeout:15];\n(\n${clausulas}\n);\nout center;`;
}

function normalizarElementos(elements) {
  return elements
    .map((el) => {
      const amenity = el.tags?.amenity;
      const info = TIPOS[amenity];
      if (!info) return null;
      // Los "way" (edificios) no traen lat/lon directo, solo un centro
      // aproximado que Overpass calcula con `out center`.
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) return null;
      return {
        id: `${el.type}/${el.id}`,
        tipo: amenity,
        etiqueta: info.etiqueta,
        letra: info.letra,
        color: info.color,
        nombre: el.tags?.name ?? info.etiqueta,
        lat,
        lon,
      };
    })
    .filter(Boolean);
}

export async function obtenerPuntosAyuda() {
  const cache = leerCache();
  if (cache && Date.now() - cache.guardadoEn < CACHE_VIGENTE_MS) {
    return cache.puntos;
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(construirConsulta())}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
    const data = await res.json();

    const puntos = normalizarElementos(data.elements);
    guardarCache(puntos);
    return puntos;
  } catch (err) {
    // Un 429 (límite de uso) o una falla de red no debería dejar el mapa sin
    // ningún hospital/comisaría/bombero si ya se había conseguido la lista
    // antes en esta pestaña -- mostrar datos con hasta 24h de antigüedad es
    // mejor que no mostrar nada.
    if (cache) return cache.puntos;
    throw err;
  }
}
