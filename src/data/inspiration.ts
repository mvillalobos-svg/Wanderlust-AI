import { TravelPreferences } from "../types";

export interface InspirationTrip {
  id: string;
  title: string;
  tagline: string;
  image: string;
  preferences: TravelPreferences;
}

export const INSPIRATION_TRIPS: InspirationTrip[] = [
  {
    id: "kyoto",
    title: "Kioto, Japón",
    tagline: "Templos antiguos, jardines zen y la auténtica cocina kaiseki",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
    preferences: {
      destination: "Kioto, Japón",
      duration: 5,
      budget: "Moderado",
      interests: ["Cultura", "Gastronomía", "Relax"],
      restrictions: "Ninguna",
      verifiedPlaces: "Templo Kinkaku-ji (Pabellón de Oro), Calle Histórica de Sannenzaka, Santuario Fushimi Inari-taisha, Bosque de Bambú de Arashiyama y Templo Kiyomizu-dera.",
      verifiedRules: "Clima templado primaveral ideal para caminatas. Mantener el volumen bajo en templos y deambular sin comer por la vía pública en Gion."
    }
  },
  {
    id: "machu",
    title: "Machu Picchu, Perú",
    tagline: "Aventura andina, historia inca y vistas panorámicas mágicas",
    image: "https://images.unsplash.com/photo-1587590227264-0ac64bc63c32?auto=format&fit=crop&w=600&q=80",
    preferences: {
      destination: "Machu Picchu y Cusco, Perú",
      duration: 4,
      budget: "Moderado",
      interests: ["Aventura", "Cultura", "Naturaleza"],
      restrictions: "Evitar esfuerzo cardiovascular extremo continuo por altura",
      verifiedPlaces: "Plaza de Armas de Cusco, Fortaleza Sacsayhuamán, Mercado de San Pedro, Santuario de Machu Picchu (circuito superior 1 o 2), Ollantaytambo.",
      verifiedRules: "Clima andino con sol radiante por el día y frío fuerte por las noches. Tomar té de coca el primer día para acondicionamiento y aclimatación."
    }
  },
  {
    id: "paris",
    title: "París, Francia",
    tagline: "El corazón del romanticismo, bistrós, arte y museos de clase mundial",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    preferences: {
      destination: "París, Francia",
      duration: 3,
      budget: "Lujoso",
      interests: ["Gastronomía", "Cultura", "Compras"],
      restrictions: "Movilidad reducida leve (evitar escaleras empinadas en estaciones antiguas de metro)",
      verifiedPlaces: "Museo del Louvre (reservado con antelación), Torre Eiffel con acceso a la cima, Crucero por el Río Sena al atardecer, Barrio de Montmartre, Plaza de los Vosgos.",
      verifiedRules: "Monumento nacional cerrado los lunes o martes según el caso. Clima nublado ligero, se requiere calzado cómodo y chaqueta impermeable."
    }
  },
  {
    id: "costarica",
    title: "Costa Rica",
    tagline: "Pura Vida entre bosques nubosos, volcanes activos y playas tropicales",
    image: "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?auto=format&fit=crop&w=600&q=80",
    preferences: {
      destination: "Manuel Antonio y Volcán Arenal, Costa Rica",
      duration: 6,
      budget: "Económico",
      interests: ["Naturaleza", "Aventura", "Relax"],
      restrictions: "Dieta vegetariana estricta",
      verifiedPlaces: "Parque Nacional Manuel Antonio (cerrado los martes), Aguas Termales de Tabacón, Parque Nacional Volcán Arenal (Senderos de Lava 1968), Catarata La Fortuna.",
      verifiedRules: "Humedad alta con chubascos rápidos por la tarde. Llevar repelente biodegradable y bloqueador solar amigable con el arrecife ecológico."
    }
  }
];
