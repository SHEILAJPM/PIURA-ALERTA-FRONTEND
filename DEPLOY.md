# Despliegue de PIURA ALERTA — Frontend

Guía paso a paso para pasar de "corre en mi máquina" a producción. No la ejecuta
Claude Code por vos — necesita una cuenta de Cloudinary que solo el dueño del
proyecto puede crear. Esto deja todo listo (config de Vercel/Netlify, redirects
para las rutas de React Router) para que el `git push` final sea lo único que falte.

## 0. Prerrequisito: el backend ya desplegado

Este frontend necesita la URL pública del backend (ver `PIURA-ALERTA-BACKEND/DEPLOY.md`).
Desplegar ese primero, o al menos tenerlo corriendo en algún lado, antes de este paso.

## 1. Crear la cuenta de Cloudinary (subida de fotos en reportes)

Los reportes ciudadanos suben fotos directo desde el navegador a Cloudinary
(`src/lib/cloudinary.js`) — el backend nunca recibe el archivo, solo la URL
resultante. Sin esto configurado, publicar un reporte **con foto** falla (sin
foto sigue funcionando igual).

1. Crear una cuenta gratis en [cloudinary.com](https://cloudinary.com).
2. En el dashboard, copiar el **Cloud name** (aparece arriba de todo).
3. Ir a **Settings (⚙) > Upload > Upload presets > Add upload preset**:
   - **Signing Mode**: `Unsigned` (obligatorio — es lo que permite subir
     desde el navegador sin exponer ninguna clave secreta).
   - Nombre del preset: el que quieras (ej. `piura_alerta_reportes`).
   - Opcional pero recomendable: en **Upload Manipulations**, limitar
     tamaño/formato para no aceptar archivos gigantes.
4. Guardar. Vas a usar el **Cloud name** y el **nombre del preset** en el paso 3.

## 2. Desplegar en Vercel (recomendado)

1. Subir este repo a GitHub (si no lo está ya).
2. En Vercel: **New Project**, importar el repo. Vercel detecta Vite solo
   (`npm run build`, output `dist/`) — no hace falta tocar nada del build.
3. El [`vercel.json`](vercel.json) incluido agrega el rewrite que hace falta
   para que rutas como `/mapa` o `/admin/usuarios` no den 404 al refrescar o
   entrar por link directo (la app es un SPA con `react-router-dom`, todo el
   ruteo pasa por `index.html`).
4. Configurar las env vars (**Settings > Environment Variables**):

   | Variable                        | Valor                                                                       |
   | ------------------------------- | --------------------------------------------------------------------------- |
   | `VITE_API_URL`                  | URL del backend desplegado, ej. `https://piura-alerta-backend.onrender.com` |
   | `VITE_WS_URL`                   | mismo host, esquema `wss`, ej. `wss://piura-alerta-backend.onrender.com`    |
   | `VITE_CLOUDINARY_CLOUD_NAME`    | el Cloud name del paso 1                                                    |
   | `VITE_CLOUDINARY_UPLOAD_PRESET` | el nombre del preset del paso 1                                             |

5. Deploy.
6. Volver al `DEPLOY.md` del **backend** y completar ahí `CORS_ORIGIN` con la
   URL que Vercel te dio (ej. `https://piura-alerta.vercel.app`) — sin esto, el
   navegador bloquea las requests del frontend al backend en producción.

### Alternativa: Netlify

Mismo build (`npm run build`, publish directory `dist`). El [`public/_redirects`](public/_redirects)
incluido cumple la misma función que `vercel.json` (rewrite a `index.html` para
las rutas de React Router) — Netlify lo copia solo al build. Mismas env vars que arriba.

## 3. Verificar que quedó bien

- Abrir la URL desplegada, confirmar que el Dashboard carga datos reales (no
  solo el esqueleto de carga) — valida `VITE_API_URL`.
- Abrir `/mapa` **por URL directa** (no navegando desde adentro) y refrescar —
  si da 404, revisar el rewrite del paso 2.
- En DevTools > Network > WS, confirmar que hay una conexión WebSocket abierta
  al backend — valida `VITE_WS_URL`.
- Publicar un reporte ciudadano con foto — valida Cloudinary. Si falla con
  "Falta configurar VITE_CLOUDINARY_...", revisar las env vars del paso 2.4.
