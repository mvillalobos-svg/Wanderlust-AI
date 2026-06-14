import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();

app.use(express.json({ limit: "15mb" }));

app.use("/api/*", (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Falta la variable de entorno GEMINI_API_KEY."
    });
  }
  next();
});

const systemInstruction = `Rol y Objetivo
Eres Michelle, una asesora de viajes apasionada, experta y altamente adaptable. Tu objetivo es diseñar itinerarios personalizados y colaborar con el usuario para refinar el plan mediante iteraciones y feedback continuo. Transmites una profunda pasión por explorar el mundo.

Modo de Operación
Puedes recibir dos tipos de entrada:
1. Nueva Solicitud: Un conjunto de preferencias iniciales (Destino, Duración, Presupuesto, Intereses, Restricciones). Nota: La duración no tiene límite, adapta el itinerario a la cantidad de días que el usuario solicite.
2. Feedback/Modificación: Un comentario del usuario sobre un itinerario generado previamente.

Información de Intereses
El usuario puede seleccionar intereses diversos, incluyendo opciones especializadas como: Ciencia y Tecnología (museos interactivos, observatorios, polos tecnológicos), Deporte (eventos deportivos, estadios, turismo activo), Voluntariado (proyectos sociales, conservación ecológica), Cine (locaciones de películas, festivales, estudios), además de cultura, gastronomía, naturaleza, etc.

Instrucciones de Generación
- Identidad: Preséntate sutilmente como Michelle en el primer mensaje, mostrando entusiasmo por el destino elegido.
- Análisis Inicial: Evalúa las entradas o el feedback. Prioriza siempre la seguridad y las restricciones de salud/movilidad/alérgenos.
- Adaptabilidad: Si el usuario pide un cambio, modifica solo la parte solicitada del itinerario manteniendo la coherencia del resto del viaje.
- Tono: Mantén un tono entusiasta, colaborativo, respetuoso y organizado.

Estructura Requerida para el Itinerario
Debes responder obligatoriamente con un objeto JSON válido que siga el esquema definido. Dentro del JSON se debe incluir un string llamado 'markdownItinerary' que contiene el itinerario redactado siguiendo ESTRICTAMENTE esta estructura en formato Markdown:

## Resumen del Viaje
[Párrafo breve y emocionante sobre lo que se experimentará. Si es una modificación, explica brevemente el cambio realizado.]

## Desglose Diario

Día [Número]: [Título temático del día]

Mañana: [Actividad y opción de desayuno]

Tarde: [Actividades y opción de almuerzo]

Noche: [Actividades y opción de cena]

... [repite para cada día solicitado] ...

## Estimación de Presupuesto
[Explicación breve de la distribución del presupuesto seleccionado]

## Espacio para Comentarios
[Cierra tu respuesta siempre con una pregunta amigable invitando al usuario a interactuar contigo. Por ejemplo: "Soy Michelle y estoy aquí para perfeccionar este viaje. ¿Qué te parece esta propuesta? Si deseas cambiar el enfoque de algún día, ajustar el ritmo o buscar algo diferente, dímelo y lo ajustaré con gusto."]`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    markdownItinerary: {
      type: Type.STRING,
      description: "El itinerario estructurado completo en formato Markdown siguiendo estrictamente la estructura solicitada."
    },
    budgetDistribution: {
      type: Type.ARRAY,
      description: "Lista de categorías e importes en porcentaje aproximado para el gráfico de torta o barra en el cliente",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Ej: Alojamiento, Transporte, Gastronomía, Actividades, Emergencias" },
          percentage: { type: Type.INTEGER, description: "Porcentaje del total (0 a 100)" },
          amountEst: { type: Type.STRING, description: "Gasto monetario estimado orientativo (ej: '$$' o '$150 USD')" },
          description: { type: Type.STRING, description: "Breve nota sobre qué cubre este presupuesto, adaptado al nivel elegido" }
        },
        required: ["category", "percentage", "amountEst", "description"]
      }
    },
    daysTimeline: {
      type: Type.ARRAY,
      description: "Desglose simplificado para renderizar una línea de tiempo rápida e interactiva en la UI del cliente",
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          title: { type: Type.STRING, description: "Título corto del día" },
          morning: { type: Type.STRING, description: "Actividad principal resumida de la mañana" },
          afternoon: { type: Type.STRING, description: "Actividad principal resumida de la tarde" },
          evening: { type: Type.STRING, description: "Actividad principal resumida de la noche" }
        },
        required: ["dayNumber", "title", "morning", "afternoon", "evening"]
      }
    }
  },
  required: ["markdownItinerary", "budgetDistribution", "daysTimeline"]
};

app.post("/api/itinerary/generate", async (req, res) => {
  try {
    const { destination, duration, budget, interests, restrictions, verifiedPlaces, verifiedRules } = req.body;

    if (!destination || !duration) {
      return res.status(400).json({ error: "Faltan datos requeridos (destino, duración)." });
    }

    const contextText = (verifiedPlaces || verifiedRules) ? `\n\nContexto Adicional (Datos de la Base de Conocimiento):\nUtiliza la siguiente información verificada para enriquecer tu respuesta y asegurar la precisión de los lugares:\n\nLugares recomendados: ${verifiedPlaces || "No se especificaron lugares preestablecidos."}\n\nReglas locales actuales: ${verifiedRules || "No se especificaron reglas de clima o temporadas."}` : "";

    const prompt = `Por favor genera un itinerario completo personalizado con los siguientes parámetros de viaje:\n- Destino comercial: ${destination}\n- Duración del viaje: ${duration} días\n- Nivel de Presupuesto: ${budget || "Moderado"}\n- Intereses preferidos: ${Array.isArray(interests) ? interests.join(", ") : "Cualquiera"}\n- Restricciones declaradas (dietarias, movilidad, etc.): ${restrictions || "Ninguna"}${contextText}\n\nRecuerda estructurar el markdownItinerary con precisión quirúrgica, y rellenar correctamente la distribución de presupuesto y la línea de tiempo interactiva en los campos correspondientes del JSON de respuesta.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("El modelo Gemini no devolvió ningún contenido útil.");
    }

    const result = JSON.parse(text);
    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    res.status(500).json({ error: error?.message || "Ocurrió un error inesperado al generar el itinerario." });
  }
});

app.post("/api/itinerary/refine", async (req, res) => {
  try {
    const { originalItinerary, feedback, preferences, history } = req.body;

    if (!feedback) {
      return res.status(400).json({ error: "Falta el comentario o instrucción de modificación." });
    }

    const contextText = (preferences?.verifiedPlaces || preferences?.verifiedRules) ? `\n\nContexto Adicional (Datos de la Base de Conocimiento):\nUtiliza la siguiente información verificada para enriquecer tu respuesta y asegurar la precisión de los lugares:\n\nLugares recomendados: ${preferences.verifiedPlaces || "No se especificaron lugares preestablecidos."}\n\nReglas locales actuales: ${preferences.verifiedRules || "No se especificaron reglas de clima o temporadas."}` : "";

    const prefContext = preferences ? `\n--- Preferencias del Viaje Original ---\n- Destino: ${preferences.destination}\n- Duración original: ${preferences.duration} días\n- Presupuesto original: ${preferences.budget}\n- Intereses originales: ${Array.isArray(preferences.interests) ? preferences.interests.join(", ") : "Cualquiera"}\n- Restricciones originales: ${preferences.restrictions || "Ninguna"}${contextText}\n` : "";

    const promptContext = `\n${prefContext}\n--- Itinerario Inicial Generado Anteriormente ---\n${originalItinerary}\n\n--- Solicitud de Feedback/Cambio del Usuario ---\n"${feedback}"\n\nPor favor, como asesor experto de viajes, analiza de forma positiva la solicitud del usuario ("${feedback}").\nReconoce de manera alegre y atenta su sugerencia en la primera sección del markdownItinerary (Resumen del Viaje), aplica el refinamiento con gran precisión de detalles preservando el resto del viaje intacto y completamente coherente, y devuelve las matrices JSON actualizadas (budgetDistribution y daysTimeline) para coincidir estrictamente con el nuevo plan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptContext,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("El modelo Gemini no devolvió ningún contenido útil tras el refinamiento.");
    }

    const result = JSON.parse(text);
    res.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Error refining itinerary:", error);
    res.status(500).json({ error: error?.message || "Ocurrió un error inesperado al modificar el itinerario." });
  }
});

export default app;
