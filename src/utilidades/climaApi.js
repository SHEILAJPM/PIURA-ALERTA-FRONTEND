// Open-Meteo: sin API key ni cuenta (a diferencia de OpenWeatherMap), por eso
// se llama directo desde el navegador en vez de proxearlo por el backend —
// mismo criterio que los tiles de CARTO en RiesgoMap.jsx.
const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Centro de Piura: los sensores/albergues del proyecto están todos dentro de
// la ciudad, así que un solo punto alcanza para un pronóstico de referencia.
const LAT_PIURA = -5.1945;
const LON_PIURA = -80.6328;

const HORAS_A_MIRAR = 6;

export async function obtenerPronosticoLluvia() {
  const params = new URLSearchParams({
    latitude: LAT_PIURA,
    longitude: LON_PIURA,
    hourly: "precipitation_probability,precipitation",
    timezone: "America/Lima",
    // 2 días, no 1: con solo el día de hoy, entrada la noche ya no queda
    // ninguna hora futura en la respuesta -- el código caía a mostrar las
    // primeras horas del día (ya pasadas) como si fueran el pronóstico de
    // "las próximas 6 horas". Con el día siguiente ya incluido, siempre hay
    // horas futuras para encontrar.
    forecast_days: "2",
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();

  const { time, precipitation_probability: probabilidad, precipitation: mm } = data.hourly;
  const ahora = Date.now();
  const indiceActual = time.findIndex((t) => new Date(t).getTime() >= ahora);
  // Si de verdad no hay ninguna hora futura en la respuesta (no debería
  // pasar con forecast_days=2, pero por si acaso), cae a un slice vacío en
  // vez de al principio del arreglo -- mostrar "sin datos" es honesto, mostrar
  // lluvia de ayer/madrugada como si fuera el pronóstico no lo es.
  const inicio = indiceActual === -1 ? time.length : indiceActual;
  const probabilidadVentana = probabilidad.slice(inicio, inicio + HORAS_A_MIRAR);
  const mmVentana = mm.slice(inicio, inicio + HORAS_A_MIRAR);

  return {
    probabilidadMax: probabilidadVentana.length ? Math.max(...probabilidadVentana) : 0,
    mmEsperados: mmVentana.reduce((suma, valor) => suma + valor, 0),
    horas: HORAS_A_MIRAR,
  };
}
