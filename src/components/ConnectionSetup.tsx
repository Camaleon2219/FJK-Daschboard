import React, { useState } from 'react';
import { Database, Key, ArrowRight, ShieldCheck, Info, Sparkles, AlertCircle } from 'lucide-react';
import { sanitizeBinId } from '../utils/jsonbin';

interface ConnectionSetupProps {
  onConnect: (binId: string, readKey: string) => Promise<void>;
  onLoadDemo: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  initialBinId?: string;
  initialReadKey?: string;
}

export const ConnectionSetup: React.FC<ConnectionSetupProps> = ({
  onConnect,
  onLoadDemo,
  isLoading = false,
  errorMessage,
  initialBinId = '',
  initialReadKey = ''
}) => {
  const [binId, setBinId] = useState(initialBinId);
  const [readKey, setReadKey] = useState(initialReadKey);
  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isBusy = isLoading || localLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanId = sanitizeBinId(binId);
    if (!cleanId) {
      setValidationError('Bitte gib eine gültige JSONBin Bin-ID ein (z.B. 66a9246bffd5d1605309592b oder vollständige URL).');
      return;
    }

    setLocalLoading(true);
    try {
      await onConnect(cleanId, readKey);
    } catch (err: any) {
      setValidationError(err.message || 'Verbindung konnte nicht hergestellt werden.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25 mb-4 border border-blue-400/30">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            FJK CNC Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Noch keine Datenquelle verbunden.
          </p>
        </div>

        {/* Read-Only Notice */}
        <div className="mb-6 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Sicher &amp; Read-Only: </span>
            Diese Anwendung liest ausschließlich Daten aus deinem bestehenden JSONBin (<code className="text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded">record.tools</code> &amp; <code className="text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded">record.history</code>). Deine Daten werden nicht verändert oder überschrieben.
          </div>
        </div>

        {/* Error Alert */}
        {(errorMessage || validationError) && (
          <div className="mb-5 bg-rose-500/15 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Verbindungsfehler:</strong>
              {validationError || errorMessage}
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>BIN-ID *</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">24-stellige Hex-ID oder voller Link</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={binId}
                onChange={(e) => {
                  setBinId(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="z.B. 66a9246bffd5d1605309592b"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>READ KEY (Optional)</span>
              <span className="text-[11px] font-normal text-slate-500">Nur bei privaten Bins nötig</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={readKey}
                onChange={(e) => setReadKey(e.target.value)}
                placeholder="z.B. $2a$10$..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Falls dein Bin öffentlich ist (Public Bin), kannst du das Feld leer lassen.
            </p>
          </div>

          <button
            type="submit"
            disabled={isBusy || !binId.trim()}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-[0.99]"
          >
            {isBusy ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Verbindung wird hergestellt...</span>
              </>
            ) : (
              <>
                <span>Verbinden</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Data Option */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-3">
            Noch keine Bin-ID zur Hand?
          </p>
          <button
            type="button"
            onClick={onLoadDemo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition-all hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Beispieldaten ausprobieren (Demo-Modus)</span>
          </button>
        </div>

        {/* Info Footnote */}
        <div className="mt-4 text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Die Verbindung wird dauerhaft in deinem Browser gespeichert.</span>
        </div>
      </div>
    </div>
  );
};
