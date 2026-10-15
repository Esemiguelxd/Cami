# 🦐 Cami - Asistente Virtual de Rutas en Ciudad del Carmen

**Cami** es una aplicación web interactiva diseñada para realizar recorridos turísticos inteligentes y personalizados en **Ciudad del Carmen, Campeche**. La app integra cálculo de rutas en tiempo real asistido por **Gemma 4**, seguimiento de ubicación GPS en vivo, asistente de voz interactivo para audio-guías culturales, pronóstico del clima automático con recomendaciones para la salud y un chatbot conversacional para conocer la historia, gastronomía de camarones y atractivos de la isla.

Integrantes: 
Miguel Ángel Jiménez May
Jose Emanuel acencio Pérez
Luis Angel Barrientos Payro
Axel Farid Canul Avilez
Alessandro Farid Vázquez Cortes
---

## 🌟 Características Principales

### 1. 🗺️ Mapa Interactivo en Tiempo Real de Ciudad del Carmen
* **Estilo Visual Oscuro (Blueprint)**: Interfaz de alta gama en azul marino con detalles dorados y líneas de ruta luminosas, inspirada en la referencia de diseño.
* **Puntos de Interés Emblemáticos (POIs)**:
  - 🌴 **Playa Norte**: El boulevard costero, las palapas y el monumento al Camarón Gigante.
  - 🏛️ **Museo Victoriano Niévares**: Antigua institución y memoria histórica de la Isla de Tris y piratas.
  - 🌊 **Malecón de la Ciudad / Caleta**: Vistas marinas y escultura de la *Stella Maris*.
  - 🎯 **Centro Histórico y Parroquia de Nuestra Señora del Carmen**: Corazón colonial y patrona de la isla.
  - 🌲 **Parque Ignacio Zaragoza**: Plaza central con el emblemático quiosco morisco traído de Bélgica en el siglo XIX.
  - 🎓 **Universidad Autónoma de Campeche / UNACAR**: Campus universitario y centro de estudios de la Laguna de Términos.
  - 🏮 **Faro de Campeche (La Puntilla)**: Histórica vigía marítima en la entrada de la laguna.
  - 🌴 **Playa Bahamitas**: Aguas color esmeralda y arenas conchíferas vírgenes.
  - 🍤 **Mercado Alonso Felipe de Andrade**: Gastronomía tradicional de camarón gigante y pan de cazón.
  - 🐬 **Santuario Laguna de Términos**: Hogar de más de 300 delfines toninas y manglares.
  - 🌉 **Puente El Zacatal**: Uno de los puentes más largos de México (3.86 km).
* **Seguimiento GPS en Tiempo Real**: Marcador de radar animado con radio de precisión que sigue tu ubicación física o simula la caminata paso a paso.
* **Exportación GPX**: Guarda y descarga tu trayecto para usarlo en GPS físicos o apps como Strava / Garmin.
* **Modos de Contraste**: Alterna entre la capa oscura blueprint y la capa de satélite de alto contraste.

---

### 2. ☀️ Clima Automático y Recomendaciones para la Salud
* **Conexión Automática a Open-Meteo**: Detecta las condiciones climatológicas reales para las coordenadas de Ciudad del Carmen (`lat: 18.6433, lon: -91.8315`).
* **Métricas en Pantalla**: Temperatura actual, sensación térmica, viento costero, humedad, índice UV y pronóstico horario con probabilidad de lluvias.
* **Recomendaciones de Salud Dinámicas**:
  - ☀️ *Índice UV Alto (UV ≥ 7)*: Alerta para usar bloqueador solar FPS 50+, sombrero de ala ancha y lentes oscuros.
  - 💧 *Alerta de Calor / Sensación Térmica (≥ 35°C)*: Recomendación de hidratación constante con agua natural o de coco y evitar insolación entre 12:00 y 16:00.
  - 🌧️ *Peligro de Lluvias (Probabilidad ≥ 40%)*: Sugerencia de llevar paraguas o impermeable y priorizar paradas techadas como el Museo o el Mercado Gastronómico.
  - 💨 *Viento Costero Fuerte (≥ 30 km/h)*: Precaución con oleaje en Playa Norte y Malecón.
* **Simulador de Escenarios Climatológicos**: Menú desplegable para probar la reacción de la app ante sol intenso, lluvias con chubascos o viento del norte.

---

### 3. 🧠 Cálculo de Rutas Inteligentes e Integración con Gemma 4
* **Solicitudes del Usuario (Bloque Inferior Derecho)**:
  - **¿Cuánto tiempo tienes?**: Píldoras interactivas de `1 hora y media`, `3 horas`, `6 horas` o todo el día.
  - **¿Qué te late?**: Filtros de interés por *Historia*, *Playa*, *Comida*, *Naturaleza*, *Familia* y *Apoyar negocios locales*.
  - **Punto de Salida**: Selecciona partir desde tu ubicación GPS actual, Parque Zaragoza, Playa Norte, Malecón, etc.
  - **Hora de Salida**: Programación horaria adaptada al atardecer o la mañana.
* **Integración API con Gemma 4**:
  - Compatible de forma nativa con **Ollama** (`http://localhost:11434/api/generate`), APIs compatibles con OpenAI (`/v1/chat/completions`) y Google AI Studio.
  - Modal integrado para configurar URL del endpoint, nombre del modelo (`gemma4`, `gemma:7b`, etc.) y probar la conexión con 1 clic.
  - **Motor Inteligente Heurístico Integrado**: Si el servidor Gemma 4 aún no está encendido, Cami utiliza su propio motor local con conocimiento geográfico y algoritmos de optimización de ruta para Ciudad del Carmen, garantizando que la aplicación siempre funcione al 100%.

---

### 4. 🎧 Asistente de Voz y Recorridos Virtuales Narrados
* **Locución por Síntesis de Voz (Web Speech API)**: Narra con acento cálido la historia de los piratas, las características de cada playa y curiosidades de los lugares visitados.
* **Reproductor en Vivo con Subtítulos**: Muestra visualizador de ondas sonoras, subtítulos en vivo y botones para pausar, reanudar y saltar paradas.
* **Comandos por Micrófono**: Presiona el botón del micrófono y pídele a Cami cosas como:
  - *"Cami, ¿qué clima hace hoy?"*
  - *"Arma un recorrido de 3 horas de playa y comida"*
  - *"Cuéntame sobre el Museo Victoriano Niévares"*

---

### 5. 💬 Chatbot Cami con Mascota Camarón
* Drawer deslizante con la simpática mascota del camarón de Ciudad del Carmen.
* Responde dudas turísticas, lugares recomendados para comer camarón gigante al coco, leyendas del pirata Lorencillo y tips de viaje.
* Cada respuesta cuenta con un botón para escuchar la locución en audio.

---

## 🚀 Cómo Ejecutar la Aplicación

### Opción 1: Ejecutar con el Servidor Local Integrado (Recomendado)
Abre una terminal en esta carpeta y ejecuta:
```bash
./bin/node server.js
```
Abre tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

*(El servidor incluye un proxy CORS interno para conectar con Ollama sin bloqueos del navegador).*

### Opción 2: Abrir Directamente en el Navegador
Puedes hacer doble clic en el archivo **`index.html`** para abrirlo en Google Chrome, Safari o Microsoft Edge.

---

## 🤖 Cómo Conectar con tu Modelo Gemma 4 Local (Ollama)

1. En tu computadora, inicia Ollama con el modelo Gemma:
   ```bash
   ollama run gemma4
   # o bien: ollama run gemma:7b
   ```
2. En la barra superior de Cami, haz clic en el botón con icono de cerebro (**🧠 Configurar API Gemma 4**).
3. Verifica la URL (`http://localhost:11434/api/generate`) y haz clic en **"Probar Conexión"**.
4. ¡Listo! Las rutas y las conversaciones del chatbot ahora serán generadas directamente por tu modelo Gemma 4.

---

## 📁 Estructura del Código

```text
/Cami/
├── assets/
│   ├── cami-logo.jpg          # Logotipo original del camarón carmelita
│   └── logo.svg               # Logotipo vectorial escalable
├── css/
│   └── styles.css             # Estilos oscuros blueprint, animaciones y diseño responsivo
├── js/
│   ├── app.js                 # Coordinador principal de la aplicación
│   ├── locations.js           # Base de datos de POIs y rutas de Ciudad del Carmen
│   ├── map.js                 # Controlador del mapa Leaflet, pines, líneas y GPS
│   ├── weather.js             # Integración con Open-Meteo y recomendaciones de salud
│   ├── voiceAssistant.js      # Asistente de voz, audio-guía y reconocimiento
│   ├── gemma.js               # Conector con Gemma 4 y motor heurístico local
│   └── chatbot.js             # Interfaz conversacional del Chatbot Cami
├── index.html                 # Página principal con layout de Imagen 1 e Imagen 2
├── server.js                  # Servidor HTTP ligero y proxy CORS para Gemma 4
├── package.json               # Configuración del paquete
└── README.md                  # Documentación
```

Desarrollado con ❤️ para **Ciudad del Carmen, Campeche**.
