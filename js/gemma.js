/**
 * Cami - Motor de Integración de IA con Gemma 4 y Cálculo de Rutas en Tiempo Real
 * Soporta conexión con Ollama (http://localhost:11434), OpenAI-compatible API,
 * Google Gemma API y un motor heurístico local de alta fidelidad para Ciudad del Carmen.
 */

import { POI_LOCATIONS, CARMEN_CENTER } from "./locations.js";

export class GemmaService {
  constructor() {
    this.apiUrl = localStorage.getItem("cami_gemma_url") || "http://localhost:11434/api/generate";
    this.modelName = localStorage.getItem("cami_gemma_model") || "gemma4";
    this.apiKey = localStorage.getItem("cami_gemma_key") || "";
    this.apiType = localStorage.getItem("cami_gemma_type") || "ollama"; // "ollama", "openai", "gemini"
    this.isOnline = false;
  }

  saveConfig(url, model, key, type) {
    this.apiUrl = url;
    this.modelName = model;
    this.apiKey = key;
    this.apiType = type;
    localStorage.setItem("cami_gemma_url", url);
    localStorage.setItem("cami_gemma_model", model);
    localStorage.setItem("cami_gemma_key", key);
    localStorage.setItem("cami_gemma_type", type);
  }

  async testConnection() {
    try {
      if (this.apiType === "ollama") {
        const testPrompt = {
          model: this.modelName,
          prompt: "Hola Gemma, confirma si estás en línea con una sola palabra: Lista.",
          stream: false
        };
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testPrompt),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          this.isOnline = true;
          return { success: true, message: `Conexión exitosa con ${this.modelName}` };
        }
      } else if (this.apiType === "openai") {
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.modelName,
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 10
          }),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          this.isOnline = true;
          return { success: true, message: "Conectado al API OpenAI-compatible" };
        }
      }
    } catch (e) {
      this.isOnline = false;
      return { success: false, message: `No se pudo conectar a ${this.apiUrl}: ${e.message}. Se usará el motor inteligente integrado de Cami.` };
    }

    this.isOnline = false;
    return { success: false, message: "Servidor no respondió. Usando motor inteligente integrado." };
  }

  /**
   * Genera una ruta inteligente adaptada a tiempo, intereses, clima y punto de salida
   */
  async generateTourRoute(options) {
    const {
      durationHours = 3,
      categories = ["playas", "historia"],
      departurePoint = { id: "parque_zaragoza", name: "Parque Zaragoza", lat: 18.6475, lng: -91.8329 },
      weatherData = null,
      customPrompt = ""
    } = options;

    // Intentar consultar al endpoint de Gemma 4 si está configurado
    if (this.isOnline) {
      try {
        const gemmaResult = await this.queryGemmaApi(durationHours, categories, departurePoint, weatherData, customPrompt);
        if (gemmaResult && gemmaResult.stops && gemmaResult.stops.length > 0) {
          return gemmaResult;
        }
      } catch (err) {
        console.warn("Falla en consulta a Gemma 4 API, activando motor determinista:", err);
      }
    }

    // Motor Inteligente Heurístico de Cami para Ciudad del Carmen
    return this.calculateSmartLocalRoute(durationHours, categories, departurePoint, weatherData);
  }

  calculateSmartLocalRoute(durationHours, categories, departurePoint, weatherData) {
    const isRainy = weatherData?.isRainy || false;
    const isVeryHot = (weatherData?.apparentTemp || 30) >= 35;

    // 1. Filtrar y calificar POIs según afinidad
    const scoredPois = POI_LOCATIONS.map(poi => {
      let score = 0;

      // Coincidencia con categorías seleccionadas
      const matchesCategory = categories.some(cat => {
        if (cat === "historia" && (poi.category === "cultura" || poi.tags.includes("Historia"))) return true;
        if (cat === "playa" && (poi.category === "playas" || poi.tags.includes("Playa"))) return true;
        if (cat === "comida" && (poi.category === "gastronomia" || poi.tags.includes("Comida"))) return true;
        if (cat === "naturaleza" && (poi.category === "naturaleza" || poi.tags.includes("Naturaleza"))) return true;
        if (cat === "familia" && poi.tags.includes("Familia")) return true;
        if (cat === "negocios" && poi.tags.includes("Negocios locales")) return true;
        return false;
      });

      if (matchesCategory) score += 50;

      // Bonificación por valoración y popularidad
      score += (poi.rating || 4.5) * 5;

      // Adaptación al clima
      if (isRainy) {
        if (poi.recommendedScenario === "rainy" || poi.id === "museo_victoriano" || poi.id === "mercado_afa") {
          score += 40; // Priorizar bajo techo
        } else if (poi.category === "playas") {
          score -= 30; // Evitar playa con tormenta
        }
      } else if (isVeryHot) {
        if (poi.id === "playa_norte" || poi.id === "malecon_costero") {
          score += 20; // Brisa marina apetecible
        }
      }

      // Distancia desde el punto de salida
      const startLat = departurePoint.lat || CARMEN_CENTER[0];
      const startLng = departurePoint.lng || CARMEN_CENTER[1];
      const dist = this.haversineDistance(startLat, startLng, poi.lat, poi.lng);
      score -= dist * 3; // Premiar cercanía inicial

      return { poi, score, dist };
    });

    // Ordenar de mayor a menor puntuación
    scoredPois.sort((a, b) => b.score - a.score);

    // 2. Presupuesto de tiempo (en minutos)
    const budgetMinutes = durationHours * 60;
    let accumulatedTime = 0;
    const selectedPois = [];

    for (const item of scoredPois) {
      const visitTime = item.poi.visitDurationMin || 40;
      const travelTime = 15; // Estimado promedio entre paradas en Carmen
      if (accumulatedTime + visitTime + travelTime <= budgetMinutes || selectedPois.length < 2) {
        selectedPois.push(item.poi);
        accumulatedTime += (visitTime + travelTime);
      }
      if (accumulatedTime >= budgetMinutes - 10) break;
    }

    // 3. Optimización de orden de ruta (Heurística del vecino más cercano)
    const orderedStops = this.optimizeSequence(selectedPois, departurePoint);

    // 4. Calcular métricas finales
    let totalKm = 0;
    for (let i = 0; i < orderedStops.length - 1; i++) {
      totalKm += this.haversineDistance(
        orderedStops[i].lat, orderedStops[i].lng,
        orderedStops[i + 1].lat, orderedStops[i + 1].lng
      );
    }
    totalKm = Math.round(totalKm * 10) / 10;

    const totalWalkMins = Math.round(accumulatedTime);

    // Generar justificación inteligente
    const aiInsight = this.generateAiRouteInsight(orderedStops, durationHours, categories, weatherData, departurePoint);

    return {
      title: `Recorrido Personalizado Cami (${durationHours}h)`,
      stops: orderedStops,
      totalStops: orderedStops.length,
      estimatedDurationMinutes: totalWalkMins,
      estimatedDistanceKm: Math.max(1.8, totalKm),
      departureName: departurePoint.name,
      aiInsight: aiInsight,
      generatedWith: this.isOnline ? `Gemma 4 (${this.modelName})` : "Motor IA Cami (Ciudad del Carmen)",
      timestamp: new Date().toISOString()
    };
  }

  optimizeSequence(pois, startPoint) {
    if (pois.length <= 2) return pois;

    const unvisited = [...pois];
    const sequence = [];
    let currentPos = {
      lat: startPoint.lat || CARMEN_CENTER[0],
      lng: startPoint.lng || CARMEN_CENTER[1]
    };

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = this.haversineDistance(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng);
        if (d < minDistance) {
          minDistance = d;
          nearestIndex = i;
        }
      }

      const nextPoi = unvisited.splice(nearestIndex, 1)[0];
      sequence.push(nextPoi);
      currentPos = { lat: nextPoi.lat, lng: nextPoi.lng };
    }

    return sequence;
  }

  generateAiRouteInsight(stops, durationHours, categories, weatherData, departure) {
    const names = stops.map(s => s.name).join(", ");
    const temp = weatherData?.temperature || 31;
    const cond = weatherData?.condition || "cálido";
    const healthNote = weatherData?.healthRecommendation?.pillText || "usar bloqueador";

    return `He diseñado tu recorrido ideal de ${durationHours} horas partiendo de ${departure.name}. Trazamos una secuencia óptima pasando por: ${names}. Adaptado al clima actual de ${temp}°C (${cond}), con recomendación especial de: ${healthNote}. ¡Disfruta la belleza y el sabor de Ciudad del Carmen!`;
  }

  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Chat conversacional con Cami IA sobre Ciudad del Carmen
   */
  async chatWithCami(userMessage, conversationHistory = []) {
    if (this.isOnline) {
      try {
        const systemPrompt = "Eres Cami, la asistente virtual turística inteligente y cordial de Ciudad del Carmen, Campeche. Conoces a profundidad la historia de los piratas en la Isla de Tris, la expulsión de 1717, la Parroquia del Carmen, el quiosco morisco del Parque Zaragoza, la gastronomía del camarón gigante, pan de cazón, Playa Norte, Playa Bahamitas y los delfines de la Laguna de Términos. Hablas con calidez carmelita y das recomendaciones precisas sobre clima, salud y rutas.";

        if (this.apiType === "ollama") {
          const res = await fetch(this.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: this.modelName,
              prompt: `${systemPrompt}\n\nUsuario: ${userMessage}\nCami:`,
              stream: false
            })
          });
          if (res.ok) {
            const data = await res.json();
            return data.response;
          }
        }
      } catch (err) {
        console.warn("Fallo de chat con Gemma remoto:", err);
      }
    }

    // Base de conocimiento inteligente integrada de Cami
    return this.generateLocalKnowledgeResponse(userMessage);
  }

  generateLocalKnowledgeResponse(query) {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Museo Victoriano Niévares
    if (q.includes("nievares") || q.includes("victoriano") || (q.includes("museo") && !q.includes("zaragoza"))) {
      return "El Museo Victoriano Niévares, ubicado en Calle 22, es el Museo de la Ciudad de Carmen. Lleva el nombre del insigne médico y filántropo Don Victoriano Niévares. El edificio data del siglo XIX como hospital y hoy exhibe piezas arqueológicas de los mayas chontales, armas de los corsarios ingleses de la época de la Isla de Tris y la historia del auge camaronero y petrolero.";
    }

    // 2. Playa Bahamitas
    if (q.includes("bahamita") || q.includes("bahamitas") || q.includes("playa virgen")) {
      return "Playa Bahamitas es un paraíso natural ubicado a 15 kilómetros al noreste del centro, sobre la carretera Costera del Golfo. Es famosa por sus aguas de tono verde esmeralda translúcido y su arena blanca llena de conchas y caracoles marinos. Al ser un sitio natural y sereno sin grandes comercios, te aconsejo llevar tu propia agua, sombrilla y bloqueador biodegradable.";
    }

    // 3. Playa Norte
    if (q.includes("playa norte") || (q.includes("norte") && q.includes("playa")) || q.includes("palapa") || q.includes("letras de carmen")) {
      return "Playa Norte es la playa urbana más icónica de Ciudad del Carmen, ubicada a lo largo del Boulevard Costero Nelson Barrera. Cuenta con aguas apacibles del Golfo, palapas familiares, restaurantes de pescados y mariscos, canchas deportivas y la famosa escultura del Camarón Gigante junto a las letras monumentales para la foto del recuerdo.";
    }

    // 4. Playas en general
    if (q.includes("playa") || q.includes("nadar") || q.includes("mar")) {
      return "En Ciudad del Carmen tienes dos experiencias de playa fantásticas: Playa Norte, perfecta si buscas palapas, música, comida y servicios; y Playa Bahamitas hacia el este, si prefieres naturaleza virgen, aguas cristalinas color esmeralda y tranquilidad absoluta.";
    }

    // 5. Malecón y Stella Maris
    if (q.includes("malecon") || q.includes("stella maris") || q.includes("virgen del mar") || q.includes("caleta")) {
      return "El Malecón de Ciudad del Carmen bordea la confluencia entre el Golfo de México y la Laguna de Términos. Su mayor ícono es la monumental escultura de la Virgen Stella Maris, patrona de los marineros, erigida sobre el agua. Es el paseo predilecto al caer la tarde para sentir la brisa marina, comer un raspado y admirar el paso de las embarcaciones.";
    }

    // 6. Parque Ignacio Zaragoza y Quiosco Morisco
    if (q.includes("zaragoza") || q.includes("quiosco") || q.includes("kiosko") || q.includes("parque central") || q.includes("marquesita")) {
      return "El Parque Ignacio Zaragoza es el corazón tradicional de Ciudad del Carmen. Su joya es el quiosco de hierro forjado de estilo morisco, importado desde Bélgica en 1886. Por las tardes es una delicia caminar bajo sus laureles centenarios mientras disfrutas una auténtica marquesita con queso de bola y helado artesanal de coco.";
    }

    // 7. Centro Histórico y Parroquia de la Virgen del Carmen
    if (q.includes("parroquia") || q.includes("iglesia") || q.includes("catedral") || q.includes("virgen del carmen") || q.includes("patrona") || q.includes("centro historico") || q.includes("centro")) {
      return "El Centro Histórico rodea la Parroquia de Nuestra Señora del Carmen, consagrada a la patrona de la isla. Se edificó en conmemoración de la histórica victoria sobre los piratas el 16 de julio de 1717. Cada mes de julio se celebran las Fiestas del Carmen, donde la sagrada imagen sale en una emotiva procesión en lancha por toda la Laguna de Términos.";
    }

    // 8. Faro de la Puntilla / Faro de Campeche
    if (q.includes("faro") || q.includes("puntilla") || q.includes("xicalango")) {
      return "El Faro de la Puntilla se ubica en el extremo sur de la isla. Ha sido la guía de navegantes, barcos camaroneros y buques de altamar que entran a la Laguna de Términos desde hace más de un siglo. Es un rincón histórico con vistas espectaculares de las corrientes de la bocana y el atardecer.";
    }

    // 9. Puente El Zacatal
    if (q.includes("puente") || q.includes("zacatal")) {
      return "El Puente El Zacatal es una proeza de la ingeniería mexicana. Inaugurado en 1994 con 3,861 metros de longitud, conecta a la Isla del Carmen con la península de Atasta sobre la entrada de la laguna. Por las noches su iluminación ofrece una postal inolvidable reflejada en el mar.";
    }

    // 10. Delfines y Laguna de Términos
    if (q.includes("delfin") || q.includes("tonina") || q.includes("laguna") || q.includes("manglar")) {
      return "La Laguna de Términos es un Área de Protección de Flora y Fauna de renombre internacional. Es el hogar permanente de más de 300 delfines toninas (nariz de botella) que puedes ver saltar libremente. Te recomiendo tomar un tour en lancha entre las 8:00 y las 11:00 am desde el Malecón o La Puntilla para verlos de cerca entre los manglares.";
    }

    // 11. Universidad UNACAR
    if (q.includes("universidad") || q.includes("unacar") || q.includes("campus") || q.includes("liceo")) {
      return "La Universidad Autónoma del Carmen (UNACAR), heredera del histórico Liceo Carmelita, tiene su campus principal en Avenida Concordia. Es pionera en investigaciones de biología marina, monitoreo acústico de cetáceos y preservación del ecosistema lagunar del sureste.";
    }

    // 12. Mercado Alonso Felipe de Andrade
    if (q.includes("mercado") || q.includes("alonso felipe") || q.includes("afa")) {
      return "El Mercado Alonso Felipe de Andrade, sobre Calle 20, es el templo gastronómico popular de la isla. Aquí puedes degustar cócteles de camarón gigante con aguacate fresco, pan de cazón recién horneado, empanadas y pescados fritos directamente de las cooperativas pesqueras locales.";
    }

    // 13. Pan de Cazón
    if (q.includes("pan de cazon") || q.includes("cazon")) {
      return "El pan de cazón es el platillo cumbre de Campeche. Consiste en tortillas de maíz recién hechas intercaladas con carne deshebrada de cazón y frijoles negros refritos, todo bañado en una deliciosa salsa chiltomate de jitomate criollo con epazote y decorado con chile habanero asado. ¡Es obligado probarlo!";
    }

    // 14. Camarones y Especialidades de Mar
    if (q.includes("camaron") || q.includes("marisco") || q.includes("comer") || q.includes("comida") || q.includes("restaurante")) {
      return "Ciudad del Carmen es la Capital Camaronera de México. No te vayas sin probar los camarones gigantes empanizados al coco con salsa agridulce, los camarones al ajillo, las manos de cangrejo moro y un coctel campechano con ostión y pulpo. Los mejores sitios son el Mercado AFA y los restaurantes del Malecón y Playa Norte.";
    }

    // 15. Bebidas Tradicionales
    if (q.includes("chaya") || q.includes("beber") || q.includes("bebida") || q.includes("tomar")) {
      return "Para refrescarte del calor carmelita, la bebida estrella es el agua fresca de chaya con piña o limón, rica en antioxidantes. También es tradicional el agua de coco fresca recién bajada de la palmera y la horchata artesanal campechana.";
    }

    // 16. Piratas e Historia de la Isla de Tris
    if (q.includes("pirata") || q.includes("wallace") || q.includes("lorencillo") || q.includes("1717") || q.includes("historia") || q.includes("origen") || q.includes("palo de tinte")) {
      return "En los siglos XVII y XVIII, Ciudad del Carmen era llamada Isla de Tris y fue base de temidos piratas ingleses liderados por corsarios como Peter Wallace, quienes saqueaban el preciado palo de tinte. El 16 de julio de 1717, Don Alonso Felipe de Andrade comandó una expedición que expulsó definitivamente a los corsarios, fundando la ciudad bajo la advocación de la Virgen del Carmen.";
    }

    // 17. Clima, Ropa y Salud
    if (q.includes("clima") || q.includes("calor") || q.includes("lluvia") || q.includes("temperatura") || q.includes("ropa") || q.includes("bloqueador") || q.includes("sol")) {
      return "En Carmen el clima es tropical cálido y húmedo con abundante sol y brisa del Golfo. Te sugiero vestir ropa de lino o algodón fresco, sombrero, calzado cómodo para caminar y bloqueador solar FPS 50+. Si se prevén chubascos vespertinos, un paraguas ligero te mantendrá protegido.";
    }

    // 18. Actividades para niños y familias
    if (q.includes("nino") || q.includes("familia") || q.includes("hijos")) {
      return "Para familias con niños, las actividades ideales son: 1) Pasear en lancha por la Laguna de Términos para ver delfines salvajes, 2) Bañarse en las aguas tranquilas de Playa Norte con palapas y juegos, y 3) Comer marquesitas y alimentar palomas en el quiosco del Parque Zaragoza al atardecer.";
    }

    // 19. Atardecer y paseos románticos
    if (q.includes("atardecer") || q.includes("ocaso") || q.includes("pareja") || q.includes("noche") || q.includes("romantico")) {
      return "El mejor punto para contemplar el atardecer sobre el Golfo es el Malecón Costero en Playa Norte o junto a la escultura de la Stella Maris. El cielo se tiñe de tonos naranjas y violetas espectaculares. De noche, cenar camarones al coco en una palapa iluminada con vista al mar es un plan insuperable.";
    }

    // 20. Cómo llegar o transporte
    if (q.includes("llegar") || q.includes("transporte") || q.includes("aeropuerto") || q.includes("taxi")) {
      return "A Ciudad del Carmen puedes llegar por vía aérea al Aeropuerto Internacional de Ciudad del Carmen (CME) o por carretera cruzando el imponente Puente El Zacatal desde el oeste o el Puente de la Unidad desde el norte. Dentro de la ciudad los taxis locales son económicos y la zona centro y malecón se caminan cómodamente a pie.";
    }

    // Respuesta conversacional inteligente predeterminada
    return `¡Con mucho gusto! Como tu asistente Cami, conozco cada rincón de Ciudad del Carmen: desde el Museo Victoriano Niévares y el quiosco morisco, hasta Playa Norte, Bahamitas, los delfines de la laguna y los mejores restaurantes de camarón. Pregúntame sobre cualquier lugar o dime qué te interesa conocer hoy.`;
  }
}
