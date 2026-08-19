// No hay fotos de perfil en el modelo de datos (solo fotos de reportes), así
// que en vez de un ícono de persona genérico para todos, cada nombre se
// mapea siempre al mismo color — reconocible entre reportes de la misma
// persona, sin necesitar una imagen real.
const COLORES = [
  "#c1272d",
  "#e8a33d",
  "#2f9e44",
  "#0a2f52",
  "#b8862e",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#4338ca",
  "#15803d",
];

function colorDe(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES[Math.abs(hash) % COLORES.length];
}

function Avatar({ nombre, size = 40, className = "" }) {
  const inicial = (nombre?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <span
      className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        backgroundColor: colorDe(nombre ?? ""),
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {inicial}
    </span>
  );
}

export default Avatar;
