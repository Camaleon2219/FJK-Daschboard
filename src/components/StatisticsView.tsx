import React, { useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Users, 
  Activity, 
  Layers, 
  Cpu, 
  Wrench, 
  AlertCircle,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { Tool, HistoryEntry, StockLimits } from '../types';

interface StatisticsViewProps {
  tools: Tool[];
  history: HistoryEntry[];
  stockLimits: StockLimits;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  tools,
  history,
  stockLimits
}) => {
  // 1. Bestandsverteilung nach Kategorie
  const categoryStats = useMemo(() => {
    if (tools.length === 0) return [];
    const counts: Record<string, { count: number; pieces: number }> = {};
    
    tools.forEach((t) => {
      const cat = t.category || t.kategorie || 'Sonstige';
      const q = Number(t.quantity ?? t.bestand ?? t.stueck ?? 1);
      const pieces = isNaN(q) || q < 0 ? 0 : q;
      
      if (!counts[cat]) counts[cat] = { count: 0, pieces: 0 };
      counts[cat].count += 1;
      counts[cat].pieces += pieces;
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [tools]);

  // 2. Statusverteilung
  const statusStats = useMemo(() => {
    if (tools.length === 0) return [];
    const counts: Record<string, number> = {};

    tools.forEach((t) => {
      const st = t.status ? String(t.status).trim() : 'Unbekannt';
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tools]);

  // 3. Bestandsampel Aufteilung
  const ampelStats = useMemo(() => {
    if (tools.length === 0) return null;
    let sufficient = 0;
    let low = 0;
    let critical = 0;

    tools.forEach((t) => {
      const q = Number(t.quantity ?? t.bestand ?? t.stueck ?? 0);
      if (isNaN(q) || q <= stockLimits.critical) critical += 1;
      else if (q <= stockLimits.low) low += 1;
      else sufficient += 1;
    });

    return { sufficient, low, critical, total: tools.length };
  }, [tools, stockLimits]);

  // 4. Häufigste Aktionen in der Historie
  const actionStats = useMemo(() => {
    if (history.length === 0) return [];
    const counts: Record<string, number> = {};

    history.forEach((h) => {
      const act = h.action || h.aktion;
      if (act && typeof act === 'string') {
        const clean = act.trim();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [history]);

  // 5. Meistgenannte Werkzeuge in der Historie (Aktivitäts-Häufigkeit)
  const topToolsHistory = useMemo(() => {
    if (history.length === 0) return [];
    const counts: Record<string, number> = {};

    history.forEach((h) => {
      const toolName = h.toolName || h.werkzeug;
      if (toolName && typeof toolName === 'string') {
        const clean = toolName.trim();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [history]);

  // 6. Aktivitäten pro Benutzer
  const userStats = useMemo(() => {
    if (history.length === 0) return [];
    const counts: Record<string, number> = {};

    history.forEach((h) => {
      const u = h.userName || h.benutzer || h.user;
      if (u && typeof u === 'string') {
        const clean = u.trim();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [history]);

  // 7. Werkzeuge pro Maschine
  const machineStats = useMemo(() => {
    if (tools.length === 0) return [];
    const counts: Record<string, number> = {};

    tools.forEach((t) => {
      const m = t.machine || t.maschine;
      if (m && typeof m === 'string' && m.trim()) {
        const clean = m.trim();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tools]);

  const hasToolData = tools.length > 0;
  const hasHistoryData = history.length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Werkstatt-Statistiken &amp; Kennzahlen
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Reale Auswertung auf Basis von <strong className="text-white font-mono">{tools.length}</strong> Werkzeugen und <strong className="text-white font-mono">{history.length}</strong> Historieneinträgen.
          </p>
        </div>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Bestandsverteilung nach Kategorie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Werkzeugkategorien</h3>
              </div>
              <span className="text-xs text-slate-500">{categoryStats.length} Kategorien</span>
            </div>

            {!hasToolData || categoryStats.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Keine Werkzeugdaten für Kategorien vorhanden.
              </div>
            ) : (
              <div className="space-y-3.5">
                {categoryStats.map((cat) => {
                  const percent = Math.round((cat.count / tools.length) * 100);
                  return (
                    <div key={cat.name} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{cat.name}</span>
                        <div className="font-mono text-slate-400">
                          <strong className="text-white">{cat.count} Typen</strong> ({cat.pieces} Stk.) · {percent}%
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Bestandsampel & Statusverteilung */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Bestandsgesundheit &amp; Status</h3>
              </div>
            </div>

            {!hasToolData || !ampelStats ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Keine Daten für Bestandsampel vorhanden.
              </div>
            ) : (
              <div className="space-y-4">
                {/* 3 Traffic light blocks */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Ausreichend</span>
                    <span className="text-2xl font-black font-mono text-emerald-300">{ampelStats.sufficient}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {Math.round((ampelStats.sufficient / ampelStats.total) * 100)}%
                    </span>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Niedrig (≤ {stockLimits.low})</span>
                    <span className="text-2xl font-black font-mono text-amber-300">{ampelStats.low}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {Math.round((ampelStats.low / ampelStats.total) * 100)}%
                    </span>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">Leer (≤ {stockLimits.critical})</span>
                    <span className="text-2xl font-black font-mono text-rose-300">{ampelStats.critical}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {Math.round((ampelStats.critical / ampelStats.total) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Status Breakdown List */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Werkzeugstatus Aufteilung
                  </span>
                  {statusStats.map((st) => (
                    <div key={st.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                      <span className="text-slate-300">{st.name}</span>
                      <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        {st.count} Werkzeuge
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Meist verwendete Werkzeuge in der Historie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Meistbewegte Werkzeuge</h3>
              </div>
              <span className="text-xs text-slate-500">Aus Historie</span>
            </div>

            {!hasHistoryData || topToolsHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Keine Werkzeugbewegungen in der Historie erfasst.
              </div>
            ) : (
              <div className="space-y-3">
                {topToolsHistory.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                    <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                      <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-xs shrink-0">
                      {item.count} Aktionen
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Häufigste Aktionen & Benutzeraktivitäten */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Aktivitäten pro Mitarbeiter &amp; Aktionen</h3>
              </div>
            </div>

            {!hasHistoryData || (userStats.length === 0 && actionStats.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Keine Benutzeraktivitäten in der Historie gefunden.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Users List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Mitarbeiter-Aktivität
                  </span>
                  {userStats.map((u) => (
                    <div key={u.name} className="flex items-center justify-between text-xs bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
                      <span className="font-semibold text-slate-200 font-mono">👤 {u.name}</span>
                      <span className="font-mono font-bold text-purple-400">{u.count} Einträge</span>
                    </div>
                  ))}
                </div>

                {/* Actions List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Häufigste Aktionsarten
                  </span>
                  {actionStats.slice(0, 5).map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-xs bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
                      <span className="text-slate-300 truncate max-w-[120px]">{a.name}</span>
                      <span className="font-mono font-bold text-blue-400">{a.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Machine occupancy if present */}
          {machineStats.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> Werkzeuge pro CNC-Maschine
              </span>
              <div className="flex flex-wrap gap-2">
                {machineStats.map((m) => (
                  <span key={m.name} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5">
                    <span>{m.name}:</span>
                    <strong className="text-blue-400 font-mono">{m.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
