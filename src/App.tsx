import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { ConnectionSetup } from './components/ConnectionSetup';
import { DashboardView } from './components/DashboardView';
import { ToolsView } from './components/ToolsView';
import { HistoryView } from './components/HistoryView';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import { ToolDetailModal } from './components/ToolDetailModal';
import { 
  fetchJsonBinData, 
  testJsonBinConnection, 
  loadCachedData, 
  clearCache, 
  loadConfig, 
  saveConfig 
} from './utils/jsonbin';
import { exportToolsToCsv, exportHistoryToCsv } from './utils/csvExport';
import { DEMO_RECORD } from './utils/demoData';
import { Tool, HistoryEntry, ConnectionStatus, DashboardConfig, StockLimits, NavTab } from './types';
import { Download, AlertTriangle } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<DashboardConfig>(() => loadConfig());
  const [tools, setTools] = useState<Tool[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rawRecord, setRawRecord] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const autoRefreshTimerRef = useRef<number | null>(null);

  // Total physical pieces count
  const totalPieces = tools.reduce((sum, t) => {
    const q = Number(t.quantity ?? t.bestand ?? t.stueck ?? 1);
    return sum + (isNaN(q) || q < 0 ? 0 : q);
  }, 0);

  // Initialize data loading
  const loadData = useCallback(async (isSilent = false) => {
    if (!config.binId) {
      // Check if there is cache available
      const cached = loadCachedData();
      if (cached) {
        setTools(cached.tools);
        setHistory(cached.history);
        setLastUpdated(cached.timestamp);
        setStatus('offline');
      } else {
        setStatus('disconnected');
      }
      return;
    }

    if (!isSilent) setIsRefreshing(true);
    setStatus('updating');
    setErrorMessage(null);

    try {
      const result = await fetchJsonBinData(config.binId, config.readKey);

      setTools(result.tools);
      setHistory(result.history);
      setRawRecord(result.rawRecord);
      setLastUpdated(result.timestamp);
      setStatus(result.isFromCache ? 'offline' : 'connected');

      if (result.error && result.isFromCache) {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verbindung zu JSONBin fehlgeschlagen.');
      setStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  }, [config.binId, config.readKey]);

  // Initial load on mount
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Auto-refresh interval management
  useEffect(() => {
    if (autoRefreshTimerRef.current) {
      window.clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }

    if (config.autoRefreshInterval > 0 && config.binId && status !== 'disconnected') {
      autoRefreshTimerRef.current = window.setInterval(() => {
        loadData(true);
      }, config.autoRefreshInterval * 1000);
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        window.clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [config.autoRefreshInterval, config.binId, status, loadData]);

  // Connect from setup screen
  const handleConnect = async (binId: string, readKey: string) => {
    const newConfig: DashboardConfig = {
      ...config,
      binId,
      readKey
    };
    saveConfig(newConfig);
    setConfig(newConfig);

    // Immediate fetch
    setStatus('updating');
    try {
      const result = await fetchJsonBinData(binId, readKey);
      setTools(result.tools);
      setHistory(result.history);
      setRawRecord(result.rawRecord);
      setLastUpdated(result.timestamp);
      setStatus(result.isFromCache ? 'offline' : 'connected');
      setActiveTab('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Abrufen der Daten.');
      setStatus('error');
    }
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    const demoTools = DEMO_RECORD.tools as Tool[];
    const demoHistory = DEMO_RECORD.history as HistoryEntry[];
    setTools(demoTools);
    setHistory(demoHistory);
    setRawRecord(DEMO_RECORD);
    setLastUpdated(new Date().toISOString());
    setStatus('connected');
    setActiveTab('dashboard');
  };

  // Save config from settings page
  const handleSaveConfig = async (newBinId: string, newReadKey: string, autoRefresh: number) => {
    const updated: DashboardConfig = {
      ...config,
      binId: newBinId,
      readKey: newReadKey,
      autoRefreshInterval: autoRefresh
    };
    saveConfig(updated);
    setConfig(updated);
    await loadData(false);
  };

  // Disconnect
  const handleDisconnect = () => {
    clearCache();
    const resetCfg: DashboardConfig = {
      ...config,
      binId: '',
      readKey: ''
    };
    saveConfig(resetCfg);
    setConfig(resetCfg);
    setTools([]);
    setHistory([]);
    setRawRecord(null);
    setLastUpdated(null);
    setStatus('disconnected');
  };

  // Clear Cache
  const handleClearCache = () => {
    clearCache();
    if (!config.binId) {
      setTools([]);
      setHistory([]);
      setStatus('disconnected');
    }
  };

  // Update stock limits
  const handleUpdateStockLimits = (limits: StockLimits) => {
    const updated: DashboardConfig = {
      ...config,
      stockLimits: limits
    };
    saveConfig(updated);
    setConfig(updated);
  };

  // CSV Exports
  const handleExportTools = () => {
    exportToolsToCsv(tools);
  };

  const handleExportHistory = () => {
    exportHistoryToCsv(history);
  };

  // Download Standalone HTML file
  const handleDownloadStandaloneHtml = () => {
    const link = document.createElement('a');
    link.href = '/FJK_CNC_Dashboard.html';
    link.download = 'FJK_CNC_Dashboard.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Windows Batch file for Electron .EXE
  const handleDownloadBatFile = () => {
    const link = document.createElement('a');
    link.href = '/build-electron-app.bat';
    link.download = 'build-electron-app.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show setup if disconnected and no tools
  const showSetup = status === 'disconnected' && tools.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        lastSyncTime={lastUpdated}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        totalTools={tools.length}
        totalPieces={totalPieces}
        binId={config.binId}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Offline / Error Warning Banner if data is cached or unreachable */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong className="block text-amber-300 font-semibold mb-0.5">Hinweis zur Verbindung:</strong>
              {errorMessage}
              {status === 'offline' && ' Das Dashboard zeigt die zuletzt erfolgreich geladenen Daten aus dem Browser-Cache an.'}
            </div>
          </div>
        )}

        {/* View Routing */}
        {showSetup ? (
          <ConnectionSetup
            onConnect={handleConnect}
            onLoadDemo={handleLoadDemo}
            initialBinId={config.binId}
            initialReadKey={config.readKey}
            isLoading={isRefreshing || status === 'updating'}
            errorMessage={errorMessage}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                tools={tools}
                history={history}
                stockLimits={config.stockLimits}
                setActiveTab={setActiveTab}
                onSelectTool={(tool) => setSelectedTool(tool)}
                onExportTools={handleExportTools}
                onExportHistory={handleExportHistory}
              />
            )}

            {activeTab === 'tools' && (
              <ToolsView
                tools={tools}
                stockLimits={config.stockLimits}
                onSelectTool={(tool) => setSelectedTool(tool)}
                onExportCsv={handleExportTools}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onExportCsv={handleExportHistory}
              />
            )}

            {activeTab === 'statistics' && (
              <StatisticsView
                tools={tools}
                history={history}
                stockLimits={config.stockLimits}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                binId={config.binId}
                readKey={config.readKey}
                autoRefreshInterval={config.autoRefreshInterval}
                stockLimits={config.stockLimits}
                status={status}
                onSaveConfig={handleSaveConfig}
                onTestConnection={testJsonBinConnection}
                onDisconnect={handleDisconnect}
                onClearCache={handleClearCache}
                onUpdateStockLimits={handleUpdateStockLimits}
                onDownloadStandaloneHtml={handleDownloadStandaloneHtml}
                onDownloadBatFile={handleDownloadBatFile}
                rawRecord={rawRecord}
              />
            )}
          </>
        )}
      </main>

      {/* Tool Detail Modal (Inspect properties and unknown fields) */}
      <ToolDetailModal
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
        stockLimits={config.stockLimits}
      />

      {/* Modern Industrial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">FJK CNC Dashboard</strong> · Eigenständige Read-Only Werkzeugübersicht
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-mono text-slate-500">JSONBin.io Endpoint /v3/b/latest</span>
            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>FJK_CNC_Dashboard.html</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadBatFile}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>build-electron-app.bat</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
