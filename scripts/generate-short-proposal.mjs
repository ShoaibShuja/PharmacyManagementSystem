import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
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
const outputPath = path.join(
  outputDir,
  "Darman_Pharmacy_Management_System_Short_Proposal.docx",
);
const assetDir = path.join(outputDir, "short-assets");

const colors = {
  navy: "17324D",
  blue: "1E5A85",
  cyan: "2C8FB5",
  ink: "1F2933",
  muted: "52606D",
  line: "B8C7D1",
  white: "FFFFFF",
};

const portrait = {
  type: SectionType.NEXT_PAGE,
  page: {
    size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
    margin: { top: 850, right: 850, bottom: 850, left: 850 },
  },
};

const tightPortrait = {
  ...portrait,
  page: {
    ...portrait.page,
    margin: { top: 680, right: 760, bottom: 680, left: 760 },
  },
};

const border = { style: BorderStyle.SINGLE, size: 1, color: colors.line };

async function pngImage(source, id) {
  const target = path.join(assetDir, `${id}.png`);
  await sharp(path.join(root, source))
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(target);
  return target;
}

async function imageRun(filePath, maxWidth, maxHeight) {
  const data = await fs.readFile(filePath);
  const meta = await sharp(data).metadata();
  const ratio = Math.min(maxWidth / meta.width, maxHeight / meta.height, 1);
  return new ImageRun({
    data,
    type: "png",
    transformation: {
      width: Math.round(meta.width * ratio),
      height: Math.round(meta.height * ratio),
    },
  });
}

const p = (text, options = {}) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Aptos",
        size: options.size ?? 21,
        bold: options.bold,
        italics: options.italics,
        color: options.color ?? colors.ink,
      }),
    ],
    heading: options.heading,
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { before: options.before ?? 0, after: options.after ?? 105, line: options.line ?? 285 },
    border: options.border,
  });

const h1 = (text) =>
  p(text, {
    heading: HeadingLevel.HEADING_1,
    size: 38,
    bold: true,
    color: colors.navy,
    after: 160,
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: colors.cyan } },
  });

const h2 = (text) =>
  p(text, {
    heading: HeadingLevel.HEADING_2,
    size: 27,
    bold: true,
    color: colors.blue,
    before: 130,
    after: 70,
  });

const bullet = (text) => p(`- ${text}`, { alignment: AlignmentType.LEFT, after: 45 });

function table(headers, rows, widths) {
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
              margins: { top: 70, bottom: 70, left: 80, right: 80 },
              children: [
                p(header, {
                  bold: true,
                  color: colors.white,
                  size: 16,
                  alignment: AlignmentType.LEFT,
                  after: 0,
                  line: 220,
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
                      ? { fill: "F7FAFC", type: ShadingType.CLEAR, color: "auto" }
                      : undefined,
                  borders: { top: border, bottom: border, left: border, right: border },
                  verticalAlign: VerticalAlign.TOP,
                  margins: { top: 55, bottom: 55, left: 65, right: 65 },
                  children: [
                    p(String(value), {
                      size: 16,
                      alignment: AlignmentType.LEFT,
                      after: 0,
                      line: 215,
                    }),
                  ],
                }),
            ),
          }),
      ),
    ],
  });
}

const section = (children, properties = tightPortrait) => ({ properties, children });

async function diagramPage(title, source, caption, maxWidth, maxHeight) {
  const image = await imageRun(source, maxWidth, maxHeight);
  return section([
    h2(title),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [image],
    }),
    p(caption, {
      alignment: AlignmentType.CENTER,
      italics: true,
      color: colors.muted,
      size: 17,
      after: 0,
    }),
  ]);
}

await fs.mkdir(assetDir, { recursive: true });

const logo = path.join(root, "public", "brand", "darman-logo.png");
const diagrams = {
  context: path.join(outputDir, "assets", "dfd-context.png"),
  level1: path.join(outputDir, "assets", "dfd-level-1.png"),
  conceptual: path.join(outputDir, "assets", "erd-conceptual.png"),
  catalog: await pngImage("docs/diagrams/New ERD/02 - Catalog and Inventory Physical ERD.webp", "erd-catalog"),
};

const tools = [
  ["Application framework", "Next.js 16 App Router", "Routes, layouts, protected pages, and production build."],
  ["Language", "TypeScript", "Static typing for safer application code."],
  ["User interface", "React, Tailwind CSS, shadcn/ui", "Responsive screens, forms, dialogs, tables, and states."],
  ["Database and Auth", "Supabase PostgreSQL/Auth/RLS", "Relational data, authentication, policies, views, and RPCs."],
  ["Forms and validation", "React Hook Form, Zod", "Validated forms with useful error messages."],
  ["Reports and export", "TanStack Query, Recharts, jsPDF, CSV", "Caching, charts, receipts, and exports."],
  ["Deployment and QA", "Vercel, ESLint, TypeScript, Next build", "Hosting, checks, builds, and release validation."],
];

const costs = [
  ["Student development labor", "12 weeks", "0", "Academic contribution, not billed."],
  ["Internet and data", "3 months", "90", "Research, development, staging, and deployment."],
  ["Electricity and equipment use", "3 months", "60", "Power and personal computer use."],
  ["Custom domain", "1 year", "20", "Optional professional project address."],
  ["Printing and binding", "1 set", "25", "Proposal, monograph, and presentation copies."],
  ["Testing and demonstration materials", "1 allowance", "15", "Sample labels, barcode tests, and preparation."],
  ["Contingency", "1 allowance", "20", "Unexpected academic or deployment expenses."],
  ["Total estimated direct cost", "", "230", "Student out-of-pocket project estimate."],
];

const timeline = [
  ["1", "Initiation and requirements", "Problem, scope, stakeholders, success criteria.", "Approved scope."],
  ["2", "Existing-system analysis", "Study manual workflows and risks.", "Problem analysis."],
  ["3", "Logical and interface design", "Prepare DFD, ERD, routes, and screens.", "Validated design."],
  ["4", "Database foundation", "Create tables, constraints, indexes, RLS.", "Initial migration."],
  ["5", "Authentication and roles", "Login, guards, role menus, permissions.", "Role access."],
  ["6", "Medicine and inventory", "Catalog, categories, batches, search.", "Inventory MVP."],
  ["7", "Dashboard and alerts", "Summary cards, low stock, expiry, trend.", "Dashboard."],
  ["8", "Sales and POS", "Barcode search, cart, FEFO sale, receipts.", "Protected sales."],
  ["9", "Suppliers and purchases", "Suppliers, purchase orders, receiving.", "Purchasing workflow."],
  ["10", "Reports and settings", "Reports, exports, pharmacy settings, roles.", "Administration."],
  ["11", "Hardening and QA", "Lint, types, build, RLS, responsive tests.", "Release candidate."],
  ["12", "Deployment and documentation", "Staging, production steps, guide, proposal.", "Final handoff."],
];

const document = new Document({
  creator: "Darman Pharmacy Management System Project",
  title: "Darman Pharmacy Management System - Short Monograph Proposal",
  description: "Short university monograph proposal for a single-branch pharmacy management system.",
  styles: {
    default: {
      document: {
        run: { font: "Aptos", size: 21, color: colors.ink },
        paragraph: { spacing: { line: 285, after: 105 } },
      },
    },
  },
  sections: [
    section(
      [
        p("MONOGRAPH PROPOSAL ON", { alignment: AlignmentType.CENTER, bold: true, size: 28, after: 240 }),
        p("Darman Pharmacy Management System", { alignment: AlignmentType.CENTER, bold: true, size: 34, color: colors.navy, after: 160 }),
        p("سیستم مدیریت دواخانه درمان", { alignment: AlignmentType.CENTER, bold: true, size: 26, after: 280 }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [await imageRun(logo, 150, 150)],
        }),
        p("BY", { alignment: AlignmentType.CENTER, bold: true, size: 20, after: 100 }),
        p("Your Name", { alignment: AlignmentType.CENTER, bold: true, size: 22, after: 60 }),
        p("Reg No", { alignment: AlignmentType.CENTER, size: 18, after: 280 }),
        p("In partial fulfillment of the requirements for the award of the degree of", { alignment: AlignmentType.CENTER, size: 18, after: 60 }),
        p("BACHELOR OF SOFTWARE ENGINEERING", { alignment: AlignmentType.CENTER, bold: true, size: 22, after: 0 }),
      ],
      portrait,
    ),
    section(
      [
        p("MONOGRAPH PROPOSAL ON", { alignment: AlignmentType.CENTER, bold: true, size: 28, after: 200 }),
        p("Darman Pharmacy Management System", { alignment: AlignmentType.CENTER, bold: true, size: 34, color: colors.navy, after: 280 }),
        p("In partial fulfillment of the requirements for the award of the degree of (BSE)", { alignment: AlignmentType.CENTER, size: 18, after: 240 }),
        p("TO", { alignment: AlignmentType.CENTER, bold: true, size: 18, after: 80 }),
        p("RANA University", { alignment: AlignmentType.CENTER, bold: true, size: 24, after: 260 }),
        p("Faculty of Computer Science", { alignment: AlignmentType.CENTER, size: 20, after: 80 }),
        p("Department of Software Engineering", { alignment: AlignmentType.CENTER, size: 20, after: 260 }),
        p("Supervisor: [Supervisor Name and Academic Title]", { alignment: AlignmentType.CENTER, size: 18, after: 80 }),
        p("Submission Date: [Month Year]", { alignment: AlignmentType.CENTER, size: 18, after: 0 }),
      ],
      portrait,
    ),
    section([
      h1("Table of Contents"),
      ...[
        "Executive Summary",
        "1. Introduction",
        "2. Existing System",
        "3. Proposed System",
        "4. Logical Design",
        "5. Physical Design",
        "6. Tools and Technologies",
        "7. Project Time and Cost Estimation",
        "8. Project Timeline",
        "9. Risk Assessment and Trust Signals",
        "10. Conclusion",
        "11. References",
      ].map((item) => p(item, { alignment: AlignmentType.LEFT, bold: true, color: colors.navy, after: 35 })),
      h1("Executive Summary"),
      p("Darman Pharmacy Management System is a secure single-branch pharmacy operations system for medicine catalog management, batch inventory, sales, suppliers, purchase orders, expiry warnings, reporting, settings, and role-based access."),
      p("The system replaces paper or spreadsheet-based work with a controlled web application. It supports Admin, Pharmacist, and Cashier roles, atomic FEFO sales, atomic purchase receiving, low-stock alerts, expiry tracking, receipts, and basic exports."),
    ]),
    section([
      h1("1. Introduction"),
      p("Community pharmacies need accurate information about available medicines, stock batches, expiry dates, suppliers, purchases, and sales. Manual records can delay service and make stock decisions unreliable. This project delivers a clean and practical system for everyday pharmacy work."),
      p("The objectives are to manage medicines and categories, track batch inventory, warn about low stock and expiry, process sales, create receipts, manage suppliers and purchase orders, provide operational reports, and protect workflows through roles and database security."),
      h1("2. Existing System"),
      p("The existing system is assumed to rely on paper records, informal stock counts, spreadsheets, or disconnected tools. These methods can produce inaccurate stock balances, weak expiry control, scattered supplier history, slow sales processing, limited reports, and weak access control."),
      h1("3. Proposed System"),
      p("The proposed system is a responsive web application for one pharmacy branch. It provides role-aware workflows for medicines, inventory lookup, POS sales, suppliers, purchases, reports, settings, and user-role management."),
      p("Sales and purchasing are handled through protected PostgreSQL functions so stock changes are validated and committed atomically. Supabase Row Level Security remains the authorization boundary."),
    ]),
    section([
      h1("4. Logical Design"),
      p("The logical design describes how users, processes, and data stores interact. External users send login, medicine, sales, purchase, reporting, and settings requests to the application. The application validates the role, calls protected workflows, and reads or writes authorized database records."),
      p("Core rules include FEFO stock allocation for sales, batch-based inventory, expired stock exclusion from saleable quantity, controlled purchase receiving, role-aware reports, and inventory adjustment logs."),
      bullet("Cashiers process sales and view medicine availability."),
      bullet("Pharmacists manage medicines, inventory, sales, suppliers, and purchase orders."),
      bullet("Admins manage the full operational system, settings, and roles."),
    ]),
    await diagramPage(
      "Level 1 Data Flow Diagram",
      diagrams.level1,
      "Figure 1. Level 1 DFD showing authentication, catalog, inventory, sales, purchasing, reporting, and administration processes.",
      640,
      820,
    ),
    await diagramPage(
      "Conceptual Entity Relationship Model",
      diagrams.conceptual,
      "Figure 2. Conceptual ERD of staff, medicines, suppliers, inventory, sales, purchases, settings, and adjustments.",
      640,
      820,
    ),
    section([
      h1("5. Physical Design"),
      p("The physical design uses Next.js App Router, TypeScript, reusable UI components, Supabase PostgreSQL, Supabase Auth, Row Level Security, views, and transactional RPCs."),
      p("The database includes profiles, medicine categories, suppliers, medicines, inventory batches, sales, sale items, purchase orders, purchase items, inventory adjustments, and app settings."),
      p("Security is enforced through authenticated routes, role-aware UI, RLS policies, protected database functions, disabled direct browser writes for transactional tables, and safe environment variables."),
    ]),
    await diagramPage(
      "Physical ERD: Catalog and Inventory",
      diagrams.catalog,
      "Figure 3. Physical database design for categories, medicines, suppliers, batches, and inventory summary data.",
      641,
      328,
    ),
    section([
      h1("6. Tools and Technologies"),
      table(["Area", "Tool or Technology", "Use"], tools, [24, 30, 46]),
      h1("7. Project Time and Cost Estimation"),
      p("Development labor is treated as the student academic contribution. Direct expenses cover research, development, testing, demonstration, printing, and presentation."),
      table(["Item", "Quantity", "Total USD", "Basis"], costs, [25, 14, 14, 47]),
    ]),
    section([
      h1("8. Project Timeline"),
      table(["Week", "Milestone", "Main Activities", "Deliverable"], timeline, [8, 23, 45, 24]),
      h1("9. Risk Assessment and Trust Signals"),
      p("Main risks include unauthorized access, incorrect stock after concurrent sales, purchase receiving mistakes, expired stock being sold, user adoption difficulty, internet interruption, backup ownership gaps, and production configuration errors."),
      p("Mitigations and trust signals include RLS, transactional functions, FEFO allocation, rollback tests, beginner-focused UI, deployment checklists, staging acceptance, role tests, export checks, responsive checks, linting, type checks, production build success, QA documentation, DFD evidence, and ERD evidence."),
    ]),
    section([
      h1("10. Conclusion"),
      p("Darman Pharmacy Management System delivers a focused and practical solution for single-branch pharmacy operations. It connects medicine records, batch inventory, sales, purchasing, expiry warnings, reports, and user permissions in a maintainable system suitable for a real academic software project and future production deployment."),
      h1("11. References"),
      ...[
        "PROJECT_STATE.md repository source of truth.",
        "docs/CLIENT_GUIDE.md beginner user manual.",
        "docs/DEPLOYMENT.md deployment and maintenance guide.",
        "docs/MANUAL_QA_CHECKLIST.md manual testing checklist.",
        "Supabase documentation for PostgreSQL, Auth, and Row Level Security.",
        "Next.js, React, TypeScript, Tailwind CSS, and Vercel official documentation.",
      ].map((item) => p(item, { alignment: AlignmentType.LEFT, after: 55 })),
    ]),
    section([
      p("PROJECT PROPOSAL APPROVAL SHEET", { alignment: AlignmentType.CENTER, bold: true, size: 28, after: 300 }),
      p("The undersigned certify that they have read the following Project Proposal and are satisfied with the overall contents and idea, and recommend the proposal for university project approval.", { after: 280 }),
      p("Project Title: Darman Pharmacy Management System", { bold: true, alignment: AlignmentType.LEFT, after: 180 }),
      p("Student Name: [Student Full Name]", { alignment: AlignmentType.LEFT, after: 180 }),
      p("Registration Number: [Student ID]", { alignment: AlignmentType.LEFT, after: 260 }),
      p("Supervisor Name and Signature: ________________________________", { alignment: AlignmentType.LEFT, after: 260 }),
      p("Department Approval: __________________________________________", { alignment: AlignmentType.LEFT, after: 260 }),
      p("Date: ____________________", { alignment: AlignmentType.LEFT, after: 0 }),
    ], portrait),
  ],
});

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, await Packer.toBuffer(document));
console.log(JSON.stringify({ docx: outputPath }, null, 2));
