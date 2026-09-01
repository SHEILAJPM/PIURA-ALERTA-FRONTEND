
const CACHE_VERSION = 'v1';
const CACHE_NAME = `piura-alerta-${CACHE_VERSION}`;

const TIPOS_NOTIFICACION = {
  ALERTA_ROJA: 'alerta_roja',
  REPORTE_VERIFICADO: 'reporte_verificado',
  REPORTE_CERCANO: 'reporte_cercano',
  TICKET_RESUELTO: 'ticket_resuelto',
  GENERAL: 'general',
};

const ICONOS = {
  [TIPOS_NOTIFICACION.ALERTA_ROJA]: '/pwa-192.png',
  [TIPOS_NOTIFICACION.REPORTE_VERIFICADO]: '/pwa-192.png',
  [TIPOS_NOTIFICACION.REPORTE_CERCANO]: '/pwa-192.png',
  [TIPOS_NOTIFICACION.TICKET_RESUELTO]: '/pwa-192.png',
  [TIPOS_NOTIFICACION.GENERAL]: '/pwa-192.png',
};

const VIBRACION = {
  [TIPOS_NOTIFICACION.ALERTA_ROJA]: [200, 100, 200, 100, 200],
  [TIPOS_NOTIFICACION.REPORTE_VERIFICADO]: [100, 50, 100],
  [TIPOS_NOTIFICACION.REPORTE_CERCANO]: [50, 50, 50],
  [TIPOS_NOTIFICACION.TICKET_RESUELTO]: [50, 50, 50],
  [TIPOS_NOTIFICACION.GENERAL]: [100],
};

const REQUIERE_INTERACCION = {
  [TIPOS_NOTIFICACION.ALERTA_ROJA]: true,
  [TIPOS_NOTIFICACION.REPORTE_VERIFICADO]: false,
  [TIPOS_NOTIFICACION.REPORTE_CERCANO]: false,
  [TIPOS_NOTIFICACION.TICKET_RESUELTO]: false,
  [TIPOS_NOTIFICACION.GENERAL]: false,
};

self.addEventListener("push", (event) => {
  let datos = {
    titulo: "Piura Alerta",
    cuerpo: "Hay una novedad en el sistema.",
    tipo: TIPOS_NOTIFICACION.GENERAL,
    url: "/",
    reporte_id: null,
    sensor_id: null,
    timestamp: Date.now(),
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      datos = { ...datos, ...payload };
    } catch {
      datos.cuerpo = event.data.text();
    }
  }

  let tag = "piura-alerta-estado";
  if (datos.tipo === TIPOS_NOTIFICACION.ALERTA_ROJA) {
    tag = `alerta-roja-${datos.sensor_id || 'general'}`;
  } else if (datos.tipo === TIPOS_NOTIFICACION.REPORTE_VERIFICADO) {
    tag = `reporte-${datos.reporte_id || Date.now()}`;
  } else if (datos.tipo === TIPOS_NOTIFICACION.REPORTE_CERCANO) {
    tag = `reporte-cercano-${datos.reporte_id || Date.now()}`;
  }

  const opciones = {
    body: datos.cuerpo,
    icon: ICONOS[datos.tipo] || '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: tag,
    data: {
      url: datos.url || "/",
      tipo: datos.tipo,
      reporte_id: datos.reporte_id,
      sensor_id: datos.sensor_id,
      timestamp: datos.timestamp,
    },
    requireInteraction: REQUIERE_INTERACCION[datos.tipo] || false,
    vibrate: VIBRACION[datos.tipo] || [100],
    actions: [],
    silent: false,
  };

  if (datos.tipo === TIPOS_NOTIFICACION.ALERTA_ROJA) {
    opciones.actions = [
      { action: 'ver-mapa', title: 'Ver mapa de riesgo' },
      { action: 'ver-albergues', title: 'Albergues cercanos' },
    ];
  } else if (datos.tipo === TIPOS_NOTIFICACION.REPORTE_VERIFICADO) {
    opciones.actions = [
      { action: 'ver-reporte', title: 'Ver reporte' },
      { action: 'compartir', title: 'Compartir' },
    ];
  }

  event.waitUntil(
    self.registration.showNotification(datos.titulo, opciones)
  );
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  const url = data.url || "/";

  notification.close();

  if (action === 'ver-mapa') {
    event.waitUntil(abrirURL('/mapa'));
    return;
  }

  if (action === 'ver-albergues') {
    event.waitUntil(abrirURL('/mapa?mostrar=albergues'));
    return;
  }

  if (action === 'ver-reporte' && data.reporte_id) {
    event.waitUntil(abrirURL(`/reportes?reporte=${data.reporte_id}`));
    return;
  }

  if (action === 'compartir' && data.reporte_id) {
    event.waitUntil(compartirReporte(data.reporte_id));
    return;
  }

  // Acción por defecto: abrir la URL
  event.waitUntil(abrirURL(url));
});

async function abrirURL(url) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  const existente = clients.find((client) => {
    try {
      return new URL(client.url).pathname === url;
    } catch {
      return false;
    }
  });

  if (existente) {
    await existente.focus();
    return existente;
  }

  return self.clients.openWindow(url);
}

async function compartirReporte(reporteId) {
  const url = `${self.location.origin}/reportes?reporte=${reporteId}`;
  const texto = `📢 Reporte ciudadano en Piura Alerta\n\nVer reporte: ${url}`;

  try {
    await navigator.share({
      title: 'Reporte ciudadano - Piura Alerta',
      text: texto,
      url: url,
    });
    return;
  } catch {}

  return self.clients.openWindow(url);
}

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  return self.clients.claim();
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reportes') {
    event.waitUntil(sincronizarReportes());
  }
});

async function sincronizarReportes() {
  try {
    const db = await openDB();
    const pendientes = await db.getAll('reportes-pendientes');
    
    for (const reporte of pendientes) {
      try {
        await fetch('/api/reportes-ciudadanos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reporte),
        });
        await db.delete('reportes-pendientes', reporte.id);
      } catch {}
    }
  } catch {}
}

// 🔥 FUNCIÓN: Abrir IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PiuraAlertaDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('reportes-pendientes')) {
        db.createObjectStore('reportes-pendientes', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}