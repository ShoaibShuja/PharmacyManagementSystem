export type ExportColumn = {
  header: string;
  key: string;
  width?: number;
  align?: "left" | "right";
};

export type ExportRow = Record<string, string | number>;

export type ReportExport = {
  title: string;
  filename: string;
  pharmacyName: string;
  generatedLabel: string;
  summary: Array<{ label: string; value: string }>;
  columns: ExportColumn[];
  rows: ExportRow[];
};

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildCsv(report: ReportExport) {
  const lines = [
    report.columns.map((column) => escapeCsv(column.header)).join(","),
    ...report.rows.map((row) =>
      report.columns.map((column) => escapeCsv(row[column.key] ?? "")).join(","),
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadCsv(report: ReportExport) {
  downloadBlob(buildCsv(report), "text/csv;charset=utf-8", `${report.filename}.csv`);
}

export async function downloadPdf(report: ReportExport) {
  const document = await buildPdf(report);
  document.save(`${report.filename}.pdf`);
}

export async function buildPdf(report: ReportExport) {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const rowHeight = 7;
  const headerHeight = 8;
  const widths = getColumnWidths(report.columns, contentWidth);
  let y = 13;

  function addPageHeader() {
    document.setTextColor(20, 30, 40);
    document.setFont("helvetica", "bold");
    document.setFontSize(15);
    document.text(report.pharmacyName, margin, y);
    document.setFontSize(11);
    document.text(report.title, margin, y + 6);
    document.setFont("helvetica", "normal");
    document.setTextColor(95, 105, 115);
    document.setFontSize(8);
    document.text(report.generatedLabel, pageWidth - margin, y, {
      align: "right",
    });
    y += 12;

    if (report.summary.length > 0) {
      const summaryText = report.summary
        .map((item) => `${item.label}: ${item.value}`)
        .join("   |   ");
      document.setTextColor(50, 60, 70);
      document.text(summaryText, margin, y, { maxWidth: contentWidth });
      y += 7;
    }

    drawTableHeader();
  }

  function drawTableHeader() {
    document.setFillColor(235, 245, 241);
    document.rect(margin, y, contentWidth, headerHeight, "F");
    document.setTextColor(30, 70, 55);
    document.setFont("helvetica", "bold");
    document.setFontSize(8);
    let x = margin;
    report.columns.forEach((column, index) => {
      const align = column.align ?? "left";
      const textX = align === "right" ? x + widths[index] - 2 : x + 2;
      document.text(column.header, textX, y + 5, { align });
      x += widths[index];
    });
    y += headerHeight;
  }

  addPageHeader();

  if (report.rows.length === 0) {
    document.setFont("helvetica", "normal");
    document.setTextColor(100, 110, 120);
    document.text("No records for the selected filters.", margin + 2, y + 7);
  } else {
    for (let rowIndex = 0; rowIndex < report.rows.length; rowIndex += 1) {
      if (y + rowHeight > pageHeight - 12) {
        document.addPage();
        y = 13;
        addPageHeader();
      }

      if (rowIndex % 2 === 1) {
        document.setFillColor(249, 250, 251);
        document.rect(margin, y, contentWidth, rowHeight, "F");
      }

      document.setFont("helvetica", "normal");
      document.setTextColor(35, 42, 50);
      document.setFontSize(7.5);
      let x = margin;
      report.columns.forEach((column, columnIndex) => {
        const align = column.align ?? "left";
        const textX =
          align === "right" ? x + widths[columnIndex] - 2 : x + 2;
        const value = String(report.rows[rowIndex][column.key] ?? "");
        const clipped =
          value.length > 42 ? `${value.slice(0, 39)}...` : value;
        document.text(clipped, textX, y + 4.7, { align });
        x += widths[columnIndex];
      });
      y += rowHeight;
    }
  }

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setTextColor(120, 125, 130);
    document.setFontSize(7);
    document.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: "right",
    });
  }

  return document;
}

function getColumnWidths(columns: ExportColumn[], availableWidth: number) {
  const specified = columns.reduce(
    (total, column) => total + (column.width ?? 0),
    0,
  );
  const unspecified = columns.filter((column) => column.width === undefined).length;
  const remaining = Math.max(availableWidth - specified, 0);
  const automaticWidth = unspecified > 0 ? remaining / unspecified : 0;
  return columns.map((column) => column.width ?? automaticWidth);
}
