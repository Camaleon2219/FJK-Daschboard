import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  Layers, 
  MapPin, 
  Cpu, 
  ExternalLink, 
  Code2, 
  FileText, 
  Info,
  Calendar,
  Sparkles,
  Droplet
} from 'lucide-react';
import { Tool, StockLimits } from '../types';

interface ToolDetailModalProps {
  tool: Tool | null;
  onClose: () => void;
  stockLimits: StockLimits;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  tool,
  onClose,
  stockLimits
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!tool) return null;

  // Recognized known keys
  const knownKeys = new Set([
    'id', 'name', 'bezeichnung', 'category', 'kategorie', 'typ', 'type',
    'diameter', 'durchmesser', 'shank', 'schaft', 'length', 'laenge',
    'flutes', 'schneiden', 'coating', 'beschichtung', 'material', 'werkstoff',
    'manufacturer', 'hersteller', 'sku', 'artikelnummer', 'magazine', 'magazin',
    'holder', 'halter', 'zLength', 'zLaenge', 'coolant', 'kuehlung',
    'machine', 'maschine', 'location', 'lagerort', 'status',
    'quantity', 'bestand', 'stueck', 'notes', 'notizen',
    'updatedAt', 'letzteAenderung', 'updatedBy', 'icon', 'image', 'imageUrl',
    'link', 'history'
  ]);

  // Extract any unknown additional properties
  const extraProperties = Object.entries(tool).filter(
    ([key]) => !knownKeys.has(key) && !key.startsWith('_')
  );

  const qty = Number(tool.quantity ?? tool.bestand ?? tool.stueck ?? 0);
  const isCritical = qty <= stockLimits.low;
  const isEmpty = qty <= stockLimits.critical;

  const formatVal = (v: any) => {
    if (v === null || v === undefined || v === '') return '–';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {tool.icon || '⚙️'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                  {formatVal(tool.category || tool.kategorie || tool.typ)}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isEmpty 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : isCritical 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Bestand: {qty} Stk.
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Status: {formatVal(tool.status)}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {tool.name || tool.bezeichnung || 'Unbenanntes Werkzeug'}
              </h3>
              {(tool.manufacturer || tool.hersteller || tool.sku || tool.artikelnummer) && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {tool.manufacturer || tool.hersteller} {tool.sku || tool.artikelnummer ? `· Art.-Nr: ${tool.sku || tool.artikelnummer}` : ''}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Core Geometric CNC Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>Geometrie &amp; Spezifikationen</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Durchmesser</span>
                <span className="text-base font-bold text-white font-mono">
                  {tool.diameter ?? tool.durchmesser ? `Ø ${tool.diameter ?? tool.durchmesser} mm` : '–'}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Schaft Ø</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {tool.shank ?? tool.schaft ? `${tool.shank ?? tool.schaft} mm` : '–'}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Gesamtlänge</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {tool.length ?? tool.laenge ? `${tool.length ?? tool.laenge} mm` : '–'}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Schneiden (Z)</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {formatVal(tool.flutes ?? tool.schneiden)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Beschichtung</span>
                <span className="text-sm font-semibold text-slate-200">
                  {formatVal(tool.coating ?? tool.beschichtung)}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Schneidstoff</span>
                <span className="text-sm font-semibold text-slate-200">
                  {formatVal(tool.material ?? tool.werkstoff)}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-cyan-400" /> Kühlung
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {formatVal(tool.coolant ?? tool.kuehlung)}
                </span>
              </div>
            </div>
          </div>

          {/* Machine & Storage Placement */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Maschine &amp; Lagerplatzierung</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Lagerort</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatVal(tool.location ?? tool.lagerort)}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Maschine</span>
                <span className="text-sm font-semibold text-slate-200">
                  {formatVal(tool.machine ?? tool.maschine)}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Magazin-Platz</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {formatVal(tool.magazine ?? tool.magazin)}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Halter / Aufnahme</span>
                <span className="text-sm font-semibold text-slate-200">
                  {formatVal(tool.holder ?? tool.halter)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Z-Länge (Messung)</span>
                <span className="text-sm font-bold text-white font-mono">
                  {tool.zLength ?? tool.zLaenge ? `${tool.zLength ?? tool.zLaenge} mm` : '–'}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Letzte Änderung</span>
                <span className="text-sm font-semibold text-slate-300 font-mono">
                  {formatVal(tool.updatedAt ?? tool.letzteAenderung)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Cutting Data */}
          {(tool.notes || tool.notizen) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Notizen &amp; Schnittdaten</span>
              </h4>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                {tool.notes || tool.notizen}
              </div>
            </div>
          )}

          {/* External Link */}
          {tool.link && (
            <div>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Hersteller-Link / Datenblatt aufrufen</span>
              </a>
            </div>
          )}

          {/* Unbekannte zusätzliche Eigenschaften (Requirement 10) */}
          {extraProperties.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Weitere vorhandene Datenfelder ({extraProperties.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {extraProperties.map(([key, value]) => (
                  <div key={key} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs flex justify-between gap-3 items-center">
                    <span className="font-mono text-purple-300 font-semibold truncate max-w-[150px]">{key}</span>
                    <span className="text-slate-200 font-mono text-right truncate">{formatVal(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Inspector Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'JSON-Objekt ausblenden' : 'Rohdaten (JSON) ansehen'}</span>
            </button>
            {showRawJson && (
              <pre className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-blue-300 overflow-x-auto max-h-56 scrollbar-thin">
                {JSON.stringify(tool, null, 2)}
              </pre>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
