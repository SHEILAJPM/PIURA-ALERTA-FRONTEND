import React from "react";

function AdminPageHeader({ titulo, subtitulo, accion }) {
  return (
    <div
      className="flex items-center justify-between px-4 sm:px-8 h-20 border-b gap-4"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <h1 className="text-2xl font-bold truncate">
        {titulo}{" "}
        {subtitulo && (
          <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>
            {subtitulo}
          </span>
        )}
      </h1>
      {accion}
    </div>
  );
}

export default AdminPageHeader;
