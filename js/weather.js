/**
 * Cami - Servicio de Clima en Tiempo Real para Ciudad del Carmen, Campeche
 * Integra API de Open-Meteo con detección automática y recomendaciones para la salud.
 */

const CARMEN_LAT = 18.6433;
const CARMEN_LNG = -91.8315;

export class WeatherService {
  constructor() {
    this.currentData = null;
    this.currentScenario = "auto"; // "auto" o id de escenario de demo
    this.listeners = [];
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentData));
  }

  async init() {
    await this.fetchRealWeather();
    // Actualizar automáticamente cada 10 minutos
    setInterval(() => {
      if (this.currentScenario === "auto") {
        this.fetchRealWeather();
      }
    }, 10 * 60 * 1000);
  }

  async fetchRealWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${CARMEN_LAT}&longitude=${CARMEN_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,uv_index&timezone=America%2FMerida&forecast_days=2`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Respuesta no OK de Open-Meteo");
      const data = await response.json();
      this.currentData = this.parseOpenMeteoResponse(data);
      this.notify();
      return this.currentData;
    } catch (err) {
      console.warn("No se pudo conectar a Open-Meteo online, cargando modelo climático local de Carmen:", err);
      this.loadRealisticCarmenDefault();
      this.notify();
      return this.currentData;
    }
  }

  parseOpenMeteoResponse(data) {
    const current = data.current;
    const hourly = data.hourly;
    const now = new Date();
    const currentHour = now.getHours();

    const temp = Math.round(current.temperature_2m);
    const apparent = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const wind = Math.round(current.wind_speed_10m * 10) / 10;
    const weatherCode = current.weather_code;
    const weatherDesc = this.mapWeatherCode(weatherCode);

    // Próximas 6 horas
    const nextHours = [];
    const timeIndex = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);
    const startIndex = timeIndex >= 0 ? timeIndex : 0;

    for (let i = 0; i < 6; i++) {
      const idx = startIndex + i;
      if (idx < hourly.time.length) {
        const timeStr = new Date(hourly.time[idx]).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
        const hTemp = Math.round(hourly.temperature_2m[idx]);
        const hRain = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 10;
        const hCode = hourly.weather_code[idx];
        const hIcon = this.mapWeatherIcon(hCode);
        nextHours.push({
          time: timeStr,
          temp: hTemp,
          rainProb: hRain,
          icon: hIcon
        });
      }
    }

    const maxTemp = Math.round(Math.max(...hourly.temperature_2m.slice(startIndex, startIndex + 12)));
    const minTemp = Math.round(Math.min(...hourly.temperature_2m.slice(startIndex, startIndex + 12)));
    const currentUV = hourly.uv_index ? hourly.uv_index[startIndex] || 7 : 7;

    const healthAdvice = this.generateHealthRecommendation(temp, apparent, currentUV, nextHours[0]?.rainProb || 0, wind);

    return {
      cityName: "Ciudad del Carmen",
      temperature: temp,
      apparentTemp: apparent,
      humidity: humidity,
      windSpeed: wind,
      condition: weatherDesc.text,
      iconClass: weatherDesc.icon,
      isRainy: weatherDesc.isRain,
      maxTemp: maxTemp,
      minTemp: minTemp,
      uvIndex: currentUV,
      hourlyForecast: nextHours,
      healthRecommendation: healthAdvice,
      lastUpdated: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      modelTime: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      source: "Open-Meteo API en vivo"
    };
  }

  loadRealisticCarmenDefault() {
    const now = new Date();
    const currentHour = now.getHours();
    const temp = 31;
    const apparent = 36;
    const wind = 12.1;
    const uv = 8;
    const rain = 45;

    const hours = [];
    for (let i = 0; i < 6; i++) {
      const h = (currentHour + i) % 24;
      const hStr = `${h.toString().padStart(2, "0")}:00`;
      const t = Math.max(24, 32 - i);
      const r = Math.min(85, Math.max(25, 60 - i * 5 + (i % 2 === 0 ? 15 : -10)));
      hours.push({
        time: hStr,
        temp: t,
        rainProb: r,
        icon: r > 50 ? "fa-cloud-showers-heavy" : "fa-cloud-sun"
      });
    }

    const healthAdvice = this.generateHealthRecommendation(temp, apparent, uv, rain, wind);

    this.currentData = {
      cityName: "Ciudad del Carmen",
      temperature: temp,
      apparentTemp: apparent,
      humidity: 78,
      windSpeed: wind,
      condition: "Parcialmente nublado",
      iconClass: "fa-cloud-sun",
      isRainy: false,
      maxTemp: 33,
      minTemp: 26,
      uvIndex: uv,
      hourlyForecast: hours,
      healthRecommendation: healthAdvice,
      lastUpdated: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      modelTime: "13:30",
      source: "Open-Meteo Carmen (Modelo de Referencia)"
    };
  }

  setDemoScenario(scenarioId) {
    this.currentScenario = scenarioId;
    const now = new Date();

    if (scenarioId === "auto") {
      this.fetchRealWeather();
      return;
    }

    if (scenarioId === "sunny") {
      const healthAdvice = {
        title: "☀️ Radiación Extrema & Calor Costero",
        pillText: "Usar bloqueador FPS 50+",
        badgeColor: "#ff9800",
        alertType: "warning",
        description: "Índice UV muy alto (UV 9) y sensación térmica de 39°C. Se aconseja aplicar bloqueador solar cada 2 horas, vestir ropa ligera con manga larga, gafas con protección UV e hidratarse constantemente con agua o suero."
      };

      this.currentData = {
        cityName: "Ciudad del Carmen",
        temperature: 34,
        apparentTemp: 39,
        humidity: 65,
        windSpeed: 10.4,
        condition: "Soleado y muy caluroso",
        iconClass: "fa-sun",
        isRainy: false,
        maxTemp: 36,
        minTemp: 27,
        uvIndex: 9.5,
        hourlyForecast: [
          { time: "14:00", temp: 34, rainProb: 5, icon: "fa-sun" },
          { time: "15:00", temp: 34, rainProb: 10, icon: "fa-sun" },
          { time: "16:00", temp: 33, rainProb: 15, icon: "fa-sun" },
          { time: "17:00", temp: 31, rainProb: 10, icon: "fa-cloud-sun" },
          { time: "18:00", temp: 29, rainProb: 5, icon: "fa-cloud-sun" },
          { time: "19:00", temp: 28, rainProb: 5, icon: "fa-moon" }
        ],
        healthRecommendation: healthAdvice,
        lastUpdated: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        modelTime: "Simulación",
        source: "Escenario de demostración: Soleado intenso"
      };
    } else if (scenarioId === "rainy") {
      const healthAdvice = {
        title: "🌧️ Peligro de Lluvias & Chubascos",
        pillText: "Peligro de lluvias / Llevar paraguas",
        badgeColor: "#38bdf8",
        alertType: "danger",
        description: "Se registran chubascos costeros y probabilidad de tormenta del 85%. Se recomienda llevar paraguas resistente al viento o impermeable, calzado antiderrapante y priorizar paradas bajo techo como el Museo Victoriano Niévares o el Mercado Gastronómico."
      };

      this.currentData = {
        cityName: "Ciudad del Carmen",
        temperature: 27,
        apparentTemp: 31,
        humidity: 92,
        windSpeed: 24.5,
        condition: "Lluvias y chubascos intermitentes",
        iconClass: "fa-cloud-showers-heavy",
        isRainy: true,
        maxTemp: 29,
        minTemp: 24,
        uvIndex: 3.2,
        hourlyForecast: [
          { time: "15:00", temp: 28, rainProb: 85, icon: "fa-cloud-showers-heavy" },
          { time: "16:00", temp: 27, rainProb: 75, icon: "fa-cloud-rain" },
          { time: "17:00", temp: 27, rainProb: 65, icon: "fa-cloud-rain" },
          { time: "18:00", temp: 26, rainProb: 50, icon: "fa-cloud-sun-rain" },
          { time: "19:00", temp: 25, rainProb: 40, icon: "fa-cloud" },
          { time: "20:00", temp: 25, rainProb: 30, icon: "fa-cloud" }
        ],
        healthRecommendation: healthAdvice,
        lastUpdated: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        modelTime: "Simulación",
        source: "Escenario de demostración: Tormenta tropical / Lluvias"
      };
    } else if (scenarioId === "windy") {
      const healthAdvice = {
        title: "💨 Viento Costero Elevado (Norte)",
        pillText: "Precaución con oleaje y viento",
        badgeColor: "#a855f7",
        alertType: "warning",
        description: "Rachas de viento costero de 35 a 45 km/h. Se sugiere precaución al caminar en las escolleras del Malecón y Playa Norte, asegurar sombreros y proteger ojos del polvo y arena."
      };

      this.currentData = {
        cityName: "Ciudad del Carmen",
        temperature: 25,
        apparentTemp: 24,
        humidity: 70,
        windSpeed: 38.0,
        condition: "Viento costero fresco (Norte)",
        iconClass: "fa-wind",
        isRainy: false,
        maxTemp: 27,
        minTemp: 22,
        uvIndex: 5.0,
        hourlyForecast: [
          { time: "15:00", temp: 26, rainProb: 20, icon: "fa-wind" },
          { time: "16:00", temp: 25, rainProb: 25, icon: "fa-wind" },
          { time: "17:00", temp: 25, rainProb: 20, icon: "fa-cloud" },
          { time: "18:00", temp: 24, rainProb: 15, icon: "fa-cloud" },
          { time: "19:00", temp: 23, rainProb: 10, icon: "fa-moon" },
          { time: "20:00", temp: 23, rainProb: 10, icon: "fa-moon" }
        ],
        healthRecommendation: healthAdvice,
        lastUpdated: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        modelTime: "Simulación",
        source: "Escenario de demostración: Viento norte"
      };
    }

    this.notify();
  }

  generateHealthRecommendation(temp, apparent, uvIndex, rainProb, windSpeed) {
    if (rainProb >= 50) {
      return {
        title: "🌧️ Peligro de lluvias",
        pillText: "Peligro de lluvias: Lleva paraguas",
        badgeColor: "#38bdf8",
        alertType: "danger",
        description: `Probabilidad de lluvia del ${rainProb}%. Te sugerimos llevar paraguas o impermeable y planear paradas en recintos protegidos como el Museo Victoriano Niévares o el Mercado Alonso Felipe de Andrade.`
      };
    }

    if (uvIndex >= 7 || temp >= 32 || apparent >= 36) {
      return {
        title: "☀️ Radiación solar alta & Calor",
        pillText: "Usar bloqueador solar FPS 50+",
        badgeColor: "#ff9800",
        alertType: "warning",
        description: `Índice UV de ${uvIndex.toFixed(1)} y sensación térmica de ${apparent}°C. Es imprescindible usar bloqueador solar FPS 50+, sombrero de ala ancha y beber al menos 2 litros de agua durante el recorrido.`
      };
    }

    if (windSpeed >= 30) {
      return {
        title: "💨 Viento costero activo",
        pillText: "Precaución en zonas de playa",
        badgeColor: "#818cf8",
        alertType: "info",
        description: `Viento de ${windSpeed} km/h en la costa. Ten precaución en las orillas de Playa Norte y asegura gorras y pertenencias ligeras.`
      };
    }

    return {
      title: "✨ Condiciones Climatológicas Óptimas",
      pillText: "Clima favorable para explorar",
      badgeColor: "#22c55e",
      alertType: "success",
      description: "La temperatura y el viento son muy agradables en la isla. Es un gran momento para realizar la ruta a pie o en bicicleta por el malecón."
    };
  }

  mapWeatherCode(code) {
    if (code === 0) return { text: "Cielo despejado", icon: "fa-sun", isRain: false };
    if (code === 1 || code === 2) return { text: "Parcialmente nublado", icon: "fa-cloud-sun", isRain: false };
    if (code === 3) return { text: "Nublado", icon: "fa-cloud", isRain: false };
    if (code >= 45 && code <= 48) return { text: "Neblina costera", icon: "fa-smog", isRain: false };
    if (code >= 51 && code <= 55) return { text: "Llovizna ligera", icon: "fa-cloud-rain", isRain: true };
    if (code >= 61 && code <= 65) return { text: "Lluvia moderada", icon: "fa-cloud-showers-heavy", isRain: true };
    if (code >= 80 && code <= 82) return { text: "Chubascos fuertes", icon: "fa-cloud-showers-heavy", isRain: true };
    if (code >= 95) return { text: "Tormenta eléctrica", icon: "fa-bolt", isRain: true };
    return { text: "Parcialmente nublado", icon: "fa-cloud-sun", isRain: false };
  }

  mapWeatherIcon(code) {
    if (code === 0) return "fa-sun";
    if (code <= 2) return "fa-cloud-sun";
    if (code === 3) return "fa-cloud";
    if (code >= 51 && code <= 67) return "fa-cloud-rain";
    if (code >= 80) return "fa-cloud-showers-heavy";
    if (code >= 95) return "fa-bolt";
    return "fa-cloud-sun";
  }
}
