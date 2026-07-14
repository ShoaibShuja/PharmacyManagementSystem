import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "docs", "new docs");
const baseName = "darman-chen-style-entity-relationship-diagram";
const drawioPath = path.join(outputDir, `${baseName}.drawio`);
const svgPath = path.join(outputDir, `${baseName}.svg`);
const jpegPath = path.join(outputDir, `${baseName}.jpeg`);

const width = 4400;
const height = 2240;

const colors = {
  bg: "#ffffff",
  band: "#f8fafc",
  entityFill: "#fde6c8",
  entityStroke: "#d99a00",
  weakFill: "#fff1d6",
  weakStroke: "#c78300",
  relationshipFill: "#e6f4db",
  relationshipStroke: "#82b366",
  attributeFill: "#d7e8ff",
  attributeStroke: "#6c8ebf",
  text: "#111827",
  muted: "#475569",
  line: "#1f2937",
  noteFill: "#f8fafc",
  noteStroke: "#94a3b8",
};

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#xa;");

const bands = [
  { label: "Access and Settings", x: 110, y: 120, w: 520, h: 1960 },
  { label: "Catalog", x: 690, y: 120, w: 890, h: 1960 },
  { label: "Inventory", x: 1640, y: 120, w: 920, h: 1960 },
  { label: "Purchasing", x: 2620, y: 120, w: 720, h: 1960 },
  { label: "Sales", x: 3400, y: 120, w: 860, h: 1960 },
];

const entities = [
  {
    id: "profile",
    label: "Profile",
    x: 260,
    y: 620,
    w: 180,
    h: 90,
    attrs: [
      ["id", -128, -118, true],
      ["email", 25, -145],
      ["role", 155, -105],
      ["is_active", -130, 60],
    ],
  },
  {
    id: "settings",
    label: "App Settings",
    x: 250,
    y: 1190,
    w: 210,
    h: 90,
    attrs: [
      ["singleton", -130, -118, true],
      ["pharmacy_name", 50, -145],
      ["currency_code", 160, 60],
      ["expiry_alert_days", -145, 68],
    ],
  },
  {
    id: "category",
    label: "Medicine Category",
    x: 890,
    y: 300,
    w: 245,
    h: 90,
    attrs: [
      ["id", -118, -112, true],
      ["name", 60, -142],
      ["is_active", -130, 54],
    ],
  },
  {
    id: "supplier",
    label: "Supplier",
    x: 895,
    y: 1080,
    w: 200,
    h: 90,
    attrs: [
      ["id", -118, -118, true],
      ["name", 35, -148],
      ["phone", 160, -82],
      ["email", 160, 54],
      ["is_active", -130, 68],
    ],
  },
  {
    id: "medicine",
    label: "Medicine",
    x: 1370,
    y: 650,
    w: 205,
    h: 90,
    attrs: [
      ["id", -125, -148, true],
      ["brand_name", 10, -170],
      ["generic_name", 170, -130],
      ["sku", 190, -18],
      ["barcode", 170, 88],
      ["status", -135, 88],
    ],
  },
  {
    id: "batch",
    label: "Inventory Batch",
    x: 2030,
    y: 650,
    w: 235,
    h: 90,
    weak: true,
    attrs: [
      ["id", -118, -160, true],
      ["batch_number", 35, -178],
      ["expiry_date", 198, -140],
      ["current_quantity", 215, 30],
      ["selling_price", -140, 94],
    ],
  },
  {
    id: "adjustment",
    label: "Inventory Adjustment",
    x: 2020,
    y: 1410,
    w: 280,
    h: 90,
    weak: true,
    attrs: [
      ["id", -125, -130, true],
      ["adjustment_type", 32, -154],
      ["quantity_change", 230, -92],
      ["reason", 228, 58],
      ["created_at", -135, 68],
    ],
  },
  {
    id: "purchase_order",
    label: "Purchase Order",
    x: 2865,
    y: 310,
    w: 235,
    h: 90,
    attrs: [
      ["id", -118, -116, true],
      ["order_number", 65, -150],
      ["status", 190, -82],
      ["expected_date", 205, 50],
      ["total_amount", -132, 60],
    ],
  },
  {
    id: "purchase_item",
    label: "Purchase Order Item",
    x: 2845,
    y: 850,
    w: 285,
    h: 90,
    weak: true,
    attrs: [
      ["id", -118, -132, true],
      ["ordered_quantity", 45, -162],
      ["received_quantity", 248, -92],
      ["unit_cost", 262, 36],
      ["intended_selling_price", -156, 68],
    ],
  },
  {
    id: "summary",
    label: "Medicine Inventory Summary",
    x: 2840,
    y: 1410,
    w: 305,
    h: 90,
    weak: true,
    view: true,
    attrs: [
      ["medicine_id", -130, -132, true],
      ["total_stock", 30, -164],
      ["saleable_stock", 222, -118],
      ["nearest_expiry", 230, 58],
    ],
  },
  {
    id: "sale",
    label: "Sale",
    x: 3540,
    y: 1410,
    w: 180,
    h: 90,
    attrs: [
      ["id", -118, -132, true],
      ["sale_number", 35, -162],
      ["status", 190, -92],
      ["payment_method", 198, 50],
      ["total_amount", -140, 68],
      ["completed_at", 20, 118],
    ],
  },
  {
    id: "sale_item",
    label: "Sale Item",
    x: 3890,
    y: 1410,
    w: 205,
    h: 90,
    weak: true,
    attrs: [
      ["id", -108, -145, true],
      ["quantity", 45, -168],
      ["unit_price", 182, -102],
      ["line_total", 182, 45],
      ["cost_snapshot", -138, 72],
    ],
  },
];

const relationships = [
  { id: "has_profile_settings", label: "Updates", x: 278, y: 905, from: "profile", to: "settings", fromCard: "1", toCard: "0..1" },
  { id: "categorizes", label: "Categorizes", x: 1210, y: 395, from: "category", to: "medicine", fromCard: "1", toCard: "0..*" },
  { id: "default_supplier", label: "Default Supplier", x: 1190, y: 1010, from: "supplier", to: "medicine", fromCard: "0..1", toCard: "0..*" },
  { id: "has_batch", label: "Has", x: 1740, y: 642, from: "medicine", to: "batch", fromCard: "1", toCard: "0..*" },
  { id: "adjusts_medicine", label: "Tracks", x: 1690, y: 1010, from: "medicine", to: "adjustment", fromCard: "1", toCard: "0..*" },
  { id: "adjusts_batch", label: "Adjusts", x: 2074, y: 960, from: "batch", to: "adjustment", fromCard: "1", toCard: "0..*" },
  { id: "supplies_batch", label: "Supplies", x: 1645, y: 1375, from: "supplier", to: "batch", fromCard: "0..1", toCard: "0..*" },
  { id: "summarized", label: "Summary", x: 2430, y: 1365, from: "medicine", to: "summary", fromCard: "1", toCard: "1" },
  {
    id: "creates_po",
    label: "Creates",
    x: 2030,
    y: 260,
    from: "profile",
    to: "purchase_order",
    fromCard: "1",
    toCard: "0..*",
    fromPoints: [{ x: 440, y: 665 }, { x: 440, y: 220 }, { x: 2030, y: 220 }],
  },
  {
    id: "receives_po",
    label: "Receives",
    x: 2440,
    y: 410,
    from: "supplier",
    to: "purchase_order",
    fromCard: "1",
    toCard: "0..*",
    fromPoints: [{ x: 1180, y: 1125 }, { x: 1180, y: 520 }],
  },
  { id: "contains_po_item", label: "Contains", x: 2908, y: 575, from: "purchase_order", to: "purchase_item", fromCard: "1", toCard: "1..*" },
  { id: "orders_medicine", label: "Orders", x: 2405, y: 820, from: "medicine", to: "purchase_item", fromCard: "1", toCard: "0..*" },
  { id: "received_as", label: "Received As", x: 2405, y: 680, from: "purchase_item", to: "batch", fromCard: "0..1", toCard: "0..1" },
  {
    id: "performs_adjustment",
    label: "Performs",
    x: 1340,
    y: 1740,
    from: "profile",
    to: "adjustment",
    fromCard: "1",
    toCard: "0..*",
    fromPoints: [{ x: 520, y: 665 }, { x: 520, y: 1785 }, { x: 1340, y: 1785 }],
  },
  {
    id: "creates_sale",
    label: "Creates",
    x: 2520,
    y: 1860,
    from: "profile",
    to: "sale",
    fromCard: "1",
    toCard: "0..*",
    fromPoints: [{ x: 500, y: 665 }, { x: 500, y: 1950 }, { x: 2520, y: 1950 }],
  },
  { id: "sold_medicine", label: "Sells", x: 2630, y: 1110, from: "medicine", to: "sale_item", fromCard: "1", toCard: "0..*" },
  { id: "allocated_batch", label: "Allocated From", x: 2740, y: 680, from: "batch", to: "sale_item", fromCard: "0..1", toCard: "0..*" },
  { id: "contains_sale_item", label: "Contains", x: 3748, y: 1402, from: "sale", to: "sale_item", fromCard: "1", toCard: "1..*" },
];

const entityById = Object.fromEntries(entities.map((entity) => [entity.id, entity]));

function entityCenter(id) {
  const entity = entityById[id];
  return { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
}

function entityPort(from, target) {
  const source = entityById[from];
  const center = entityCenter(from);
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx >= 0 ? source.x + source.w : source.x, y: center.y };
  }
  return { x: center.x, y: dy >= 0 ? source.y + source.h : source.y };
}

function relationPort(relationship, sourceId) {
  const relCenter = { x: relationship.x + 72.5, y: relationship.y + 52.5 };
  const sourceCenter = entityCenter(sourceId);
  const dx = sourceCenter.x - relCenter.x;
  const dy = sourceCenter.y - relCenter.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx < 0 ? relationship.x : relationship.x + 145, y: relCenter.y };
  }
  return { x: relCenter.x, y: dy < 0 ? relationship.y : relationship.y + 105 };
}

function orthogonalPath(a, b) {
  const midX = Math.round((a.x + b.x) / 2);
  return `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;
}

function routedPath(a, b, points = []) {
  if (!points.length) {
    return orthogonalPath(a, b);
  }
  return `M ${a.x} ${a.y} ${points.map((point) => `L ${point.x} ${point.y}`).join(" ")} L ${b.x} ${b.y}`;
}

const mxCells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
let nextId = 2;
const idMap = new Map();

function addCell(id, value, style, x, y, w, h) {
  const xmlId = id || `cell-${nextId++}`;
  idMap.set(id, xmlId);
  mxCells.push(`<mxCell id="${xmlId}" value="${esc(value)}" style="${style}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  return xmlId;
}

function addEdge(id, value, source, target, style, points = []) {
  const xmlId = id || `edge-${nextId++}`;
  const pointXml = points.length
    ? `<Array as="points">${points.map((point) => `<mxPoint x="${point.x}" y="${point.y}"/>`).join("")}</Array>`
    : "";
  mxCells.push(`<mxCell id="${xmlId}" value="${esc(value)}" style="${style}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry">${pointXml}</mxGeometry></mxCell>`);
}

const titleStyle = "text;html=1;strokeColor=none;fillColor=none;fontSize=34;fontStyle=1;align=center;verticalAlign=middle;whiteSpace=wrap;";
addCell("title", "Darman Pharmacy Management System - Chen Style Entity Relationship Diagram", titleStyle, 720, 34, 2960, 60);

for (const band of bands) {
  addCell(
    `band_${band.label.toLowerCase().replaceAll(" ", "_")}`,
    band.label,
    `rounded=1;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;align=left;verticalAlign=top;spacingLeft=18;spacingTop=12;fillColor=${colors.band};strokeColor=#e2e8f0;strokeWidth=1;`,
    band.x,
    band.y,
    band.w,
    band.h,
  );
}

for (const entity of entities) {
  const fill = entity.weak ? colors.weakFill : colors.entityFill;
  const stroke = entity.weak ? colors.weakStroke : colors.entityStroke;
  addCell(
    entity.id,
    entity.label,
    `rounded=0;whiteSpace=wrap;html=1;fontSize=18;fontStyle=1;fillColor=${fill};strokeColor=${stroke};strokeWidth=2;`,
    entity.x,
    entity.y,
    entity.w,
    entity.h,
  );
  if (entity.weak) {
    addCell(
      `${entity.id}_weak_frame`,
      "",
      `rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor=${stroke};strokeWidth=1;`,
      entity.x + 7,
      entity.y + 7,
      entity.w - 14,
      entity.h - 14,
    );
  }
}

for (const relationship of relationships) {
  addCell(
    relationship.id,
    relationship.label,
    `rhombus;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=${colors.relationshipFill};strokeColor=${colors.relationshipStroke};strokeWidth=2;`,
    relationship.x,
    relationship.y,
    145,
    105,
  );
}

for (const entity of entities) {
  const sourceId = idMap.get(entity.id);
  for (const [index, attr] of entity.attrs.entries()) {
    const [label, dx, dy, key] = attr;
    const attrId = `${entity.id}_attr_${index}`;
    const attrX = entity.x + entity.w / 2 + dx;
    const attrY = entity.y + entity.h / 2 + dy;
    const underline = key ? "fontStyle=4;" : "";
    const dashed = label.includes("_id") && !key ? "dashed=1;" : "";
    addCell(
      attrId,
      label,
      `ellipse;whiteSpace=wrap;html=1;fontSize=14;${underline}fillColor=${colors.attributeFill};strokeColor=${colors.attributeStroke};strokeWidth=1.5;${dashed}`,
      attrX,
      attrY,
      label.length > 13 ? 142 : 114,
      68,
    );
    addEdge(
      `${attrId}_edge`,
      "",
      sourceId,
      idMap.get(attrId),
      `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=${colors.line};endArrow=none;`,
    );
  }
}

for (const relationship of relationships) {
  const relId = idMap.get(relationship.id);
  addEdge(
    `${relationship.id}_from`,
    relationship.fromCard,
    idMap.get(relationship.from),
    relId,
    `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;fontSize=14;fontStyle=1;strokeColor=${colors.line};endArrow=none;labelBackgroundColor=#ffffff;`,
    relationship.fromPoints || [],
  );
  addEdge(
    `${relationship.id}_to`,
    relationship.toCard,
    relId,
    idMap.get(relationship.to),
    `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;fontSize=14;fontStyle=1;strokeColor=${colors.line};endArrow=none;labelBackgroundColor=#ffffff;`,
    relationship.toPoints || [],
  );
}

addCell(
  "legend",
  "Notation: rectangles = entities, double rectangles = weak/dependent entities, diamonds = relationships, ovals = attributes, underlined ovals = identifiers, dashed ovals = foreign/reference identifiers.",
  `rounded=1;whiteSpace=wrap;html=1;fontSize=15;align=left;spacingLeft=14;fillColor=${colors.noteFill};strokeColor=${colors.noteStroke};`,
  180,
  2110,
  3500,
  70,
);

const drawio = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" modified="2026-07-05T00:00:00.000Z" agent="Codex" version="26.0.0" type="device">
  <diagram id="darman-chen-erd" name="Chen Style ERD">
    <mxGraphModel dx="1800" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="0" shadow="0">
      <root>
        ${mxCells.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;

function text(value, x, y, size = 16, weight = 600, fill = colors.text, anchor = "middle", style = "") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${style}>${esc(value)}</text>`;
}

function svgBand(band) {
  return `<rect x="${band.x}" y="${band.y}" width="${band.w}" height="${band.h}" rx="12" fill="${colors.band}" stroke="#e2e8f0" stroke-width="1.2"/>
${text(band.label, band.x + 22, band.y + 38, 16, 700, colors.muted, "start")}`;
}

function svgEntity(entity) {
  const fill = entity.weak ? colors.weakFill : colors.entityFill;
  const stroke = entity.weak ? colors.weakStroke : colors.entityStroke;
  const frame = entity.weak
    ? `<rect x="${entity.x + 7}" y="${entity.y + 7}" width="${entity.w - 14}" height="${entity.h - 14}" fill="none" stroke="${stroke}" stroke-width="1.4"/>`
    : "";
  return `<rect x="${entity.x}" y="${entity.y}" width="${entity.w}" height="${entity.h}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
${frame}
${text(entity.label, entity.x + entity.w / 2, entity.y + entity.h / 2 + 7, 18, 700)}`;
}

function svgRelationship(relationship) {
  const cx = relationship.x + 72.5;
  const cy = relationship.y + 52.5;
  return `<polygon points="${cx},${relationship.y} ${relationship.x + 145},${cy} ${cx},${relationship.y + 105} ${relationship.x},${cy}" fill="${colors.relationshipFill}" stroke="${colors.relationshipStroke}" stroke-width="2"/>
${text(relationship.label, cx, cy + 5, relationship.label.length > 12 ? 13 : 15, 700)}`;
}

function svgAttribute(entity, attr) {
  const [label, dx, dy, key] = attr;
  const x = entity.x + entity.w / 2 + dx;
  const y = entity.y + entity.h / 2 + dy;
  const w = label.length > 13 ? 142 : 114;
  const h = 68;
  const attrCenter = { x: x + w / 2, y: y + h / 2 };
  const from = entityPort(entity.id, attrCenter);
  const line = `<path d="${orthogonalPath(from, attrCenter)}" fill="none" stroke="${colors.line}" stroke-width="1.35"/>`;
  const ellipse = `<ellipse cx="${attrCenter.x}" cy="${attrCenter.y}" rx="${w / 2}" ry="${h / 2}" fill="${colors.attributeFill}" stroke="${colors.attributeStroke}" stroke-width="1.5" ${label.includes("_id") && !key ? 'stroke-dasharray="5 4"' : ""}/>`;
  const underline = key ? 'text-decoration="underline"' : "";
  return `${line}\n${ellipse}\n${text(label, attrCenter.x, attrCenter.y + 5, 14, 500, colors.text, "middle", underline)}`;
}

function labelBox(value, x, y) {
  return `<rect x="${x - 28}" y="${y - 20}" width="56" height="23" rx="4" fill="#ffffff" opacity="0.94"/>
${text(value, x, y - 4, 13, 700)}`;
}

function svgRelationEdges(relationship) {
  const relCenter = { x: relationship.x + 72.5, y: relationship.y + 52.5 };
  const sourcePort = entityPort(relationship.from, relCenter);
  const targetPort = entityPort(relationship.to, relCenter);
  const relFrom = relationPort(relationship, relationship.from);
  const relTo = relationPort(relationship, relationship.to);
  const fromMid = relationship.fromPoints?.[Math.floor(relationship.fromPoints.length / 2)] || {
    x: (sourcePort.x + relFrom.x) / 2,
    y: (sourcePort.y + relFrom.y) / 2,
  };
  const toMid = relationship.toPoints?.[Math.floor(relationship.toPoints.length / 2)] || {
    x: (targetPort.x + relTo.x) / 2,
    y: (targetPort.y + relTo.y) / 2,
  };
  const fromLabel = { x: fromMid.x, y: fromMid.y - 6 };
  const toLabel = { x: toMid.x, y: toMid.y - 6 };
  return `<path d="${routedPath(sourcePort, relFrom, relationship.fromPoints)}" fill="none" stroke="${colors.line}" stroke-width="1.75"/>
<path d="${routedPath(relTo, targetPort, relationship.toPoints)}" fill="none" stroke="${colors.line}" stroke-width="1.75"/>
${labelBox(relationship.fromCard, fromLabel.x, fromLabel.y)}
${labelBox(relationship.toCard, toLabel.x, toLabel.y)}`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${colors.bg}"/>
  ${text("Darman Pharmacy Management System - Chen Style Entity Relationship Diagram", width / 2, 72, 34, 800)}
  ${bands.map(svgBand).join("\n")}
  ${relationships.map(svgRelationEdges).join("\n")}
  ${relationships.map(svgRelationship).join("\n")}
  ${entities.map(svgEntity).join("\n")}
  ${entities.flatMap((entity) => entity.attrs.map((attr) => svgAttribute(entity, attr))).join("\n")}
  <rect x="180" y="2110" width="3500" height="70" rx="8" fill="${colors.noteFill}" stroke="${colors.noteStroke}" stroke-width="1.5"/>
  ${text("Notation: rectangles = entities, double rectangles = weak/dependent entities, diamonds = relationships, ovals = attributes, underlined ovals = identifiers, dashed ovals = foreign/reference identifiers.", 205, 2152, 15, 600, colors.text, "start")}
</svg>`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(drawioPath, drawio, "utf8");
await fs.writeFile(svgPath, svg, "utf8");
await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toFile(jpegPath);

console.log(
  JSON.stringify(
    {
      drawio: drawioPath,
      jpeg: jpegPath,
      svg: svgPath,
      entities: entities.length,
      relationships: relationships.length,
      dimensions: `${width} x ${height}`,
    },
    null,
    2,
  ),
);
