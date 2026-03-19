import PDFDocument from "pdfkit";

export type TransactionRow = {
  id: string;
  created_at: Date;
  type: "IN" | "OUT";
  amount: any;
  remark: string | null;
  category: { title: string } | null;
  entry_by: { name: string | null; email: string } | null;
};

export type ReportMeta = {
  bookName: string;
  reportType: "date-wise" | "member-wise" | "category-wise" | "all";
  totalIn: number;
  totalOut: number;
  balance: number;
};

// ─── Colour palette ───────────────────────────────────────────────────────────
const BRAND = "#2563EB";
const BRAND_DARK = "#1E3A8A";
const INCOME_CLR = "#16A34A";
const EXPENSE_CLR = "#DC2626";
const HEADER_BG = "#1E3A8A";
const ROW_ALT = "#F0F4FF";
const BORDER = "#CBD5E1";
const MEMBER_SECTION_BG = "#F1F5F9"; // slate-100
const MEMBER_HEADER_BG = "#334155";  // slate-700

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: any): string {
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Columns layout (shared) ──────────────────────────────────────────────────
const COLS = {
  no:       { x: 40,  w: 26 },
  date:     { x: 66,  w: 75 },
  type:     { x: 141, w: 36 },
  amount:   { x: 177, w: 82 },
  category: { x: 259, w: 88 },
  remark:   { x: 347, w: 108 },
};
const ROW_H = 22;

// ─── Helper: draw one table header row ───────────────────────────────────────
function drawTableHeader(
  doc: PDFKit.PDFDocument,
  y: number,
  contentWidth: number,
  showMemberCol: boolean,
): void {
  doc.rect(40, y, contentWidth, ROW_H).fill(BRAND_DARK);
  doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
  const hY = y + 7;
  doc.text("#",        COLS.no.x + 2,       hY, { width: COLS.no.w });
  doc.text("DATE",     COLS.date.x + 4,     hY, { width: COLS.date.w });
  doc.text("TYPE",     COLS.type.x + 4,     hY, { width: COLS.type.w });
  doc.text("AMOUNT",   COLS.amount.x + 4,   hY, { width: COLS.amount.w });
  doc.text("CATEGORY", COLS.category.x + 4, hY, { width: COLS.category.w });

  if (showMemberCol) {
    // Remark column narrowed to fit member column
    doc.text("REMARK",     COLS.remark.x + 4, hY, { width: 80 });
    doc.text("MEMBER",     438,               hY, { width: 117 });
  } else {
    doc.text("REMARK",     COLS.remark.x + 4, hY, { width: COLS.remark.w });
  }
}

// ─── Helper: draw one data row ────────────────────────────────────────────────
function drawRow(
  doc: PDFKit.PDFDocument,
  tx: TransactionRow,
  idx: number,
  y: number,
  contentWidth: number,
  showMemberCol: boolean,
): void {
  const isAlt = idx % 2 === 0;
  doc.rect(40, y, contentWidth, ROW_H).fill(isAlt ? "#FFFFFF" : ROW_ALT);
  doc.rect(40, y, 3, ROW_H).fill(tx.type === "IN" ? INCOME_CLR : EXPENSE_CLR);

  const cY = y + 7;
  const typeColor = tx.type === "IN" ? INCOME_CLR : EXPENSE_CLR;

  doc.fillColor("#475569").font("Helvetica").fontSize(8);
  doc.text(String(idx + 1), COLS.no.x + 4, cY, { width: COLS.no.w });
  doc.text(formatDate(tx.created_at), COLS.date.x + 6, cY, { width: COLS.date.w - 6 });

  doc.fillColor(typeColor).font("Helvetica-Bold");
  doc.text(tx.type, COLS.type.x + 4, cY, { width: COLS.type.w });
  doc.text(
    `${tx.type === "IN" ? "+" : "-"} ${formatAmount(tx.amount)}`,
    COLS.amount.x + 4, cY, { width: COLS.amount.w },
  );

  doc.fillColor("#475569").font("Helvetica");
  doc.text(tx.category?.title ?? "-", COLS.category.x + 4, cY, { width: COLS.category.w });

  if (showMemberCol) {
    doc.text(tx.remark ?? "-", COLS.remark.x + 4, cY, { width: 80 });
    doc.text(
      tx.entry_by?.name ?? tx.entry_by?.email ?? "-",
      438, cY, { width: 117 },
    );
  } else {
    doc.text(tx.remark ?? "-", COLS.remark.x + 4, cY, { width: COLS.remark.w });
  }

  // Row bottom border
  doc
    .moveTo(40, y + ROW_H)
    .lineTo(40 + contentWidth, y + ROW_H)
    .strokeColor(BORDER)
    .lineWidth(0.5)
    .stroke();
}

// ─── Helper: draw page-level header + filter badge ────────────────────────────
function drawPageHeader(
  doc: PDFKit.PDFDocument,
  meta: ReportMeta,
  pageWidth: number,
  contentWidth: number,
): void {
  doc.rect(0, 0, pageWidth, 90).fill(HEADER_BG);
  doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold")
    .text("Transaction Report", 40, 20, { width: contentWidth });
  doc.fontSize(10).font("Helvetica").fillColor("#BFDBFE")
    .text(`Wallet: ${meta.bookName}`, 40, 50);
  doc.fillColor("#BFDBFE")
    .text(`Generated: ${formatDate(new Date())}`, 40, 64);

  let filterLabel = "";
  if (meta.reportType === "date-wise") {
    filterLabel = "Date-Wise Report";
  } else if (meta.reportType === "member-wise") {
    filterLabel = "Member-Wise Report";
  } else if (meta.reportType === "category-wise") {
    filterLabel = "Category-Wise Report";
  } else {
    filterLabel = "All Transactions";
  }

  doc.rect(0, 90, pageWidth, 26).fill(BRAND);
  doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold")
    .text(filterLabel, 40, 98, { width: contentWidth });
}

// ─── Helper: draw 3-card summary row ─────────────────────────────────────────
function drawSummaryCards(
  doc: PDFKit.PDFDocument,
  top: number,
  contentWidth: number,
  totalIn: number,
  totalOut: number,
  balance: number,
): void {
  const cardH = 52;
  const cardW = contentWidth / 3 - 8;

  doc.rect(40, top, cardW, cardH).fill("#ECFDF5");
  doc.rect(40, top, 4, cardH).fill(INCOME_CLR);
  doc.fillColor("#6B7280").fontSize(8).font("Helvetica").text("TOTAL IN", 50, top + 8);
  doc.fillColor(INCOME_CLR).fontSize(14).font("Helvetica-Bold")
    .text(`+ ${formatAmount(totalIn)}`, 50, top + 22);

  const c2 = 40 + cardW + 12;
  doc.rect(c2, top, cardW, cardH).fill("#FEF2F2");
  doc.rect(c2, top, 4, cardH).fill(EXPENSE_CLR);
  doc.fillColor("#6B7280").fontSize(8).font("Helvetica").text("TOTAL OUT", c2 + 10, top + 8);
  doc.fillColor(EXPENSE_CLR).fontSize(14).font("Helvetica-Bold")
    .text(`- ${formatAmount(totalOut)}`, c2 + 10, top + 22);

  const c3 = 40 + (cardW + 12) * 2;
  const pos = balance >= 0;
  doc.rect(c3, top, cardW, cardH).fill(pos ? "#EFF6FF" : "#FEF2F2");
  doc.rect(c3, top, 4, cardH).fill(pos ? BRAND : EXPENSE_CLR);
  doc.fillColor("#6B7280").fontSize(8).font("Helvetica").text("BALANCE", c3 + 10, top + 8);
  doc.fillColor(pos ? BRAND : EXPENSE_CLR).fontSize(14).font("Helvetica-Bold")
    .text(`${pos ? "+" : "-"} ${formatAmount(Math.abs(balance))}`, c3 + 10, top + 22);
}

// ─── Helper: draw per-member mini summary bar ─────────────────────────────────
function drawMemberSummaryBar(
  doc: PDFKit.PDFDocument,
  y: number,
  contentWidth: number,
  totalIn: number,
  totalOut: number,
  balance: number,
): void {
  const barH = 20;
  doc.rect(40, y, contentWidth, barH).fill("#E8F1FE");
  doc.fillColor("#1E3A8A").fontSize(8).font("Helvetica-Bold");

  const pos = balance >= 0;
  doc.text(
    `  IN: +${formatAmount(totalIn)}    OUT: -${formatAmount(totalOut)}    Balance: ${pos ? "+" : "-"}${formatAmount(Math.abs(balance))}    (${totalIn > 0 || totalOut > 0 ? Math.round((totalIn / (totalIn + totalOut || 1)) * 100) : 0}% income)`,
    44,
    y + 6,
    { width: contentWidth - 8 },
  );
}

// ─── Helper: draw footer on current page ─────────────────────────────────────
function drawFooter(
  doc: PDFKit.PDFDocument,
  pageWidth: number,
  contentWidth: number,
  total: number,
): void {
  const fY = doc.page.height - 30;
  doc.rect(0, fY, pageWidth, 30).fill(BRAND_DARK);
  doc.fillColor("#BFDBFE").fontSize(8).font("Helvetica")
    .text(
      `CashFlow · Transaction Report · ${total} record(s)`,
      40, fY + 10,
      { width: contentWidth, align: "center" },
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
export function buildTransactionPDF(
  transactions: TransactionRow[],
  meta: ReportMeta,
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 40, size: "A4", autoFirstPage: true });
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 80;

  if (meta.reportType === "member-wise") {
    renderMemberWisePDF(doc, transactions, meta, pageWidth, contentWidth);
  } else {
    renderFlatPDF(doc, transactions, meta, pageWidth, contentWidth);
  }

  doc.end();
  return doc;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FLAT LAYOUT  (all / date-wise / category-wise)
// ─────────────────────────────────────────────────────────────────────────────
function renderFlatPDF(
  doc: PDFKit.PDFDocument,
  transactions: TransactionRow[],
  meta: ReportMeta,
  pageWidth: number,
  contentWidth: number,
): void {
  drawPageHeader(doc, meta, pageWidth, contentWidth);

  const cardTop = 128;
  const cardH = 52;
  drawSummaryCards(doc, cardTop, contentWidth, meta.totalIn, meta.totalOut, meta.balance);

  const tableTop = cardTop + cardH + 20;
  drawTableHeader(doc, tableTop, contentWidth, /* showMemberCol */ true);

  let rowY = tableTop + ROW_H;
  const safeBottom = doc.page.height - 50;

  transactions.forEach((tx, i) => {
    if (rowY + ROW_H > safeBottom) {
      drawFooter(doc, pageWidth, contentWidth, transactions.length);
      doc.addPage();
      rowY = 40;
      drawTableHeader(doc, rowY, contentWidth, true);
      rowY += ROW_H;
    }
    drawRow(doc, tx, i, rowY, contentWidth, /* showMemberCol */ true);
    rowY += ROW_H;
  });

  if (transactions.length === 0) {
    doc.fillColor("#94A3B8").fontSize(11).font("Helvetica")
      .text("No transactions found for the selected filters.", 40, rowY + 10, {
        width: contentWidth, align: "center",
      });
  }

  drawFooter(doc, pageWidth, contentWidth, transactions.length);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEMBER-WISE LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
function renderMemberWisePDF(
  doc: PDFKit.PDFDocument,
  transactions: TransactionRow[],
  meta: ReportMeta,
  pageWidth: number,
  contentWidth: number,
): void {
  // ── 1. Page header & overall summary ────────────────────────────────────
  drawPageHeader(doc, meta, pageWidth, contentWidth);

  const cardTop = 128;
  const cardH = 52;
  drawSummaryCards(doc, cardTop, contentWidth, meta.totalIn, meta.totalOut, meta.balance);

  // ── 2. Group transactions by member ─────────────────────────────────────
  const memberMap = new Map<string, { label: string; rows: TransactionRow[] }>();

  for (const tx of transactions) {
    const key  = tx.entry_by?.email ?? "unknown";
    const label = tx.entry_by?.name ?? tx.entry_by?.email ?? "Unknown Member";
    if (!memberMap.has(key)) memberMap.set(key, { label, rows: [] });
    memberMap.get(key)!.rows.push(tx);
  }

  if (memberMap.size === 0) {
    doc.fillColor("#94A3B8").fontSize(11).font("Helvetica")
      .text("No transactions found.", 40, cardTop + cardH + 30, {
        width: contentWidth, align: "center",
      });
    drawFooter(doc, pageWidth, contentWidth, 0);
    return;
  }

  const safeBottom = doc.page.height - 50;

  // Member index table (TOC) — just a small summary before sections
  let curY = cardTop + cardH + 20;

  // ── TOC header ─────────────────────────────────────────────────────────
  const tocH = 22;
  doc.rect(40, curY, contentWidth, tocH).fill(MEMBER_HEADER_BG);
  doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold")
    .text("MEMBER SUMMARY", 48, curY + 7, { width: contentWidth });
  curY += tocH;

  const tocCols = { name: 40, txCount: 250, totalIn: 320, totalOut: 400, balance: 470 };

  // TOC column header
  doc.rect(40, curY, contentWidth, 18).fill("#E2E8F0");
  doc.fillColor("#334155").fontSize(7.5).font("Helvetica-Bold");
  doc.text("Member Name",   tocCols.name + 8,    curY + 5, { width: 200 });
  doc.text("Transactions",  tocCols.txCount + 4, curY + 5, { width: 70  });
  doc.text("Total IN",      tocCols.totalIn + 4, curY + 5, { width: 75  });
  doc.text("Total OUT",     tocCols.totalOut + 4,curY + 5, { width: 65  });
  doc.text("Balance",       tocCols.balance + 4, curY + 5, { width: 75  });
  curY += 18;

  let tocAlt = false;
  for (const [, { label, rows }] of memberMap) {
    const mIn  = rows.reduce((a, t) => t.type === "IN"  ? a + Number(t.amount) : a, 0);
    const mOut = rows.reduce((a, t) => t.type === "OUT" ? a + Number(t.amount) : a, 0);
    const mBal = mIn - mOut;

    doc.rect(40, curY, contentWidth, 18).fill(tocAlt ? "#F8FAFC" : "#FFFFFF");
    doc.fillColor("#1E293B").fontSize(7.5).font("Helvetica");
    doc.text(label,                   tocCols.name + 8,    curY + 5, { width: 200 });
    doc.text(String(rows.length),     tocCols.txCount + 4, curY + 5, { width: 70  });
    doc.fillColor(INCOME_CLR);
    doc.text(`+ ${formatAmount(mIn)}`, tocCols.totalIn + 4, curY + 5, { width: 75 });
    doc.fillColor(EXPENSE_CLR);
    doc.text(`- ${formatAmount(mOut)}`, tocCols.totalOut + 4, curY + 5, { width: 65 });
    doc.fillColor(mBal >= 0 ? BRAND : EXPENSE_CLR);
    doc.text(`${mBal >= 0 ? "+" : "-"} ${formatAmount(Math.abs(mBal))}`, tocCols.balance + 4, curY + 5, { width: 75 });

    tocAlt = !tocAlt;
    curY += 18;
  }

  curY += 12; // gap before sections

  // ── 3. Per-member sections ─────────────────────────────────────────────
  let memberIndex = 0;
  for (const [, { label, rows }] of memberMap) {
    memberIndex++;

    const mIn  = rows.reduce((a, t) => t.type === "IN"  ? a + Number(t.amount) : a, 0);
    const mOut = rows.reduce((a, t) => t.type === "OUT" ? a + Number(t.amount) : a, 0);
    const mBal = mIn - mOut;

    // Ensure section header fits; if near bottom, add new page
    if (curY + 60 > safeBottom) {
      drawFooter(doc, pageWidth, contentWidth, transactions.length);
      doc.addPage();
      curY = 40;
    }

    // ─ Member section header bar ─
    doc.rect(40, curY, contentWidth, 28).fill(MEMBER_HEADER_BG);
    // Avatar circle placeholder
    doc.circle(58, curY + 14, 10).fill(BRAND);
    doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold")
      .text(label.charAt(0).toUpperCase(), 54, curY + 8, { width: 12, align: "center" });

    doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold")
      .text(`${memberIndex}. ${label}`, 74, curY + 8, { width: contentWidth - 100 });
    doc.fillColor("#94A3B8").fontSize(8).font("Helvetica")
      .text(`${rows.length} transaction${rows.length !== 1 ? "s" : ""}`, 74, curY + 19, { width: 200 });
    curY += 28;

    // ─ Member mini-summary bar ─
    drawMemberSummaryBar(doc, curY, contentWidth, mIn, mOut, mBal);
    curY += 20;

    // ─ Table header ─
    drawTableHeader(doc, curY, contentWidth, /* showMemberCol */ false);
    curY += ROW_H;

    // ─ Row data ─
    rows.forEach((tx, i) => {
      if (curY + ROW_H > safeBottom) {
        drawFooter(doc, pageWidth, contentWidth, transactions.length);
        doc.addPage();
        curY = 40;
        // Repeat section label on new page
        doc.rect(40, curY, contentWidth, 18).fill(MEMBER_SECTION_BG);
        doc.fillColor(BRAND_DARK).fontSize(8).font("Helvetica-Bold")
          .text(`(continued) ${label}`, 48, curY + 5, { width: contentWidth });
        curY += 18;
        drawTableHeader(doc, curY, contentWidth, false);
        curY += ROW_H;
      }
      drawRow(doc, tx, i, curY, contentWidth, /* showMemberCol */ false);
      curY += ROW_H;
    });

    curY += 16; // gap between member sections
  }

  drawFooter(doc, pageWidth, contentWidth, transactions.length);
}
