/**
 * Cami - Controlador del Mapa Interactivo de Ciudad del Carmen, Campeche
 * Soporta mapa oscuro tipo Blueprint, pines personalizados, trazado de rutas con brillo,
 * seguimiento GPS en tiempo real y simulación de recorrido virtual.
 */

import { CARMEN_CENTER, CARMEN_DEFAULT_ZOOM, POI_LOCATIONS } from "./locations.js";

export const CARTO_API_KEY = "cb1_4lve_1_b36978b60815e99c26d10a53";

export class MapController {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.cartoApiKey = CARTO_API_KEY;
    this.map = null;
    this.markers = {};
    this.routePolylines = [];
    this.gpsMarker = null;
    this.gpsAccuracyCircle = null;
    this.currentGpsPos = null;
    this.isTrackingGps = false;
    this.gpsWatchId = null;
    this.tourSimulationInterval = null;
    this.activeTileLayer = null;
    this.contrastMode = "dark"; // "dark", "voyager", o "contrast"
    this.onPoiSelectedCallback = null;
    this.onGpsUpdatedCallback = null;
  }

  init() {
    // Inicializar mapa de Leaflet centrado en Ciudad del Carmen
    this.map = L.map(this.containerId, {
      center: CARMEN_CENTER,
      zoom: CARMEN_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    // Añadir controles de zoom en la posición superior derecha (como en la Imagen 2)
    L.control.zoom({
      position: "topright"
    }).addTo(this.map);

    // Cargar capa de Naturaleza & Turismo por defecto (CARTO Voyager con API Key)
    this.setTileLayer("voyager");

    // Renderizar todos los puntos de interés icónicos de Ciudad del Carmen
    this.renderAllPois();

    // Iniciar con la vista óptima de la isla
    this.fitIslandBounds();

    return this;
  }

  setTileLayer(mode) {
    // Remover capas activas previas
    if (this.activeLayers && this.activeLayers.length > 0) {
      this.activeLayers.forEach(layer => this.map.removeLayer(layer));
      this.activeLayers = [];
    } else if (this.activeTileLayer) {
      this.map.removeLayer(this.activeTileLayer);
    }
    this.activeLayers = [];

    const containerEl = document.getElementById(this.containerId);

    if (mode === "voyager") {
      // 🌿 Capa de Naturaleza, Playas y Turismo Oficial (CARTO Voyager con API Key)
      // Muestra aguas costeras azul claro, manglares verdes, playas y calles nítidas
      this.activeTileLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${this.cartoApiKey}`,
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
        }
      );
      this.activeLayers.push(this.activeTileLayer);
      if (containerEl) {
        containerEl.classList.remove("high-contrast-mode");
        containerEl.classList.add("voyager-mode");
      }
    } else if (mode === "satellite") {
      // 🛰️ Vista Satelital Real (Fotografía aérea de la isla, manglares y mar) + Etiquetas
      this.activeTileLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          attribution: "Esri World Imagery"
        }
      );
      const labelsLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          opacity: 0.85
        }
      );
      this.activeLayers.push(this.activeTileLayer, labelsLayer);
      if (containerEl) {
        containerEl.classList.remove("voyager-mode");
        containerEl.classList.add("high-contrast-mode");
      }
    } else if (mode === "topo") {
      // 🗺️ Relieve Topográfico y Áreas Naturales Protegidas
      this.activeTileLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri Topo"
        }
      );
      this.activeLayers.push(this.activeTileLayer);
      if (containerEl) {
        containerEl.classList.remove("high-contrast-mode");
        containerEl.classList.add("voyager-mode");
      }
    } else {
      // 🌙 Modo Noche (CARTO Dark Matter con API Key)
      this.activeTileLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${this.cartoApiKey}`,
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
        }
      );
      this.activeLayers.push(this.activeTileLayer);
      if (containerEl) {
        containerEl.classList.remove("high-contrast-mode");
        containerEl.classList.remove("voyager-mode");
      }
    }

    this.activeLayers.forEach(layer => layer.addTo(this.map));
    this.contrastMode = mode;
  }

  toggleContrast() {
    // Cicla entre: Voyager (Naturaleza) -> Satélite Real -> Topográfico -> Noche
    let newMode = "voyager";
    if (this.contrastMode === "voyager") {
      newMode = "satellite";
    } else if (this.contrastMode === "satellite") {
      newMode = "topo";
    } else if (this.contrastMode === "topo") {
      newMode = "dark";
    } else {
      newMode = "voyager";
    }
    this.setTileLayer(newMode);
    return newMode;
  }

  renderAllPois() {
    // Limpiar marcadores previos
    Object.values(this.markers).forEach(m => this.map.removeLayer(m));
    this.markers = {};

    POI_LOCATIONS.forEach(poi => {
      const marker = this.createCustomPoiMarker(poi);
      marker.addTo(this.map);
      this.markers[poi.id] = marker;
    });
  }

  createCustomPoiMarker(poi) {
    let customHtml = "";

    if (poi.id === "centro_historico") {
      // Marcador de Centro con aros concéntricos como en la Imagen 2
      customHtml = `
        <div class="custom-poi-marker marker-centro" title="${poi.name}">
          <div class="marker-pulse-ring"></div>
          <div class="marker-center-core"></div>
          <div class="marker-label-tag">Centro</div>
        </div>
      `;
    } else {
      // Marcador de píldora redondeada estilizada como en la Imagen 2
      customHtml = `
        <div class="custom-poi-marker marker-pill" style="--pin-color: ${poi.pinColor};" title="${poi.name}">
          <div class="marker-icon-box">
            <i class="fa-solid ${poi.icon}"></i>
          </div>
          <span class="marker-title-label">${poi.name}</span>
        </div>
      `;
    }

    const customIcon = L.divIcon({
      html: customHtml,
      className: "cami-poi-div-icon",
      iconSize: [160, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([poi.lat, poi.lng], { icon: customIcon });

    // Popup interactivo con datos, foto y botón para escuchar voz
    const popupContent = `
      <div class="poi-interactive-popup">
        <div class="popup-header" style="border-left: 4px solid ${poi.pinColor}">
          <span class="popup-cat-badge">${poi.category.toUpperCase()}</span>
          <h4 class="popup-title">${poi.name}</h4>
          <span class="popup-subtitle">${poi.subtitle}</span>
        </div>
        <p class="popup-desc">${poi.shortDesc}</p>
        <div class="popup-meta-row">
          <span><i class="fa-solid fa-clock"></i> ${poi.visitDurationMin} min</span>
          <span><i class="fa-solid fa-star" style="color: #fbbf24"></i> ${poi.rating}</span>
          <span><i class="fa-solid fa-ticket"></i> ${poi.cost}</span>
        </div>
        <div class="popup-health-alert">
          <i class="fa-solid fa-shield-heart"></i>
          <span>${poi.healthTip}</span>
        </div>
        <div class="popup-actions-row">
          <button class="btn-popup-voice" data-poi-id="${poi.id}">
            <i class="fa-solid fa-volume-high"></i> Escuchar Cami
          </button>
          <button class="btn-popup-add" data-poi-id="${poi.id}">
            <i class="fa-solid fa-plus"></i> Añadir a Ruta
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: "cami-custom-popup",
      maxWidth: 320,
      offset: [0, -10]
    });

    marker.on("click", () => {
      if (this.onPoiSelectedCallback) {
        this.onPoiSelectedCallback(poi);
      }
    });

    return marker;
  }

  drawRoute(poiList) {
    // Eliminar trazados anteriores
    this.clearRoute();

    if (!poiList || poiList.length < 2) return;

    // Obtener coordenadas en orden
    const latLngs = poiList.map(poi => [poi.lat, poi.lng]);

    // Crear borde de contraste oscuro que hace resaltar la ruta sobre mar, manglares y arena
    const contrastLine = L.polyline(latLngs, {
      color: "#081524",
      weight: 10,
      opacity: 0.65,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(this.map);

    // Crear línea de resplandor externa
    const glowLine = L.polyline(latLngs, {
      color: "#f59e0b",
      weight: 8,
      opacity: 0.45,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(this.map);

    // Crear línea principal dorada vibrante
    const mainLine = L.polyline(latLngs, {
      color: "#ff9800",
      weight: 5,
      opacity: 0.98,
      dashArray: "8, 6",
      lineCap: "round",
      lineJoin: "round",
      className: "cami-animated-route-line"
    }).addTo(this.map);

    this.routePolylines.push(contrastLine, glowLine, mainLine);

    // Dibujar orden numérico en las paradas
    poiList.forEach((poi, index) => {
      const stepBadge = L.divIcon({
        html: `<div class="route-step-number-badge">${index + 1}</div>`,
        className: "step-badge-icon",
        iconSize: [26, 26],
        iconAnchor: [13, 38]
      });
      const badgeMarker = L.marker([poi.lat, poi.lng], { icon: stepBadge }).addTo(this.map);
      this.routePolylines.push(badgeMarker);
    });

    // Ajustar zoom para abarcar toda la ruta trazada con margen
    const bounds = L.latLngBounds(latLngs);
    this.map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
  }

  clearRoute() {
    this.routePolylines.forEach(layer => this.map.removeLayer(layer));
    this.routePolylines = [];
  }

  fitIslandBounds() {
    // Bounding box que cubre toda la mancha urbana de Ciudad del Carmen y Bahamitas
    const southWest = L.latLng(18.6100, -91.8700);
    const northEast = L.latLng(18.7050, -91.7200);
    this.map.fitBounds(L.latLngBounds(southWest, northEast), {
      padding: [40, 40]
    });
  }

  // GEOLOCALIZACIÓN GPS EN TIEMPO REAL
  startGpsTracking() {
    if (!navigator.geolocation) {
      alert("La geolocalización GPS no está soportada en este navegador.");
      return;
    }

    this.isTrackingGps = true;

    // Obtener ubicación inmediata
    navigator.geolocation.getCurrentPosition(
      pos => this.updateGpsPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
      err => {
        console.warn("Aviso de GPS:", err.message, "- Usando coordenadas del Centro de Carmen");
        this.updateGpsPosition(CARMEN_CENTER[0], CARMEN_CENTER[1], 25);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // Seguir posición en tiempo real
    this.gpsWatchId = navigator.geolocation.watchPosition(
      pos => this.updateGpsPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
      err => console.warn("Watch GPS error:", err.message),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );

    return true;
  }

  stopGpsTracking() {
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
    this.isTrackingGps = false;
  }

  updateGpsPosition(lat, lng, accuracy = 20) {
    this.currentGpsPos = { lat, lng, accuracy };

    // Crear o mover el marcador de GPS (radar animado)
    if (!this.gpsMarker) {
      const gpsIcon = L.divIcon({
        html: `
          <div class="realtime-gps-radar-marker">
            <div class="gps-pulse-wave"></div>
            <div class="gps-inner-dot"></div>
          </div>
        `,
        className: "gps-div-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      this.gpsMarker = L.marker([lat, lng], { icon: gpsIcon, zIndexOffset: 1000 }).addTo(this.map);
      this.gpsAccuracyCircle = L.circle([lat, lng], {
        radius: Math.min(accuracy, 100),
        color: "#38bdf8",
        fillColor: "#38bdf8",
        fillOpacity: 0.12,
        weight: 1
      }).addTo(this.map);
    } else {
      this.gpsMarker.setLatLng([lat, lng]);
      this.gpsAccuracyCircle.setLatLng([lat, lng]);
      this.gpsAccuracyCircle.setRadius(Math.min(accuracy, 100));
    }

    if (this.onGpsUpdatedCallback) {
      this.onGpsUpdatedCallback(this.currentGpsPos);
    }
  }

  centerOnGps() {
    if (this.currentGpsPos) {
      this.map.flyTo([this.currentGpsPos.lat, this.currentGpsPos.lng], 16, { animate: true, duration: 1.2 });
    } else {
      this.startGpsTracking();
    }
  }

  // SIMULACIÓN DE RECORRIDO VIRTUAL PASO A PASO
  simulateVirtualTour(poiList, onStepCallback, onFinishCallback) {
    this.stopTourSimulation();

    if (!poiList || poiList.length === 0) return;

    let currentIndex = 0;
    const totalSteps = poiList.length;
    this.isTourRunning = true;

    const visitStep = (index) => {
      if (!this.isTourRunning || index >= totalSteps) {
        this.isTourRunning = false;
        if (onFinishCallback) onFinishCallback();
        return;
      }

      currentIndex = index;
      const currentPoi = poiList[index];
      this.updateGpsPosition(currentPoi.lat, currentPoi.lng, 10);
      this.map.flyTo([currentPoi.lat, currentPoi.lng], 15, { animate: true, duration: 1 });

      // Abrir popup del marcador
      const marker = this.markers[currentPoi.id];
      if (marker) {
        marker.openPopup();
      }

      const nextCallback = () => {
        if (!this.isTourRunning) return;
        this.tourSimulationTimeout = setTimeout(() => {
          visitStep(index + 1);
        }, 1400); // Pausa agradable de 1.4 segundos entre lugares
      };

      if (onStepCallback) {
        onStepCallback(currentPoi, index, totalSteps, nextCallback);
      }
    };

    visitStep(0);
  }

  stopTourSimulation() {
    this.isTourRunning = false;
    if (this.tourSimulationTimeout) {
      clearTimeout(this.tourSimulationTimeout);
      this.tourSimulationTimeout = null;
    }
  }

  exportGpx(poiList, routeName = "Recorrido-Cami-Carmen") {
    if (!poiList || poiList.length === 0) return;

    const waypoints = poiList.map(p => `
    <wpt lat="${p.lat}" lon="${p.lng}">
      <name>${this.escapeXml(p.name)}</name>
      <desc>${this.escapeXml(p.shortDesc)}</desc>
    </wpt>`).join("");

    const trackPoints = poiList.map(p => `
      <trkpt lat="${p.lat}" lon="${p.lng}"></trkpt>`).join("");

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cami - Asistente de Rutas Ciudad del Carmen" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${this.escapeXml(routeName)}</name>
    <desc>Ruta personalizada generada por Cami para Ciudad del Carmen, Campeche.</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  ${waypoints}
  <trk>
    <name>${this.escapeXml(routeName)}</name>
    <trkseg>
      ${trackPoints}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${routeName.toLowerCase().replace(/\s+/g, "-")}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }
}
