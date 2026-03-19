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

function fmt(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtAmt(amount: any): string {
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Column positions
const COL = {
  no: { x: 40, w: 24 },
  date: { x: 64, w: 72 },
  type: { x: 136, w: 34 },
  amount: { x: 170, w: 80 },
  category: { x: 250, w: 90 },
  remark: { x: 340, w: 100 },
  member: { x: 440, w: 115 },
};
const ROW_H = 20;

function tableHeader(
  doc: PDFKit.PDFDocument,
  y: number,
  showMember: boolean,
): void {
  doc.rect(40, y, 515, ROW_H).fill("#F3F4F6");
  doc.fillColor("#374151").fontSize(7.5).font("Helvetica-Bold");
  const ty = y + 6;
  doc.text("#", COL.no.x + 2, ty, { width: COL.no.w });
  doc.text("DATE", COL.date.x + 2, ty, { width: COL.date.w });
  doc.text("TYPE", COL.type.x + 2, ty, { width: COL.type.w });
  doc.text("AMOUNT", COL.amount.x + 2, ty, { width: COL.amount.w });
  doc.text("CATEGORY", COL.category.x + 2, ty, { width: COL.category.w });
  doc.text("REMARK", COL.remark.x + 2, ty, { width: COL.remark.w });
  if (showMember) {
    doc.text("MEMBER", COL.member.x + 2, ty, { width: COL.member.w });
  }
}

function tableRow(
  doc: PDFKit.PDFDocument,
  tx: TransactionRow,
  idx: number,
  y: number,
  showMember: boolean,
): void {
  // Alternating row background
  doc.rect(40, y, 515, ROW_H).fill(idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB");

  const ry = y + 6;
  const amtColor = tx.type === "IN" ? "#16A34A" : "#DC2626";

  doc.fillColor("#374151").font("Helvetica").fontSize(7.5);
  doc.text(String(idx + 1), COL.no.x + 2, ry, { width: COL.no.w });
  doc.text(fmt(tx.created_at), COL.date.x + 2, ry, { width: COL.date.w });

  doc.fillColor(amtColor).font("Helvetica-Bold");
  doc.text(tx.type, COL.type.x + 2, ry, { width: COL.type.w });
  doc.text(
    `${tx.type === "IN" ? "+" : "-"} ${fmtAmt(tx.amount)}`,
    COL.amount.x + 2,
    ry,
    { width: COL.amount.w },
  );

  doc.fillColor("#374151").font("Helvetica");
  doc.text(tx.category?.title ?? "-", COL.category.x + 2, ry, {
    width: COL.category.w,
  });
  doc.text(tx.remark ?? "-", COL.remark.x + 2, ry, { width: COL.remark.w });
  if (showMember) {
    doc.text(
      tx.entry_by?.name ?? tx.entry_by?.email ?? "-",
      COL.member.x + 2,
      ry,
      { width: COL.member.w },
    );
  }

  // Bottom border
  doc
    .moveTo(40, y + ROW_H)
    .lineTo(555, y + ROW_H)
    .strokeColor("#E5E7EB")
    .lineWidth(0.5)
    .stroke();
}

// ─── Main Entry ───────────────────────────────────────────────────────────────
export function buildTransactionPDF(
  transactions: TransactionRow[],
  meta: ReportMeta,
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 40, size: "A4", autoFirstPage: true });

  const reportLabels: Record<ReportMeta["reportType"], string> = {
    all: "All Transactions",
    "date-wise": "Date-Wise Report",
    "member-wise": "Member-Wise Report",
    "category-wise": "Category-Wise Report",
  };

  // ── Header ────────────────────────────────────────────────────────────────
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text("Transaction Report", 40, 40);
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#6B7280")
    .text(
      `Wallet: ${meta.bookName}  ·  ${reportLabels[meta.reportType]}  ·  Generated: ${fmt(new Date())}`,
      40,
      65,
    );

  // ── Divider ───────────────────────────────────────────────────────────────
  doc
    .moveTo(40, 82)
    .lineTo(555, 82)
    .strokeColor("#D1D5DB")
    .lineWidth(1)
    .stroke();

  // ── Summary ───────────────────────────────────────────────────────────────
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#6B7280")
    .text("TOTAL IN", 40, 92);
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#16A34A")
    .text(`+ ${fmtAmt(meta.totalIn)}`, 40, 104);

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#6B7280")
    .text("TOTAL OUT", 180, 92);
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#DC2626")
    .text(`- ${fmtAmt(meta.totalOut)}`, 180, 104);

  const balPos = meta.balance >= 0;
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#6B7280")
    .text("BALANCE", 320, 92);
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor(balPos ? "#16A34A" : "#DC2626")
    .text(`${balPos ? "+" : "-"} ${fmtAmt(Math.abs(meta.balance))}`, 320, 104);

  doc
    .moveTo(40, 124)
    .lineTo(555, 124)
    .strokeColor("#D1D5DB")
    .lineWidth(1)
    .stroke();

  // ── Table ─────────────────────────────────────────────────────────────────
  const showMember = meta.reportType === "member-wise";
  const safeBottom = doc.page.height - 40;

  let y = 132;
  tableHeader(doc, y, showMember);
  y += ROW_H;

  if (transactions.length === 0) {
    doc
      .fillColor("#9CA3AF")
      .fontSize(10)
      .font("Helvetica")
      .text("No transactions found.", 40, y + 12, {
        width: 515,
        align: "center",
      });
  }

  transactions.forEach((tx, i) => {
    if (y + ROW_H > safeBottom) {
      doc.addPage();
      y = 40;
      tableHeader(doc, y, showMember);
      y += ROW_H;
    }
    tableRow(doc, tx, i, y, showMember);
    y += ROW_H;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  doc
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor("#9CA3AF")
    .text(
      `CashFlow  ·  ${transactions.length} record(s)`,
      40,
      doc.page.height - 28,
      { width: 515, align: "center" },
    );

  doc.end();
  return doc;
}
