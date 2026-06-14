import React from "react";
import { BudgetCategory } from "../types";
import { Landmark, Compass, Bed, Utensils, AlertTriangle, HelpCircle } from "lucide-react";

interface BudgetChartProps {
  categories: BudgetCategory[];
}

export default function BudgetChart({ categories }: BudgetChartProps) {
  // Map icons to categories
  const getIcon = (category: string) => {
    const lowercase = category.toLowerCase();
    if (lowercase.includes("alojamiento") || lowercase.includes("hotel") || lowercase.includes("hospedaje")) {
      return <Bed className="w-4 h-4 text-emerald-600" />;
    }
    if (lowercase.includes("transporte") || lowercase.includes("vuelo") || lowercase.includes("auto") || lowercase.includes("traslado")) {
      return <Compass className="w-4 h-4 text-sky-600" />;
    }
    if (lowercase.includes("gastronom") || lowercase.includes("comida") || lowercase.includes("restaurante") || lowercase.includes("cena")) {
      return <Utensils className="w-4 h-4 text-rose-600" />;
    }
    if (lowercase.includes("actividad") || lowercase.includes("tour") || lowercase.includes("entrada") || lowercase.includes("excurs")) {
      return <Landmark className="w-4 h-4 text-amber-600" />;
    }
    if (lowercase.includes("emerg") || lowercase.includes("seguro") || lowercase.includes("imprev")) {
      return <AlertTriangle className="w-4 h-4 text-purple-600" />;
    }
    return <HelpCircle className="w-4 h-4 text-slate-600" />;
  };

  const getThemeClasses = (category: string) => {
    const lowercase = category.toLowerCase();
    if (lowercase.includes("alojamiento") || lowercase.includes("hotel") || lowercase.includes("hospedaje")) {
      return { bg: "bg-emerald-500", border: "border-emerald-200", badge: "bg-emerald-50 text-emerald-700", text: "text-emerald-800" };
    }
    if (lowercase.includes("transporte") || lowercase.includes("vuelo") || lowercase.includes("auto") || lowercase.includes("traslado")) {
      return { bg: "bg-sky-500", border: "border-sky-250", badge: "bg-sky-50 text-sky-700", text: "text-sky-800" };
    }
    if (lowercase.includes("gastronom") || lowercase.includes("comida") || lowercase.includes("restaurante") || lowercase.includes("cena")) {
      return { bg: "bg-rose-500", border: "border-rose-200", badge: "bg-rose-50 text-rose-700", text: "text-rose-800" };
    }
    if (lowercase.includes("actividad") || lowercase.includes("tour") || lowercase.includes("entrada") || lowercase.includes("excurs")) {
      return { bg: "bg-amber-500", border: "border-amber-200", badge: "bg-amber-50 text-amber-700", text: "text-amber-800" };
    }
    if (lowercase.includes("emerg") || lowercase.includes("seguro") || lowercase.includes("imprev")) {
      return { bg: "bg-purple-500", border: "border-purple-200", badge: "bg-purple-50 text-purple-700", text: "text-purple-800" };
    }
    return { bg: "bg-slate-500", border: "border-slate-200", badge: "bg-slate-50 text-slate-700", text: "text-slate-800" };
  };

  const totalPercentage = categories.reduce((sum, item) => sum + item.percentage, 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm" id="budget-breakdown-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-slate-900 text-lg flex items-center gap-2">
            📊 Estimación de Distribución
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribución porcentual del presupuesto según prioridades</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            Total {totalPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bars Stacked visual block */}
      <div className="h-6 w-full rounded-full bg-slate-50 overflow-hidden flex mb-6 border border-slate-100/80">
        {categories.map((item, index) => {
          const themes = getThemeClasses(item.category);
          return (
            <div
              key={index}
              style={{ width: `${(item.percentage / (totalPercentage || 100)) * 100}%` }}
              className={`${themes.bg} transition-all duration-500 hover:brightness-95 cursor-pointer relative group`}
              title={`${item.category}: ${item.percentage}%`}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                  {item.category}: {item.percentage}% ({item.amountEst})
                </div>
                <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories detailed cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categories.map((item, index) => {
          const themes = getThemeClasses(item.category);
          return (
            <div
              key={index}
              className="group relative flex flex-col justify-between p-3.5 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 rounded-xl transition-all duration-200"
              id={`budget-category-tile-${index}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg shadow-2xs border border-slate-100">
                    {getIcon(item.category)}
                  </div>
                  <span className="text-sm font-medium text-slate-800">{item.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-right">
                  <span className={`text-xs font-semibold font-mono px-2 py-0.5 rounded-full ${themes.badge}`}>
                    {item.percentage}%
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono bg-white border border-slate-100 px-1.5 py-0.5 rounded shadow-3xs">
                    {item.amountEst}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic group-hover:line-clamp-none transition-all duration-300">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
