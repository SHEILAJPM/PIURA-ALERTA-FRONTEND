const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Sube la foto directo del navegador a Cloudinary (unsigned upload preset) —
// el backend nunca recibe el archivo, solo la URL resultante. El preset se
// crea una vez en el dashboard de Cloudinary (Settings > Upload > Add upload
// preset, modo "Unsigned") y ahí se puede limitar tamaño/formato permitido.
export async function subirFoto(archivo) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Falta configurar VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env"
    );
  }

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("No se pudo subir la foto. Intenta de nuevo.");
  }

  const data = await res.json();
  return data.secure_url;
}
