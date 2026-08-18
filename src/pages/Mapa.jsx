import React, { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useZonasRiesgo } from "../hooks/useZonasRiesgo";
import { useAlbergues } from "../hooks/useAlbergues";
import { useSensores } from "../hooks/useSensores";
import { useEstadoSensores } from "../hooks/useEstadoSensores";
import Skeleton from "../components/Skeleton";
import ErrorBanner from "../components/ErrorBanner";
import { useTheme } from "../context/ThemeContext";

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

function crearIconoBootstrap(claseIcono, color) {
  return L.divIcon({
    html: `<div style="background:${color};width:34px;height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:16px;color:white;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2.5px solid white;"><i class="bi ${claseIcono}"></i></div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
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

function Mapa() {
  const { theme } = useTheme();
  const { data: zonas, loading: cargandoZonas, error: errorZonas } = useZonasRiesgo();
  const { data: albergues, loading: cargandoAlbergues, error: errorAlbergues } = useAlbergues();
  const { data: sensores, loading: cargandoSensores, error: errorSensores } = useSensores();
  const { data: estadoSensores } = useEstadoSensores();

  const featureCollection = useMemo(() => zonasAFeatureCollection(zonas), [zonas]);
  const cargando = cargandoZonas || cargandoAlbergues || cargandoSensores;
  const error = errorZonas || errorAlbergues || errorSensores;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-6">
        <p
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--color-primary)" }}
        >
          Mapa de riesgo
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">Zonas de riesgo, albergues y sensor</h2>
        <p className="mt-3 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Visualiza las zonas con riesgo de inundación, los albergues disponibles y la ubicación
          del sensor del río.
        </p>
      </section>

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
            <i className="bi bi-house-door-fill" aria-hidden="true" />
          </span>
          Albergue
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white shrink-0"
            style={{ backgroundColor: COLOR_RIESGO.alto }}
          >
            <i className="bi bi-broadcast-pin" aria-hidden="true" />
          </span>
          Sensor
        </span>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={`No se pudieron cargar algunos datos del mapa: ${error}`} />
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        {cargando ? (
          <Skeleton className="h-[520px] w-full rounded-none" />
        ) : (
          <MapContainer center={CENTRO_PIURA} zoom={13} style={{ height: "520px", width: "100%" }}>
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
                  fillOpacity: 0.25,
                  weight: 2,
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
                  Ocupación: {albergue.ocupacion_actual}/{albergue.capacidad}
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
                  icon={crearIconoBootstrap(enLinea ? "bi-broadcast-pin" : "bi-tools", enLinea ? "#c1272d" : "#6b7280")}
                >
                  <Popup>
                    <strong>{sensor.nombre}</strong>
                    <br />
                    Sensor {sensor.codigo}
                    <br />
                    Prealerta: {sensor.nivel_prealerta_cm} cm · Alerta roja: {sensor.nivel_alerta_roja_cm} cm
                    <br />
                    {enLinea ? (
                      <span style={{ color: "#2f9e44" }}>
                        <i className="bi bi-check-circle-fill" aria-hidden="true" /> En línea
                      </span>
                    ) : (
                      <span style={{ color: "#c1272d" }}>
                        <i className="bi bi-tools" aria-hidden="true" /> Sin señal
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
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          {albergues?.length === 0 && <p>Aún no hay albergues registrados.</p>}
          {featureCollection.features.length === 0 && (
            <p className={albergues?.length === 0 ? "mt-1" : ""}>Aún no hay zonas de riesgo registradas.</p>
          )}
        </div>
      )}
    </main>
  );
}

export default Mapa;
