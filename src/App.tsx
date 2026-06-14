import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  Send,
  Sliders,
  CheckCircle,
  Clock,
  Heart,
  Smile,
  Info,
  Loader2,
  Lock,
  ChevronRight,
  Shield,
  MessageSquare,
  Flame,
  ArrowRight
} from "lucide-react";
import { TravelPreferences, ItineraryResult, ChatMessage } from "./types";
import { INSPIRATION_TRIPS } from "./data/inspiration";
import BudgetChart from "./components/BudgetChart";
import TimelineView from "./components/TimelineView";

const INTEREST_OPTIONS = [
  { id: "Cultura", label: "Cultura y Arte", icon: "🏛️" },
  { id: "Gastronomía", label: "Gastronomía local", icon: "🍽️" },
  { id: "Aventura", label: "Aventura", icon: "🌋" },
  { id: "Relax", label: "Relax y bienestar", icon: "🧘" },
  { id: "Naturaleza", label: "Naturaleza", icon: "🌳" },
  { id: "Compras", label: "Compras", icon: "🛍️" },
  { id: "Ciencia y Tecnología", label: "Ciencia y Tecnología", icon: "🔬" },
  { id: "Deporte", label: "Deporte", icon: "⚽" },
  { id: "Voluntariado", label: "Voluntariado", icon: "🙌" },
  { id: "Cine", label: "Cine", icon: "🎬" },
];

export default function App() {
  // Input states
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: "",
    duration: 5,
    budget: "₡ 850.000",
    interests: ["Cultura"],
    restrictions: "",
  });

  const [activeTab, setActiveTab] = useState<"timeline" | "markdown">("timeline");
  const [showVerifiedContext, setShowVerifiedContext] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat/Feedback states
  const [feedback, setFeedback] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "advisor",
      text: "¡Hola! Soy Michelle, tu asesora de viajes apasionada, experta y colaborativa. Elige un destino y tus preferencias de viaje a la izquierda, y diseñaré un itinerario personalizado a tu medida con opciones perfectas para ti.",
      timestamp: new Date(),
    }
  ]);

  // Handle preset selection
  const handleSelectPreset = (prefab: TravelPreferences) => {
    setPreferences(prefab);
    setError(null);
    // Auto generate for presets to make it snappy & engaging!
    triggerGeneration(prefab);
  };

  // Toggle interest checkboxes
  const toggleInterest = (interestId: string) => {
    setPreferences((prev) => {
      const interests = prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId];
      return { ...prev, interests };
    });
  };

  // Primary Generator call
  const triggerGeneration = async (prefPayload = preferences) => {
    if (!prefPayload.destination.trim()) {
      setError("Por favor ingresa un destino para poder asesorarte.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setItinerary(null);

    // Initial advisor chat state
    const tempMessages: ChatMessage[] = [
      {
        id: "generating-notif",
        sender: "advisor",
        text: `Excelentes elecciones. Estoy analizando las mejores opciones para tu viaje de ${prefPayload.duration} días a ${prefPayload.destination} con presupuesto ${prefPayload.budget}. Dame unos segundos para armar el plan ideal de forma segura...`,
        timestamp: new Date(),
        type: "notification"
      }
    ];
    setChatMessages(tempMessages);

    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefPayload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Ocurrió un error al contactar al servidor.");
      }

      setItinerary({
        markdownItinerary: data.markdownItinerary,
        budgetDistribution: data.budgetDistribution,
        daysTimeline: data.daysTimeline,
      });

      // Update Chat
      setChatMessages([
        {
          id: `gen-done-${Date.now()}`,
          sender: "advisor",
          text: `¡Listo! He diseñado tu itinerario a ${prefPayload.destination}. He incorporado actividades de ${prefPayload.interests.join(", ")} respetando tus restricciones. Revisa la línea de tiempo interactiva o lee el informe en la pestaña del costado. ¿Te gustaría cambiar algo?`,
          timestamp: new Date(),
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al conectar con el servidor de la inteligencia artificial.");
      // Restore initial state but keep track of error
      setChatMessages([
        {
          id: "welcome",
          sender: "advisor",
          text: `Mil disculpas, tuve un contratiempo al procesar la ruta: "${err?.message || "Conexión inestable"}". Por favor verifica tus credenciales o vuelve a intentarlo.`,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Collaborative Refiner call
  const triggerRefinement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !itinerary) return;

    const userInstructions = feedback.trim();
    setFeedback("");
    setIsRefining(true);
    setError(null);

    // Append user feedback and a loader bubble
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userInstructions,
      timestamp: new Date(),
      type: "feedback"
    };

    const loaderMessage: ChatMessage = {
      id: `loader-${Date.now()}`,
      sender: "advisor",
      text: "¡Perfecto! Una idea fantástica. Dame un momento, estoy modificando el itinerario manteniendo la coherencia de todos tus otros días...",
      timestamp: new Date(),
      type: "notification"
    };

    setChatMessages((prev) => [...prev, userMessage, loaderMessage]);

    try {
      const res = await fetch("/api/itinerary/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalItinerary: itinerary.markdownItinerary,
          feedback: userInstructions,
          preferences: preferences,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Fallo en la comunicación médica de viaje.");
      }

      setItinerary({
        markdownItinerary: data.markdownItinerary,
        budgetDistribution: data.budgetDistribution,
        daysTimeline: data.daysTimeline,
      });

      // Split summary response for chat box
      const extraction = data.markdownItinerary;
      // Get the segment before "## Desglose Diario" to quote the updated greeting part
      let summarySnippet = "";
      if (extraction.includes("## Resumen del Viaje")) {
        const parts = extraction.split("## Desglose Diario");
        const headerPart = parts[0].replace("## Resumen del Viaje", "").trim();
        summarySnippet = headerPart;
      }

      setChatMessages((prev) => {
        // filter out the provisional loader
        const cleaned = prev.filter(m => m.id !== loaderMessage.id);
        return [
          ...cleaned,
          {
            id: `advisor-ref-${Date.now()}`,
            sender: "advisor",
            text: summarySnippet || `¡Perfecto! He aplicado tu cambio con éxito: "${userInstructions}". He actualizado el itinerario en las pestañas y ajustado la distribución del presupuesto para reflejarlo de forma coherente.`,
            timestamp: new Date(),
          }
        ];
      });

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Fallo en el proceso de refinamiento.");
      setChatMessages((prev) => {
        const cleaned = prev.filter(m => m.id !== loaderMessage.id);
        return [
          ...cleaned,
          {
            id: `error-${Date.now()}`,
            sender: "advisor",
            text: `Ups, no pude aplicar el ajuste. Error: ${err?.message || "Reconexión requerida"}`,
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-800" id="main-advisor-app">
      {/* Premium Header */}
      <header className="sticky top-0 bg-[#0F172A] border-b border-slate-850 z-40 px-4 py-3.5 shadow-md text-[#F8FAFC]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-500 rounded-xl flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20 transition-transform hover:rotate-6">
              <Compass className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg md:text-xl tracking-tight flex items-center gap-2">
                Wanderlust AI
                <span className="text-xs font-semibold font-mono bg-sky-500/10 border border-sky-400/30 text-[#38BDF8] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-sky-400 rounded-full animate-ping"></span>
                  Premium Plan
                </span>
              </h1>
              <p className="text-xs text-slate-400">Diseño interactivo de itinerarios y refinamiento de alta gama</p>
            </div>
          </div>
          {/* Subtle credits with literal labels */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono">
            <span>Hora Local: 16:57 UTC-7</span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="bg-[#1E293B] border border-slate-800 text-slate-350 px-2.5 py-1 rounded-md text-[11px] font-medium">
              Asesora Michelle
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Form Planner */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset Inspiration Carousel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm" id="inspiration-presets-panel">
            <h3 className="font-display font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
              Destinos de Inspiración Rápida
            </h3>
            <p className="text-xs text-slate-500 mb-4">Haz clic en un destino para autocompletar y planificar instantáneamente:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INSPIRATION_TRIPS.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => handleSelectPreset(trip.preferences)}
                  className="group relative h-28 rounded-xl overflow-hidden cursor-pointer border border-slate-100 hover:border-sky-400 transition-all shadow-xs hover:shadow-md active:scale-97"
                >
                  <img
                    src={trip.image}
                    alt={trip.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-2.5">
                    <h4 className="text-white font-display font-bold text-xs leading-none">{trip.title}</h4>
                    <p className="text-[10px] text-slate-200 line-clamp-1 mt-1 font-sans">{trip.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Selection Form */}
          <div className="bg-white border border-slate-250 rounded-2xl p-5 shadow-sm space-y-5" id="form-planner-card">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-700" />
              Preferencias del Viaje
            </h3>

            {/* Error alerts */}
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 rounded-r-xl text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-600" />
                  Atención requerida
                </p>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 sm:text-slate-500" />
                  Destino Comercial
                </label>
                <input
                  type="text"
                  value={preferences.destination}
                  onChange={(e) => setPreferences({ ...preferences, destination: e.target.value })}
                  placeholder="Ej: Kioto, Roma, Machu Picchu, Costa Rica..."
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-slate-400 transition-all font-sans"
                  disabled={isGenerating || isRefining}
                />
              </div>

              {/* Duration Days */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-500 sm:text-slate-500" />
                    Duración del Viaje (en días)
                  </label>
                  <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                    {preferences.duration} {preferences.duration === 1 ? "Día" : "Días"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferences(prev => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))}
                    className="h-10 w-10 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-lg text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    disabled={isGenerating || isRefining || preferences.duration <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={preferences.duration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPreferences({ ...preferences, duration: isNaN(val) ? 1 : Math.max(1, val) });
                    }}
                    className="flex-1 h-10 text-center bg-slate-50 border border-slate-200 px-4 rounded-xl text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-slate-400 font-mono"
                    disabled={isGenerating || isRefining}
                  />
                  <button
                    type="button"
                    onClick={() => setPreferences(prev => ({ ...prev, duration: prev.duration + 1 }))}
                    className="h-10 w-10 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-lg text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer"
                    disabled={isGenerating || isRefining}
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono italic">
                  Ingresa cualquier cantidad de días. ¡Michelle adaptará el itinerario completo!
                </p>
              </div>

              {/* Budget Costa Rican Colones input and preset shortcuts */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  💰 Presupuesto en Colones Costarricenses (₡)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-sm">
                    ₡
                  </span>
                  <input
                    type="text"
                    value={preferences.budget}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Keep custom text or value
                      setPreferences({ ...preferences, budget: val });
                    }}
                    placeholder="Ej: 850.000"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-slate-400 transition-all font-mono font-semibold"
                    disabled={isGenerating || isRefining}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, budget: "₡ 350.000 (Económico)" })}
                    className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      preferences.budget.includes("350.000")
                        ? "bg-[#1E293B] border-[#1E293B] text-[#38BDF8]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    🪙 ₡350k (Económico)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, budget: "₡ 850.000 (Moderado)" })}
                    className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      preferences.budget.includes("850.000")
                        ? "bg-[#1E293B] border-[#1E293B] text-[#38BDF8]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    💳 ₡850k (Equilibrado)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, budget: "₡ 1.800.000 (Lujoso)" })}
                    className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      preferences.budget.includes("1.800.000")
                        ? "bg-[#1E293B] border-[#1E293B] text-[#38BDF8]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    💎 ₡1.8M (Lujoso)
                  </button>
                </div>
              </div>

              {/* Interests Multi-Select pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
                  Intereses Preferidos
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((item) => {
                    const isSelected = preferences.interests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        disabled={isGenerating || isRefining}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Health/Mobility constraints input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  Restricciones (Salud, Alérgenos y Movilidad)
                </label>
                <input
                  type="text"
                  value={preferences.restrictions}
                  onChange={(e) => setPreferences({ ...preferences, restrictions: e.target.value })}
                  placeholder="Ej: Silla de ruedas, vegano, evitar escaleras, etc."
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans italic"
                  disabled={isGenerating || isRefining}
                />
                <p className="text-[10px] text-amber-600 flex items-center gap-1 font-mono">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  El asesor se adaptará estrictamente para sugerir trayectos e ingredientes seguros
                </p>
              </div>

              {/* Verified Base de Conocimiento Section */}
              <div className="pt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShowVerifiedContext(!showVerifiedContext)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 uppercase tracking-wider font-mono py-1 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                    Base de Conocimiento Verificada {preferences.verifiedPlaces || preferences.verifiedRules ? "(Con Datos)" : ""}
                  </span>
                  <span className="text-slate-400 font-sans text-xs">
                    {showVerifiedContext ? "Ocultar ▲" : "Configurar ▼"}
                  </span>
                </button>
                
                {showVerifiedContext && (
                  <div className="mt-3 space-y-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl animate-feed">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                        📍 Lugares recomendados
                      </label>
                      <textarea
                        value={preferences.verifiedPlaces || ""}
                        onChange={(e) => setPreferences({ ...preferences, verifiedPlaces: e.target.value })}
                        placeholder="Lugares e hitos que Michelle integrará con prioridad..."
                        className="w-full bg-white border border-slate-200/80 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-slate-400 min-h-16 font-sans resize-y"
                        disabled={isGenerating || isRefining}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                        📅 Reglas locales actuales (clima, eventos)
                      </label>
                      <textarea
                        value={preferences.verifiedRules || ""}
                        onChange={(e) => setPreferences({ ...preferences, verifiedRules: e.target.value })}
                        placeholder="Datos del mes (ej: época de lluvias, festivales locales)..."
                        className="w-full bg-white border border-slate-200/80 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-slate-400 min-h-16 font-sans resize-y"
                        disabled={isGenerating || isRefining}
                      />
                    </div>
                    
                    <p className="text-[9px] text-slate-400 leading-normal font-sans">
                      *Al cargar un destino o destino rápido, esta información se actualizará de forma verificada de nuestra base para alimentar a la asesora.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={() => triggerGeneration()}
              disabled={isGenerating || isRefining || !preferences.destination.trim()}
              className={`w-full py-3.5 rounded-xl font-display font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating
                  ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                  : "bg-[#0F172A] hover:bg-[#1E293B] text-white hover:text-[#38BDF8] shadow-slate-200 hover:shadow-lg active:scale-98"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                  Analizando y Trazando Ruta...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-sky-400 group-hover:animate-spin" />
                  Generar Propuesta de Itinerario
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Generated Content & Chat */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Display Box */}
          {!itinerary ? (
            /* EMPTY STATE screen */
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px] space-y-4" id="empty-workspace-state">
              <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Compass className="w-8 h-8 animate-pulse text-blue-500" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-bold text-slate-900 text-xl">Tu próximo viaje comienza aquí</h3>
                <p className="text-sm text-slate-500 font-sans leading-relaxed">
                  Completa las preferencias e intereses a la izquierda o selecciona un destino rápido para que nuestro asesor experto trace un itinerario detallado a tu medida.
                </p>
              </div>
              <div className="pt-4 flex flex-col md:flex-row gap-3 text-left w-full max-w-sm">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm">🥗</div>
                  <div>
                    <h5 className="font-bold text-xs">Dieta y Alérgenos</h5>
                    <p className="text-[10px] text-slate-400">Platos típicos adaptados</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm">🚶‍♂️</div>
                  <div>
                    <h5 className="font-bold text-xs">Movilidad Segura</h5>
                    <p className="text-[10px] text-slate-400">Rutas accesibles sugeridas</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cover Summary Card */}
              <div className="bg-[#0F172A] text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-slate-800" id="itinerary-cover-stats">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Compass className="w-40 h-40 text-sky-450" />
                </div>
                
                <div className="relative space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-widest bg-sky-500/20 border border-sky-400/30 text-[#38BDF8] px-2.5 py-1 rounded-full">
                      🔥 Itinerario Diseñado
                    </span>
                    <span className="text-[10px] uppercase font-bold font-mono tracking-widest bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-1 rounded-full">
                      Presupuesto {preferences.budget}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight">
                      {preferences.destination}
                    </h2>
                    <p className="text-slate-300 text-xs mt-1 font-sans flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      Plan completo de {preferences.duration} días adaptado a tus intereses
                    </p>
                  </div>

                  {/* Badges for interests / restriction warning */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">Preferencias:</span>
                    {preferences.interests.map((int) => (
                      <span key={int} className="bg-slate-800 text-sky-300 border border-slate-700/60 px-2.5 py-0.5 rounded-md font-sans font-medium text-[11px]">
                        {int}
                      </span>
                    ))}
                    {preferences.restrictions && (
                      <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-mono text-[11px]">
                        ⚠️ {preferences.restrictions}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* View/Tab Controls */}
              <div className="bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm flex items-center justify-between" id="tab-controls">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                      activeTab === "timeline"
                        ? "bg-[#1E293B] text-[#38BDF8] shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Línea de Tiempo Interactiva
                  </button>
                  <button
                    onClick={() => setActiveTab("markdown")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                      activeTab === "markdown"
                        ? "bg-[#1E293B] text-[#38BDF8] shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Resumen en Texto Detallado
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Listo para Viajar
                </div>
              </div>

              {/* Display area of Tab content */}
              <div className="min-h-[300px]">
                {activeTab === "timeline" ? (
                  /* Timeline interactivo */
                  <TimelineView timeline={itinerary.daysTimeline} />
                ) : (
                  /* Formatted Detailed Report */
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm markdown-body" id="itinerary-detail-rich">
                    <ReactMarkdown>{itinerary.markdownItinerary}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Interactive Budget Visualizer Block */}
              {itinerary.budgetDistribution && itinerary.budgetDistribution.length > 0 && (
                <BudgetChart categories={itinerary.budgetDistribution} />
              )}
            </div>
          )}

          {/* Collaborative Refinement Advisor Panel (La consulta con el Asesor) */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4" id="collaboration-advisor-chat">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  {/* Round profile image resembling the advisor */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Asesor de Viajes"
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full object-cover border border-sky-300/60"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800">
                    Asesora Michelle
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">Especialista en Destinos Globales</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono">
                  Online Advisor
                </span>
              </div>
            </div>

            {/* Chat message bubbles scroll window */}
            <div className="max-h-72 overflow-y-auto space-y-3.5 pr-2 animate-feed" id="chat-messages-container">
              {chatMessages.map((msg) => {
                const isAdvisor = msg.sender === "advisor";
                const isNotification = msg.type === "notification";

                if (isNotification) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-white border border-slate-200/60 rounded-lg px-3.5 py-1.5 text-[11px] text-slate-500 text-center max-w-sm flex items-center gap-2 italic">
                        <Loader2 className="w-3 h-3 text-sky-500 animate-spin" />
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdvisor ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-xl text-xs md:text-sm leading-relaxed shadow-3xs ${
                        isAdvisor
                          ? "bg-white border-l-4 border-l-[#38BDF8] border-y border-r border-slate-200 text-slate-800"
                          : "bg-[#1E293B] text-sky-200 border border-slate-800 rounded-tr-none"
                      }`}
                    >
                      {!isAdvisor && (
                        <div className="text-[9px] font-bold font-mono tracking-wider text-sky-400 opacity-90 mb-1 uppercase">
                          Solicitud de Modificación
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input form */}
            <form onSubmit={triggerRefinement} className="relative mt-2">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  itinerary
                    ? "Ej: 'Cambia el almuerzo del Día 2 por algo vegetariano'..."
                    : "Primero genera una propuesta de itinerario para chatear..."
                }
                className="w-full bg-white border border-slate-300 pl-4 pr-12 py-3 rounded-lg text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all font-sans"
                disabled={!itinerary || isGenerating || isRefining}
              />
              <button
                type="submit"
                disabled={!itinerary || isGenerating || isRefining || !feedback.trim()}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all ${
                  itinerary && feedback.trim()
                    ? "bg-[#1E293B] hover:bg-[#0F172A] text-[#38BDF8] shadow-xs"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
                title="Enviar comentario de modificación"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center font-mono italic">
              Michelle refinará instantáneamente el programa asegurando la consistencia del presupuesto y del viaje
            </p>
          </div>
        </div>
      </main>

      {/* Sticky footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-4 text-xs font-mono border-t border-slate-800 ml-0 mr-0 mt-8">
        <p>© 2026 Asesor de Viajes Experto. Desarrollado con inteligencia artificial usando @google/genai.</p>
      </footer>
    </div>
  );
}
