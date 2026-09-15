import React from 'react';
import { 
  Wrench, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  ArrowRight, 
  Search, 
  FileSpreadsheet,
  Clock,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';
import { Tool, HistoryEntry, StockLimits, NavTab } from '../types';

interface DashboardViewProps {
  tools: Tool[];
  history: HistoryEntry[];
  stockLimits: StockLimits;
  setActiveTab: (tab: NavTab) => void;
  onSelectTool: (tool: Tool) => void;
  onExportTools: () => void;
  onExportHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tools,
  history,
  stockLimits,
  setActiveTab,
  onSelectTool,
  onExportTools,
  onExportHistory
}) => {
  // 1. Werkzeuge gesamt
  const totalTools = tools.length;

  // 2. Gesamtbestand (Sum of quantities)
  const totalQuantity = tools.reduce((sum, t) => {
    const q = Number(t.quantity ?? t.bestand ?? t.stueck ?? 1);
    return sum + (isNaN(q) || q < 0 ? 0 : q);
  }, 0);

  // 3. Verfügbar (Count of available tools)
  const availableTools = tools.filter((t) => {
    const s = String(t.status || '').toLowerCase();
    return s.includes('verfügbar') || s.includes('verfuegbar') || s.includes('neu') || s === 'ok';
  });
  const availableCount = availableTools.length;

  // 4. Kritischer Bestand (Quantity <= low limit)
  const criticalTools = tools.filter((t) => {
    const q = Number(t.quantity ?? t.bestand ?? t.stueck ?? 0);
    return !isNaN(q) && q <= stockLimits.low;
  });
  const criticalCount = criticalTools.length;

  // Zero stock / empty tools
  const emptyStockTools = tools.filter((t) => {
    const q = Number(t.quantity ?? t.bestand ?? t.stueck ?? 0);
    return !isNaN(q) && q <= stockLimits.critical;
  });

  // 5. Historieneinträge gesamt
  const totalHistoryEntries = history.length;

  // Recent 5 tool changes from history
  const recentHistory = history.slice(0, 5);

  // Category counts
  const categoryMap: Record<string, number> = {};
  tools.forEach((t) => {
    const cat = t.category || t.kategorie || 'Sonstige';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            CNC-Werkstatt Übersicht
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Echtzeit-Kennzahlen und Bestandsüberwachung für CNC-Bearbeitungswerkzeuge.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportTools}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Werkzeuge CSV</span>
          </button>
          <button
            onClick={onExportHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>Historie CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Big KPI Stat-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Werkzeuge gesamt */}
        <div 
          onClick={() => setActiveTab('tools')}
          className="cursor-pointer group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Werkzeuge gesamt</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {totalTools}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Verschiedene Typen</span>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
              Tabelle <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Gesamtbestand */}
        <div 
          onClick={() => setActiveTab('tools')}
          className="cursor-pointer group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gesamtbestand</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-400 font-mono tracking-tight">
            {totalQuantity} <span className="text-sm font-sans font-medium text-slate-400">Stk.</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Vorhandene Stückzahl</span>
            <span className="text-indigo-400 font-medium">Lager + Maschine</span>
          </div>
        </div>

        {/* Card 3: Verfügbar */}
        <div 
          onClick={() => setActiveTab('tools')}
          className="cursor-pointer group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verfügbar</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {availableCount}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Einsatzbereit</span>
            <span className="text-emerald-400 font-medium">
              {totalTools > 0 ? Math.round((availableCount / totalTools) * 100) : 0}% der Typen
            </span>
          </div>
        </div>

        {/* Card 4: Kritischer Bestand */}
        <div 
          onClick={() => setActiveTab('tools')}
          className={`cursor-pointer group bg-slate-900 hover:bg-slate-850 border rounded-2xl p-5 transition-all shadow-sm relative overflow-hidden ${
            criticalCount > 0 
              ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/20' 
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Kritischer Bestand</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${
              criticalCount > 0 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-amber-400">
            {criticalCount}
            {emptyStockTools.length > 0 && (
              <span className="text-xs font-sans font-semibold text-rose-400 ml-2">
                ({emptyStockTools.length} leer)
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Bestand ≤ {stockLimits.low} Stk.</span>
            <span className="text-amber-400 font-medium">Prüfen</span>
          </div>
        </div>

        {/* Card 5: Historieneinträge */}
        <div 
          onClick={() => setActiveTab('history')}
          className="cursor-pointer group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Historieneinträge</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono tracking-tight">
            {totalHistoryEntries}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Protokollierte Aktionen</span>
            <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
              Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Stock Traffic Light Legend & Alert Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bestandsampel:</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              Ausreichend (&gt; {stockLimits.low} Stk.)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
              Niedrig (≤ {stockLimits.low} Stk.)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
              Kein Bestand (≤ {stockLimits.critical} Stk.)
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Grenzwerte anpassen ⚙️
        </button>
      </div>

      {/* Main Grid: Critical Tools Alert Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Critical / Low Stock Alert List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Bestandsüberwachung ({criticalCount} Werkzeuge unter Limit)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tools')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Alle anzeigen <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {criticalTools.length === 0 ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
                <p className="font-medium text-slate-300">Alle Werkzeugbestände im grünen Bereich!</p>
                <p className="text-xs text-slate-500 mt-0.5">Keine Werkzeuge unterschreiten den Mindestbestand von {stockLimits.low} Stück.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pr-4">Ampel</th>
                      <th className="pb-3 pr-4">Werkzeug / Bezeichnung</th>
                      <th className="pb-3 pr-4">Kategorie</th>
                      <th className="pb-3 pr-4">Lagerort</th>
                      <th className="pb-3 text-right">Bestand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {criticalTools.slice(0, 6).map((tool, idx) => {
                      const qty = Number(tool.quantity ?? tool.bestand ?? tool.stueck ?? 0);
                      const isZero = qty <= stockLimits.critical;
                      return (
                        <tr 
                          key={tool.id || idx}
                          onClick={() => onSelectTool(tool)}
                          className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                              isZero ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-400 shadow-amber-400/50'
                            }`}></span>
                          </td>
                          <td className="py-3 pr-4 text-white font-semibold flex items-center gap-2">
                            <span>{tool.icon || '⚙️'}</span>
                            <span className="hover:text-blue-400 transition-colors">
                              {tool.name || tool.bezeichnung || 'Unbenannt'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-400">{tool.category || tool.kategorie || '–'}</td>
                          <td className="py-3 pr-4 text-slate-400 font-mono">{tool.location || tool.lagerort || '–'}</td>
                          <td className="py-3 text-right">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isZero ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {qty} Stk.
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Activity / History Snippet */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Letzte Aktivitäten</h3>
              </div>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                Vollständig <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Keine Historiedaten gefunden.
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item, idx) => {
                  const dateStr = item.timestamp || item.zeitstempel || item.date || item.datum || '';
                  let formattedDate = dateStr;
                  try {
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                      formattedDate = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' +
                                      d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                    }
                  } catch {}

                  return (
                    <div key={item.id || idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
                      <div className="flex items-center justify-between gap-2 text-slate-400 mb-1">
                        <span className="font-bold text-white font-mono">
                          {item.userName || item.benutzer || item.user || 'Mitarbeiter'}
                        </span>
                        <span className="text-[11px] text-slate-500">{formattedDate}</span>
                      </div>
                      <div className="font-medium text-blue-300 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
                          {item.action || item.aktion || 'Aktion'}
                        </span>
                        <span className="truncate text-slate-200">{item.toolName || item.werkzeug || 'Werkzeug'}</span>
                      </div>
                      {item.details && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Category Summary Footer */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
              Top Kategorien
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topCategories.map(([cat, count]) => (
                <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700">
                  <span>{cat}</span>
                  <strong className="font-mono text-blue-400">{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
