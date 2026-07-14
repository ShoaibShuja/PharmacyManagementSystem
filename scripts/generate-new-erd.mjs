import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "docs", "diagrams", "New ERD");
const drawioPath = path.join(outputDir, "darman-complete-entity-relationship-diagram.drawio");

const colors = {
  bg: "#f8fafc",
  ink: "#172033",
  muted: "#526070",
  line: "#5b708b",
  grid: "#e2e8f0",
  entity: "#dbeafe",
  entityStroke: "#2563eb",
  weak: "#fef3c7",
  weakStroke: "#d97706",
  bridge: "#dcfce7",
  bridgeStroke: "#16a34a",
  audit: "#ede9fe",
  auditStroke: "#7c3aed",
  view: "#fee2e2",
  viewStroke: "#dc2626",
  pk: "#eff6ff",
  fk: "#f8fafc",
  required: "#ffffff",
  optional: "#f8fafc",
};

const physicalTables = {
  profiles: table("profiles", "entity", [
    pk("id", "uuid", "NOT NULL", "PK, FK auth.users(id), ON DELETE CASCADE"),
    col("email", "text", "NOT NULL", "CHECK not blank"),
    col("full_name", "text", "NOT NULL", "DEFAULT ''"),
    col("role", "app_role", "NOT NULL", "DEFAULT cashier"),
    col("is_active", "boolean", "NOT NULL", "DEFAULT true"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  medicine_categories: table("medicine_categories", "entity", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    col("name", "text", "NOT NULL", "UQ lower(name), CHECK not blank"),
    col("description", "text", "NULL", ""),
    col("is_active", "boolean", "NOT NULL", "DEFAULT true"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  suppliers: table("suppliers", "entity", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    col("name", "text", "NOT NULL", "IDX, CHECK not blank"),
    col("contact_person", "text", "NULL", ""),
    col("phone", "text", "NULL", ""),
    col("email", "text", "NULL", "CHECK email format when present"),
    col("address", "text", "NULL", ""),
    col("notes", "text", "NULL", ""),
    col("is_active", "boolean", "NOT NULL", "DEFAULT true"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  medicines: table("medicines", "entity", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    col("brand_name", "text", "NOT NULL", "IDX, CHECK not blank"),
    col("generic_name", "text", "NULL", "IDX"),
    col("dosage_form", "text", "NOT NULL", "CHECK not blank"),
    col("strength", "text", "NULL", ""),
    fk("category_id", "uuid", "NULL", "FK medicine_categories.id, ON DELETE SET NULL"),
    fk("default_supplier_id", "uuid", "NULL", "FK suppliers.id, ON DELETE SET NULL"),
    col("sku", "text", "NULL", "UQ lower(sku) when present"),
    col("barcode", "text", "NULL", "UQ barcode when present"),
    col("unit", "text", "NOT NULL", "DEFAULT unit, CHECK not blank"),
    col("default_selling_price", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("default_cost_price", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("reorder_threshold", "integer", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("status", "record_status", "NOT NULL", "DEFAULT active"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  inventory_batches: table("inventory_batches", "weak", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    fk("medicine_id", "uuid", "NOT NULL", "FK medicines.id, ON DELETE RESTRICT"),
    fk("supplier_id", "uuid", "NULL", "FK suppliers.id, ON DELETE SET NULL"),
    fk("purchase_order_item_id", "uuid", "NULL", "FK purchase_order_items.id, ON DELETE SET NULL"),
    col("batch_number", "text", "NOT NULL", "UQ medicine_id + lower(batch_number)"),
    col("expiry_date", "date", "NOT NULL", "IDX"),
    col("cost_price", "numeric(12,2)", "NOT NULL", "CHECK >= 0"),
    col("selling_price", "numeric(12,2)", "NOT NULL", "CHECK >= 0"),
    col("initial_quantity", "integer", "NOT NULL", "CHECK > 0"),
    col("current_quantity", "integer", "NOT NULL", "CHECK >= 0"),
    col("received_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  sales: table("sales", "entity", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    col("sale_number", "text", "NOT NULL", "UQ, CHECK not blank"),
    col("status", "sale_status", "NOT NULL", "DEFAULT draft"),
    col("subtotal", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("discount_amount", "numeric(12,2)", "NOT NULL", "CHECK 0..subtotal"),
    col("tax_amount", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("total_amount", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("amount_paid", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("change_amount", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("payment_method", "payment_method", "NOT NULL", "DEFAULT cash"),
    fk("cashier_id", "uuid", "NOT NULL", "FK profiles.id, ON DELETE RESTRICT"),
    col("completed_at", "timestamptz", "NULL", "Required when completed"),
    col("voided_at", "timestamptz", "NULL", "Required when voided"),
    fk("voided_by", "uuid", "NULL", "FK profiles.id, required when voided"),
    col("void_reason", "text", "NULL", ""),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  sale_items: table("sale_items", "bridge", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    fk("sale_id", "uuid", "NOT NULL", "FK sales.id, ON DELETE CASCADE"),
    fk("medicine_id", "uuid", "NOT NULL", "FK medicines.id, ON DELETE RESTRICT"),
    fk("inventory_batch_id", "uuid", "NULL", "FK inventory_batches.id, historical batch link"),
    col("quantity", "integer", "NOT NULL", "CHECK > 0"),
    col("unit_price", "numeric(12,2)", "NOT NULL", "CHECK >= 0"),
    col("cost_price_snapshot", "numeric(12,2)", "NOT NULL", "DEFAULT 0"),
    col("discount_amount", "numeric(12,2)", "NOT NULL", "CHECK <= unit_price * quantity"),
    col("line_total", "numeric(12,2)", "NOT NULL", "CHECK >= 0"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  purchase_orders: table("purchase_orders", "entity", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    col("order_number", "text", "NOT NULL", "UQ, CHECK not blank"),
    fk("supplier_id", "uuid", "NOT NULL", "FK suppliers.id, ON DELETE RESTRICT"),
    col("status", "purchase_order_status", "NOT NULL", "DEFAULT draft"),
    col("expected_date", "date", "NULL", "CHECK not in past"),
    col("subtotal", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("discount_amount", "numeric(12,2)", "NOT NULL", "CHECK 0..subtotal"),
    col("tax_amount", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("total_amount", "numeric(12,2)", "NOT NULL", "DEFAULT 0, CHECK >= 0"),
    col("notes", "text", "NULL", ""),
    fk("created_by", "uuid", "NOT NULL", "FK profiles.id, ON DELETE RESTRICT"),
    col("ordered_at", "timestamptz", "NULL", ""),
    col("received_at", "timestamptz", "NULL", ""),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  purchase_order_items: table("purchase_order_items", "bridge", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    fk("purchase_order_id", "uuid", "NOT NULL", "FK purchase_orders.id, ON DELETE CASCADE"),
    fk("medicine_id", "uuid", "NOT NULL", "FK medicines.id, ON DELETE RESTRICT"),
    col("ordered_quantity", "integer", "NOT NULL", "CHECK > 0"),
    col("received_quantity", "integer", "NOT NULL", "CHECK 0..ordered_quantity"),
    col("unit_cost", "numeric(12,2)", "NOT NULL", "CHECK >= 0"),
    col("intended_selling_price", "numeric(12,2)", "NOT NULL", "CHECK >= 0"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("UNIQUE", "constraint", "NOT NULL", "purchase_order_id + medicine_id"),
  ]),
  inventory_adjustments: table("inventory_adjustments", "audit", [
    pk("id", "uuid", "NOT NULL", "PK, DEFAULT gen_random_uuid()"),
    fk("medicine_id", "uuid", "NOT NULL", "FK medicines.id, ON DELETE RESTRICT"),
    fk("inventory_batch_id", "uuid", "NOT NULL", "FK inventory_batches.id, ON DELETE RESTRICT"),
    col("adjustment_type", "inventory_adjustment_type", "NOT NULL", "receive/increase/decrease/correction/sale/sale_void"),
    col("quantity_change", "integer", "NOT NULL", "CHECK <> 0"),
    col("reason", "text", "NOT NULL", "CHECK not blank"),
    col("reference_type", "text", "NULL", "sales or purchase workflow reference"),
    col("reference_id", "uuid", "NULL", ""),
    fk("performed_by", "uuid", "NOT NULL", "FK profiles.id, ON DELETE RESTRICT"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  app_settings: table("app_settings", "entity", [
    pk("singleton", "boolean", "NOT NULL", "PK, DEFAULT true, CHECK singleton"),
    col("pharmacy_name", "text", "NOT NULL", "DEFAULT My Pharmacy, CHECK not blank"),
    col("phone", "text", "NULL", ""),
    col("email", "text", "NULL", ""),
    col("address", "text", "NULL", ""),
    col("currency_code", "text", "NOT NULL", "DEFAULT USD, CHECK ^[A-Z]{3}$"),
    col("tax_rate", "numeric(5,2)", "NOT NULL", "CHECK 0..100"),
    col("expiry_alert_days", "integer", "NOT NULL", "CHECK >= 0"),
    col("default_reorder_threshold", "integer", "NOT NULL", "CHECK >= 0"),
    col("receipt_footer", "text", "NULL", ""),
    fk("updated_by", "uuid", "NULL", "FK profiles.id, ON DELETE SET NULL"),
    col("created_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
    col("updated_at", "timestamptz", "NOT NULL", "DEFAULT now()"),
  ]),
  medicine_inventory_summary: table("medicine_inventory_summary", "view", [
    pk("medicine_id", "uuid", "NOT NULL", "VIEW key from medicines.id"),
    col("brand_name", "text", "NOT NULL", "from medicines"),
    col("generic_name", "text", "NULL", "from medicines"),
    col("category_name", "text", "NULL", "from medicine_categories"),
    col("total_quantity", "integer", "NOT NULL", "SUM inventory_batches.current_quantity"),
    col("nearest_expiry_date", "date", "NULL", "MIN batch expiry with stock"),
    col("reorder_threshold", "integer", "NOT NULL", "from medicines"),
    col("is_low_stock", "boolean", "NOT NULL", "total_quantity <= reorder_threshold"),
  ]),
};

const pages = [
  {
    id: "new-conceptual",
    name: "01 - Conceptual ERD",
    file: "01 - Conceptual ERD.webp",
    title: "Conceptual Entity Relationship Diagram",
    subtitle: "Entities, weak entities, bridge entities, attributes, and relationship rules",
    width: 2200,
    height: 1580,
    kind: "conceptual",
    boxes: [
      box("profiles", 80, 290, 270, 90, "entity", ["id", "email", "role"]),
      box("medicine_categories", 510, 290, 300, 90, "entity", ["id", "name"]),
      box("suppliers", 940, 290, 270, 90, "entity", ["id", "name", "contact"]),
      box("app_settings", 1550, 290, 300, 90, "entity", ["singleton", "pharmacy profile"]),
      box("medicines", 520, 640, 330, 100, "entity", ["id", "brand_name", "sku", "barcode"]),
      box("inventory_batches", 1010, 640, 340, 100, "weak", ["id", "batch_number", "expiry_date", "quantity"]),
      box("purchase_orders", 1450, 640, 330, 100, "entity", ["id", "order_number", "status"]),
      box("purchase_order_items", 1450, 1010, 350, 100, "bridge", ["id", "ordered_quantity", "received_quantity"]),
      box("sales", 80, 1010, 300, 100, "entity", ["id", "sale_number", "payment totals"]),
      box("sale_items", 520, 1010, 330, 100, "bridge", ["id", "quantity", "line_total"]),
      box("inventory_adjustments", 990, 1010, 390, 100, "weak", ["id", "type", "quantity_change", "reason"]),
      box("medicine_inventory_summary", 990, 1340, 390, 90, "view", ["medicine_id", "total_quantity", "nearest_expiry"]),
    ],
    relationships: [
      r("medicine_categories", "medicines", "categorizes", "1", "0..*", "id", "category_id"),
      r("suppliers", "medicines", "default supplier", "0..1", "0..*", "id", "default_supplier_id"),
      r("suppliers", "inventory_batches", "supplies batches", "0..1", "0..*", "id", "supplier_id"),
      r("medicines", "inventory_batches", "has batches", "1", "1..*", "id", "medicine_id"),
      r("profiles", "sales", "processes", "1", "0..*", "id", "cashier_id"),
      r("sales", "sale_items", "contains", "1", "1..*", "id", "sale_id"),
      r("medicines", "sale_items", "sold as", "1", "0..*", "id", "medicine_id"),
      r("inventory_batches", "sale_items", "allocated FEFO", "0..1", "0..*", "id", "inventory_batch_id"),
      r("suppliers", "purchase_orders", "receives orders", "1", "0..*", "id", "supplier_id"),
      r("profiles", "purchase_orders", "creates", "1", "0..*", "id", "created_by"),
      r("purchase_orders", "purchase_order_items", "contains", "1", "1..*", "id", "purchase_order_id"),
      r("medicines", "purchase_order_items", "ordered as", "1", "0..*", "id", "medicine_id"),
      r("purchase_order_items", "inventory_batches", "received into", "0..1", "0..*", "id", "purchase_order_item_id"),
      r("medicines", "inventory_adjustments", "audited by", "1", "0..*", "id", "medicine_id"),
      r("inventory_batches", "inventory_adjustments", "stock changes", "1", "0..*", "id", "inventory_batch_id"),
      r("profiles", "inventory_adjustments", "performs", "1", "0..*", "id", "performed_by"),
      r("profiles", "app_settings", "updates", "0..1", "0..1", "id", "updated_by"),
      r("medicines", "medicine_inventory_summary", "summarizes", "1", "1", "id", "medicine_id"),
      r("inventory_batches", "medicine_inventory_summary", "aggregates", "0..*", "1", "medicine_id", "medicine_id"),
    ],
    notes: [
      note(1540, 1280, 520, 160, "Legend", [
        "Blue = strong entity",
        "Yellow = weak / existence-dependent entity",
        "Green = bridge / junction table",
        "Red = read-only reporting view",
      ]),
    ],
  },
  physicalPage("02 - Catalog and Inventory Physical ERD", "02 - Catalog and Inventory Physical ERD.webp", 2860, 1460, [
    place("medicine_categories", 80, 170, 720),
    place("suppliers", 80, 690, 720),
    place("medicines", 990, 170, 780),
    place("inventory_batches", 1980, 170, 800),
    place("inventory_adjustments", 990, 880, 780),
    place("medicine_inventory_summary", 1980, 880, 800),
  ], [
    r("medicine_categories", "medicines", "category_id optional", "1", "0..*", "id", "category_id"),
    r("suppliers", "medicines", "default_supplier_id optional", "0..1", "0..*", "id", "default_supplier_id"),
    r("suppliers", "inventory_batches", "supplier_id optional", "0..1", "0..*", "id", "supplier_id"),
    r("medicines", "inventory_batches", "medicine_id required", "1", "0..*", "id", "medicine_id"),
    r("medicines", "inventory_adjustments", "medicine_id required", "1", "0..*", "id", "medicine_id"),
    r("inventory_batches", "inventory_adjustments", "inventory_batch_id required", "1", "0..*", "id", "inventory_batch_id"),
    r("medicines", "medicine_inventory_summary", "view key", "1", "1", "id", "medicine_id"),
    r("inventory_batches", "medicine_inventory_summary", "quantity aggregate", "0..*", "1", "medicine_id", "medicine_id"),
  ]),
  physicalPage("03 - Sales Physical ERD", "03 - Sales Physical ERD.webp", 2860, 1380, [
    place("profiles", 80, 180, 720),
    place("sales", 990, 150, 780),
    place("sale_items", 990, 860, 780),
    place("medicines", 1980, 150, 800),
    place("inventory_batches", 1980, 860, 800),
  ], [
    r("profiles", "sales", "cashier_id required", "1", "0..*", "id", "cashier_id"),
    r("profiles", "sales", "voided_by optional", "0..1", "0..*", "id", "voided_by"),
    r("sales", "sale_items", "sale_id cascade", "1", "1..*", "id", "sale_id"),
    r("medicines", "sale_items", "medicine_id required", "1", "0..*", "id", "medicine_id"),
    r("inventory_batches", "sale_items", "batch snapshot optional", "0..1", "0..*", "id", "inventory_batch_id"),
    r("medicines", "inventory_batches", "saleable batches", "1", "0..*", "id", "medicine_id"),
  ]),
  physicalPage("04 - Purchasing Physical ERD", "04 - Purchasing Physical ERD.webp", 2860, 1420, [
    place("suppliers", 80, 150, 720),
    place("profiles", 80, 800, 720),
    place("purchase_orders", 990, 150, 780),
    place("purchase_order_items", 990, 880, 780),
    place("medicines", 1980, 150, 800),
    place("inventory_batches", 1980, 880, 800),
  ], [
    r("suppliers", "purchase_orders", "supplier_id required", "1", "0..*", "id", "supplier_id"),
    r("profiles", "purchase_orders", "created_by required", "1", "0..*", "id", "created_by"),
    r("purchase_orders", "purchase_order_items", "purchase_order_id cascade", "1", "1..*", "id", "purchase_order_id"),
    r("medicines", "purchase_order_items", "medicine_id required", "1", "0..*", "id", "medicine_id"),
    r("purchase_order_items", "inventory_batches", "purchase_order_item_id optional", "0..1", "0..*", "id", "purchase_order_item_id"),
    r("medicines", "inventory_batches", "received batches", "1", "0..*", "id", "medicine_id"),
  ]),
  physicalPage("05 - Administration and Constraints ERD", "05 - Administration and Constraints ERD.webp", 2860, 1320, [
    place("profiles", 80, 170, 720),
    place("app_settings", 990, 170, 780),
    place("inventory_adjustments", 990, 800, 780),
    place("medicines", 1980, 170, 800),
    place("inventory_batches", 1980, 800, 800),
  ], [
    r("profiles", "app_settings", "updated_by optional", "0..1", "0..1", "id", "updated_by"),
    r("profiles", "inventory_adjustments", "performed_by required", "1", "0..*", "id", "performed_by"),
    r("medicines", "inventory_adjustments", "medicine_id required", "1", "0..*", "id", "medicine_id"),
    r("inventory_batches", "inventory_adjustments", "batch audit", "1", "0..*", "id", "inventory_batch_id"),
    r("medicines", "inventory_batches", "batch ownership", "1", "0..*", "id", "medicine_id"),
  ], [
    note(80, 740, 720, 180, "Database enforcement", [
      "RLS enabled on public tables",
      "Transactional RPCs protect sales, receiving, and role changes",
      "Browser clients cannot directly mutate transactional tables",
    ]),
  ]),
  {
    id: "new-lineage",
    name: "06 - Data Flow and Lifecycle ERD",
    file: "06 - Data Flow and Lifecycle ERD.webp",
    title: "Entity Lifecycle and Data Flow",
    subtitle: "Single-branch pharmacy data moves from setup to purchase receiving, sales, audit, and reporting",
    width: 1900,
    height: 980,
    kind: "lifecycle",
    boxes: [
      box("Catalog Setup", 80, 200, 330, 120, "entity", ["medicine_categories", "suppliers", "medicines"]),
      box("Purchase Planning", 500, 200, 340, 120, "entity", ["purchase_orders", "purchase_order_items"]),
      box("Stock Receiving", 930, 200, 340, 120, "weak", ["inventory_batches", "inventory_adjustments"]),
      box("POS Sales", 1360, 200, 340, 120, "bridge", ["sales", "sale_items", "FEFO deduction"]),
      box("Reports", 930, 610, 340, 120, "view", ["medicine_inventory_summary", "CSV/PDF exports"]),
      box("Administration", 80, 610, 330, 120, "audit", ["profiles", "app_settings", "roles"]),
    ],
    relationships: [
      r("Catalog Setup", "Purchase Planning", "feeds orders", "", "", "Catalog Setup", "Purchase Planning"),
      r("Purchase Planning", "Stock Receiving", "receiving creates stock", "", "", "Purchase Planning", "Stock Receiving"),
      r("Stock Receiving", "POS Sales", "sale allocates stock", "", "", "Stock Receiving", "POS Sales"),
      r("Stock Receiving", "Reports", "summarized by", "", "", "Stock Receiving", "Reports"),
      r("Administration", "Purchase Planning", "authorizes", "", "", "Administration", "Purchase Planning"),
      r("Administration", "POS Sales", "authorizes", "", "", "Administration", "POS Sales"),
      r("Administration", "Reports", "configures", "", "", "Administration", "Reports"),
    ],
    notes: [
      note(1360, 600, 400, 170, "Scope guard", [
        "Single branch only",
        "No prescriptions or patient records",
        "No insurance or accounting suite",
      ]),
    ],
  },
];

function table(name, kind, rows) {
  return { name, kind, rows };
}

function pk(name, type, nullable, constraint) {
  return { role: "PK", name, type, nullable, constraint };
}

function fk(name, type, nullable, constraint) {
  return { role: "FK", name, type, nullable, constraint };
}

function col(name, type, nullable, constraint) {
  return { role: "", name, type, nullable, constraint };
}

function place(name, x, y, width) {
  const source = physicalTables[name];
  const rowHeight = 34;
  return {
    ...source,
    x,
    y,
    width,
    headerHeight: 46,
    rowHeight,
    height: 46 + source.rows.length * rowHeight,
  };
}

function box(name, x, y, width, height, kind, attrs) {
  return { name, x, y, width, height, kind, attrs };
}

function note(x, y, width, height, title, rows) {
  return { name: title, x, y, width, height, kind: "note", attrs: rows };
}

function r(from, to, label, fromCard, toCard, fromRow, toRow) {
  return { from, to, label, fromCard, toCard, fromRow, toRow };
}

function physicalPage(title, file, width, height, tables, relationships, notes = []) {
  return {
    id: file.toLowerCase().replaceAll(" ", "-").replace(/[^a-z0-9-]/g, ""),
    name: file.replace(".webp", ""),
    file,
    title,
    subtitle: "Physical data model with row-level key anchors, data types, nullability, constraints, and cardinality",
    width,
    height,
    kind: "physical",
    tables,
    relationships,
    notes,
  };
}

function palette(kind) {
  if (kind === "weak") return { fill: colors.weak, stroke: colors.weakStroke };
  if (kind === "bridge") return { fill: colors.bridge, stroke: colors.bridgeStroke };
  if (kind === "audit") return { fill: colors.audit, stroke: colors.auditStroke };
  if (kind === "view") return { fill: colors.view, stroke: colors.viewStroke };
  if (kind === "note") return { fill: "#fefce8", stroke: "#ca8a04" };
  return { fill: colors.entity, stroke: colors.entityStroke };
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(value, x, y, size = 15, weight = 400, color = colors.ink, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function pageItems(page) {
  return [...(page.tables ?? []), ...(page.boxes ?? []), ...(page.notes ?? [])];
}

function findItem(page, name) {
  const found = pageItems(page).find((item) => item.name === name);
  if (!found) throw new Error(`Missing item ${name} on ${page.name}`);
  return found;
}

function rowCenter(table, rowName) {
  if (!table.rows) return center(table);
  const index = table.rows.findIndex((row) => row.name === rowName);
  if (index < 0) return center(table);
  return {
    x: table.x + table.width / 2,
    y: table.y + table.headerHeight + index * table.rowHeight + table.rowHeight / 2,
  };
}

function center(item) {
  return { x: item.x + item.width / 2, y: item.y + item.height / 2 };
}

function anchor(item, target, rowName) {
  const base = rowName ? rowCenter(item, rowName) : center(item);
  const tc = center(target);
  const dx = tc.x - base.x;
  if (Math.abs(dx) > Math.abs(tc.y - base.y)) {
    return { x: dx >= 0 ? item.x + item.width : item.x, y: base.y };
  }
  return { x: base.x, y: tc.y >= base.y ? item.y + item.height : item.y };
}

function orthogonalPath(start, end) {
  const midX = Math.round((start.x + end.x) / 2);
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
}

function renderRelationships(page) {
  const parts = [
    `<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M 0 0 L 10 4 L 0 8 z" fill="${colors.line}"/></marker></defs>`,
  ];
  for (const rel of page.relationships) {
    const from = findItem(page, rel.from);
    const to = findItem(page, rel.to);
    const start = anchor(from, to, rel.fromRow);
    const end = anchor(to, from, rel.toRow);
    const labelX = Math.round((start.x + end.x) / 2);
    const labelY = Math.round((start.y + end.y) / 2) - 8;
    parts.push(`<path d="${orthogonalPath(start, end)}" fill="none" stroke="${colors.line}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow)"/>`);
    if (rel.label) {
      parts.push(`<rect x="${labelX - 92}" y="${labelY - 19}" width="184" height="24" rx="5" fill="${colors.bg}" stroke="#cbd5e1"/>`);
      parts.push(text(rel.label, labelX, labelY - 2, 12, 700, colors.muted, "middle"));
    }
    if (rel.fromCard) parts.push(text(rel.fromCard, start.x + (start.x < end.x ? 8 : -8), start.y - 8, 13, 800, colors.ink, start.x < end.x ? "start" : "end"));
    if (rel.toCard) parts.push(text(rel.toCard, end.x + (end.x < start.x ? 8 : -8), end.y - 8, 13, 800, colors.ink, end.x < start.x ? "start" : "end"));
  }
  return parts.join("\n");
}

function renderPhysicalTable(item) {
  const { fill, stroke } = palette(item.kind);
  const parts = [
    `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" rx="7" fill="#ffffff" stroke="${stroke}" stroke-width="2"/>`,
    `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.headerHeight}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
    text(item.name, item.x + 18, item.y + 30, 17, 800),
  ];
  item.rows.forEach((row, index) => {
    const y = item.y + item.headerHeight + index * item.rowHeight;
    const rowFill = row.role === "PK" ? colors.pk : row.role === "FK" ? colors.fk : row.nullable === "NULL" ? colors.optional : colors.required;
    const key = row.role ? `${row.role} ` : "";
    parts.push(`<rect x="${item.x + 1}" y="${y}" width="${item.width - 2}" height="${item.rowHeight}" fill="${rowFill}"/>`);
    parts.push(`<path d="M ${item.x + 12} ${y + item.rowHeight} H ${item.x + item.width - 12}" stroke="${colors.grid}" stroke-width="1"/>`);
    parts.push(text(`${key}${row.name}`, item.x + 16, y + 22, 13, row.role === "PK" ? 800 : 600));
    parts.push(text(row.type, item.x + 210, y + 22, 13, 500, colors.muted));
    parts.push(text(row.nullable, item.x + 345, y + 22, 12, 700, row.nullable === "NOT NULL" ? "#166534" : "#7c2d12"));
    parts.push(text(row.constraint, item.x + 430, y + 22, 12, 500, colors.muted));
  });
  return parts.join("\n");
}

function renderConceptBox(item) {
  const { fill, stroke } = palette(item.kind);
  const isWeak = item.kind === "weak";
  const parts = [
    `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${isWeak ? 3 : 2}"/>`,
  ];
  if (isWeak) {
    parts.push(`<rect x="${item.x + 7}" y="${item.y + 7}" width="${item.width - 14}" height="${item.height - 14}" rx="3" fill="none" stroke="${stroke}" stroke-width="1.6"/>`);
  }
  parts.push(text(item.name, item.x + item.width / 2, item.y + 34, 18, 800, colors.ink, "middle"));
  item.attrs.forEach((attr, index) => {
    const ax = item.x + 30 + index * 105;
    const ay = item.y - 72 - (index % 2) * 30;
    parts.push(`<ellipse cx="${ax + 48}" cy="${ay + 24}" rx="66" ry="24" fill="#ffffff" stroke="${stroke}" stroke-width="1.8"/>`);
    parts.push(`<path d="M ${ax + 48} ${ay + 48} L ${item.x + item.width / 2} ${item.y}" stroke="${stroke}" stroke-width="1.4"/>`);
    parts.push(text(attr, ax + 48, ay + 29, 13, index === 0 ? 800 : 600, colors.ink, "middle"));
  });
  return parts.join("\n");
}

function renderNote(item) {
  const { fill, stroke } = palette("note");
  const parts = [
    `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
    text(item.name, item.x + 18, item.y + 30, 17, 800),
  ];
  item.attrs.forEach((row, index) => parts.push(text(row, item.x + 18, item.y + 62 + index * 27, 14, 600, colors.ink)));
  return parts.join("\n");
}

function renderSvg(page) {
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">`,
    `<rect width="${page.width}" height="${page.height}" fill="${colors.bg}"/>`,
    text("Darman Pharmacy Management System", 70, 58, 20, 800, colors.muted),
    text(page.title, 70, 96, 30, 800),
    text(page.subtitle, 70, 126, 16, 500, colors.muted),
    text("New complete ERD", page.width - 70, 70, 14, 700, colors.muted, "end"),
    renderRelationships(page),
  ];
  for (const item of pageItems(page)) {
    if (item.rows) parts.push(renderPhysicalTable(item));
    else if (item.kind === "note") parts.push(renderNote(item));
    else parts.push(renderConceptBox(item));
  }
  parts.push("</svg>");
  return parts.join("\n");
}

function drawioCell(id, value, style, x, y, width, height, parent = "1") {
  return `<mxCell id="${id}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;
}

function renderDrawioPage(page) {
  let id = 2;
  const ids = new Map();
  const rowIds = new Map();
  const cells = [
    '<mxCell id="0"/>',
    '<mxCell id="1" parent="0"/>',
    drawioCell(`title-${id++}`, `${page.title}&#xa;${page.subtitle}`, "text;html=1;strokeColor=none;fillColor=none;fontSize=24;fontStyle=1;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;", 70, 40, 1200, 80),
  ];

  for (const item of pageItems(page)) {
    const itemId = `item-${id++}`;
    ids.set(item.name, itemId);
    const { fill, stroke } = palette(item.kind);
    if (item.rows) {
      cells.push(drawioCell(itemId, item.name, `shape=table;startSize=${item.headerHeight};container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=1;fontStyle=1;fontSize=16;align=left;spacingLeft=14;fillColor=${fill};strokeColor=${stroke};html=1;`, item.x, item.y, item.width, item.height));
      item.rows.forEach((row, index) => {
        const rowId = `row-${id++}`;
        rowIds.set(`${item.name}.${row.name}`, rowId);
        const rowFill = row.role === "PK" ? colors.pk : row.role === "FK" ? colors.fk : row.nullable === "NULL" ? colors.optional : colors.required;
        cells.push(`<mxCell id="${rowId}" value="${esc(`${row.role ? `${row.role} ` : ""}${row.name} : ${row.type} | ${row.nullable} | ${row.constraint}`)}" style="shape=tableRow;horizontal=1;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=${rowFill};collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;align=left;spacingLeft=10;html=1;" vertex="1" parent="${itemId}"><mxGeometry y="${item.headerHeight + index * item.rowHeight}" width="${item.width}" height="${item.rowHeight}" as="geometry"/></mxCell>`);
      });
    } else {
      const style = item.kind === "note"
        ? `rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};fontSize=14;align=left;spacingLeft=12;`
        : `rounded=0;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};fontStyle=1;fontSize=16;`;
      const value = item.kind === "note" ? `${item.name}&#xa;${item.attrs.join("&#xa;")}` : `${item.name}&#xa;${item.attrs.join(" | ")}`;
      cells.push(drawioCell(itemId, value, style, item.x, item.y, item.width, item.height));
    }
  }

  for (const rel of page.relationships) {
    const source = rowIds.get(`${rel.from}.${rel.fromRow}`) ?? ids.get(rel.from);
    const target = rowIds.get(`${rel.to}.${rel.toRow}`) ?? ids.get(rel.to);
    const label = [rel.label, rel.fromCard && rel.toCard ? `${rel.fromCard} to ${rel.toCard}` : ""].filter(Boolean).join(" | ");
    cells.push(`<mxCell id="edge-${id++}" value="${esc(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=${colors.line};fontColor=${colors.muted};startArrow=ERone;endArrow=ERmany;entryX=0;entryY=0.5;exitX=1;exitY=0.5;" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  }

  return `  <diagram id="${page.id}" name="${esc(page.name)}">
    <mxGraphModel dx="1800" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${page.width}" pageHeight="${page.height}" math="0" shadow="0">
      <root>
        ${cells.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const drawio = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" modified="2026-06-28T00:00:00.000Z" agent="Codex" version="26.0.0" type="device" pages="${pages.length}">
${pages.map(renderDrawioPage).join("\n")}
</mxfile>
`;
  await fs.writeFile(drawioPath, drawio, "utf8");
  for (const page of pages) {
    const svg = renderSvg(page);
    const svgPath = path.join(outputDir, page.file.replace(/\.webp$/i, ".svg"));
    const webpPath = path.join(outputDir, page.file);
    await fs.writeFile(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg)).webp({ quality: 96 }).toFile(webpPath);
  }
  console.log(`Generated ${pages.length} ERD pages in ${outputDir}`);
  console.log(drawioPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
