import ExcelJS from 'exceljs';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmtDateExcel = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const MONTH_NAMES = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

/* ─────────────────────────────────────────────────────────────
   COULEURS / STYLES (identiques à exportExcel.js)
───────────────────────────────────────────────────────────── */
const C = {
  headerBg:    'FF0D8FC4', headerFont:  'FFFFFFFF',
  subHeaderBg: 'FFE8F6FD',
  articleBg:   'FFDFF2FB', articleFont: 'FF0B5E7F',
  subtotalBg:  'FFCCE8F6', subtotalFont:'FF065070',
  totalBg:     'FF0D8FC4', totalFont:   'FFFFFFFF',
  green:       'FF01773D', greenBg:     'FFE6F9EF',
  red:         'FFB71C1C', redBg:       'FFFDE8E8',
  blue:        'FF0B7DB0', blueBg:      'FFE8F6FD',
  amber:       'FFC47A00', amberBg:     'FFFFF3CD',
  gray:        'FF888888', border:      'FFD0E8F5',
  altRow:      'FFF7FBFF', white:       'FFFFFFFF',
  orange:      'FFE65100', orangeBg:    'FFFFF3E0',
  purple:      'FF6A1B9A', purpleBg:    'FFF3E5F5',
};

const xlBorder  = (color = C.border) => ({
  top:    { style: 'thin',   color: { argb: color } },
  left:   { style: 'thin',   color: { argb: color } },
  bottom: { style: 'thin',   color: { argb: color } },
  right:  { style: 'thin',   color: { argb: color } },
});
const xlBorderM = (color = 'FF0A7BAE') => ({
  top:    { style: 'medium', color: { argb: color } },
  left:   { style: 'medium', color: { argb: color } },
  bottom: { style: 'medium', color: { argb: color } },
  right:  { style: 'medium', color: { argb: color } },
});
const xlFill  = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const xlFont  = (argb, bold = false, size = 10) => ({ name: 'Arial', size, bold, color: { argb } });
const xlAlign = (h = 'left', v = 'middle') => ({ horizontal: h, vertical: v, wrapText: false });

/* ─────────────────────────────────────────────────────────────
   ONGLET 1 : TOUS LES MOUVEMENTS (détail complet)
   Colonnes : Date / Article / Désignation / Dépôt /
              Entrées / Val Entrée / Sorties / Val Sortie /
              Valeur Mvt / Solde Permanent / Stock Final
───────────────────────────────────────────────────────────── */
function buildDetailSheet(wb, data, cols, dateDebut, dateFin) {
  const ws = wb.addWorksheet('📋 Mouvements détail', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  const COL_COUNT = 11;
  ws.columns = [
    { key: 'date',       width: 13 },
    { key: 'article',    width: 16 },
    { key: 'design',     width: 38 },
    { key: 'depot',      width: 24 },
    { key: 'entrees',    width: 14 },
    { key: 'valEntree',  width: 16 },
    { key: 'sorties',    width: 14 },
    { key: 'valSortie',  width: 16 },
    { key: 'valeurMvt',  width: 16 },
    { key: 'solde',      width: 18 },
    { key: 'stockFinal', width: 14 },
  ];

  /* ── Ligne 1 : titre ── */
  ws.mergeCells(1, 1, 1, COL_COUNT);
  const tc     = ws.getCell(1, 1);
  const period = dateDebut && dateFin ? ` — du ${fmtDateExcel(dateDebut)} au ${fmtDateExcel(dateFin)}` : '';
  tc.value     = `Mouvements de stock${period}`;
  tc.font      = xlFont(C.headerFont, true, 13);
  tc.fill      = xlFill(C.headerBg);
  tc.alignment = xlAlign('center');
  tc.border    = xlBorderM();
  ws.getRow(1).height = 28;

  /* ── Ligne 2 : en-têtes ── */
  const headers = [
    'Date', 'Article', 'Désignation', 'Dépôt',
    'Entrées', 'Val Entrée', 'Sorties', 'Val Sortie',
    'Valeur Mvt', 'Solde Permanent', 'Stock Final',
  ];
  headers.forEach((h, i) => {
    const cell     = ws.getCell(2, i + 1);
    cell.value     = h;
    cell.font      = xlFont('FF0D0C0C', true, 9);
    cell.fill      = xlFill(C.subHeaderBg);
    cell.alignment = xlAlign(i >= 4 ? 'right' : 'left');
    cell.border    = xlBorder();
  });
  ws.getRow(2).height = 20;

  /* ── Lignes de données ── */
  data.forEach((row, idx) => {
    const rowNum   = idx + 3;
    const rowFill  = idx % 2 === 1 ? xlFill(C.altRow) : xlFill(C.white);
    const e        = Number(row[cols.entrees]    ?? 0);
    const valE     = Number(row[cols.pruEntree]  ?? 0);
    const s        = Number(row[cols.sorties]    ?? 0);
    const valS     = Number(row[cols.pruSortie]  ?? 0);
    const valMvt   = Number(row[cols.valeurMvt]  ?? 0);
    const solde    = Number(row[cols.solde]      ?? 0);
    const stockFin = row[cols.stockFinal] != null ? Number(row[cols.stockFinal]) : null;

    const set = (col, value, fnt, aln, numFmt, customFill) => {
      const cell     = ws.getCell(rowNum, col);
      cell.value     = value;
      cell.fill      = customFill || rowFill;
      cell.font      = fnt  || xlFont('FF333333', false, 9);
      cell.alignment = aln  || xlAlign('left');
      cell.border    = xlBorder();
      if (numFmt) cell.numFmt = numFmt;
    };

    set(1,  fmtDateExcel(row[cols.date]),  xlFont(C.gray, false, 9),  xlAlign('center'));
    set(2,  row[cols.article]  ?? '',      xlFont(C.blue, false, 9),  xlAlign('center'));
    set(3,  row[cols.design]   ?? '');
    set(4,  row[cols.nomDepot] ?? '');

    // Entrées (quantité)
    if (e > 0) set(5, e, xlFont(C.green, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.greenBg));
    else        set(5, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

    // Val Entrée
    if (valE > 0) set(6, valE, xlFont(C.green, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.greenBg));
    else           set(6, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

    // Sorties (quantité)
    if (s > 0) set(7, s, xlFont(C.red, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.redBg));
    else        set(7, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

    // Val Sortie
    if (valS > 0) set(8, valS, xlFont(C.red, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.redBg));
    else           set(8, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

    // Valeur Mvt
    if (valMvt !== 0) {
      const f = valMvt > 0 ? xlFont('FF4a4a4a', false, 9) : xlFont(C.red, false, 9);
      const bg = valMvt > 0 ? xlFill('FFF7F7F7') : xlFill(C.redBg);
      set(9, valMvt, f, xlAlign('right'), '#,##0.##', bg);
    } else set(9, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

    // Solde Permanent
    const sf = solde > 0 ? xlFill(C.blueBg) : solde < 0 ? xlFill(C.redBg) : rowFill;
    const ff = solde > 0 ? xlFont(C.blue, true, 9) : solde < 0 ? xlFont(C.red, true, 9) : xlFont('FFDDDDDD', false, 9);
    set(10, solde !== 0 ? solde : '—', ff, xlAlign('right'), '#,##0.##', sf);

    // Stock Final
    if (stockFin !== null) {
      const sfF = stockFin > 0 ? xlFill(C.amberBg) : stockFin < 0 ? xlFill(C.redBg) : rowFill;
      const sfFont = stockFin > 0 ? xlFont(C.amber, true, 9) : stockFin < 0 ? xlFont(C.red, true, 9) : xlFont(C.gray, false, 9);
      set(11, stockFin, sfFont, xlAlign('right'), '#,##0.##', sfF);
    } else set(11, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

    ws.getRow(rowNum).height = 17;
  });

  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: COL_COUNT } };
}

/* ─────────────────────────────────────────────────────────────
   ONGLET 2 : RÉCAP PAR MOIS → PAR ARTICLE
   Structure :
     ┌─ Bandeau MOIS ──────────────────────────────────────┐
     │  Bandeau Article                                     │
     │    Ligne dépôt 1 : Entrées / ValE / Sorties / ValS  │
     │    Ligne dépôt 2 : …                                │
     │  Sous-total Article                                  │
     │  …                                                   │
     └─ Total du mois ─────────────────────────────────────┘
     Grand Total
───────────────────────────────────────────────────────────── */
function buildRecapMensuelSheet(wb, data, cols) {
  const ws = wb.addWorksheet('📊 Récap mensuel', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  const COL_COUNT = 9;
  ws.columns = [
    { key: 'mois',      width: 22 },
    { key: 'article',   width: 16 },
    { key: 'design',    width: 36 },
    { key: 'depot',     width: 24 },
    { key: 'entrees',   width: 14 },
    { key: 'valEntree', width: 16 },
    { key: 'sorties',   width: 14 },
    { key: 'valSortie', width: 16 },
    { key: 'stockFin',  width: 14 },
  ];

  /* ── Ligne 1 : titre ── */
  ws.mergeCells(1, 1, 1, COL_COUNT);
  const tc     = ws.getCell(1, 1);
  tc.value     = '📊  Récapitulatif mensuel — Entrées / Sorties par Article';
  tc.font      = xlFont(C.headerFont, true, 13);
  tc.fill      = xlFill(C.headerBg);
  tc.alignment = xlAlign('center');
  tc.border    = xlBorderM();
  ws.getRow(1).height = 28;

  /* ── Ligne 2 : en-têtes ── */
  const headers = ['Mois / Article', 'Article', 'Désignation', 'Dépôt', 'Entrées', 'Val Entrée', 'Sorties', 'Val Sortie', 'Stock Final'];
  headers.forEach((h, i) => {
    const cell     = ws.getCell(2, i + 1);
    cell.value     = h;
    cell.font      = xlFont('FF0D0C0C', true, 9);
    cell.fill      = xlFill(C.subHeaderBg);
    cell.alignment = xlAlign(i >= 4 ? 'right' : 'left');
    cell.border    = xlBorder();
  });
  ws.getRow(2).height = 20;

  /* ── Grouper par mois ── */
  const byMonth = {};
  data.forEach(row => {
    const raw = row[cols.date];
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(row);
  });

  let currentRow  = 3;
  let grandE      = 0;
  let grandValE   = 0;
  let grandS      = 0;
  let grandValS   = 0;
  let grandStockFin  = 0;

  // ── Calcul du stock final global (dernier jour par article, tous mois) ──
  const allByArticle = {};
    data.forEach(row => {
    const code = row[cols.article] ?? '(sans code)';
    if (!allByArticle[code]) allByArticle[code] = [];
    allByArticle[code].push(row);
    });
    Object.values(allByArticle).forEach(artRows => {
    const sorted = [...artRows].sort((a, b) => new Date(b[cols.date]) - new Date(a[cols.date]));
    const sfRow  = sorted.find(r => r[cols.stockFinal] != null);
    if (sfRow) grandStockFin += Number(sfRow[cols.stockFinal]);
  });

  const monthKeys = Object.keys(byMonth).sort();

  monthKeys.forEach(monthKey => {
    const [year, month] = monthKey.split('-').map(Number);
    const monthLabel    = `${MONTH_NAMES[month - 1]} ${year}`;
    const monthRows     = byMonth[monthKey];

    /* ── Bandeau MOIS ── */
    ws.mergeCells(currentRow, 1, currentRow, COL_COUNT);
    const mCell     = ws.getCell(currentRow, 1);
    mCell.value     = `📅  ${monthLabel}`;
    mCell.font      = xlFont(C.headerFont, true, 11);
    mCell.fill      = xlFill('FF1976D2');
    mCell.alignment = xlAlign('left');
    mCell.border    = xlBorderM('FF1565C0');
    ws.getRow(currentRow).height = 22;
    currentRow++;

    /* ── Grouper par article dans ce mois ── */
    const byArticle = {};
    monthRows.forEach(row => {
      const code = row[cols.article] ?? '(sans code)';
      if (!byArticle[code]) byArticle[code] = [];
      byArticle[code].push(row);
    });

    let monthE    = 0;
    let monthValE = 0;
    let monthS    = 0;
    let monthValS = 0;

    Object.entries(byArticle).forEach(([artCode, artRows]) => {
      const design = artRows[0][cols.design] ?? '';

      /* ── Bandeau ARTICLE ── */
      ws.mergeCells(currentRow, 1, currentRow, COL_COUNT);
      const artCell     = ws.getCell(currentRow, 1);
      artCell.value     = `  ▸  ${artCode}  —  ${design}`;
      artCell.font      = xlFont(C.articleFont, true, 10);
      artCell.fill      = xlFill(C.articleBg);
      artCell.alignment = xlAlign('left');
      artCell.border    = xlBorder('FF8CC8E8');
      ws.getRow(currentRow).height = 18;
      currentRow++;

      /* ── Grouper par dépôt ── */
      const byDepot = {};
      artRows.forEach(row => {
        const dk = String(row['Depot'] ?? row[cols.nomDepot] ?? '(sans dépôt)');
        if (!byDepot[dk]) byDepot[dk] = [];
        byDepot[dk].push(row);
      });

      let artE    = 0;
      let artValE = 0;
      let artS    = 0;
      let artValS = 0;
      let artSF   = 0; // stock final de l'article = dernier stockFinal par dépôt

      Object.entries(byDepot).forEach(([depotLabel, depotRows], depIdx) => {
        // Agréger entrées/sorties/valeurs pour ce dépôt ce mois
        let depE = 0, depValE = 0, depS = 0, depValS = 0;
        depotRows.forEach(r => {
          depE    += Number(r[cols.entrees]   ?? 0);
          depValE += Number(r[cols.pruEntree] ?? 0);
          depS    += Number(r[cols.sorties]   ?? 0);
          depValS += Number(r[cols.pruSortie] ?? 0);
        });

        // Stock final = ligne avec la date la plus récente de ce dépôt ce mois
        const sortedDR = [...depotRows].sort((a, b) => new Date(b[cols.date]) - new Date(a[cols.date]));
        const sfRow    = sortedDR.find(r => r[cols.stockFinal] != null);
        const depSF    = sfRow ? Number(sfRow[cols.stockFinal]) : null;

        artE    += depE;
        artValE += depValE;
        artS    += depS;
        artValS += depValS;
        if (depSF !== null) artSF += depSF;

        const rowFill = depIdx % 2 === 1 ? xlFill(C.altRow) : xlFill(C.white);

        const set = (col, value, fnt, aln, numFmt, customFill) => {
          const cell     = ws.getCell(currentRow, col);
          cell.value     = value;
          cell.fill      = customFill || rowFill;
          cell.font      = fnt  || xlFont('FF333333', false, 9);
          cell.alignment = aln  || xlAlign('left');
          cell.border    = xlBorder();
          if (numFmt) cell.numFmt = numFmt;
        };

        // Col 1 : vide (mois/article déjà affichés au-dessus)
        set(1, '');
        // Col 2 : code article
        set(2, artCode, xlFont(C.blue, false, 9), xlAlign('center'));
        // Col 3 : désignation
        set(3, design, xlFont('FF555555', false, 9));
        // Col 4 : dépôt
        set(4, depotLabel, xlFont('FF555555', false, 9));

        // Col 5 : entrées qté
        if (depE > 0) set(5, depE, xlFont(C.green, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.greenBg));
        else           set(5, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

        // Col 6 : val entrée
        if (depValE > 0) set(6, depValE, xlFont(C.green, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.greenBg));
        else              set(6, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

        // Col 7 : sorties qté
        if (depS > 0) set(7, depS, xlFont(C.red, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.redBg));
        else           set(7, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

        // Col 8 : val sortie
        if (depValS > 0) set(8, depValS, xlFont(C.red, true, 9), xlAlign('right'), '#,##0.##', xlFill(C.redBg));
        else              set(8, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

        // Col 9 : stock final
        if (depSF !== null) {
          const sfF = depSF > 0 ? xlFill(C.amberBg) : depSF < 0 ? xlFill(C.redBg) : rowFill;
          const sfFont = depSF > 0 ? xlFont(C.amber, true, 9) : depSF < 0 ? xlFont(C.red, true, 9) : xlFont(C.gray, false, 9);
          set(9, depSF, sfFont, xlAlign('right'), '#,##0.##', sfF);
        } else set(9, '—', xlFont('FFDDDDDD', false, 9), xlAlign('right'));

        ws.getRow(currentRow).height = 17;
        currentRow++;
      });

      /* ── Sous-total ARTICLE ── */
      ws.mergeCells(currentRow, 1, currentRow, 3);
      const stLabel     = ws.getCell(currentRow, 1);
      stLabel.value     = `  ▶  Sous-total : ${artCode} — ${design}`;
      stLabel.font      = xlFont(C.subtotalFont, true, 9);
      stLabel.fill      = xlFill(C.subtotalBg);
      stLabel.alignment = xlAlign('left');
      stLabel.border    = xlBorderM('FF8CC8E8');

      const stDepot     = ws.getCell(currentRow, 4);
      stDepot.value     = '';
      stDepot.fill      = xlFill(C.subtotalBg);
      stDepot.border    = xlBorderM('FF8CC8E8');

      const vals = [
        [5, artE,    C.green],
        [6, artValE, C.green],
        [7, artS,    C.red],
        [8, artValS, C.red],
        [9, artSF,   C.amber],
      ];
      vals.forEach(([col, val, color]) => {
        const c     = ws.getCell(currentRow, col);
        c.value     = val;
        c.fill      = xlFill(C.subtotalBg);
        c.font      = xlFont(color, true, 9);
        c.alignment = xlAlign('right');
        c.numFmt    = '#,##0.##';
        c.border    = xlBorderM('FF8CC8E8');
      });

      ws.getRow(currentRow).height = 20;
      currentRow++;

      monthE    += artE;
      monthValE += artValE;
      monthS    += artS;
      monthValS += artValS;
    });

    /* ── Total du MOIS ── */
    ws.mergeCells(currentRow, 1, currentRow, 4);
    const mtLabel     = ws.getCell(currentRow, 1);
    mtLabel.value     = `◆  Total ${monthLabel}`;
    mtLabel.font      = xlFont('FFFFFFFF', true, 10);
    mtLabel.fill      = xlFill('FF0D47A1');
    mtLabel.alignment = xlAlign('left');
    mtLabel.border    = xlBorderM('FF0A3A85');

    const mVals = [
      [5, monthE,    'FF90EEB8'],
      [6, monthValE, 'FF90EEB8'],
      [7, monthS,    'FFFFAAAA'],
      [8, monthValS, 'FFFFAAAA'],
      [9, '',        C.headerFont],
    ];
    mVals.forEach(([col, val, color]) => {
      const c     = ws.getCell(currentRow, col);
      c.value     = val !== '' ? val : '';
      c.fill      = xlFill('FF0D47A1');
      c.font      = xlFont(color, true, 10);
      c.alignment = xlAlign('right');
      if (val !== '') c.numFmt = '#,##0.##';
      c.border    = xlBorderM('FF0A3A85');
    });

    ws.getRow(currentRow).height = 22;
    currentRow++;

    // ligne de séparation vide
    currentRow++;

    grandE    += monthE;
    grandValE += monthValE;
    grandS    += monthS;
    grandValS += monthValS;
  });

  /* ── GRAND TOTAL ── */
  ws.mergeCells(currentRow, 1, currentRow, 4);
  const gtLabel     = ws.getCell(currentRow, 1);
  gtLabel.value     = '◆◆  GRAND TOTAL — Toute la période';
  gtLabel.font      = xlFont(C.totalFont, true, 11);
  gtLabel.fill      = xlFill(C.totalBg);
  gtLabel.alignment = xlAlign('left');
  gtLabel.border    = xlBorderM();

  const gtVals = [
    [5, grandE,    'FF90EEB8'],
    [6, grandValE, 'FF90EEB8'],
    [7, grandS,    'FFFFAAAA'],
    [8, grandValS, 'FFFFAAAA'],
    [9, grandStockFin, 'FFFFD54F'],
  ];
  gtVals.forEach(([col, val, color]) => {
    const c     = ws.getCell(currentRow, col);
    c.value     = val !== '' ? val : '';
    c.fill      = xlFill(C.totalBg);
    c.font      = xlFont(color, true, 11);
    c.alignment = xlAlign('right');
    if (val !== '') c.numFmt = '#,##0.##';
    c.border    = xlBorderM();
  });

  ws.getRow(currentRow).height = 26;

  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: COL_COUNT } };
}

/* ─────────────────────────────────────────────────────────────
   EXPORT PRINCIPAL
───────────────────────────────────────────────────────────── */
export async function exportExcelMouvements(data, cols, dateDebut, dateFin) {
  if (!data || data.length === 0) return;

  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Stock Dashboard';
  wb.created  = new Date();

  // Onglet 1 : Détail complet de tous les mouvements affichés
  buildDetailSheet(wb, data, cols, dateDebut, dateFin);

  // Onglet 2 : Récap mensuel → par article → par dépôt
  buildRecapMensuelSheet(wb, data, cols);

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  const suffix = dateDebut && dateFin
    ? `${dateDebut}_au_${dateFin}`
    : new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `mouvements_${suffix}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}