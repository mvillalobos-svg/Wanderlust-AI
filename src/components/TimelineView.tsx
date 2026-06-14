import React, { useState } from "react";
import { DayTimelineItem } from "../types";
import { Sun, Sunset, Moon, Check, ChevronDown, ChevronUp, Layers, Compass } from "lucide-react";

interface TimelineViewProps {
  timeline: DayTimelineItem[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  // Store expanded state for different days
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    // Expand the first day by default
    return { 1: true };
  });

  // Track checked/liked states of activities
  const [checkedActivities, setCheckedActivities] = useState<Record<string, boolean>>({});

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const expandAll = () => {
    const nextState: Record<number, boolean> = {};
    timeline.forEach((item) => {
      nextState[item.dayNumber] = true;
    });
    setExpandedDays(nextState);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  const toggleActivityChecked = (dayNum: number, period: "morning" | "afternoon" | "evening") => {
    const key = `${dayNum}-${period}`;
    setCheckedActivities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-4" id="itinerary-timeline-wrapper">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
            Vistas del Itinerario
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={expandAll}
            className="text-[11px] font-medium text-sky-600 bg-sky-50/50 hover:bg-sky-50 hover:text-sky-700 font-mono px-2 py-1 rounded transition-colors"
          >
            Expandir todo
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={collapseAll}
            className="text-[11px] font-medium text-slate-500 hover:bg-slate-100 font-mono px-2 py-1 rounded transition-colors"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      <div className="relative border-l-2 border-dashed border-slate-100 ml-4 pl-6 space-y-6">
        {timeline.map((item) => {
          const isExpanded = !!expandedDays[item.dayNumber];

          return (
            <div key={item.dayNumber} className="relative group/day" id={`timeline-day-${item.dayNumber}`}>
              {/* Day indicator node */}
              <div
                onClick={() => toggleDay(item.dayNumber)}
                className={`absolute -left-[35px] top-0 h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 z-10 font-mono text-xs font-bold ${
                  isExpanded
                    ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-100 scale-110"
                    : "bg-white border-slate-300 text-slate-500 hover:border-slate-400"
                }`}
              >
                {item.dayNumber}
              </div>

              {/* Day Card */}
              <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs hover:border-slate-200 transition-all duration-300">
                {/* Header of the Day */}
                <div
                  onClick={() => toggleDay(item.dayNumber)}
                  className="flex items-center justify-between p-4 bg-slate-50/60 cursor-pointer select-none hover:bg-slate-100/40 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        DÍA {item.dayNumber}
                      </span>
                      <Compass className="w-3.5 h-3.5 text-slate-400 group-hover/day:animate-spin-once" />
                    </div>
                    <h4 className="font-display font-semibold text-slate-800 text-sm md:text-base mt-2 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                  <div className="text-slate-400 group-hover/day:text-slate-600 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Day Details Accordion */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isExpanded ? "max-h-[800px] border-t border-slate-100" : "max-h-0"
                  }`}
                >
                  <div className="p-4 space-y-4">
                    {/* Period: Morning */}
                    <div className="flex gap-3 items-start relative group/item">
                      <div className="flex flex-col items-center">
                        <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-100 text-amber-500">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 group-last/item:hidden min-h-[30px] my-1"></div>
                      </div>
                      <div className="flex-1 bg-slate-50/40 border border-slate-100/50 p-3 rounded-lg hover:bg-amber-50/10 hover:border-amber-100/40 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold font-mono uppercase text-amber-700 tracking-wider">
                            Mañana
                          </span>
                          <button
                            onClick={() => toggleActivityChecked(item.dayNumber, "morning")}
                            className={`p-1 rounded-md border transition-all ${
                              checkedActivities[`${item.dayNumber}-morning`]
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-200 text-slate-300 hover:text-slate-400 hover:border-slate-300"
                            }`}
                            title="Guardar / Marcar favorito"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                        <p
                          className={`text-slate-700 text-xs md:text-sm mt-1.5 leading-relaxed ${
                            checkedActivities[`${item.dayNumber}-morning`] ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.morning}
                        </p>
                      </div>
                    </div>

                    {/* Period: Afternoon */}
                    <div className="flex gap-3 items-start relative group/item">
                      <div className="flex flex-col items-center">
                        <div className="p-1.5 bg-orange-50 rounded-lg border border-orange-100 text-orange-500">
                          <Sunset className="w-4 h-4" />
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 group-last/item:hidden min-h-[30px] my-1"></div>
                      </div>
                      <div className="flex-1 bg-slate-50/40 border border-slate-100/50 p-3 rounded-lg hover:bg-orange-50/10 hover:border-orange-100/40 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold font-mono uppercase text-orange-700 tracking-wider">
                            Tarde
                          </span>
                          <button
                            onClick={() => toggleActivityChecked(item.dayNumber, "afternoon")}
                            className={`p-1 rounded-md border transition-all ${
                              checkedActivities[`${item.dayNumber}-afternoon`]
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-200 text-slate-300 hover:text-slate-400 hover:border-slate-300"
                            }`}
                            title="Guardar / Marcar favorito"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                        <p
                          className={`text-slate-700 text-xs md:text-sm mt-1.5 leading-relaxed ${
                            checkedActivities[`${item.dayNumber}-afternoon`] ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.afternoon}
                        </p>
                      </div>
                    </div>

                    {/* Period: Evening */}
                    <div className="flex gap-3 items-start relative group/item">
                      <div className="flex flex-col items-center">
                        <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-500">
                          <Moon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-50/40 border border-slate-100/50 p-3 rounded-lg hover:bg-indigo-50/10 hover:border-indigo-100/40 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold font-mono uppercase text-indigo-700 tracking-wider">
                            Noche
                          </span>
                          <button
                            onClick={() => toggleActivityChecked(item.dayNumber, "evening")}
                            className={`p-1 rounded-md border transition-all ${
                              checkedActivities[`${item.dayNumber}-evening`]
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-200 text-slate-300 hover:text-slate-400 hover:border-slate-300"
                            }`}
                            title="Guardar / Marcar favorito"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                        <p
                          className={`text-slate-700 text-xs md:text-sm mt-1.5 leading-relaxed ${
                            checkedActivities[`${item.dayNumber}-evening`] ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.evening}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
