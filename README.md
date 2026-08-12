# 💻 PIURA ALERTA — Dashboard de Mando, Control & Monitoreo Hidrológico

## 👥 Integrantes

* **Sheila Jacqueline Principe Merino** — Lead Hardware IoT & Backend Engineer
* **Adrian Steven Juarez Panta** — Lead Frontend UI/UX & Structural Engineer

## 📝 Descripción

El **Frontend de PIURA ALERTA** representa el Centro de Mando y Control Hidrológico para la prevención de inundaciones en la cuenca del Río Piura.

Es un Dashboard web interactivo desarrollado con **React 18**, utilizando una interfaz **Civic Tech Light Mode**.

La aplicación permite:

* Monitorear el nivel del agua en tiempo real.
* Visualizar el estado de riesgo: Verde, Amarillo y Rojo.
* Mostrar sensores mediante un mapa GIS.
* Visualizar gráficos de nivel de agua.
* Recibir información mediante WebSockets.
* Consultar alertas enviadas a la población.

## 🛠️ Tecnologías

| Tecnología              | Uso                                        |
| ----------------------- | ------------------------------------------ |
| React 18                | Desarrollo de componentes e interfaz       |
| Tailwind CSS            | Diseño y estilos responsivos               |
| Recharts                | Gráficos en tiempo real                    |
| Leaflet / React-Leaflet | Mapas interactivos                         |
| Lucide React            | Iconos                                     |
| WebSocket API           | Comunicación en tiempo real con el Backend |

## ⚡ Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/sheilajpm/piura-alerta-frontend.git
cd piura-alerta-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:5173
```

### 4. Compilar para producción

```bash
npm run build
```

## 🔌 Conexión con Backend

El Frontend recibe información en tiempo real mediante WebSockets:

```text
ws://localhost:8080
```

## 📊 Funcionalidades principales

* Dashboard de monitoreo.
* Indicadores KPI.
* Mapa GIS.
* Gráfico de nivel de agua.
* Semáforo de riesgo.
* Registro de alertas.
* Visualización de albergues.
* Reportes.
* Comunicación en tiempo real.
