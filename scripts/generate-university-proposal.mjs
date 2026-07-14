import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import JSZip from "jszip";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  SectionType,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

const root = process.cwd();
const outputDir = path.join(root, "docs", "final proposal");
const assetDir = path.join(outputDir, "university-proposal-assets");
const outputPath = path.join(
  outputDir,
  "Darman_Pharmacy_Management_System_University_Monograph_Proposal.docx",
);

const colors = {
  navy: "17324D",
  blue: "1E5A85",
  cyan: "2C8FB5",
  ink: "1F2933",
  muted: "52606D",
  line: "B8C7D1",
  soft: "F7FAFC",
  white: "FFFFFF",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: colors.line };

const portrait = {
  type: SectionType.NEXT_PAGE,
  page: {
    size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
    margin: { top: 620, right: 700, bottom: 620, left: 700 },
  },
};

const landscape = {
  type: SectionType.NEXT_PAGE,
  page: {
    size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
    margin: { top: 520, right: 520, bottom: 520, left: 520 },
  },
};

const textRun = (text, options = {}) =>
  new TextRun({
    text,
    font: "Aptos",
    size: options.size ?? 22,
    bold: options.bold,
    italics: options.italics,
    color: options.color ?? colors.ink,
  });

const p = (text, options = {}) =>
  new Paragraph({
    children: [textRun(text, options)],
    heading: options.heading,
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    spacing: {
      before: options.before ?? 0,
      after: options.after ?? 80,
      line: options.line ?? 260,
    },
    border: options.border,
  });

const h1 = (text) =>
  p(text, {
    heading: HeadingLevel.HEADING_1,
    size: 32,
    bold: true,
    color: colors.navy,
    after: 115,
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: colors.cyan } },
  });

const h2 = (text) =>
  p(text, {
    heading: HeadingLevel.HEADING_2,
    size: 26,
    bold: true,
    color: colors.blue,
    before: 70,
    after: 45,
  });

const bullet = (text) =>
  p(`- ${text}`, {
    alignment: AlignmentType.LEFT,
    after: 35,
    line: 230,
  });

const compactP = (text) =>
  p(text, {
    size: 22,
    after: 75,
    line: 276,
  });

function docxTable(headers, rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (header, index) =>
            new TableCell({
              width: { size: widths[index], type: WidthType.PERCENTAGE },
              shading: { fill: colors.navy, type: ShadingType.CLEAR, color: "auto" },
              borders: { top: border, bottom: border, left: border, right: border },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 55, bottom: 55, left: 65, right: 65 },
              children: [
                p(header, {
                  bold: true,
                  color: colors.white,
                  size: 22,
                  alignment: AlignmentType.LEFT,
                  after: 0,
                  line: 250,
                }),
              ],
            }),
        ),
      }),
      ...rows.map(
        (row, rowIndex) =>
          new TableRow({
            children: row.map(
              (value, index) =>
                new TableCell({
                  width: { size: widths[index], type: WidthType.PERCENTAGE },
                  shading:
                    rowIndex % 2
                      ? { fill: colors.soft, type: ShadingType.CLEAR, color: "auto" }
                      : undefined,
                  borders: { top: border, bottom: border, left: border, right: border },
                  verticalAlign: VerticalAlign.TOP,
                  margins: { top: 45, bottom: 45, left: 55, right: 55 },
                  children: [
                    p(String(value), {
                      size: 22,
                      alignment: AlignmentType.LEFT,
                      after: 0,
                      line: 250,
                    }),
                  ],
                }),
            ),
          }),
      ),
    ],
  });
}

async function pngAsset(source, name) {
  const target = path.join(assetDir, `${name}.png`);
  await sharp(path.join(root, source))
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(target);
  return target;
}

async function imageRun(filePath, maxWidth, maxHeight) {
  const data = await fs.readFile(filePath);
  const metadata = await sharp(data).metadata();
  const ratio = Math.min(maxWidth / metadata.width, maxHeight / metadata.height, 1);

  return new ImageRun({
    data,
    type: "png",
    transformation: {
      width: Math.round(metadata.width * ratio),
      height: Math.round(metadata.height * ratio),
    },
  });
}

const section = (children, properties = portrait) => ({ properties, children });

async function diagramSection(title, source, caption, maxWidth, maxHeight) {
  return section(
    [
      h1(title),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 70 },
        children: [await imageRun(source, maxWidth, maxHeight)],
      }),
      p(caption, {
        alignment: AlignmentType.CENTER,
        italics: true,
        color: colors.muted,
        size: 22,
        after: 0,
      }),
    ],
    landscape,
  );
}

await fs.mkdir(assetDir, { recursive: true });

const logo = path.join(root, "public", "brand", "darman-logo.png");
const dfd = await pngAsset(
  "docs/new docs/darman-complete-data-flow-diagram.webp",
  "single-page-dfd",
);
const erd = await pngAsset(
  "docs/new docs/darman-complete-entity-relationship-diagram.webp",
  "single-page-erd",
);

const existingProblems = [
  ["Stock records", "Manual or spreadsheet records can become outdated immediately after sales, purchases, corrections, or returned stock. Staff may know that a medicine exists but still be unsure how many saleable units are available."],
  ["Expiry control", "Expiry dates are often checked only during physical inspection. This creates a risk that expired or near-expiry batches stay on the shelf while newer batches are sold first."],
  ["Sales workflow", "Receipts, discounts, payment totals, and stock deduction may depend on repeated manual calculations. A busy counter can easily produce missed deductions or unclear receipt history."],
  ["Purchasing", "Supplier contact records, purchase-order status, delivered quantities, and batch details are difficult to review when documents are scattered across files or notebooks."],
  ["Reporting", "Daily sales, low-stock items, expiring batches, purchase value, and inventory value are slow to prepare because the data is not centralized or filtered automatically."],
  ["Security", "Shared notebooks or spreadsheet files cannot enforce Admin, Pharmacist, and Cashier permissions. Staff may accidentally change records that should be protected."],
];

const scopeRows = [
  ["Dashboard and alerts", "Daily sales, transaction count, active medicines, recent sales, low-stock warnings, and expiry warnings so the pharmacy can see its operational position without preparing manual summaries."],
  ["Medicine catalog", "Medicine categories, brand and generic names, dosage form, strength, SKU, barcode, unit, default prices, reorder threshold, status, and searchable medicine details."],
  ["Inventory", "Batch number, received quantity, current quantity, expiry date, cost price, selling price, received date, saleable quantity, nearest expiry, and adjustment history."],
  ["Sales and POS", "Barcode/search entry, cart controls, discount, payment method, atomic FEFO stock deduction, completed sale history, receipt view, printing, and PDF receipt export."],
  ["Suppliers and purchases", "Supplier records, contact details, active/inactive state, purchase-order drafts, ordered/cancelled states, delivery receiving, batch creation, and purchase history."],
  ["Reports and settings", "Sales, inventory, expiry, and purchase reports with CSV/PDF export, plus pharmacy identity settings, receipt footer, expiry alert window, and Admin role management."],
];

const tools = [
  ["Framework", "Next.js 16 App Router", "Routes, protected pages, layouts, production build."],
  ["Language", "TypeScript", "Safer application code through static typing."],
  ["Interface", "React, Tailwind CSS, shadcn/ui", "Responsive screens, dialogs, tables, forms, and states."],
  ["Database", "Supabase PostgreSQL", "Relational schema, constraints, indexes, views, and transactional RPCs."],
  ["Authentication", "Supabase Auth and RLS", "Email/password sessions, role-based access, and protected records."],
  ["Validation", "React Hook Form, Zod", "Validated forms and clear input errors."],
  ["Data and reports", "TanStack Query, Recharts, jsPDF, CSV", "Caching, dashboard chart, receipts, and exports."],
  ["Deployment and QA", "Vercel, ESLint, TypeScript build", "Hosting, linting, type checks, production build, and release validation."],
];

const costs = [
  ["Student development labor", "12 weeks", "0", "Academic contribution; not billed."],
  ["Internet and research data", "3 months", "90", "Development, research, staging, and deployment access."],
  ["Electricity and equipment use", "3 months", "60", "Personal computer and power usage estimate."],
  ["Custom domain", "1 year", "20", "Optional professional project address."],
  ["Printing and binding", "1 set", "25", "Proposal, monograph, and presentation copies."],
  ["Testing materials", "1 allowance", "15", "Sample labels, barcode tests, and demonstration preparation."],
  ["Contingency", "1 allowance", "20", "Unexpected academic or deployment expenses."],
  ["Total estimated direct cost", "", "230", "Student out-of-pocket project estimate."],
];

const timeline = [
  ["1", "Initiation", "Confirm problem, users, scope, exclusions, and success criteria.", "Approved scope."],
  ["2", "Existing-system study", "Review manual workflows, risks, records, and expected improvements.", "Problem analysis."],
  ["3", "Logical design", "Prepare DFD, ERD, roles, modules, and main data rules.", "Validated design."],
  ["4", "Database foundation", "Create tables, constraints, indexes, profile automation, and RLS.", "Database migration."],
  ["5", "Authentication", "Build login, protected routes, role landing, and access messages.", "Role access."],
  ["6", "Catalog and inventory", "Build medicines, categories, batches, search, filters, and details.", "Inventory MVP."],
  ["7", "Dashboard and alerts", "Build sales metrics, low-stock warnings, expiry warnings, and charts.", "Dashboard."],
  ["8", "Sales and POS", "Build barcode/search POS, cart, FEFO checkout, receipts, and history.", "Sales workflow."],
  ["9", "Suppliers and purchases", "Build supplier records, purchase orders, delivery receiving, and audit logs.", "Purchasing workflow."],
  ["10", "Reports and settings", "Build exports, pharmacy settings, and role-management controls.", "Admin features."],
  ["11", "Hardening and QA", "Run route, role, RLS, transaction, responsive, lint, type, and build checks.", "Release candidate."],
  ["12", "Deployment and handoff", "Prepare deployment guide, client guide, final proposal, and smoke-test plan.", "Final handoff."],
];

const risks = [
  ["Unauthorized access", "Use Supabase Auth, protected routes, Row Level Security, role-specific navigation, and Admin-only role changes through a protected database function."],
  ["Incorrect stock after sales", "Use a transactional PostgreSQL sale function that validates items, locks available batches, applies FEFO allocation, deducts stock, and logs inventory adjustments together."],
  ["Expired stock sold accidentally", "Exclude expired batches from saleable stock, show expiry warning windows, and display batch-level expiry details in medicine and report views."],
  ["Purchase receiving mistakes", "Require every delivered purchase item to include a batch number and expiry date before stock is created, and block duplicate receiving through order status checks."],
  ["User adoption difficulty", "Keep the interface minimal, responsive, and beginner-focused, with clear empty states, validation messages, confirmation dialogs, and role-appropriate navigation."],
  ["Production setup errors", "Use deployment documentation, environment-variable checks, Supabase Auth URL configuration, staging acceptance, production smoke tests, and log inspection."],
];

const document = new Document({
  creator: "Darman Pharmacy Management System Project",
  title: "Darman Pharmacy Management System - University Monograph Proposal",
  description: "Professional university monograph proposal for a single-branch pharmacy management system.",
  styles: {
    default: {
      document: {
        run: { font: "Aptos", size: 20, color: colors.ink },
        paragraph: { spacing: { line: 260, after: 80 } },
      },
    },
  },
  sections: [
    section([
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
        children: [await imageRun(logo, 82, 82)],
      }),
      p("University Monograph Proposal", {
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 26,
        color: colors.blue,
        after: 45,
      }),
      p("Darman Pharmacy Management System", {
        alignment: AlignmentType.CENTER,
        bold: true,
        size: 32,
        color: colors.navy,
        after: 130,
      }),
      h1("1. Introduction"),
      compactP("Community pharmacies manage medicines with different batches, costs, selling prices, suppliers, and expiry dates. When these activities are handled through notebooks, spreadsheets, or disconnected tools, the pharmacy can lose visibility over stock, expiry, purchases, and daily sales."),
      compactP("Darman Pharmacy Management System is proposed as a real-life, single-branch pharmacy operations system. It focuses on practical pharmacy work: medicine catalog management, batch inventory, point-of-sale sales, suppliers, purchase orders, expiry warnings, low-stock alerts, reports, settings, and role-based access."),
      h2("Problem Statement and Background"),
      compactP("Local pharmacy staff need a simple system that keeps stock accurate, prevents expired-stock mistakes, speeds up sales, preserves supplier and purchase history, and provides basic reports without requiring advanced technical knowledge."),
      compactP("The background of the project is the gap between daily pharmacy decisions and the quality of available information. A pharmacy owner or staff member needs to know which medicines are available, which batches should be sold first, which items are close to expiry, which items need reordering, and who performed each sensitive operation. If this information is delayed or inconsistent, the pharmacy can lose money, waste stock, or serve customers slowly."),
      compactP("This proposal treats the project as a real operational product, not only as a classroom exercise. The system is intentionally limited to pharmacy business operations and avoids clinical features such as patient medical records, prescriptions, insurance claims, drug-interaction checking, and telemedicine. That boundary keeps the project realistic, safer to implement, and easier to explain to pharmacy staff."),
      h2("Project Aim"),
      compactP("The aim is to design and build a secure, maintainable, and beginner-friendly pharmacy management system that can support daily pharmacy operations and demonstrate professional full-stack software engineering practice."),
      compactP("The expected result is a working MVP that a local pharmacy could understand and evaluate. The system should reduce manual effort, improve stock confidence, support clear staff roles, and provide enough reporting for daily operational decisions without becoming a large accounting or hospital-management system."),
    ]),
    section([
      h1("2. Existing System"),
      compactP("The existing system is assumed to be manual or semi-digital. Staff may record medicines, purchases, sales, and expiry dates in paper books, spreadsheets, or separate files. This approach can work for very small operations but becomes unreliable as medicine variety and transaction volume increase."),
      compactP("In a manual workflow, stock information is usually updated after the counter becomes quiet or at the end of the day. This delay makes it hard to trust the current quantity during busy hours. The same issue affects purchasing because staff may reorder late, over-order slow-moving stock, or miss items that are already below threshold."),
      compactP("The existing approach also creates weak accountability. If a medicine record, price, supplier contact, purchase order, or stock quantity changes, there may be no clear record of who made the change and why. For a business that handles paid inventory and expiry-sensitive products, this lack of traceability is a serious operational weakness."),
      docxTable(["Area", "Existing Limitation"], existingProblems, [28, 72]),
      h2("Need for Change"),
      compactP("The pharmacy needs a central system that updates stock after each protected sale or receiving operation, warns staff before stock or expiry problems become serious, and separates responsibilities between Admin, Pharmacist, and Cashier users."),
      compactP("The change is justified because the pharmacy does not only need digital storage; it needs controlled workflows. Sales should deduct stock automatically. Purchase receiving should create stock batches only after required delivery details are entered. Reports should be based on saved transactions rather than separate calculations. Staff permissions should prevent accidental or unauthorized changes."),
    ]),
    section([
      h1("3. Proposed System"),
      compactP("The proposed system is a browser-based pharmacy management application for one branch. It supports controlled operations from login to medicine management, sales, purchasing, reporting, and settings."),
      compactP("The system is designed around the real responsibilities of a small pharmacy. Admin users manage the whole system, Pharmacists manage operational pharmacy data, and Cashiers focus on sales and medicine availability. This role structure reduces screen clutter and keeps sensitive changes away from users who do not need them."),
      compactP("The proposed solution also uses batch-normalized inventory. Stock is not stored as a single editable number on the medicine record. Instead, each received batch stores its own quantity, expiry date, cost, selling price, and supplier reference. This allows the system to support FEFO selling, expiry reports, historical receipts, and audit records."),
      h2("Proposed Solution and Scope of Work"),
      docxTable(["Module", "Proposed Capability"], scopeRows, [28, 72]),
      h2("Role Scope"),
      bullet("Admin: full access to medicines, suppliers, purchases, sales, reports, settings, and role management."),
      bullet("Pharmacist: manages medicines, inventory, sales, suppliers, and purchase orders, but cannot manage user roles or dangerous settings."),
      bullet("Cashier: processes sales and checks medicine availability, without editing master data or purchasing records."),
      h2("Scope Boundaries"),
      compactP("The system is intentionally single-branch and business-focused. It does not include patient records, prescriptions, clinical decision support, insurance processing, accounting ledgers, loyalty programs, native mobile applications, AI demand forecasting, or SMS/email automation. These exclusions protect the MVP from unnecessary risk and keep the project deliverable within the academic timeline."),
    ]),
    section([
      h1("4. Logical Design"),
      compactP("The logical design separates external users, application processes, data stores, and outputs. Staff requests are authenticated, authorized by role, validated in the application, and finally handled by protected database reads or transactional functions."),
      compactP("The main data flow begins when a staff member signs in and receives a role-based session. After that, the user can access only the modules allowed for that role. Medicine and supplier changes flow through catalog processes, purchase orders flow through purchasing processes, sales flow through POS processes, and reports read from authorized records. The system stores operational data in normalized tables and produces receipts, alerts, and exports as outputs."),
      compactP("The logical design also separates master data from transaction data. Medicines, categories, suppliers, settings, and profiles describe the pharmacy environment. Sales, sale items, purchase orders, purchase-order items, inventory batches, and inventory adjustments record business events. This separation makes the system easier to maintain and easier to audit."),
      bullet("Sales use FEFO allocation so the earliest valid batch is deducted first."),
      bullet("Purchase receiving creates inventory batches and adjustment logs in one protected workflow."),
      bullet("Reports read authorized operational data and export only the visible filtered result set."),
      bullet("Clinical, insurance, prescription, multi-branch, loyalty, SMS/email automation, and AI forecasting features are intentionally excluded."),
    ]),
    await diagramSection(
      "4.1 Data Flow Diagram",
      dfd,
      "Figure 1. Complete DFD showing external entities, named processes, data stores, outputs, and labeled data flows.",
      1250,
      660,
    ),
    await diagramSection(
      "4.2 Entity Relationship Diagram",
      erd,
      "Figure 2. Complete ERD showing entities, weak/dependent tables, bridge tables, attributes, keys, data types, nullability, constraints, and cardinality.",
      1260,
      660,
    ),
    section([
      h1("5. Physical Design"),
      compactP("The physical design uses a Next.js App Router frontend, typed React components, Supabase PostgreSQL, Supabase Auth, Row Level Security, views, indexes, constraints, and security-definer RPCs."),
      compactP("The application is organized as protected routes for dashboard, medicines, sales, suppliers, purchases, reports, settings, login, and unauthorized access. Shared UI patterns are used for page headers, tables, filters, empty states, loading states, errors, pagination, forms, dialogs, confirmations, and toast feedback. This keeps the user experience consistent across modules."),
      compactP("The database design uses relational constraints instead of relying only on interface rules. Prices are non-negative, quantities are positive or non-negative depending on the field, purchase discounts cannot exceed subtotals, sale completion fields are checked, batch numbers are unique per medicine, and expected purchase dates cannot be in the past. These constraints protect the data even if a client-side request is incorrect."),
      h2("Database Objects"),
      bullet("Core tables: profiles, medicine_categories, suppliers, medicines, sales, purchase_orders, and app_settings."),
      bullet("Dependent or bridge tables: inventory_batches, sale_items, purchase_order_items, and inventory_adjustments."),
      bullet("View: medicine_inventory_summary for stock totals, saleable quantity, and nearest expiry date."),
      h2("Protected Workflows"),
      bullet("complete_sale validates cart items, locks batches, allocates stock by FEFO, writes sale items, deducts stock, and logs adjustments."),
      bullet("create_purchase_order, set_purchase_order_status, and receive_purchase_order protect the purchasing lifecycle."),
      bullet("change_user_role allows Admin-controlled role changes while blocking self-demotion."),
      h2("Security and Deployment Design"),
      compactP("The browser receives only public Supabase configuration values. Service-role keys are not exposed. Row Level Security remains the database authorization boundary, while route guards and role-aware UI improve the user experience. Deployment is planned for Vercel with Supabase hosting the database and authentication service."),
    ]),
    section([
      h1("6. Tools and Technologies"),
      compactP("The selected tools support a production-style academic project while staying realistic for one student developer. The stack provides type safety, reusable components, managed authentication, relational data, secure policies, report generation, and a clear deployment path."),
      docxTable(["Area", "Tool or Technology", "Use in the Project"], tools, [23, 30, 47]),
      h1("7. Project Time and Cost Estimation"),
      compactP("The estimate uses a student-budget model. Development labor is treated as academic contribution, while direct expenses cover resources needed to research, build, test, present, and demonstrate the system."),
      compactP("The direct budget is intentionally modest because the project uses personal development equipment and managed free or low-cost services for academic demonstration. If the system is later adopted by a real pharmacy, production hosting, backup features, domain renewal, and maintenance can be budgeted separately by the system owner."),
      docxTable(["Item", "Quantity", "Total USD", "Basis"], costs, [28, 14, 14, 44]),
    ]),
    section([
      h1("8. Project Timeline"),
      compactP("The roadmap organizes the project into twelve weekly milestones. Each milestone produces a concrete deliverable and supports the next project phase."),
      compactP("The timeline follows a practical software delivery order: first understanding the problem, then designing the data and workflows, then building the database and authentication, then implementing operational modules, and finally hardening, testing, documenting, and preparing the deployment handoff."),
      docxTable(["Week", "Milestone", "Main Activities", "Deliverable"], timeline, [8, 23, 45, 24]),
    ]),
    section([
      h1("Risk Assessment and Trust Signals"),
      compactP("The project risks are manageable because the system uses a narrow scope, protected database operations, role-based access, documented deployment steps, and repeatable quality checks."),
      compactP("The main project risk is not only technical failure; it is building too much or building features outside the pharmacy business scope. The proposal therefore keeps the product focused on single-branch operations and avoids clinical, insurance, accounting-suite, and automation features that would require additional policy, legal, or domain review."),
      docxTable(["Risk", "Mitigation"], risks, [34, 66]),
      h2("Trust Signals"),
      bullet("The application has documented manual QA, deployment guidance, staging evidence, DFD assets, and ERD assets."),
      bullet("The latest validation includes linting, TypeScript checks, and production build checks."),
      bullet("The proposal uses a limited MVP scope suitable for a university real-life software project and a local pharmacy owner."),
      bullet("Sensitive workflows such as sales completion, purchase receiving, and role changes are protected by database functions rather than direct browser writes."),
      bullet("The documentation includes beginner-facing operating guidance, deployment steps, manual QA coverage, and known production responsibilities."),
      h1("Conclusion"),
      compactP("Darman Pharmacy Management System provides a practical and professional solution for single-branch pharmacy operations. It improves stock visibility, sales accuracy, purchasing control, expiry awareness, reporting, and staff access control while staying within the approved non-clinical project scope."),
      compactP("The proposal demonstrates the full path from problem analysis to logical design, physical design, implementation tools, budget, timeline, and risk control. It is suitable for university presentation because it addresses a real operational problem, applies professional engineering practices, and remains achievable within a focused academic project plan."),
    ]),
  ],
});

await fs.mkdir(outputDir, { recursive: true });
const buffer = await Packer.toBuffer(document);
await fs.writeFile(outputPath, buffer);

const zip = await JSZip.loadAsync(buffer);
const mediaFiles = Object.keys(zip.files).filter((name) =>
  name.startsWith("word/media/"),
);
const documentXml = await zip.file("word/document.xml")?.async("string");
const externalRels = Object.keys(zip.files).filter((name) =>
  name.endsWith(".rels"),
);

if (!buffer.subarray(0, 2).equals(Buffer.from("PK"))) {
  throw new Error("Generated DOCX does not have a valid ZIP signature.");
}

if (!documentXml?.includes("Introduction") || !documentXml.includes("Project Timeline")) {
  throw new Error("Generated DOCX is missing required proposal sections.");
}

console.log(
  JSON.stringify(
    {
      docx: outputPath,
      bytes: buffer.length,
      mediaFiles: mediaFiles.length,
      relationshipParts: externalRels.length,
      designedMaximumPages: 13,
    },
    null,
    2,
  ),
);
