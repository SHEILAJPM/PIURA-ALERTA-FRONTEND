import React from "react";

function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--color-primary)" }} className="text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="font-semibold">Río Piura Alerta</p>
        <p className="text-sm text-white/60 mt-1">
          Sistema de monitoreo y prevención ante peligros por lluvias
        </p>
      </div>
    </footer>
  );
}

export default Footer;
