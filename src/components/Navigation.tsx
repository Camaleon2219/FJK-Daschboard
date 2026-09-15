import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  History, 
  BarChart3, 
  Settings, 
  RotateCw, 
  Wifi, 
  WifiOff, 
  CloudCheck, 
  AlertCircle,
  Download
} from 'lucide-react';
import { NavTab, ConnectionStatus } from '../types';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  status: ConnectionStatus;
  lastSyncTime: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalTools: number;
  totalPieces: number;
  binId: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  status,
  lastSyncTime,
  onRefresh,
  isRefreshing,
  totalTools,
  totalPieces,
  binId
}) => {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'Noch nicht synchronisiert';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            JSONBin Status: Verbunden
          </span>
        );
      case 'updating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <RotateCw className="w-3 h-3 animate-spin text-amber-400" />
            Aktualisierung läuft...
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <WifiOff className="w-3 h-3" />
            Offline – zuletzt geladene Daten
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            Verbindung fehlgeschlagen
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600">
            <WifiOff className="w-3 h-3" />
            Nicht verbunden
          </span>
        );
    }
  };

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tools' as NavTab, label: 'Werkzeuge', icon: Wrench, count: totalTools },
    { id: 'history' as NavTab, label: 'Historie', icon: History },
    { id: 'statistics' as NavTab, label: 'Statistiken', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Einstellungen', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner with Brand, Status & Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-mono font-bold text-xl tracking-tighter border border-blue-400/30">
              FJK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  FJK CNC Dashboard
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Read-Only
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                <span>{getStatusBadge()}</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="text-slate-400 font-mono">
                  Letzte Aktualisierung: <span className="text-slate-200 font-medium">{formatTime(lastSyncTime)}</span>
                </span>
                {binId && (
                  <>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="font-mono text-slate-400 text-[11px] truncate max-w-[140px]" title={binId}>
                      Bin: <span className="text-blue-400">{binId.slice(0, 8)}...</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Refresh Button */}
          <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center">
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <div className="text-slate-400">Typen: <strong className="text-white font-mono">{totalTools}</strong></div>
              <div className="text-slate-600">|</div>
              <div className="text-slate-400">Bestand: <strong className="text-blue-400 font-mono">{totalPieces} Stk.</strong></div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing || !binId}
              title="Daten aus JSONBin jetzt neu abrufen"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>↻ Aktualisieren</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
