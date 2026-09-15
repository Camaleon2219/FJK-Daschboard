import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileSpreadsheet, 
  ExternalLink, 
  Layers, 
  Eye, 
  SlidersHorizontal,
  X,
  Wrench
} from 'lucide-react';
import { Tool, StockLimits } from '../types';

interface ToolsViewProps {
  tools: Tool[];
  stockLimits: StockLimits;
  onSelectTool: (tool: Tool) => void;
  onExportCsv: () => void;
  isCompact?: boolean;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  tools,
  stockLimits,
  onSelectTool,
  onExportCsv,
  isCompact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedStatus, setSelectedStatus] = useState<string>('Alle');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Dynamically extract categories from tools
  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((t) => {
      const cat = t.category || t.kategorie;
      if (cat && typeof cat === 'string') set.add(cat.trim());
    });
    return ['Alle', ...Array.from(set).sort()];
  }, [tools]);

  // Dynamically extract statuses
  const statusOptions = useMemo(() => {
    return [
      'Alle',
      'Verfügbar',
      'Niedriger Bestand',
      'Kein Bestand (Leer)',
      'In Maschine',
      'Verschlissen',
      'Nachgeschliffen',
      'Neu'
    ];
  }, []);

  // Filter & Search Logic
  const filteredTools = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return tools.filter((tool) => {
      // 1. Text Search across multiple fields
      if (q) {
        const searchable = [
          tool.name,
          tool.bezeichnung,
          tool.id,
          tool.sku,
          tool.artikelnummer,
          tool.category,
          tool.kategorie,
          tool.typ,
          tool.type,
          tool.diameter ? `${tool.diameter}` : '',
          tool.durchmesser ? `${tool.durchmesser}` : '',
          tool.machine,
          tool.maschine,
          tool.location,
          tool.lagerort,
          tool.manufacturer,
          tool.hersteller,
          tool.magazine,
          tool.magazin,
          tool.holder,
          tool.halter,
          tool.coating,
          tool.beschichtung,
          tool.notes,
          tool.notizen
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'Alle') {
        const toolCat = tool.category || tool.kategorie;
        if (toolCat !== selectedCategory) return false;
      }

      // 3. Status Filter
      if (selectedStatus !== 'Alle') {
        const qty = Number(tool.quantity ?? tool.bestand ?? tool.stueck ?? 0);
        const statusStr = String(tool.status || '').toLowerCase();

        if (selectedStatus === 'Verfügbar') {
          if (!statusStr.includes('verfügbar') && !statusStr.includes('verfuegbar') && !statusStr.includes('neu')) {
            return false;
          }
        } else if (selectedStatus === 'Niedriger Bestand') {
          if (qty > stockLimits.low || qty <= stockLimits.critical) return false;
        } else if (selectedStatus === 'Kein Bestand (Leer)') {
          if (qty > stockLimits.critical) return false;
        } else if (selectedStatus === 'In Maschine') {
          if (!statusStr.includes('maschine')) return false;
        } else if (selectedStatus === 'Verschlissen') {
          if (!statusStr.includes('verschlissen') && !statusStr.includes('defekt')) return false;
        } else if (selectedStatus === 'Nachgeschliffen') {
          if (!statusStr.includes('nachgeschliffen')) return false;
        } else if (selectedStatus === 'Neu') {
          if (!statusStr.includes('neu')) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let aVal: any = a[sortField] ?? a.name ?? '';
      let bVal: any = b[sortField] ?? b.name ?? '';

      if (sortField === 'bestand' || sortField === 'quantity') {
        aVal = Number(a.quantity ?? a.bestand ?? a.stueck ?? 0);
        bVal = Number(b.quantity ?? b.bestand ?? b.stueck ?? 0);
      } else if (sortField === 'diameter') {
        aVal = Number(a.diameter ?? a.durchmesser ?? 0);
        bVal = Number(b.diameter ?? b.durchmesser ?? 0);
      } else if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(String(bVal), 'de') 
          : String(bVal).localeCompare(aVal, 'de');
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tools, searchTerm, selectedCategory, selectedStatus, sortField, sortDirection, stockLimits]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getTrafficLight = (quantity: number | string | undefined) => {
    const q = Number(quantity ?? 0);
    if (isNaN(q) || q <= stockLimits.critical) {
      return {
        color: 'bg-rose-500 shadow-rose-500/50',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        label: 'Kein Bestand'
      };
    }
    if (q <= stockLimits.low) {
      return {
        color: 'bg-amber-400 shadow-amber-400/50',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'Niedrig'
      };
    }
    return {
      color: 'bg-emerald-500 shadow-emerald-500/50',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      label: 'Ausreichend'
    };
  };

  const formatDisplay = (val: any) => {
    if (val === null || val === undefined || val === '') return '–';
    return String(val);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Search & Filter Header Bar */}
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
              placeholder="🔍 Werkzeug suchen (Name, Typ, Ø, Maschine, Lagerort, Herst.)..."
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Alle Werkzeuge als CSV-Datei exportieren"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Werkzeuge als CSV exportieren</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Kategorie:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filter Clear Tag */}
          {(searchTerm || selectedCategory !== 'Alle' || selectedStatus !== 'Alle') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Alle');
                setSelectedStatus('Alle');
              }}
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20"
            >
              <X className="w-3 h-3" />
              <span>Filter zurücksetzen</span>
            </button>
          )}

          <div className="ml-auto text-slate-400 text-xs font-mono">
            Gefunden: <strong className="text-white">{filteredTools.length}</strong> von {tools.length}
          </div>
        </div>
      </div>

      {/* Main Tools Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {tools.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center">
            <Wrench className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Keine Werkzeugdaten gefunden.</h3>
            <p className="text-xs text-slate-400 max-w-md">
              In deinem verbundenen JSONBin wurden unter <code className="text-blue-400">record.tools</code> keine Daten gefunden.
            </p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Keine passenden Werkzeuge gefunden</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Versuche deine Suchbegriffe oder die Filter nach Kategorie und Status anzupassen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold select-none">
                  <th className="py-3.5 px-4 w-12 text-center">Ampel</th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Werkzeug / Bezeichnung</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Kategorie</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('diameter')}
                    className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Ø (mm)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Länge</th>
                  <th 
                    onClick={() => handleSort('quantity')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Bestand</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Maschine</th>
                  <th className="py-3.5 px-4">Lagerort</th>
                  <th className="py-3.5 px-4">Letzte Änderung</th>
                  <th className="py-3.5 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredTools.map((tool, index) => {
                  const qty = Number(tool.quantity ?? tool.bestand ?? tool.stueck ?? 0);
                  const ampel = getTrafficLight(qty);
                  const statusStr = String(tool.status || 'verfügbar').toLowerCase();
                  const diameter = tool.diameter ?? tool.durchmesser;
                  const length = tool.length ?? tool.laenge;
                  const lastChange = tool.updatedAt ?? tool.letzteAenderung;

                  let formattedDate = '–';
                  if (lastChange) {
                    try {
                      const d = new Date(lastChange);
                      if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
                                        d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                      } else {
                        formattedDate = String(lastChange);
                      }
                    } catch {
                      formattedDate = String(lastChange);
                    }
                  }

                  return (
                    <tr
                      key={tool.id || index}
                      onClick={() => onSelectTool(tool)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      {/* Bestandsampel Dot */}
                      <td className="py-3 px-4 text-center">
                        <span 
                          title={ampel.label}
                          className={`inline-block w-3 h-3 rounded-full ${ampel.color}`}
                        ></span>
                      </td>

                      {/* Werkzeug / Bezeichnung */}
                      <td className="py-3 px-4 text-white font-semibold">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base select-none">{tool.icon || '⚙️'}</span>
                          <div>
                            <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                              {tool.name || tool.bezeichnung || 'Unbenanntes Werkzeug'}
                            </div>
                            {(tool.sku || tool.artikelnummer || tool.manufacturer || tool.hersteller) && (
                              <div className="text-[11px] text-slate-400 font-mono font-normal">
                                {tool.manufacturer || tool.hersteller ? `${tool.manufacturer || tool.hersteller} · ` : ''}
                                {tool.sku || tool.artikelnummer || ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kategorie */}
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[11px]">
                          {formatDisplay(tool.category || tool.kategorie || tool.typ)}
                        </span>
                      </td>

                      {/* Durchmesser */}
                      <td className="py-3 px-3 text-slate-200 font-mono">
                        {diameter ? `Ø ${diameter} mm` : '–'}
                      </td>

                      {/* Länge */}
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {length ? `${length} mm` : '–'}
                      </td>

                      {/* Bestand mit Ampel Badge */}
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-full text-xs border ${ampel.badge}`}>
                          <span>{qty}</span>
                          <span className="text-[10px] font-sans font-normal opacity-80">Stk.</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          statusStr.includes('verfügbar') || statusStr.includes('verfuegbar') || statusStr.includes('neu')
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : statusStr.includes('maschine')
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                            : statusStr.includes('verschlissen')
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {formatDisplay(tool.status)}
                        </span>
                      </td>

                      {/* Maschine */}
                      <td className="py-3 px-4 text-slate-300">
                        {formatDisplay(tool.machine || tool.maschine)}
                      </td>

                      {/* Lagerort */}
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {formatDisplay(tool.location || tool.lagerort)}
                      </td>

                      {/* Letzte Änderung */}
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Details Icon */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTool(tool);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all"
                          title="Alle Werkzeugdetails anzeigen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Summary */}
        <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div>
            Angezeigt: <strong className="text-white font-mono">{filteredTools.length}</strong> von {tools.length} Werkzeugen
          </div>
          <div className="text-[11px] text-slate-500">
            Tipp: Klicke auf eine Tabellenzeile, um das vollständige Werkzeug-Detailfenster zu öffnen.
          </div>
        </div>
      </div>
    </div>
  );
};
