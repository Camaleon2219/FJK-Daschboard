import { Tool, HistoryEntry, DashboardConfig, StockLimits } from '../types';

export interface FetchResult {
  success: boolean;
  tools: Tool[];
  history: HistoryEntry[];
  rawRecord?: any;
  error?: string;
  isOfflineFallback?: boolean;
  isFromCache?: boolean;
  timestamp?: string;
}

const STORAGE_KEYS = {
  BIN_ID: 'fjk_cnc_dashboard_bin_id',
  READ_KEY: 'fjk_cnc_dashboard_read_key',
  CACHE_TOOLS: 'fjk_cnc_dashboard_cache_tools',
  CACHE_HISTORY: 'fjk_cnc_dashboard_cache_history',
  CACHE_TIME: 'fjk_cnc_dashboard_cache_time',
  AUTO_REFRESH: 'fjk_cnc_dashboard_auto_refresh',
  STOCK_LIMITS: 'fjk_cnc_dashboard_stock_limits',
  THEME_COMPACT: 'fjk_cnc_dashboard_compact'
};

export function loadConfig(): DashboardConfig {
  const savedLimits = localStorage.getItem(STORAGE_KEYS.STOCK_LIMITS);
  let stockLimits: StockLimits = { low: 3, critical: 0 };
  if (savedLimits) {
    try {
      stockLimits = JSON.parse(savedLimits);
    } catch {}
  }

  return {
    binId: localStorage.getItem(STORAGE_KEYS.BIN_ID) || '',
    readKey: localStorage.getItem(STORAGE_KEYS.READ_KEY) || '',
    autoRefreshInterval: parseInt(localStorage.getItem(STORAGE_KEYS.AUTO_REFRESH) || '0', 10),
    stockLimits,
    lastSyncTime: localStorage.getItem(STORAGE_KEYS.CACHE_TIME) || null
  };
}

export function saveConfig(config: DashboardConfig) {
  if (config.binId !== undefined) localStorage.setItem(STORAGE_KEYS.BIN_ID, config.binId.trim());
  if (config.readKey !== undefined) localStorage.setItem(STORAGE_KEYS.READ_KEY, (config.readKey || '').trim());
  if (config.autoRefreshInterval !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AUTO_REFRESH, String(config.autoRefreshInterval));
  }
  if (config.stockLimits) {
    localStorage.setItem(STORAGE_KEYS.STOCK_LIMITS, JSON.stringify(config.stockLimits));
  }
}

export function clearCache() {
  localStorage.removeItem(STORAGE_KEYS.CACHE_TOOLS);
  localStorage.removeItem(STORAGE_KEYS.CACHE_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.CACHE_TIME);
}

export function loadCachedData(): { tools: Tool[]; history: HistoryEntry[]; timestamp: string | null } | null {
  const cache = getCachedData();
  if (cache.tools.length > 0 || cache.history.length > 0) {
    return {
      tools: cache.tools,
      history: cache.history,
      timestamp: cache.cachedTime
    };
  }
  return null;
}

export async function testJsonBinConnection(binId: string, readKey?: string): Promise<boolean> {
  const cleanId = sanitizeBinId(binId);
  if (!cleanId) return false;

  const endpoint = `https://api.jsonbin.io/v3/b/${cleanId}/latest`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const key = (readKey || '').trim();
  if (key) {
    headers['X-Master-Key'] = key;
    headers['X-Access-Key'] = key;
  }

  try {
    const res = await fetch(endpoint, { method: 'GET', headers });
    return res.ok;
  } catch {
    return false;
  }
}

export function getStoredConfig() {
  return {
    binId: localStorage.getItem(STORAGE_KEYS.BIN_ID) || '',
    readKey: localStorage.getItem(STORAGE_KEYS.READ_KEY) || '',
    autoRefresh: parseInt(localStorage.getItem(STORAGE_KEYS.AUTO_REFRESH) || '0', 10),
    lastSyncTime: localStorage.getItem(STORAGE_KEYS.CACHE_TIME) || null
  };
}

export function saveStoredConfig(binId: string, readKey: string, autoRefresh?: number) {
  if (binId) localStorage.setItem(STORAGE_KEYS.BIN_ID, binId.trim());
  localStorage.setItem(STORAGE_KEYS.READ_KEY, (readKey || '').trim());
  if (autoRefresh !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AUTO_REFRESH, String(autoRefresh));
  }
}

export function clearStoredConfig() {
  localStorage.removeItem(STORAGE_KEYS.BIN_ID);
  localStorage.removeItem(STORAGE_KEYS.READ_KEY);
  localStorage.removeItem(STORAGE_KEYS.CACHE_TOOLS);
  localStorage.removeItem(STORAGE_KEYS.CACHE_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.CACHE_TIME);
}

export function getCachedData(): { tools: Tool[]; history: HistoryEntry[]; cachedTime: string | null } {
  try {
    const rawTools = localStorage.getItem(STORAGE_KEYS.CACHE_TOOLS);
    const rawHistory = localStorage.getItem(STORAGE_KEYS.CACHE_HISTORY);
    const cachedTime = localStorage.getItem(STORAGE_KEYS.CACHE_TIME);

    return {
      tools: rawTools ? JSON.parse(rawTools) : [],
      history: rawHistory ? JSON.parse(rawHistory) : [],
      cachedTime
    };
  } catch (err) {
    console.warn('Fehler beim Lesen des Caches:', err);
    return { tools: [], history: [], cachedTime: null };
  }
}

export function setCachedData(tools: Tool[], history: HistoryEntry[]) {
  try {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CACHE_TOOLS, JSON.stringify(tools));
    localStorage.setItem(STORAGE_KEYS.CACHE_HISTORY, JSON.stringify(history));
    localStorage.setItem(STORAGE_KEYS.CACHE_TIME, now);
    return now;
  } catch (err) {
    console.warn('Fehler beim Speichern in Cache:', err);
    return null;
  }
}

export function sanitizeBinId(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  // If user pasted a full URL like https://api.jsonbin.io/v3/b/66123456.../latest or https://jsonbin.io/app/bins/66...
  const match = trimmed.match(/([a-f0-9]{24})/i);
  if (match) return match[1].toLowerCase();
  return trimmed;
}

export async function fetchJsonBinData(binId: string, readKey?: string): Promise<FetchResult> {
  const cleanId = sanitizeBinId(binId);
  if (!cleanId) {
    return {
      success: false,
      tools: [],
      history: [],
      error: 'Keine gültige BIN-ID angegeben.'
    };
  }

  const endpoint = `https://api.jsonbin.io/v3/b/${cleanId}/latest`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const key = (readKey || '').trim();
  if (key) {
    headers['X-Master-Key'] = key;
    headers['X-Access-Key'] = key;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      let errorText = `HTTP ${response.status}: `;
      if (response.status === 404) {
        errorText += 'Bin-ID nicht gefunden. Bitte prüfe die ID.';
      } else if (response.status === 401 || response.status === 403) {
        errorText += 'Zugriff verweigert. Dieser Bin ist privat – bitte gültigen Read-Key / Master-Key angeben.';
      } else {
        const text = await response.text().catch(() => '');
        errorText += text || response.statusText || 'Netzwerkfehler.';
      }
      throw new Error(errorText);
    }

    const data = await response.json();
    
    // JSONBin returns { record: { ... }, metadata: { ... } }
    const record = data.record || data;

    // Extract tools: can be record.tools or record.werkzeuge or array
    let extractedTools: Tool[] = [];
    if (Array.isArray(record.tools)) {
      extractedTools = record.tools;
    } else if (Array.isArray(record.werkzeuge)) {
      extractedTools = record.werkzeuge;
    } else if (Array.isArray(record)) {
      extractedTools = record;
    }

    // Extract history: can be record.history or record.historie or record.auditLog
    let extractedHistory: HistoryEntry[] = [];
    if (Array.isArray(record.history)) {
      extractedHistory = record.history;
    } else if (Array.isArray(record.historie)) {
      extractedHistory = record.historie;
    } else if (Array.isArray(record.auditLog)) {
      extractedHistory = record.auditLog;
    }

    const now = new Date().toISOString();
    setCachedData(extractedTools, extractedHistory);

    return {
      success: true,
      tools: extractedTools,
      history: extractedHistory,
      rawRecord: record,
      timestamp: now
    };
  } catch (err: any) {
    console.warn('JSONBin fetch failed:', err);
    // Try to load cached data
    const cached = getCachedData();
    if (cached.tools.length > 0 || cached.history.length > 0) {
      return {
        success: false,
        tools: cached.tools,
        history: cached.history,
        isOfflineFallback: true,
        isFromCache: true,
        timestamp: cached.cachedTime || undefined,
        error: `Die Daten konnten nicht geladen werden: ${err.message || 'Verbindung fehlgeschlagen'}. Es werden lokal gespeicherte Offline-Daten angezeigt.`
      };
    }

    return {
      success: false,
      tools: [],
      history: [],
      error: `Die Daten konnten nicht geladen werden: ${err.message || 'Bitte überprüfe die BIN-ID und den Read-Key.'}`
    };
  }
}
