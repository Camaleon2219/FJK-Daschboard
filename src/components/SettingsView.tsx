import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Key, 
  RotateCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sliders, 
  Download, 
  Sun, 
  Moon, 
  Code2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { StockLimits, ConnectionStatus } from '../types';
import { sanitizeBinId } from '../utils/jsonbin';

interface SettingsViewProps {
  binId: string;
  readKey: string;
  autoRefreshInterval: number; // in seconds
  stockLimits: StockLimits;
  status: ConnectionStatus;
  onSaveConfig: (newBinId: string, newReadKey: string, autoRefresh: number) => Promise<void>;
  onTestConnection: (binId: string, readKey: string) => Promise<boolean>;
  onDisconnect: () => void;
  onClearCache: () => void;
  onUpdateStockLimits: (limits: StockLimits) => void;
  onDownloadStandaloneHtml: () => void;
  rawRecord?: any;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  binId,
  readKey,
  autoRefreshInterval,
  stockLimits,
  status,
  onSaveConfig,
  onTestConnection,
  onDisconnect,
  onClearCache,
  onUpdateStockLimits,
  onDownloadStandaloneHtml,
  rawRecord
}) => {
  const [inputBinId, setInputBinId] = useState(binId);
  const [inputReadKey, setInputReadKey] = useState(readKey);
  const [inputAutoRefresh, setInputAutoRefresh] = useState(autoRefreshInterval);
  const [inputLowLimit, setInputLowLimit] = useState(stockLimits.low);
  const [inputCriticalLimit, setInputCriticalLimit] = useState(stockLimits.critical);
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection(inputBinId, inputReadKey);
      if (ok) {
        setTestResult({ success: true, message: 'Verbindung zu JSONBin war erfolgreich!' });
      } else {
        setTestResult({ success: false, message: 'Verbindung fehlgeschlagen. Bitte BIN-ID und Read-Key prüfen.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Verbindungstest fehlgeschlagen.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSaveConfig(inputBinId, inputReadKey, inputAutoRefresh);
      onUpdateStockLimits({
        low: Number(inputLowLimit) || 3,
        critical: Number(inputCriticalLimit) || 0
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          <span>Dashboard-Einstellungen</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Verwalte die JSONBin-Datenquelle, automatische Aktualisierung, Bestandsgrenzwerte und Exportmöglichkeiten.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Section 1: JSONBin Verbindung */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>1. JSONBin Datenquelle</span>
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              status === 'connected' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {status === 'connected' ? 'Verbunden' : 'Nicht verbunden'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>BIN-ID *</span>
                <span className="text-[11px] font-normal text-slate-500">Endpunkt: https://api.jsonbin.io/v3/b/{'{BIN_ID}'}/latest</span>
              </label>
              <input
                type="text"
                value={inputBinId}
                onChange={(e) => setInputBinId(e.target.value)}
                placeholder="z.B. 66a9246bffd5d1605309592b"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>READ KEY (Optional)</span>
                <span className="text-[11px] font-normal text-slate-500">Nur bei privaten Bins erforderlich</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={inputReadKey}
                  onChange={(e) => setInputReadKey(e.target.value)}
                  placeholder="X-Master-Key / X-Access-Key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !inputBinId.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                {isTesting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Testet...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Verbindung testen</span>
                  </>
                )}
              </button>

              {binId && (
                <a
                  href={`https://api.jsonbin.io/v3/b/${sanitizeBinId(inputBinId || binId)}/latest`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Im Browser öffnen</span>
                </a>
              )}
            </div>

            {binId && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Möchtest du die Verbindung zu diesem JSONBin wirklich trennen?')) {
                    onDisconnect();
                    setInputBinId('');
                    setInputReadKey('');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                <span>Verbindung trennen</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Automatische Aktualisierung (Requirement 14 & 20) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-indigo-400" />
              <span>2. Automatische Aktualisierung</span>
            </h3>
            <span className="text-xs text-slate-400">Hintergrund-Synchronisation</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Auto-Refresh Intervall
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { value: 0, label: 'Aus' },
                { value: 30, label: '30 Sekunden' },
                { value: 60, label: '60 Sekunden' },
                { value: 300, label: '5 Minuten' },
                { value: 900, label: '15 Minuten' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInputAutoRefresh(opt.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    inputAutoRefresh === opt.value
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Wenn aktiv, ruft das Dashboard im Hintergrund neue Daten ab, ohne die Seite neu zu laden.
            </p>
          </div>
        </div>

        {/* Section 3: Bestandsampel Grenzwerte */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>3. Bestandsampel Grenzwerte</span>
            </h3>
            <span className="text-xs text-slate-400">STOCK_LIMITS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                🟡 Niedriger Bestand Schwelle (≤ Stk.)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={inputLowLimit}
                onChange={(e) => setInputLowLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard: 3 Stück. Werkzeuge mit diesem Bestand oder weniger werden gelb markiert.
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                🔴 Kritischer / Kein Bestand Schwelle (≤ Stk.)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={inputCriticalLimit}
                onChange={(e) => setInputCriticalLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard: 0 Stück. Werkzeuge mit 0 Stück werden rot markiert.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Lokale Daten & Cache (Requirement 20) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>4. Lokaler Speicher &amp; Cache</span>
            </h3>
            <span className="text-xs text-slate-400">Browser localStorage</span>
          </div>

          <p className="text-xs text-slate-400">
            Das Dashboard speichert den zuletzt geladenen Stand lokal im Browser, um im Offline-Fall oder bei kurzen Verbindungsproblemen die letzten Daten sofort anzuzeigen.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (confirm('Lokalen Cache leeren? Beim nächsten Start müssen die Daten aus JSONBin neu geladen werden.')) {
                  onClearCache();
                  alert('Lokaler Cache wurde erfolgreich geleert.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cache löschen</span>
            </button>

            {rawRecord && (
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Rohdaten verbergen' : 'Rohdaten (JSON) inspizieren'}</span>
              </button>
            )}
          </div>

          {showRawJson && rawRecord && (
            <pre className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-blue-300 overflow-x-auto max-h-60 scrollbar-thin">
              {JSON.stringify(rawRecord, null, 2)}
            </pre>
          )}
        </div>

        {/* Section 5: Standalone Single-File HTML Download (Requirement 22 & 25) */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950/30 border border-blue-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>5. Standalone Datei: FJK_CNC_Dashboard.html</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Offline-Fähig
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Möchtest du das <strong>FJK CNC Dashboard</strong> direkt per Doppelklick als eigenständige Datei auf einem Werkstatt-PC oder Tablet nutzen?
            Lade die fertige <code className="text-emerald-300 font-mono">FJK_CNC_Dashboard.html</code> herunter – komplett mit HTML, CSS und Vanilla JavaScript, ohne Build-Tools oder Installation.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={onDownloadStandaloneHtml}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>📥 FJK_CNC_Dashboard.html herunterladen</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
          <div className="text-xs text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Einstellungen erfolgreich gespeichert!
              </span>
            ) : (
              <span>Änderungen speichern &amp; anwenden</span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <span>Einstellungen speichern</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
