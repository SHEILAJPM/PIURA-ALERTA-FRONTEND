# PIURA-ALERTA-FRONTEND
# Es una plataforma web e IoT en tiempo real diseñada para el monitoreo del río Piura y la prevención de inundaciones.

# La página actúa como un Centro de Mando y Control Hidrológico:

# Visualización en Vivo: Recibe continuamente las lecturas físicas del sensor ultrasónico/ESP32 vía WebSockets, actualizando la altura del río y trazando la curva de nivel en un gráfico interactivo sin necesidad de recargar la pantalla.
# Mapa GIS y Semáforo de Riesgo: Muestra la ubicación de los puntos de medición en un mapa geoespacial de Piura y cambia automáticamente los colores de los indicadores (Verde, Amarillo y Rojo) según la severidad del caudal.

# Gestión de Crisis e Integración: Procesa un algoritmo predictivo que estima las horas de llegada de la crecida, gestiona la ubicación de los albergues habilitados y dispara alertas automáticas a los celulares de la población conectándose directamente con Telegram.
