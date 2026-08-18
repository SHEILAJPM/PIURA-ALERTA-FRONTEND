import React from "react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="w-10 h-10 rounded-full flex items-center justify-center text-lg
                 bg-white/10 hover:bg-white/20 text-white transition"
    >
      <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}`} aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
