import React, { useState, useMemo } from 'react';
import { 
  Search, 
  History as HistoryIcon, 
  FileSpreadsheet, 
  User, 
  Tag, 
  Calendar, 
  Wrench, 
  Cpu, 
  X,
  Clock
} from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryViewProps {
  history: HistoryEntry[];
  onExportCsv: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onExportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('Alle');
  const [selectedAction, setSelectedAction] = useState<string>('Alle');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('Alle');

  // Extract unique users
  const users = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      const u = h.userName || h.benutzer || h.user;
      if (u && typeof u === 'string') set.add(u.trim());
    });
    return ['Alle', ...Array.from(set).sort()];
  }, [history]);

  // Extract unique actions
  const actions = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      const a = h.action || h.aktion;
      if (a && typeof a === 'string') set.add(a.trim());
    });
    return ['Alle', ...Array.from(set).sort()];
  }, [history]);

  // Filter logic
  const filteredHistory = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const now = new Date().getTime();

    return history.filter((item) => {
      // 1. Search Query
      if (q) {
        const searchable = [
          item.userName,
          item.benutzer,
          item.user,
          item.action,
          item.aktion,
          item.toolName,
          item.werkzeug,
          item.machine,
          item.maschine,
          item.details,
          Array.isArray(item.changes) ? item.changes.join(' ') : ''
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      // 2. User Filter
      if (selectedUser !== 'Alle') {
        const u = item.userName || item.benutzer || item.user;
        if (u !== selectedUser) return false;
      }

      // 3. Action Filter
      if (selectedAction !== 'Alle') {
        const a = item.action || item.aktion;
        if (a !== selectedAction) return false;
      }

      // 4. Timeframe Filter
      if (selectedTimeframe !== 'Alle') {
        const dateStr = item.timestamp || item.zeitstempel || item.date || item.datum;
        if (!dateStr) return false;
        try {
          const itemTime = new Date(dateStr).getTime();
          if (isNaN(itemTime)) return true;
          const diffDays = (now - itemTime) / (1000 * 60 * 60 * 24);

          if (selectedTimeframe === 'Heute' && diffDays > 1) return false;
          if (selectedTimeframe === 'Letzte 7 Tage' && diffDays > 7) return false;
          if (selectedTimeframe === 'Letzte 30 Tage' && diffDays > 30) return false;
        } catch {
          return true;
        }
      }

      return true;
    });
  }, [history, searchTerm, selectedUser, selectedAction, selectedTimeframe]);

  const formatDateTimeParts = (item: HistoryEntry) => {
    const raw = item.timestamp || item.zeitstempel || item.date || item.datum || '';
    if (!raw) return { date: item.date || item.datum || '–', time: item.time || item.uhrzeit || '–' };

    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) {
        return { date: raw, time: item.time || item.uhrzeit || '–' };
      }
      return {
        date: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
      };
    } catch {
      return { date: raw, time: '–' };
    }
  };

  const getActionBadgeClass = (action: string | undefined) => {
    const a = String(action || '').toLowerCase();
    if (a.includes('neu') || a.includes('angelegt') || a.includes('eingelagert') || a.includes('zugang')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (a.includes('entnahme') || a.includes('abgang') || a.includes('minus')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (a.includes('verschlissen') || a.includes('defekt') || a.includes('lösch')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (a.includes('rüst') || a.includes('maschine') || a.includes('wechsel')) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header with Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Historie durchsuchen (Benutzer, Werkzeug, Aktion, Details)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm self-end md:self-auto"
            title="Historie als CSV-Datei exportieren"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Historie als CSV exportieren</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          
          {/* User Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Benutzer:</span>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Aktion:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Zeitraum:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Alle">Alle Zeiträume</option>
              <option value="Heute">Heute</option>
              <option value="Letzte 7 Tage">Letzte 7 Tage</option>
              <option value="Letzte 30 Tage">Letzte 30 Tage</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedUser !== 'Alle' || selectedAction !== 'Alle' || selectedTimeframe !== 'Alle') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedUser('Alle');
                setSelectedAction('Alle');
                setSelectedTimeframe('Alle');
              }}
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20"
            >
              <X className="w-3 h-3" />
              <span>Filter zurücksetzen</span>
            </button>
          )}

          <div className="ml-auto text-slate-400 text-xs font-mono">
            Einträge: <strong className="text-white">{filteredHistory.length}</strong> von {history.length}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {history.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center">
            <HistoryIcon className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Keine Historiedaten gefunden.</h3>
            <p className="text-xs text-slate-400 max-w-md">
              In deinem verbundenen JSONBin wurden unter <code className="text-blue-400">record.history</code> noch keine Protokolleinträge erfasst.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Keine passenden Historieneinträge gefunden</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Passe deine Filterkriterien für Benutzer, Aktion oder Zeitraum an.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold select-none">
                  <th className="py-3.5 px-4 w-32">Datum</th>
                  <th className="py-3.5 px-3 w-24">Uhrzeit</th>
                  <th className="py-3.5 px-4">Benutzer</th>
                  <th className="py-3.5 px-4">Aktion</th>
                  <th className="py-3.5 px-4">Werkzeug</th>
                  <th className="py-3.5 px-3 text-right">Menge</th>
                  <th className="py-3.5 px-4">Maschine</th>
                  <th className="py-3.5 px-4">Details / Änderungen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredHistory.map((item, index) => {
                  const { date, time } = formatDateTimeParts(item);
                  const actionStr = item.action || item.aktion || '–';
                  const userStr = item.userName || item.benutzer || item.user || '–';
                  const toolStr = item.toolName || item.werkzeug || '–';
                  const qtyStr = item.quantity ?? item.menge ?? '–';
                  const machineStr = item.machine || item.maschine || '–';
                  const detailsStr = Array.isArray(item.changes) 
                    ? item.changes.join(' · ') 
                    : (item.details || '–');

                  return (
                    <tr
                      key={item.id || index}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Datum */}
                      <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                        {date}
                      </td>

                      {/* Uhrzeit */}
                      <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">
                        {time}
                      </td>

                      {/* Benutzer */}
                      <td className="py-3 px-4 text-white font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0 font-bold border border-slate-700">
                            {userStr.charAt(0)}
                          </span>
                          <span>{userStr}</span>
                        </div>
                      </td>

                      {/* Aktion */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getActionBadgeClass(actionStr)}`}>
                          {actionStr}
                        </span>
                      </td>

                      {/* Werkzeug */}
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {toolStr}
                      </td>

                      {/* Menge */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                        {qtyStr}
                      </td>

                      {/* Maschine */}
                      <td className="py-3 px-4 text-slate-400">
                        {machineStr}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={detailsStr}>
                        {detailsStr}
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
  );
};
