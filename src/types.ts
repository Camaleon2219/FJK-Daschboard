export interface Tool {
  id?: string | number;
  name?: string;
  bezeichnung?: string;
  category?: string;
  kategorie?: string;
  typ?: string;
  type?: string;
  diameter?: string | number;
  durchmesser?: string | number;
  shank?: string | number;
  schaft?: string | number;
  length?: string | number;
  laenge?: string | number;
  flutes?: string | number;
  schneiden?: string | number;
  coating?: string;
  beschichtung?: string;
  material?: string;
  werkstoff?: string;
  manufacturer?: string;
  hersteller?: string;
  sku?: string;
  artikelnummer?: string;
  magazine?: string;
  magazin?: string;
  holder?: string;
  halter?: string;
  zLength?: string | number;
  zLaenge?: string | number;
  coolant?: string;
  kuehlung?: string;
  machine?: string;
  maschine?: string;
  location?: string;
  lagerort?: string;
  status?: string;
  quantity?: string | number;
  bestand?: string | number;
  stueck?: string | number;
  notes?: string;
  notizen?: string;
  updatedAt?: string;
  letzteAenderung?: string;
  updatedBy?: string;
  icon?: string;
  image?: string;
  imageUrl?: string;
  link?: string;
  [key: string]: any;
}

export interface HistoryEntry {
  id?: string | number;
  timestamp?: string;
  zeitstempel?: string;
  date?: string;
  datum?: string;
  time?: string;
  uhrzeit?: string;
  userName?: string;
  benutzer?: string;
  user?: string;
  action?: string;
  aktion?: string;
  toolId?: string | number;
  toolName?: string;
  werkzeug?: string;
  quantity?: string | number;
  menge?: string | number;
  machine?: string;
  maschine?: string;
  details?: string;
  changes?: string[] | string;
  [key: string]: any;
}

export interface StockLimits {
  low: number;
  critical: number;
}

export interface DashboardConfig {
  binId: string;
  readKey: string;
  autoRefreshInterval: number; // in seconds
  stockLimits: StockLimits;
  theme?: 'dark' | 'light';
  lastSyncTime?: string | null;
}

export interface JsonBinConfig {
  binId: string;
  readKey: string;
  autoRefreshInterval: number; // in seconds (0 = off)
  lastSyncTime: string | null;
  cachedAt: string | null;
}

export type ConnectionStatus = 'connected' | 'updating' | 'error' | 'offline' | 'disconnected';

export type NavTab = 'dashboard' | 'tools' | 'history' | 'statistics' | 'settings';
