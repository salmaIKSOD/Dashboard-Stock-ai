// ══════════════════════════════════════════════════════════════
//  exportExcelAlertes.js
//  Export Excel (.xlsx) — pour PageAlertes.js
//  Utilise SheetJS (xlsx) — version gratuite (sans cellStyles payant)
//
//  Mise en forme obtenue avec la version gratuite :
//   - Largeurs de colonnes optimisées automatiquement
//   - Titre + sous-titre fusionnés en haut de feuille
//   - Lignes figées sous l'en-tête (freeze pane)
//   - Auto-filtre activé sur les en-têtes
//   - Une feuille par catégorie (multi-onglets dans un classeur)
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  exportExcelAlertes.js
//  Export Excel (.xlsx) — pour PageAlertes.js
//  Utilise ExcelJS (gratuit, complet) — vraies couleurs de cellules
//
//  Mise en forme :
//   - Titre + sous-titre fusionnés, fond coloré
//   - En-têtes colorés (fond bleu, texte blanc, gras)
//   - Lignes alternées (zébrage léger)
//   - Largeurs de colonnes optimisées automatiquement
//   - Lignes figées sous l'en-tête (freeze pane)
//   - Filtre automatique activé sur les en-têtes
// ══════════════════════════════════════════════════════════════

import ExcelJS from 'exceljs';

const COLOR_HEADER_BG   = 'FF12A6E0'; // bleu — en-tête de colonnes
const COLOR_HEADER_TEXT = 'FFFFFFFF'; // blanc
const COLOR_TITLE_TEXT  = 'FF0D0C0C'; // noir
const COLOR_SUBTITLE    = 'FF888888'; // gris
const COLOR_ROW_EVEN    = 'FFF8FAFC'; // gris très clair
const COLOR_ROW_ODD     = 'FFFFFFFF'; // blanc
const COLOR_BORDER      = 'FFE0E0E0'; // gris bordure

function buildSheet(workbook, sheetName, rows, headers, getRow, { title, subtitle, colWidths } = {}) {
  const ws = workbook.addWorksheet(sheetName.substring(0, 31));

  let rowCursor = 1;

  // ── Titre ────────────────────────────────────────────────
  if (title) {
    ws.mergeCells(rowCursor, 1, rowCursor, headers.length);
    const titleCell = ws.getCell(rowCursor, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14, color: { argb: COLOR_TITLE_TEXT } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    ws.getRow(rowCursor).height = 24;
    rowCursor++;

    if (subtitle) {
      ws.mergeCells(rowCursor, 1, rowCursor, headers.length);
      const subCell = ws.getCell(rowCursor, 1);
      subCell.value = subtitle;
      subCell.font = { italic: true, size: 10, color: { argb: COLOR_SUBTITLE } };
      ws.getRow(rowCursor).height = 18;
      rowCursor++;
    }
    rowCursor++; // ligne vide
  }

  // ── En-têtes ─────────────────────────────────────────────
  const headerRowIdx = rowCursor;
  const headerRow = ws.getRow(headerRowIdx);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 11, color: { argb: COLOR_HEADER_TEXT } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: COLOR_BORDER } },
      bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
      left: { style: 'thin', color: { argb: COLOR_BORDER } },
      right: { style: 'thin', color: { argb: COLOR_BORDER } },
    };
  });
  headerRow.height = 22;
  rowCursor++;

  // ── Données ──────────────────────────────────────────────
  const dataRows = rows.map(getRow);
  dataRows.forEach((rowData, idx) => {
    const row = ws.getRow(rowCursor);
    const isEven = idx % 2 === 0;
    rowData.forEach((val, i) => {
      const cell = row.getCell(i + 1);
      cell.value = val;
      cell.font = { size: 10, color: { argb: 'FF333333' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? COLOR_ROW_EVEN : COLOR_ROW_ODD } };
      cell.border = { bottom: { style: 'hair', color: { argb: COLOR_BORDER } } };
      cell.alignment = { vertical: 'middle' };
    });
    row.height = 18;
    rowCursor++;
  });

  // ── Largeurs de colonnes ────────────────────────────────
  if (colWidths) {
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  } else {
    headers.forEach((h, i) => {
      const maxLen = Math.max(h.length, ...dataRows.map(r => String(r[i] ?? '').length));
      ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 3, 12), 45);
    });
  }

  // ── Figer les lignes + filtre auto ──────────────────────
  ws.views = [{ state: 'frozen', ySplit: headerRowIdx }];
  ws.autoFilter = {
    from: { row: headerRowIdx, column: 1 },
    to: { row: headerRowIdx + dataRows.length, column: headers.length },
  };

  return ws;
}

async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporte une seule liste de données en fichier Excel (.xlsx) coloré.
 *
 * @param {Array<Object>} rows      - lignes de données brutes
 * @param {string}        filename  - nom du fichier (sans extension)
 * @param {Array<string>} headers   - libellés des colonnes
 * @param {Function}      getRow    - (row) => [val1, val2, ...]
 * @param {Object}        options   - { sheetName, title, subtitle, colWidths }
 */
export async function exportExcelAlertes(rows, filename, headers, getRow, options = {}) {
  const { sheetName = 'Données', title = '', subtitle = '', colWidths = null } = options;

  const workbook = new ExcelJS.Workbook();
  buildSheet(workbook, sheetName, rows, headers, getRow, { title, subtitle, colWidths });

  await downloadWorkbook(workbook, filename);
}

/**
 * Export multi-feuilles — un classeur unique avec un onglet par catégorie
 * (Commandes urgentes, Prévisions, Anomalies, Articles prioritaires…)
 *
 * @param {Array<Object>} sheets - [{ sheetName, rows, headers, getRow, title, subtitle, colWidths }]
 * @param {string}        filename
 */
export async function exportExcelMultiSheet(sheets, filename) {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ sheetName, rows, headers, getRow, title, subtitle, colWidths }) => {
    if (!rows || rows.length === 0) return; // ignore les feuilles vides
    buildSheet(workbook, sheetName, rows, headers, getRow, { title, subtitle, colWidths });
  });

  await downloadWorkbook(workbook, filename);
}