import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Piura Alerta",
        short_name: "Piura Alerta",
        description:
          "Monitoreo del río Piura y alertas de inundación en tiempo real",
        theme_color: "#0a2f52",
        background_color: "#0a2f52",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/escudo-piura.png", // ← USA EL ESCUDO EXISTENTE
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/escudo-piura.png", // ← USA EL ESCUDO EXISTENTE
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        importScripts: ["push-sw.js"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              /\/api\/(sensores(\/estado)?|lecturas(\/ultima)?)$/.test(
                url.pathname,
              ),
            handler: "NetworkFirst",
            options: {
              cacheName: "piura-alerta-api",
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith("basemaps.cartocdn.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "piura-alerta-tiles",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 14,
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    exclude: ["node_modules/**", "e2e/**"],
  },
});
