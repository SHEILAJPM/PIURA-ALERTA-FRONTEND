import React, { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useZonasRiesgo } from "../hooks/useZonasRiesgo";
import { useAlbergues } from "../hooks/useAlbergues";
import { useSensores } from "../hooks/useSensores";
import Skeleton from "../components/Skeleton";
import ErrorBanner from "../components/ErrorBanner";

const CENTRO_PIURA = [-5.1945, -80.6328];

const COLOR_RIESGO = {
  bajo: "#2f9e44",
  medio: "#e8a33d",
  alto: "#c1272d",
};

function crearIconoEmoji(emoji, color) {
  return L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 1px 4px rgba(0,0,0,0.35);border:2px solid white;">${emoji}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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
  const { data: zonas, loading: cargandoZonas, error: errorZonas } = useZonasRiesgo();
  const { data: albergues, loading: cargandoAlbergues, error: errorAlbergues } = useAlbergues();
  const { data: sensores, loading: cargandoSensores, error: errorSensores } = useSensores();

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

      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_RIESGO.bajo }} />
          Riesgo bajo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_RIESGO.medio }} />
          Riesgo medio
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_RIESGO.alto }} />
          Riesgo alto
        </span>
        <span className="flex items-center gap-2">🏠 Albergue</span>
        <span className="flex items-center gap-2">📡 Sensor</span>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                icon={crearIconoEmoji("🏠", "#0b3d62")}
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

            {sensores?.map((sensor) => (
              <Marker
                key={sensor.id}
                position={[sensor.ubicacion.coordinates[1], sensor.ubicacion.coordinates[0]]}
                icon={crearIconoEmoji("📡", "#c1272d")}
              >
                <Popup>
                  <strong>{sensor.nombre}</strong>
                  <br />
                  Sensor {sensor.codigo}
                  <br />
                  Prealerta: {sensor.nivel_prealerta_cm} cm · Alerta roja: {sensor.nivel_alerta_roja_cm} cm
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {!cargando && albergues?.length === 0 && (
        <p className="text-sm mt-3" style={{ color: "var(--color-text-muted)" }}>
          Aún no hay albergues registrados.
        </p>
      )}
      {!cargando && featureCollection.features.length === 0 && (
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Aún no hay zonas de riesgo registradas.
        </p>
      )}
    </main>
  );
}

export default Mapa;
