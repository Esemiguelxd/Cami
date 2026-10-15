/**
 * Cami - Aplicación Web Principal
 * Coordinador de Mapa, Clima en Tiempo Real, Asistente de Voz, Chatbot y Gemma 4
 */

import { MapController } from "./map.js";
import { WeatherService } from "./weather.js";
import { VoiceAssistant } from "./voiceAssistant.js";
import { GemmaService } from "./gemma.js";
import { ChatbotController } from "./chatbot.js";
import { POI_LOCATIONS, DEPARTURE_POINTS, PREDEFINED_ROUTES } from "./locations.js";

class CamiApp {
  constructor() {
    this.mapCtrl = new MapController("carmen-map");
    this.weatherSvc = new WeatherService();
    this.voiceAsst = new VoiceAssistant();
    this.gemmaSvc = new GemmaService();
    this.chatbot = new ChatbotController(this.gemmaSvc, this.voiceAsst);

    this.currentRoute = null;
    this.selectedCategories = ["historia", "playa", "comida"];
    this.selectedDuration = 3; // horas por defecto
    this.selectedDepartureId = "parque_zaragoza";
    this.departureTime = "15:00";
    this.activeFilterCategory = "all";
  }

  async init() {
    // 1. Inicializar mapa de Ciudad del Carmen
    this.mapCtrl.init();

    // 2. Inicializar Asistente de Voz y Chatbot
    this.chatbot.init("cami-chatbot-drawer");
    this.setupVoiceControls();

    // 3. Inicializar Clima y configurar listeners
    this.setupWeather();

    // 4. Configurar panel de solicitudes del usuario (Imagen 1 en bloque inferior derecho)
    this.setupUserRequestsPanel();

    // 5. Configurar barra de navegación y explorador de categorías
    this.setupNavigationAndExplorer();

    // 6. Configurar modal de API Gemma 4
    this.setupGemmaModal();

    // 7. Generar ruta inicial por defecto para demostración inmediata (sin hablar automáticamente al cargar)
    this.buildRoute(false);

    console.log("Cami App inicializada exitosamente en Ciudad del Carmen.");
  }

  setupWeather() {
    this.weatherSvc.onUpdate(data => {
      this.renderWeatherWidgets(data);
    });

    this.weatherSvc.init();

    // Botones de actualizar clima
    document.querySelectorAll(".btn-refresh-weather").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.add("spinning");
        this.weatherSvc.fetchRealWeather().finally(() => {
          setTimeout(() => btn.classList.remove("spinning"), 600);
        });
      });
    });

    // Selector de escenarios de prueba para demostración
    const scenarioSelect = document.getElementById("demo-scenario-select");
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", (e) => {
        this.weatherSvc.setDemoScenario(e.target.value);
      });
    }
  }

  renderWeatherWidgets(data) {
    if (!data) return;

    // A. Widget Lateral Izquierdo (Diseño Imagen 2)
    const sidebarTemp = document.getElementById("sidebar-weather-temp");
    const sidebarDesc = document.getElementById("sidebar-weather-desc");
    const sidebarMinMax = document.getElementById("sidebar-weather-minmax");
    const sidebarIcon = document.getElementById("sidebar-weather-icon");
    const sidebarHourly = document.getElementById("sidebar-hourly-forecast");
    const sidebarHealth = document.getElementById("sidebar-health-recommendation");

    if (sidebarTemp) sidebarTemp.textContent = `${data.temperature}°`;
    if (sidebarDesc) sidebarDesc.textContent = data.condition;
    if (sidebarMinMax) sidebarMinMax.textContent = `↑ ${data.maxTemp}° ↓ ${data.minTemp}°`;
    if (sidebarIcon) sidebarIcon.className = `fa-solid ${data.iconClass} weather-main-icon`;

    if (sidebarHealth && data.healthRecommendation) {
      sidebarHealth.innerHTML = `
        <div class="health-alert-pill health-pill-${data.healthRecommendation.alertType}">
          <i class="fa-solid fa-heart-pulse"></i>
          <span class="health-pill-title">${data.healthRecommendation.pillText}</span>
        </div>
      `;
    }

    if (sidebarHourly && data.hourlyForecast) {
      sidebarHourly.innerHTML = data.hourlyForecast.slice(0, 4).map(h => `
        <div class="hourly-mini-item">
          <span class="hour-time">${h.time}</span>
          <i class="fa-solid ${h.icon} hour-icon"></i>
          <span class="hour-temp">${h.temp}°</span>
        </div>
      `).join("");
    }

    // B. Widget Superior del Panel de Solicitudes (Diseño Imagen 1)
    const planWeatherTemp = document.getElementById("plan-weather-temp");
    const planWeatherMetrics = document.getElementById("plan-weather-metrics");
    const planHourlyCards = document.getElementById("plan-hourly-cards");
    const planHealthBanner = document.getElementById("plan-health-banner");

    if (planWeatherTemp) {
      planWeatherTemp.textContent = `${data.temperature} °C · Carmen`;
    }
    if (planWeatherMetrics) {
      planWeatherMetrics.textContent = `Sensación ${data.apparentTemp} °C · Viento ${data.windSpeed} km/h · Modelo ${data.modelTime} · Consulta ${data.lastUpdated}`;
    }

    if (planHealthBanner && data.healthRecommendation) {
      planHealthBanner.innerHTML = `
        <div class="health-banner-box banner-${data.healthRecommendation.alertType}">
          <div class="banner-icon-col"><i class="fa-solid fa-shield-halved"></i></div>
          <div class="banner-text-col">
            <strong>${data.healthRecommendation.title}</strong>
            <p>${data.healthRecommendation.description}</p>
          </div>
        </div>
      `;
    }

    if (planHourlyCards && data.hourlyForecast) {
      planHourlyCards.innerHTML = data.hourlyForecast.map(h => `
        <div class="plan-hour-card">
          <span class="p-hour">${h.time}</span>
          <div class="p-icon-temp">
            <i class="fa-solid ${h.icon}"></i>
            <span>${h.temp} °C</span>
          </div>
          <span class="p-rain"><i class="fa-solid fa-droplet"></i> Lluvia ${h.rainProb}%</span>
        </div>
      `).join("");
    }
  }

  setupUserRequestsPanel() {
    // 1. Selector de "¿Cuánto tiempo tienes?" (Píldoras 1.5h, 3h, 6h)
    const timePills = document.querySelectorAll(".time-pill-btn");
    timePills.forEach(pill => {
      pill.addEventListener("click", () => {
        timePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.selectedDuration = parseFloat(pill.dataset.hours || 3);
      });
    });

    // 2. Selector de "¿Qué te late?" (Píldoras de intereses múltiples)
    const interestPills = document.querySelectorAll(".interest-pill-btn");
    interestPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const cat = pill.dataset.cat;
        pill.classList.toggle("active");
        if (pill.classList.contains("active")) {
          if (!this.selectedCategories.includes(cat)) this.selectedCategories.push(cat);
        } else {
          this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
        }
      });
    });

    // 3. Hora y Punto de salida
    const timeInput = document.getElementById("departure-time-input");
    if (timeInput) {
      timeInput.addEventListener("change", (e) => {
        this.departureTime = e.target.value;
      });
    }

    const departureSelect = document.getElementById("departure-point-select");
    if (departureSelect) {
      departureSelect.addEventListener("change", (e) => {
        this.selectedDepartureId = e.target.value;
        if (this.selectedDepartureId === "gps") {
          this.mapCtrl.startGpsTracking();
          this.mapCtrl.centerOnGps();
        }
      });
    }

    // 4. Botón Principal: ¡Arma mi recorrido!
    const buildBtn = document.getElementById("btn-build-route");
    if (buildBtn) {
      buildBtn.addEventListener("click", () => {
        this.buildRoute(true);
      });
    }

    // 5. Botones auxiliares de la Imagen 1
    const btnReorganize = document.getElementById("btn-reorganize");
    if (btnReorganize) {
      btnReorganize.addEventListener("click", () => {
        if (this.currentRoute && this.currentRoute.stops.length > 2) {
          // Invertir o mezclar paradas
          this.currentRoute.stops.reverse();
          this.mapCtrl.drawRoute(this.currentRoute.stops);
          this.renderRouteSummary();
        }
      });
    }

    const btnSaveRoute = document.getElementById("btn-save-route");
    if (btnSaveRoute) {
      btnSaveRoute.addEventListener("click", () => {
        alert("¡Recorrido guardado en tus Favoritos de Ciudad del Carmen!");
      });
    }

    const btnGpx = document.getElementById("btn-export-gpx");
    if (btnGpx) {
      btnGpx.addEventListener("click", () => {
        if (this.currentRoute && this.currentRoute.stops) {
          this.mapCtrl.exportGpx(this.currentRoute.stops, this.currentRoute.title);
        }
      });
    }

    const btnContrast = document.getElementById("btn-toggle-contrast");
    if (btnContrast) {
      btnContrast.addEventListener("click", () => {
        const mode = this.mapCtrl.toggleContrast();
        document.querySelectorAll(".layer-pill-btn").forEach(p => {
          if (p.dataset.layer === mode) p.classList.add("active");
          else p.classList.remove("active");
        });
        if (mode === "voyager") {
          btnContrast.innerHTML = '<i class="fa-solid fa-leaf"></i> Naturaleza';
        } else if (mode === "satellite") {
          btnContrast.innerHTML = '<i class="fa-solid fa-satellite"></i> Satélite Real';
        } else if (mode === "topo") {
          btnContrast.innerHTML = '<i class="fa-solid fa-mountain-sun"></i> Topográfico';
        } else {
          btnContrast.innerHTML = '<i class="fa-solid fa-moon"></i> Modo Noche';
        }
      });
    }

    // 6. Botón de Iniciar Recorrido Virtual con Voz
    const btnStartTour = document.getElementById("btn-start-virtual-tour");
    if (btnStartTour) {
      btnStartTour.addEventListener("click", () => {
        this.startVirtualTour();
      });
    }

    // 7. Minimizar / Expandir panel de solicitudes
    const togglePanelBtn = document.getElementById("btn-toggle-requests-panel");
    const requestsCard = document.getElementById("user-requests-card");
    if (togglePanelBtn && requestsCard) {
      togglePanelBtn.addEventListener("click", () => {
        requestsCard.classList.toggle("minimized");
        togglePanelBtn.innerHTML = requestsCard.classList.contains("minimized")
          ? '<i class="fa-solid fa-chevron-up"></i>'
          : '<i class="fa-solid fa-chevron-down"></i>';
      });
    }
  }

  async buildRoute(shouldSpeak = false) {
    const buildBtn = document.getElementById("btn-build-route");
    if (buildBtn) {
      buildBtn.disabled = true;
      buildBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando con IA...';
    }

    // Determinar punto de salida
    let departurePoint = DEPARTURE_POINTS.find(d => d.id === this.selectedDepartureId) || DEPARTURE_POINTS[1];
    if (this.selectedDepartureId === "gps" && this.mapCtrl.currentGpsPos) {
      departurePoint = {
        id: "gps",
        name: "Mi ubicación GPS actual",
        lat: this.mapCtrl.currentGpsPos.lat,
        lng: this.mapCtrl.currentGpsPos.lng
      };
    }

    try {
      const generated = await this.gemmaSvc.generateTourRoute({
        durationHours: this.selectedDuration,
        categories: this.selectedCategories,
        departurePoint: departurePoint,
        weatherData: this.weatherSvc.currentData
      });

      this.currentRoute = generated;

      // Dibujar en el mapa
      this.mapCtrl.drawRoute(generated.stops);

      // Renderizar resumen y paradas
      this.renderRouteSummary();

      // Cami anuncia la ruta solo cuando el usuario la solicitó explícitamente
      if (shouldSpeak) {
        this.voiceAsst.speak(`Ruta trazada de ${this.selectedDuration} horas con ${generated.stops.length} paradas en Ciudad del Carmen. Cuando quieras, presiona Iniciar Recorrido Virtual con Voz.`);
      }
    } catch (e) {
      console.error("Error al armar ruta:", e);
    } finally {
      if (buildBtn) {
        buildBtn.disabled = false;
        buildBtn.innerHTML = '¡Arma mi recorrido!';
      }
    }
  }

  renderRouteSummary() {
    if (!this.currentRoute) return;

    const summaryFooter = document.getElementById("route-summary-footer-bar");
    const stopsContainer = document.getElementById("route-stops-list-container");

    const totalStops = this.currentRoute.stops.length;
    const mins = this.currentRoute.estimatedDurationMinutes || 45;
    const timeStr = this.departureTime || "15:00";

    if (summaryFooter) {
      summaryFooter.innerHTML = `
        <div class="summary-text-line">
          <i class="fa-solid fa-shoe-prints"></i>
          <strong>${totalStops} paradas</strong> · ${mins} min incluyendo caminata por red a pie · salida ${timeStr}.
        </div>
      `;
    }

    if (stopsContainer) {
      stopsContainer.innerHTML = this.currentRoute.stops.map((poi, idx) => `
        <div class="itinerary-stop-card" data-poi-id="${poi.id}">
          <div class="stop-num-col" style="background: ${poi.pinColor}">${idx + 1}</div>
          <div class="stop-info-col">
            <div class="stop-title-row">
              <span class="stop-name">${poi.name}</span>
              <span class="stop-badge-cat">${poi.category}</span>
            </div>
            <p class="stop-desc">${poi.shortDesc}</p>
            <div class="stop-meta-row">
              <span><i class="fa-solid fa-clock"></i> ${poi.visitDurationMin} min de visita</span>
              <span><i class="fa-solid fa-star"></i> ${poi.rating}</span>
              <button class="btn-listen-stop-narrative" data-poi-id="${poi.id}" title="Escuchar narración de este punto">
                <i class="fa-solid fa-volume-high"></i> Escuchar
              </button>
            </div>
          </div>
        </div>
      `).join("");

      // Configurar botones de narración individual
      stopsContainer.querySelectorAll(".btn-listen-stop-narrative").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const poiId = btn.dataset.poiId;
          const poi = POI_LOCATIONS.find(p => p.id === poiId);
          if (poi) {
            this.voiceAsst.narratePoi(poi);
            this.mapCtrl.markers[poi.id]?.openPopup();
          }
        });
      });

      // Al dar click en una tarjeta de parada, centrar en el mapa
      stopsContainer.querySelectorAll(".itinerary-stop-card").forEach(card => {
        card.addEventListener("click", () => {
          const poiId = card.dataset.poiId;
          const poi = POI_LOCATIONS.find(p => p.id === poiId);
          if (poi) {
            this.mapCtrl.map.flyTo([poi.lat, poi.lng], 16, { animate: true, duration: 0.8 });
            this.mapCtrl.markers[poi.id]?.openPopup();
          }
        });
      });
    }
  }

  startVirtualTour() {
    if (!this.currentRoute || !this.currentRoute.stops || this.currentRoute.stops.length === 0) {
      alert("Primero arma un recorrido con el botón '¡Arma mi recorrido!'.");
      return;
    }

    const btnStartTour = document.getElementById("btn-start-virtual-tour");
    if (btnStartTour) {
      if (btnStartTour.classList.contains("tour-active")) {
        this.mapCtrl.stopTourSimulation();
        this.voiceAsst.stop();
        btnStartTour.innerHTML = '<i class="fa-solid fa-headphones"></i> Iniciar Recorrido Virtual con Voz';
        btnStartTour.classList.remove("tour-active");
        return;
      }
      btnStartTour.innerHTML = '<i class="fa-solid fa-stop"></i> Detener Recorrido Virtual';
      btnStartTour.classList.add("tour-active");
    }

    this.mapCtrl.simulateVirtualTour(
      this.currentRoute.stops,
      (poi, index, total, nextStep) => {
        // Cami narra la parada y avanza cuando concluye la locución
        this.voiceAsst.narratePoi(poi, () => {
          if (nextStep) nextStep();
        });
      },
      () => {
        this.voiceAsst.speak("Hemos completado todas las paradas del recorrido por Ciudad del Carmen. ¡Espero que hayas disfrutado este viaje!");
        if (btnStartTour) {
          btnStartTour.innerHTML = '<i class="fa-solid fa-headphones"></i> Iniciar Recorrido Virtual con Voz';
          btnStartTour.classList.remove("tour-active");
        }
      }
    );
  }

  setupVoiceControls() {
    const micHeaderBtn = document.getElementById("btn-voice-command");
    const voicePlayerBar = document.getElementById("voice-player-bar");
    const voiceWaveAnimation = document.getElementById("voice-wave-anim");
    const voiceSubtitles = document.getElementById("voice-subtitles-text");
    const voicePlayPauseBtn = document.getElementById("voice-btn-playpause");
    const voiceStopBtn = document.getElementById("voice-btn-stop");

    if (micHeaderBtn) {
      micHeaderBtn.addEventListener("click", () => {
        this.voiceAsst.toggleListen();
      });
    }

    this.voiceAsst.onStateChange(state => {
      if (micHeaderBtn) {
        if (state.isListening) {
          micHeaderBtn.classList.add("listening-pulse");
          micHeaderBtn.title = "Cami está escuchando...";
        } else {
          micHeaderBtn.classList.remove("listening-pulse");
          micHeaderBtn.title = "Hablar con Cami";
        }
      }

      if (voicePlayerBar) {
        if (state.isSpeaking || state.isPaused) {
          voicePlayerBar.classList.add("active");
        } else {
          voicePlayerBar.classList.remove("active");
        }
      }

      if (voiceWaveAnimation) {
        if (state.isSpeaking && !state.isPaused) {
          voiceWaveAnimation.classList.add("speaking-waves");
        } else {
          voiceWaveAnimation.classList.remove("speaking-waves");
        }
      }

      if (voicePlayPauseBtn) {
        voicePlayPauseBtn.innerHTML = state.isPaused
          ? '<i class="fa-solid fa-play"></i>'
          : '<i class="fa-solid fa-pause"></i>';
      }
    });

    this.voiceAsst.onSubtitle(text => {
      if (voiceSubtitles) {
        voiceSubtitles.textContent = text || "";
      }
    });

    if (voicePlayPauseBtn) {
      voicePlayPauseBtn.addEventListener("click", () => {
        if (this.voiceAsst.isPaused) {
          this.voiceAsst.resume();
        } else {
          this.voiceAsst.pause();
        }
      });
    }

    if (voiceStopBtn) {
      voiceStopBtn.addEventListener("click", () => {
        this.voiceAsst.stop();
        this.mapCtrl.stopTourSimulation();
      });
    }

    // Respuestas a comandos de voz interactivos
    this.voiceAsst.onVoiceCommand(transcript => {
      if (!transcript || !transcript.trim()) return;

      // Abrir el drawer del chatbot para mostrar la pregunta y la respuesta
      this.chatbot.toggle(true);
      this.chatbot.addMessage("user", transcript);

      const q = transcript.toLowerCase();

      // Si el usuario pide explícitamente armar o calcular ruta
      if (q.includes("arma") || q.includes("ruta") || q.includes("recorrido") || q.includes("itinerario")) {
        this.buildRoute(true);
        const confirmMsg = `¡Con gusto! He calculado tu ruta personalizada de ${this.selectedDuration} horas por Ciudad del Carmen. Puedes verla trazada en dorado sobre el mapa.`;
        this.chatbot.addMessage("bot", confirmMsg);
        this.voiceAsst.speak(confirmMsg);
        return;
      }

      // Para cualquier consulta sobre lugares, playas, historia, comida o clima
      this.gemmaSvc.chatWithCami(transcript).then(ans => {
        this.chatbot.addMessage("bot", ans);
        this.voiceAsst.speak(ans);
      });
    });
  }

  setupNavigationAndExplorer() {
    // Categorías del sidebar izquierdo (Imagen 2)
    const categoryItems = document.querySelectorAll(".nav-category-item");
    categoryItems.forEach(item => {
      item.addEventListener("click", () => {
        categoryItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const catId = item.dataset.cat;
        this.filterPoisByCategory(catId);
      });
    });

    // Selector visual de capas de mapa (Naturaleza, Satélite, Topo, Noche)
    const layerPills = document.querySelectorAll(".layer-pill-btn");
    layerPills.forEach(pill => {
      pill.addEventListener("click", () => {
        layerPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const layerMode = pill.dataset.layer;
        this.mapCtrl.setTileLayer(layerMode);

        const btnContrast = document.getElementById("btn-toggle-contrast");
        if (btnContrast) {
          if (layerMode === "voyager") btnContrast.innerHTML = '<i class="fa-solid fa-leaf"></i> Naturaleza';
          else if (layerMode === "satellite") btnContrast.innerHTML = '<i class="fa-solid fa-satellite"></i> Satélite Real';
          else if (layerMode === "topo") btnContrast.innerHTML = '<i class="fa-solid fa-mountain-sun"></i> Topográfico';
          else btnContrast.innerHTML = '<i class="fa-solid fa-moon"></i> Modo Noche';
        }
      });
    });

    // Botón GPS flotante en el mapa
    const btnGpsLocate = document.getElementById("btn-gps-locate");
    if (btnGpsLocate) {
      btnGpsLocate.addEventListener("click", () => {
        this.mapCtrl.startGpsTracking();
        this.mapCtrl.centerOnGps();
      });
    }

    // Botón Chatbot en navbar
    const btnOpenChat = document.getElementById("btn-open-chat");
    if (btnOpenChat) {
      btnOpenChat.addEventListener("click", () => {
        this.chatbot.toggle();
      });
    }

    // Integración de popups del mapa con Cami
    this.mapCtrl.onPoiSelectedCallback = (poi) => {
      // Al hacer clic en un POI
    };

    document.addEventListener("click", (e) => {
      const voiceTarget = e.target.closest(".btn-popup-voice");
      if (voiceTarget) {
        const poiId = voiceTarget.dataset.poiId;
        const poi = POI_LOCATIONS.find(p => p.id === poiId);
        if (poi) this.voiceAsst.narratePoi(poi);
      }

      const addTarget = e.target.closest(".btn-popup-add");
      if (addTarget) {
        const poiId = addTarget.dataset.poiId;
        const poi = POI_LOCATIONS.find(p => p.id === poiId);
        if (poi && this.currentRoute) {
          if (!this.currentRoute.stops.some(s => s.id === poi.id)) {
            this.currentRoute.stops.push(poi);
            this.mapCtrl.drawRoute(this.currentRoute.stops);
            this.renderRouteSummary();
            alert(`¡${poi.name} añadido a tu recorrido!`);
          }
        }
      }
    });
  }

  filterPoisByCategory(catId) {
    this.activeFilterCategory = catId;
    if (catId === "all") {
      this.mapCtrl.renderAllPois();
      this.mapCtrl.fitIslandBounds();
      return;
    }

    const filtered = POI_LOCATIONS.filter(p => {
      if (catId === "playas") return p.category === "playas" || p.tags.includes("Playa");
      if (catId === "gastronomia") return p.category === "gastronomia" || p.tags.includes("Comida");
      if (catId === "cultura") return p.category === "cultura" || p.tags.includes("Historia");
      if (catId === "naturaleza") return p.category === "naturaleza" || p.tags.includes("Naturaleza");
      if (catId === "eventos") return p.tags.includes("Familia") || p.category === "cultura";
      return true;
    });

    // Centrar mapa en los lugares filtrados
    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map(p => [p.lat, p.lng]));
      this.mapCtrl.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }

  setupGemmaModal() {
    const btnOpenSettings = document.getElementById("btn-gemma-settings");
    const modal = document.getElementById("gemma-settings-modal");
    const closeBtn = document.getElementById("btn-close-gemma-modal");
    const saveBtn = document.getElementById("btn-save-gemma-config");
    const testBtn = document.getElementById("btn-test-gemma-conn");
    const statusEl = document.getElementById("gemma-conn-status");

    const urlInput = document.getElementById("input-gemma-url");
    const modelInput = document.getElementById("input-gemma-model");
    const keyInput = document.getElementById("input-gemma-key");
    const typeSelect = document.getElementById("select-gemma-type");

    if (btnOpenSettings && modal) {
      btnOpenSettings.addEventListener("click", () => {
        if (urlInput) urlInput.value = this.gemmaSvc.apiUrl;
        if (modelInput) modelInput.value = this.gemmaSvc.modelName;
        if (keyInput) keyInput.value = this.gemmaSvc.apiKey;
        if (typeSelect) typeSelect.value = this.gemmaSvc.apiType;
        modal.classList.add("modal-open");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("modal-open"));
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.gemmaSvc.saveConfig(
          urlInput?.value || "http://localhost:11434/api/generate",
          modelInput?.value || "gemma4",
          keyInput?.value || "",
          typeSelect?.value || "ollama"
        );
        alert("Configuración de Gemma 4 guardada con éxito.");
        if (modal) modal.classList.remove("modal-open");
      });
    }

    if (testBtn && statusEl) {
      testBtn.addEventListener("click", async () => {
        statusEl.innerHTML = '<span class="status-testing"><i class="fa-solid fa-spinner fa-spin"></i> Probando conexión...</span>';
        const result = await this.gemmaSvc.testConnection();
        if (result.success) {
          statusEl.innerHTML = `<span class="status-online"><i class="fa-solid fa-circle-check"></i> ${result.message}</span>`;
        } else {
          statusEl.innerHTML = `<span class="status-offline"><i class="fa-solid fa-circle-exclamation"></i> ${result.message}</span>`;
        }
      });
    }
  }
}

// Inicializar la aplicación cuando cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  window.camiApp = new CamiApp();
  window.camiApp.init();
});
