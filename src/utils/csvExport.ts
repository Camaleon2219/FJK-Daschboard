import { Tool, HistoryEntry } from '../types';

function downloadCsv(content: string, filename: string) {
  // Use UTF-8 BOM so Excel opens German special characters (ä, ö, ü, ß, Ø) properly
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToolsToCsv(tools: Tool[]) {
  const headers = [
    'Werkzeug-ID',
    'Bezeichnung',
    'Kategorie',
    'Status',
    'Bestand / Menge',
    'Durchmesser (mm)',
    'Schaft (mm)',
    'Gesamtlänge (mm)',
    'Schneiden',
    'Beschichtung',
    'Werkstoff',
    'Hersteller',
    'Artikelnummer',
    'Magazin-Platz',
    'Aufnahme / Halter',
    'Z-Länge (mm)',
    'Kühlung',
    'Maschine',
    'Lagerort',
    'Letzte Änderung',
    'Zuletzt geändert von',
    'Notizen'
  ];

  const rows = tools.map((t) => [
    t.id || '',
    t.name || t.bezeichnung || '',
    t.category || t.kategorie || '',
    t.status || '',
    t.quantity ?? t.bestand ?? t.stueck ?? 1,
    t.diameter || t.durchmesser || '',
    t.shank || t.schaft || '',
    t.length || t.laenge || '',
    t.flutes || t.schneiden || '',
    t.coating || t.beschichtung || '',
    t.material || t.werkstoff || '',
    t.manufacturer || t.hersteller || '',
    t.sku || t.artikelnummer || '',
    t.magazine || t.magazin || '',
    t.holder || t.halter || '',
    t.zLength || t.zLaenge || '',
    t.coolant || t.kuehlung || '',
    t.machine || t.maschine || '',
    t.location || t.lagerort || '',
    t.updatedAt || t.letzteAenderung || '',
    t.updatedBy || '',
    t.notes || t.notizen || ''
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((r) => r.map(escapeCsvCell).join(';'))
  ].join('\r\n');

  const today = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `FJK_CNC_Werkzeuge_${today}.csv`);
}

export function exportHistoryToCsv(history: HistoryEntry[]) {
  const headers = [
    'Datum & Uhrzeit',
    'Benutzer',
    'Aktion',
    'Werkzeug',
    'Menge',
    'Maschine',
    'Details / Änderungen'
  ];

  const rows = history.map((h) => {
    let dateStr = h.timestamp || h.zeitstempel || h.date || h.datum || '';
    if (h.time || h.uhrzeit) {
      dateStr = `${dateStr} ${h.time || h.uhrzeit}`.trim();
    }
    const detailsStr = Array.isArray(h.changes) ? h.changes.join(' | ') : (h.details || '');

    return [
      dateStr,
      h.userName || h.benutzer || h.user || '',
      h.action || h.aktion || '',
      h.toolName || h.werkzeug || '',
      h.quantity ?? h.menge ?? '',
      h.machine || h.maschine || '',
      detailsStr
    ];
  });

  const csvContent = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((r) => r.map(escapeCsvCell).join(';'))
  ].join('\r\n');

  const today = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `FJK_CNC_Historie_${today}.csv`);
}
