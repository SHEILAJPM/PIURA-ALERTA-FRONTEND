// Mascota del asistente: una nubecita con cara, en vez de un ícono genérico
// de robot -- más amigable en un chat pensado para tranquilizar a alguien
// preocupado por el clima/el río. SVG inline (sin imagen externa) para que
// herede los colores del tema en claro/oscuro. Armada con círculos
// superpuestos (el truco clásico para dibujar nubes), igual que la versión
// 3D en MascotaAsistente3D.jsx.
function AvatarAsistente({ size = 40, className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <g fill="var(--color-primary)">
        <ellipse cx="32" cy="42" rx="20" ry="10" />
        <circle cx="17" cy="32" r="10" />
        <circle cx="28" cy="23" r="12" />
        <circle cx="41" cy="25" r="11" />
        <circle cx="49" cy="34" r="9" />
      </g>
      <circle cx="25" cy="40" r="4" fill="#fff" />
      <circle cx="40" cy="40" r="4" fill="#fff" />
      <circle cx="25" cy="40" r="2" fill="var(--color-brand-chrome, #0a2f52)" />
      <circle cx="40" cy="40" r="2" fill="var(--color-brand-chrome, #0a2f52)" />
      <path
        d="M26 47c2.5 3 9.5 3 12 0"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default AvatarAsistente;
