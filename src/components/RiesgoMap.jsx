import { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useZonasRiesgo } from "../hooks/useZonasRiesgo";
import { useAlbergues } from "../hooks/useAlbergues";
import { useSensores } from "../hooks/useSensores";
import { useEstadoSensores } from "../hooks/useEstadoSensores";
import Skeleton from "./Skeleton";
import ErrorBanner from "./ErrorBanner";
import { useTheme } from "../context/ThemeContext";
import Icon, { iconoHTML } from "./Icon";

function formatearHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

const CENTRO_PIURA = [-5.1945, -80.6328];

const COLOR_RIESGO = {
  bajo: "#2f9e44",
  medio: "#e8a33d",
  alto: "#c1272d",
};

function crearIconoBootstrap(nombreIcono, color) {
  return L.divIcon({
    html: `<div style="background:${color};width:34px;height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:white;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2.5px solid white;">${iconoHTML(nombreIcono)}</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

// Abre una ruta a pie desde la ubicación del usuario (si la comparte) hasta
// el albergue en Google Maps -- no hay motor de ruteo propio (ver README del
// backend), así que en vez de simularlo se delega a un servicio real.
function abrirRutaSegura(lat, lon) {
  const destino = `${lat},${lon}`;
  const url = (origen) =>
    `https://www.google.com/maps/dir/?api=1${origen ? `&origin=${origen}` : ""}&destination=${destino}&travelmode=walking`;

  if (!navigator.geolocation) {
    window.open(url(), "_blank", "noopener");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => window.open(url(`${pos.coords.latitude},${pos.coords.longitude}`), "_blank", "noopener"),
    () => window.open(url(), "_blank", "noopener")
  );
}

function zonasAFeatureCollection(zonas) {
  return {
    type: "FeatureCollection",
    features: (zonas ?? []).map((z) => ({
      type: "Feature",
      properties: { nombre: z.nombre, nivel_riesgo: z.nivel_riesgo },
      geometry: z.geom,
    })),
  };
}

function RiesgoMap({ altura = "520px", mostrarLeyenda = true }) {
  const { theme } = useTheme();
  const { data: zonas, loading: cargandoZonas, error: errorZonas } = useZonasRiesgo();
  const { data: albergues, loading: cargandoAlbergues, error: errorAlbergues } = useAlbergues();
  const { data: sensores, loading: cargandoSensores, error: errorSensores } = useSensores();
  const { data: estadoSensores } = useEstadoSensores();

  const featureCollection = useMemo(() => zonasAFeatureCollection(zonas), [zonas]);
  const cargando = cargandoZonas || cargandoAlbergues || cargandoSensores;
  const error = errorZonas || errorAlbergues || errorSensores;

  return (
    <div>
      {mostrarLeyenda && (
        <div
          className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-sm rounded-2xl border px-4 py-3"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLOR_RIESGO.bajo }} />
            Riesgo bajo
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLOR_RIESGO.medio }} />
            Riesgo medio
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLOR_RIESGO.alto }} />
            Riesgo alto
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white shrink-0"
              style={{ backgroundColor: "#0b3d62" }}
            >
              <Icon name="bi-house-door-fill" aria-hidden="true" />
            </span>
            Albergue
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white shrink-0"
              style={{ backgroundColor: COLOR_RIESGO.alto }}
            >
              <Icon name="bi-broadcast-pin" aria-hidden="true" />
            </span>
            Sensor
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorBanner message={`No se pudieron cargar algunos datos del mapa: ${error}`} />
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        {cargando ? (
          <Skeleton className="w-full rounded-none" style={{ height: altura }} />
        ) : (
          <MapContainer center={CENTRO_PIURA} zoom={13} style={{ height: altura, width: "100%" }}>
            <TileLayer
              key={theme}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={`https://{s}.basemaps.cartocdn.com/${theme === "dark" ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`}
            />

            {featureCollection.features.length > 0 && (
              <GeoJSON
                data={featureCollection}
                style={(feature) => ({
                  color: COLOR_RIESGO[feature.properties.nivel_riesgo] ?? COLOR_RIESGO.medio,
                  fillColor: COLOR_RIESGO[feature.properties.nivel_riesgo] ?? COLOR_RIESGO.medio,
                  fillOpacity: feature.properties.nivel_riesgo === "alto" ? 0.4 : 0.22,
                  weight: 1,
                  opacity: 0.5,
                })}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(
                    `<strong>${feature.properties.nombre}</strong><br/>Riesgo ${feature.properties.nivel_riesgo}`
                  );
                }}
              />
            )}

            {albergues?.map((albergue) => (
              <Marker
                key={albergue.id}
                position={[albergue.ubicacion.coordinates[1], albergue.ubicacion.coordinates[0]]}
                icon={crearIconoBootstrap("bi-house-door-fill", "#0b3d62")}
              >
                <Popup>
                  <strong>{albergue.nombre}</strong>
                  <br />
                  {albergue.direccion}
                  <br />
                  Aforo: {albergue.ocupacion_actual}/{albergue.capacidad}
                  <br />
                  <button
                    type="button"
                    onClick={() =>
                      abrirRutaSegura(albergue.ubicacion.coordinates[1], albergue.ubicacion.coordinates[0])
                    }
                    className="mt-2 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#0a2f52" }}
                  >
                    Calcular ruta segura
                  </button>
                </Popup>
              </Marker>
            ))}

            {sensores?.map((sensor) => {
              const estado = estadoSensores?.find((s) => s.codigo === sensor.codigo);
              const enLinea = estado ? estado.en_linea : true;

              return (
                <Marker
                  key={sensor.id}
                  position={[sensor.ubicacion.coordinates[1], sensor.ubicacion.coordinates[0]]}
                  icon={crearIconoBootstrap(
                    enLinea ? "bi-broadcast-pin" : "bi-tools",
                    enLinea ? "#c1272d" : "#6b7280"
                  )}
                >
                  <Popup>
                    <strong>{sensor.nombre}</strong>
                    <br />
                    Sensor {sensor.codigo}
                    <br />
                    Prealerta: {sensor.nivel_prealerta_cm} cm · Alerta roja: {sensor.nivel_alerta_roja_cm} cm
                    <br />
                    {enLinea ? (
                      <span style={{ color: "#2f9e44" }}>En línea</span>
                    ) : (
                      <span style={{ color: "#c1272d" }}>
                        Sin señal
                        {estado?.ultima_lectura?.medido_en &&
                          ` desde las ${formatearHora(estado.ultima_lectura.medido_en)}`}
                      </span>
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {!cargando && (albergues?.length === 0 || featureCollection.features.length === 0) && (
        <div
          className="mt-4 rounded-2xl border p-4 text-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          {albergues?.length === 0 && <p>Aún no hay albergues registrados.</p>}
          {featureCollection.features.length === 0 && (
            <p className={albergues?.length === 0 ? "mt-1" : ""}>Aún no hay zonas de riesgo registradas.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RiesgoMap;
