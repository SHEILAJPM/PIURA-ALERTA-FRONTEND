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

function construirConsulta() {
  const amenities = Object.keys(TIPOS);
  const clausulas = amenities
    .flatMap((amenity) => [`node["amenity"="${amenity}"](${BBOX});`, `way["amenity"="${amenity}"](${BBOX});`])
    .join("\n");
  return `[out:json][timeout:15];\n(\n${clausulas}\n);\nout center;`;
}

export async function obtenerPuntosAyuda() {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(construirConsulta())}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
  const data = await res.json();

  return data.elements
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
