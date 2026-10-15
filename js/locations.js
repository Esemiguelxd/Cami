/**
 * Cami - Base de datos de Lugares y Rutas de Ciudad del Carmen, Campeche
 */

export const CARMEN_CENTER = [18.6385, -91.8350]; // Lat, Lng del Centro Histórico real de Ciudad del Carmen
export const CARMEN_DEFAULT_ZOOM = 14;

export const CATEGORIES = {
  playas: {
    id: "playas",
    name: "Playas",
    icon: "fa-umbrella-beach",
    color: "#ffb703",
    badgeBg: "rgba(255, 183, 3, 0.15)"
  },
  gastronomia: {
    id: "gastronomia",
    name: "Gastronomía",
    icon: "fa-utensils",
    color: "#fb8500",
    badgeBg: "rgba(251, 133, 0, 0.15)"
  },
  cultura: {
    id: "cultura",
    name: "Cultura e historia",
    icon: "fa-landmark",
    color: "#a855f7",
    badgeBg: "rgba(168, 85, 247, 0.15)"
  },
  naturaleza: {
    id: "naturaleza",
    name: "Naturaleza",
    icon: "fa-leaf",
    color: "#22c55e",
    badgeBg: "rgba(34, 197, 94, 0.15)"
  },
  eventos: {
    id: "eventos",
    name: "Eventos",
    icon: "fa-calendar-days",
    color: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.15)"
  }
};

export const POI_LOCATIONS = [
  {
    id: "playa_norte",
    name: "Playa Norte",
    subtitle: "Boulevard Costero Nelson Barrera y Paseo del Mar",
    category: "playas",
    tags: ["Playa", "Familia", "Comida", "Atardecer"],
    lat: 18.6625,
    lng: -91.8260,
    pinColor: "#ffb703",
    icon: "fa-umbrella-beach",
    rating: 4.8,
    visitDurationMin: 60,
    cost: "Acceso libre",
    schedule: "Abierto 24 horas (recomendado 08:00 - 19:30)",
    shortDesc: "La playa urbana más famosa de Ciudad del Carmen sobre Paseo del Mar, con malecón costero, palapas familiares y monumentales atardeceres sobre el Golfo.",
    narrativeVoice: "¡Te damos la bienvenida a Playa Norte! Esta es la franja playera favorita de locales y visitantes en Ciudad del Carmen. Con aguas apacibles del Golfo de México y suave arena conchífera, es perfecta para refrescarse, caminar por el malecón costero y fotografiarte en el monumento del Camarón y las letras monumentales de Carmen. Los fines de semana huele a marquesitas recién hechas y pescado frito en las palapas tradicionales.",
    healthTip: "Radiación solar directa. Es fundamental aplicar protector solar FPS 50+ cada 2 horas, usar lentes oscuros con filtro UV y sombrero de ala ancha.",
    recommendedScenario: "sunny"
  },
  {
    id: "parque_zaragoza",
    name: "Parque Ignacio Zaragoza",
    subtitle: "Plaza Central con quiosco morisco traído de Bélgica en 1886",
    category: "cultura",
    tags: ["Historia", "Familia", "Comida", "Negocios locales"],
    lat: 18.63823,
    lng: -91.83575,
    pinColor: "#22c55e",
    icon: "fa-tree",
    rating: 4.8,
    visitDurationMin: 30,
    cost: "Acceso libre",
    schedule: "Abierto 24 horas",
    shortDesc: "La plaza central más querida de la isla en Calle 22 x 31, con su famoso quiosco morisco de hierro forjado, palomas y puestos de marquesitas tradicionales.",
    narrativeVoice: "Te encuentras en el Parque Ignacio Zaragoza, el corazón social de la isla. Lo más representativo es su bellísimo quiosco de herrería de estilo morisco, adquirido en Bélgica por empresarios locales en el año 1886. Por las tardes, el parque se llena de música, familias disfrutando de un helado de coco o una marquesita yucateca con queso de bola.",
    healthTip: "Árboles frondosos que proporcionan sombra fresca y resguardo térmico en días soleados.",
    recommendedScenario: "any"
  },
  {
    id: "centro_historico",
    name: "Centro Histórico y Parroquia del Carmen",
    subtitle: "Santuario Diocesano de Nuestra Señora del Carmen",
    category: "cultura",
    tags: ["Historia", "Cultura", "Negocios locales"],
    lat: 18.63885,
    lng: -91.83650,
    pinColor: "#f43f5e",
    icon: "fa-bullseye",
    rating: 4.8,
    visitDurationMin: 35,
    cost: "Acceso libre",
    schedule: "Abierto todos los días de 07:00 a 20:00",
    shortDesc: "Santuario de Nuestra Señora del Carmen sobre Calle 31, arquitectura portuaria de teja francesa y callejones coloniales llenos de vida.",
    narrativeVoice: "Este es el Centro Histórico de Ciudad del Carmen. La Parroquia de Nuestra Señora del Carmen fue erigida como gratitud por la victoria de los navíos españoles y criollos sobre los bucaneros ingleses en 1717. En su interior se venera la imagen de la Virgen que cada mes de julio sale en solemne procesión a bordo de embarcaciones por toda la bahía.",
    healthTip: "Área peatonal con sombra intermitente. Lleva calzado cómodo para caminar sobre aceras adoquinadas.",
    recommendedScenario: "any"
  },
  {
    id: "museo_victoriano",
    name: "Museo Victoriano Niévares",
    subtitle: "Museo de la Ciudad en el Antiguo Hospital (Calle 22 x 31)",
    category: "cultura",
    tags: ["Historia", "Cultura", "Familia"],
    lat: 18.64150,
    lng: -91.83610,
    pinColor: "#a855f7",
    icon: "fa-landmark",
    rating: 4.7,
    visitDurationMin: 45,
    cost: "Gratuito / Cuota voluntaria",
    schedule: "Martes a Domingo: 09:00 - 17:00",
    shortDesc: "Edificio virreinal y antiguo hospital que alberga salas prehispánicas mayas chontales, la historia de los piratas del Golfo y el auge petrolero.",
    narrativeVoice: "Nos encontramos en el Museo Victoriano Niévares, nombrado en honor al insigne médico y benefactor carmelita Don Victoriano Niévares. Este histórico edificio del siglo diecinueve resguarda piezas arqueológicas de los mayas chontales y narra la época en que la Isla de Tris fue refugio de piratas ingleses como Peter Wallace, hasta su definitiva expulsión naval el 16 de julio de 1717 día de la Virgen del Carmen.",
    healthTip: "Ambiente climatizado. Excelente opción para refugiarse si llueve o durante las horas de radiación solar más intensa.",
    recommendedScenario: "rainy"
  },
  {
    id: "malecon_costero",
    name: "Malecón de la Ciudad",
    subtitle: "Paseo del Malecón del Centro y escultura Stella Maris",
    category: "naturaleza",
    tags: ["Naturaleza", "Historia", "Playa"],
    lat: 18.63550,
    lng: -91.83564,
    pinColor: "#38bdf8",
    icon: "fa-water",
    rating: 4.9,
    visitDurationMin: 40,
    cost: "Acceso libre",
    schedule: "Abierto 24 horas",
    shortDesc: "Paseo costero con vistas a la entrada de la Laguna de Términos, pescadores artesanales y la monumental estatua de la Virgen Stella Maris sobre las olas.",
    narrativeVoice: "Estás frente al Malecón de Ciudad del Carmen. Desde aquí se contempla el encuentro entre la Laguna de Términos y el mar abierto del Golfo. Sobre las olas se erige la imponente escultura de la Virgen de la Stella Maris, que vela por los marineros y barcos camaroneros. Al atardecer, la brisa es inigualable y con suerte podrás divisar pelícanos y delfines en la entrada de la laguna.",
    healthTip: "Brisa marina constante. Mantén tu teléfono seguro si caminas cerca de las barandas y mantente hidratado.",
    recommendedScenario: "any"
  },
  {
    id: "mercado_afa",
    name: "Mercado Alonso Felipe de Andrade",
    subtitle: "La meca gastronómica del camarón y mariscos en Calle 20",
    category: "gastronomia",
    tags: ["Comida", "Negocios locales", "Familia"],
    lat: 18.64007,
    lng: -91.83857,
    pinColor: "#fb8500",
    icon: "fa-shrimp",
    rating: 4.8,
    visitDurationMin: 50,
    cost: "Consumo según platillo",
    schedule: "Diario: 06:00 - 16:00",
    shortDesc: "El centro gastronómico popular por excelencia: camarones jumbo de la laguna, cocteles de pulpo, pan de cazón y aguas de chaya con piña.",
    narrativeVoice: "¡Prepárense para deleitar el paladar en el Mercado Alonso Felipe de Andrade! Ciudad del Carmen es legendaria por su camarón rosado y café. Aquí las cocineras tradicionales preparan cócteles rebosantes con aguacate fresco, empanadas de cazón con cebolla morada y los famosos camarones al coco con salsa tártara.",
    healthTip: "Mercado techado y fresco. Alimentos recién preparados del mar a tu mesa.",
    recommendedScenario: "any"
  },
  {
    id: "universidad_unacar",
    name: "Universidad Autónoma del Carmen (UNACAR)",
    subtitle: "Campus Principal sobre Prolongación Av. Benito Juárez",
    category: "cultura",
    tags: ["Cultura", "Historia"],
    lat: 18.64702,
    lng: -91.81864,
    pinColor: "#6366f1",
    icon: "fa-graduation-cap",
    rating: 4.6,
    visitDurationMin: 40,
    cost: "Acceso libre",
    schedule: "Lunes a Viernes: 07:00 - 20:00",
    shortDesc: "Campus universitario principal, pionero en investigaciones marinas sobre la Laguna de Términos, bioacústica de cetáceos y manglares.",
    narrativeVoice: "Aquí se encuentra el Campus Principal universitario, heredero de la tradición del histórico Liceo Carmelita. La UNACAR ha sido vital para el estudio y preservación de la riqueza biológica de la Laguna de Términos, capacitando a biólogos marinos e ingenieros navales que cuidan nuestro patrimonio ambiental.",
    healthTip: "Recorrido por andadores peatonales arbolados. Hidratación recomendada durante el trayecto.",
    recommendedScenario: "any"
  },
  {
    id: "faro_campeche",
    name: "Faro de Campeche (La Puntilla)",
    subtitle: "Antigua vigía marítima en la boca de la laguna",
    category: "cultura",
    tags: ["Historia", "Naturaleza", "Playa"],
    lat: 18.62920,
    lng: -91.84050,
    pinColor: "#0ea5e9",
    icon: "fa-lighthouse",
    rating: 4.7,
    visitDurationMin: 35,
    cost: "Acceso libre al mirador exterior",
    schedule: "Diario: 08:00 - 19:00",
    shortDesc: "Faro histórico en la punta sur de la isla que durante más de un siglo ha guiado las barcas camaroneras y barcos petroleros en la entrada de la Laguna.",
    narrativeVoice: "Nos encontramos en el histórico Faro de la Puntilla, en el extremo sur de la isla. Desde aquí se vigila la bocana por donde cruzaban antiguas naves coloniales y hoy transitan barcos camaroneros de altamar. Es un sitio fascinante para contemplar la fuerza de las corrientes marinas y la puesta de sol en silencio.",
    healthTip: "Zona con viento oceánico intenso. Sujeta bien sombreros y accesorios livianos.",
    recommendedScenario: "windy"
  },
  {
    id: "puente_zacatal",
    name: "Mirador Puente El Zacatal",
    subtitle: "Carretera Federal 180 sobre la entrada de la bahía (3.86 km)",
    category: "cultura",
    tags: ["Historia", "Cultura", "Naturaleza"],
    lat: 18.62114,
    lng: -91.84164,
    pinColor: "#8b5cf6",
    icon: "fa-bridge",
    rating: 4.8,
    visitDurationMin: 30,
    cost: "Mirador libre",
    schedule: "Abierto 24 horas (recomendado al atardecer y noche)",
    shortDesc: "Uno de los puentes más largos de México (3,861 metros) que une a la Isla del Carmen con tierra firme sobre la boca de la laguna.",
    narrativeVoice: "Frente a ti se alza el monumental Puente El Zacatal. Inaugurado en noviembre de 1994, tiene casi cuatro kilómetros de longitud y cambió para siempre la conectividad del sureste mexicano al sustituir los antiguos chalanes o transbordadores marítimos. De noche se ilumina hermosamente reflejándose en las olas.",
    healthTip: "Mirador con viento fresco en el ocaso. Excelente punto para fotografía panorámica.",
    recommendedScenario: "any"
  },
  {
    id: "playa_bahamitas",
    name: "Playa Bahamitas",
    subtitle: "Aguas esmeraldas y conchas en Carretera Federal 180 km 15",
    category: "playas",
    tags: ["Playa", "Naturaleza", "Familia"],
    lat: 18.67800,
    lng: -91.73500,
    pinColor: "#ffb703",
    icon: "fa-umbrella-beach",
    rating: 4.9,
    visitDurationMin: 90,
    cost: "Acceso libre",
    schedule: "Diario de 08:00 a 18:30",
    shortDesc: "Paraíso costero virgen a unos kilómetros del centro urbano, con aguas cristalinas de tono verde esmeralda y arenas llenas de conchas marinas.",
    narrativeVoice: "¡Has llegado a la idílica Playa Bahamitas! Situada en la franja costera este de la isla, esta playa se distingue por su tono verde esmeralda translúcido y su arena blanca alfombrada de conchuelas y estrellas de mar. Es el sitio predilecto para desconectar, caminar descalzo y nadar en aguas tranquilas.",
    healthTip: "Zona semi-virgen sin tiendas cercanas. Es vital llevar agua potable suficiente, sombrilla y bloqueador solar biodegradable para proteger la vida marina.",
    recommendedScenario: "sunny"
  },
  {
    id: "laguna_terminos",
    name: "Santuario de Delfines - Laguna de Términos",
    subtitle: "Muelle de embarcaciones y Área de Protección de Flora y Fauna",
    category: "naturaleza",
    tags: ["Naturaleza", "Familia", "Playa"],
    lat: 18.63350,
    lng: -91.83150,
    pinColor: "#10b981",
    icon: "fa-fish",
    rating: 5.0,
    visitDurationMin: 120,
    cost: "Recorrido en lancha según cooperativa",
    schedule: "Tours matutinos de 07:30 a 13:00",
    shortDesc: "El humedal costero más importante del Golfo de México, hogar permanente de más de 300 delfines toninas nariz de botella y manatíes.",
    narrativeVoice: "Te encuentras ante la majestuosa Laguna de Términos, decretada Área de Protección de Flora y Fauna. Es el mayor sistema lagunar estuarino del país. En sus aguas conviven más de trescientas toninas o delfines nariz de botella residentes, aves migratorias y extensos bosques de manglar rojo que purifican nuestro entorno.",
    healthTip: "En recorridos en embarcación es obligatorio el uso de chaleco salvavidas. Usar bloqueador mineral ecológico.",
    recommendedScenario: "sunny"
  }
];

// Rutas predefinidas inteligentes para Ciudad del Carmen
export const PREDEFINED_ROUTES = [
  {
    id: "ruta_clasica_carmen",
    name: "Lo Esencial de Ciudad del Carmen",
    durationHours: 3,
    stops: ["playa_norte", "universidad_unacar", "museo_victoriano", "parque_zaragoza", "centro_historico", "malecon_costero", "playa_bahamitas"],
    description: "La ruta icónica que recorre desde Playa Norte hasta el Centro Histórico, Faro y las arenas de Bahamitas."
  },
  {
    id: "ruta_express_1_5h",
    name: "Paseo Histórico y Malecón",
    durationHours: 1.5,
    stops: ["parque_zaragoza", "centro_historico", "museo_victoriano", "malecon_costero"],
    description: "Recorrido peatonal ágil para conocer el corazón de la isla en 90 minutos."
  },
  {
    id: "ruta_playa_sol_3h",
    name: "Playas, Brisa y Camarones",
    durationHours: 3,
    stops: ["playa_norte", "mercado_afa", "malecon_costero", "playa_bahamitas"],
    description: "Sol caribeño, gastronomía camaronera tradicional y atardecer en las playas más hermosas."
  },
  {
    id: "ruta_gran_carmen_6h",
    name: "Vuelta Completa a la Isla y Laguna",
    durationHours: 6,
    stops: ["laguna_terminos", "parque_zaragoza", "mercado_afa", "museo_victoriano", "faro_campeche", "playa_norte", "puente_zacatal", "playa_bahamitas"],
    description: "Experiencia inmersiva completa con avistamiento de delfines, museos, historia de piratas y los 2 puentes."
  }
];

// Opciones de salida disponibles con coordenadas exactas
export const DEPARTURE_POINTS = [
  { id: "gps", name: "📍 Mi ubicación GPS actual en tiempo real", lat: null, lng: null },
  { id: "parque_zaragoza", name: "Parque Ignacio Zaragoza (Centro)", lat: 18.63823, lng: -91.83575 },
  { id: "playa_norte", name: "Playa Norte (Monumento al Camarón)", lat: 18.6625, lng: -91.8260 },
  { id: "malecon_costero", name: "Malecón del Centro (Stella Maris)", lat: 18.63550, lng: -91.83564 },
  { id: "mercado_afa", name: "Mercado Alonso Felipe de Andrade", lat: 18.64007, lng: -91.83857 },
  { id: "puente_zacatal", name: "Entrada Puente El Zacatal", lat: 18.62114, lng: -91.84164 }
];
