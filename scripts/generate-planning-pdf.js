const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "docs", "planejamento-crm-inteligentte.md");
const outputPath = path.join(root, "docs", "planejamento-crm-inteligentte.pdf");
const publicOutputPath = path.join(root, "public", "docs", "planejamento-crm-inteligentte.pdf");

const markdown = fs.readFileSync(inputPath, "utf8");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  bufferPages: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const colors = {
  ink: "#17202A",
  muted: "#5D6D7E",
  rule: "#D5DBDB",
  accent: "#0E6251",
  codeBg: "#F4F6F7"
};

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
let inCode = false;

function ensureSpace(height) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function writeText(text, options = {}) {
  ensureSpace(options.height || 18);
  doc.text(text, {
    width: pageWidth,
    lineGap: options.lineGap ?? 2,
    continued: false,
    indent: options.indent || 0
  });
}

function writeParagraph(line) {
  doc.font("Helvetica").fontSize(10.2).fillColor(colors.ink);
  writeText(line, { height: 24, lineGap: 3 });
  doc.moveDown(0.35);
}

function writeListItem(line) {
  doc.font("Helvetica").fontSize(10).fillColor(colors.ink);
  const cleaned = line.replace(/^\s*[-*]\s+/, "");
  ensureSpace(24);
  const startY = doc.y;
  doc.text("-", doc.page.margins.left, startY, { width: 12 });
  doc.text(cleaned, doc.page.margins.left + 16, startY, {
    width: pageWidth - 16,
    lineGap: 2
  });
  doc.moveDown(0.25);
}

function writeNumberedItem(line) {
  doc.font("Helvetica").fontSize(10).fillColor(colors.ink);
  const match = line.match(/^(\d+\.)\s+(.*)$/);
  if (!match) return writeParagraph(line);
  ensureSpace(24);
  const startY = doc.y;
  doc.text(match[1], doc.page.margins.left, startY, { width: 28 });
  doc.text(match[2], doc.page.margins.left + 32, startY, {
    width: pageWidth - 32,
    lineGap: 2
  });
  doc.moveDown(0.25);
}

function writeHeading(line) {
  const level = line.match(/^#+/)[0].length;
  const text = line.replace(/^#+\s*/, "");
  const sizes = { 1: 22, 2: 15, 3: 12.5, 4: 10.8 };
  const size = sizes[level] || 10.5;
  const space = level === 1 ? 48 : 34;
  ensureSpace(space);
  if (level === 1) {
    doc.font("Helvetica-Bold").fontSize(size).fillColor(colors.accent);
    writeText(text, { height: 34, lineGap: 1 });
    doc.moveTo(doc.page.margins.left, doc.y + 4)
      .lineTo(doc.page.margins.left + pageWidth, doc.y + 4)
      .strokeColor(colors.rule)
      .lineWidth(1)
      .stroke();
    doc.moveDown(1.1);
    return;
  }
  doc.moveDown(level === 2 ? 0.8 : 0.35);
  doc.font("Helvetica-Bold").fontSize(size).fillColor(level === 2 ? colors.accent : colors.ink);
  writeText(text, { height: 24, lineGap: 1 });
  doc.moveDown(0.25);
}

function writeCodeLine(line) {
  doc.font("Courier").fontSize(8.7).fillColor(colors.ink);
  ensureSpace(18);
  const x = doc.page.margins.left;
  const y = doc.y;
  const h = Math.max(16, doc.heightOfString(line || " ", { width: pageWidth - 16 }) + 6);
  doc.rect(x - 4, y - 2, pageWidth + 8, h).fill(colors.codeBg);
  doc.fillColor(colors.ink).text(line || " ", x + 4, y + 2, {
    width: pageWidth - 8,
    lineGap: 1
  });
}

for (const rawLine of markdown.split(/\r?\n/)) {
  const line = rawLine.replace(/\s+$/g, "");

  if (line.startsWith("```")) {
    inCode = !inCode;
    if (!inCode) doc.moveDown(0.5);
    continue;
  }

  if (inCode) {
    writeCodeLine(line);
    continue;
  }

  if (!line.trim()) {
    doc.moveDown(0.45);
    continue;
  }

  if (/^#{1,6}\s+/.test(line)) {
    writeHeading(line);
    continue;
  }

  if (/^\s*[-*]\s+/.test(line)) {
    writeListItem(line);
    continue;
  }

  if (/^\d+\.\s+/.test(line)) {
    writeNumberedItem(line);
    continue;
  }

  if (/^---+$/.test(line)) {
    ensureSpace(16);
    doc.moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.margins.left + pageWidth, doc.y)
      .strokeColor(colors.rule)
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);
    continue;
  }

  writeParagraph(line);
}

const pages = doc.bufferedPageRange();
for (let i = pages.start; i < pages.start + pages.count; i += 1) {
  doc.switchToPage(i);
  doc.font("Helvetica").fontSize(8).fillColor(colors.muted);
  doc.text(
    `CRM INTELIGENTTE - Planejamento | Pagina ${i + 1} de ${pages.count}`,
    doc.page.margins.left,
    doc.page.height - 34,
    { width: pageWidth, align: "center" }
  );
}

doc.end();

stream.on("finish", () => {
  fs.mkdirSync(path.dirname(publicOutputPath), { recursive: true });
  fs.copyFileSync(outputPath, publicOutputPath);
  console.log(`PDF gerado em: ${outputPath}`);
  console.log(`PDF publico gerado em: ${publicOutputPath}`);
});
