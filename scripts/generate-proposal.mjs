import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  LineRuleType,
  PageBreak,
  PageNumber,
  PageOrientation,
  Packer,
  Paragraph,
  SectionType,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

const root = process.cwd();
const refinedMode = process.argv.includes("--refined");
const finalMode = process.argv.includes("--final");
const wordCompatibleMode = process.argv.includes("--word-compatible");
const outputDir = refinedMode
  ? path.join(root, "docs", "Refined Proposals")
  : finalMode
    ? path.join(root, "docs", "final proposal")
  : path.join(root, "docs", "proposal");
const assetDir = path.join(
  outputDir,
  wordCompatibleMode ? "assets-word-compatible" : "assets",
);
const docxPath = path.join(
  outputDir,
  refinedMode
    ? "Darman_Pharmacy_Management_System_Refined_Proposal.docx"
    : finalMode
      ? wordCompatibleMode
        ? "Darman_Pharmacy_Management_System_Final_Proposal_Word_Compatible.docx"
        : "Darman_Pharmacy_Management_System_Final_Proposal.docx"
    : "Darman_Pharmacy_Management_System_Proposal.docx",
);
const htmlPath = path.join(outputDir, "proposal-preview.html");

const dfdDir =
  refinedMode || finalMode ? "docs/diagrams/Fixed DFD" : "docs/diagrams/DFD";
const erdDir = finalMode
  ? "docs/diagrams/New ERD"
  : refinedMode
    ? "docs/diagrams/Fixed ERD"
    : "docs/diagrams/ERD";

const colors = {
  navy: "17324D",
  blue: "1E5A85",
  cyan: "2C8FB5",
  pale: "EAF3F8",
  paleBlue: "DCEAF3",
  ink: "1F2933",
  muted: "52606D",
  line: "B8C7D1",
  white: "FFFFFF",
  green: "286B4A",
  amber: "8A5A13",
  red: "A33A3A",
};

const diagrams = [
  {
    id: "dfd-context",
    title: "Context Diagram",
    source: `${dfdDir}/Context Diagram.webp`,
    caption:
      "Figure 1. Context diagram showing the system boundary and its external actors.",
    section: "logical",
  },
  {
    id: "dfd-level-1",
    title: "Level 1 Data Flow Diagram",
    source: `${dfdDir}/Level 1 DFD.webp`,
    caption:
      "Figure 2. Level 1 DFD showing authentication, catalog, inventory, sales, purchasing, reporting, and administration processes.",
    section: "logical",
  },
  {
    id: "dfd-sales",
    title: "Level 2 Sales Data Flow Diagram",
    source: `${dfdDir}/Level 2 Sales DFD.webp`,
    caption:
      "Figure 3. Level 2 sales DFD showing checkout validation, FEFO allocation, stock deduction, adjustment logging, and receipt generation.",
    section: "logical",
  },
  {
    id: "dfd-purchasing",
    title: "Level 2 Purchasing Data Flow Diagram",
    source: `${dfdDir}/Level 2 Purchasing DFD.webp`,
    caption:
      "Figure 4. Level 2 purchasing DFD showing order creation, status control, delivery receiving, batch creation, and stock updates.",
    section: "logical",
  },
  {
    id: "dfd-reporting",
    title: "Level 2 Reporting and Administration Data Flow Diagram",
    source: `${dfdDir}/Level 2 Reporting and Admin DFD.webp`,
    caption:
      "Figure 5. Level 2 DFD for operational reporting, exports, settings, and role administration.",
    section: "logical",
  },
  {
    id: "erd-conceptual",
    title: "Conceptual Entity Relationship Model",
    source: finalMode
      ? `${erdDir}/01 - Conceptual ERD.webp`
      : `${erdDir}/Conceptual ER Model.webp`,
    caption:
      "Figure 6. Conceptual ER model of staff, medicines, suppliers, inventory, sales, purchases, settings, and adjustments.",
    section: "logical",
  },
  {
    id: "erd-catalog",
    title: "Physical ERD: Catalog and Inventory",
    source: finalMode
      ? `${erdDir}/02 - Catalog and Inventory Physical ERD.webp`
      : `${erdDir}/Physical Catalog and Inventory.webp`,
    caption:
      "Figure 7. Physical database design for categories, medicines, suppliers, batches, and inventory summary data.",
    section: "physical",
  },
  {
    id: "erd-sales",
    title: "Physical ERD: Sales",
    source: finalMode
      ? `${erdDir}/03 - Sales Physical ERD.webp`
      : `${erdDir}/Physical Sales.webp`,
    caption:
      "Figure 8. Physical database design for sales and batch-level sale items.",
    section: "physical",
  },
  {
    id: "erd-purchasing",
    title: "Physical ERD: Purchasing",
    source: finalMode
      ? `${erdDir}/04 - Purchasing Physical ERD.webp`
      : `${erdDir}/Physical Purchasing.webp`,
    caption:
      "Figure 9. Physical database design for suppliers, purchase orders, order items, and received inventory.",
    section: "physical",
  },
  {
    id: "erd-admin",
    title: "Physical ERD: Administration, Audit, and View",
    source: finalMode
      ? `${erdDir}/05 - Administration and Constraints ERD.webp`
      : `${erdDir}/Administration Audit and View.webp`,
    caption:
      "Figure 10. Physical database design for profiles, settings, inventory adjustments, and the inventory summary view.",
    section: "physical",
  },
  {
    id: "erd-lineage",
    title: "Entity Lifecycle and Data Lineage",
    source: finalMode
      ? `${erdDir}/06 - Data Flow and Lifecycle ERD.webp`
      : `${erdDir}/Entity Lifecycle and Data Lineage.webp`,
    caption:
      "Figure 11. Data lineage from master records through purchasing, stock batches, sales, reporting, and audit records.",
    section: "physical",
  },
];

const proposal = {
  title: "Darman Pharmacy Management System",
  subtitle: "Monograph Project Proposal",
  metadata: [
    ["University", "[University Name]"],
    ["Faculty", "[Faculty Name]"],
    ["Department", "[Department Name]"],
    ["Student", "[Student Full Name]"],
    ["Student ID", "[Student ID]"],
    ["Supervisor", "[Supervisor Name and Academic Title]"],
    ["Submission Date", "[Month Year]"],
  ],
  executiveSummary: [
    "Darman Pharmacy Management System is a secure, single-branch web application designed to improve the daily operation of a community pharmacy. The project addresses recurring operational problems such as inaccurate stock records, weak expiry monitoring, slow sales processing, fragmented supplier information, and limited reporting. It replaces paper-based or spreadsheet-based work with a unified system that is suitable for pharmacy owners and staff with limited technical experience.",
    "The proposed solution covers medicine and category management, batch-based inventory, low-stock and expiry alerts, point-of-sale processing, supplier management, purchase orders, role-based access, operational reports, and CSV or PDF exports. Sales deduct inventory atomically using First Expire, First Out allocation. Purchase receiving creates inventory batches and stock adjustment records in one protected transaction. Administrative, pharmacist, and cashier roles provide clear separation of responsibility.",
    "The project is implemented with Next.js, TypeScript, Supabase PostgreSQL and Auth, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts, and jsPDF. Row Level Security and database functions protect sensitive workflows. The release candidate has passed staging tests covering permissions, concurrent sales, rollback behavior, purchase receiving, reporting, exports, responsive layouts, and security headers. Production deployment remains dependent on applying the reviewed migrations, configuring production services, assigning backup ownership, and completing production smoke tests.",
    "The work is planned as a twelve-week academic software project. Development labor is treated as the student's academic contribution, while the estimated direct project cost is USD 230 for connectivity, electricity, a domain, printing, testing, and contingency. The result is a practical monograph project that demonstrates requirements analysis, database design, secure full-stack development, quality assurance, and deployment planning.",
  ],
  introduction: {
    background: [
      "Community pharmacies manage many fast-moving products with different batch numbers, prices, suppliers, and expiry dates. Daily decisions depend on knowing what is available, what is safe to sell, what must be reordered, and which stock should be used first. When these records are maintained manually, a small recording error can affect purchasing, sales, reporting, and customer service.",
      "A pharmacy management system should therefore provide more than a medicine list. It should connect purchasing, batch inventory, sales, alerts, and reporting while preserving a clear record of each stock movement. It must also be simple enough for a cashier or pharmacist to learn quickly and secure enough to prevent unauthorized changes.",
    ],
    aim:
      "The aim of this project is to design, implement, test, and prepare for deployment a production-quality, single-branch pharmacy management system that supports core operational workflows without introducing clinical, insurance, or enterprise accounting functions.",
    objectives: [
      "Create a searchable medicine catalog with categories, barcodes, pricing, supplier references, reorder levels, and active or inactive status.",
      "Track physical inventory by batch number, quantity, received date, cost, selling price, and expiry date.",
      "Provide low-stock and expiry warnings that support timely purchasing and stock handling.",
      "Implement a fast cashier-oriented point of sale with barcode scanning, discounts, receipts, and protected stock deduction.",
      "Manage suppliers and purchase orders from draft creation through ordered, delivered, or cancelled states.",
      "Provide role-based access for Admin, Pharmacist, and Cashier users.",
      "Produce basic operational reports with filters and CSV or PDF exports.",
      "Protect data with validation, Row Level Security, transactional database functions, and auditable inventory adjustments.",
      "Deliver deployment, testing, maintenance, and beginner user documentation.",
    ],
    significance: [
      "For a pharmacy owner, the system provides a clearer view of sales, inventory value, purchase activity, low stock, and upcoming expiry. For pharmacists and cashiers, it reduces repeated manual calculations and improves access to current medicine availability. For the university, the project demonstrates the complete software development lifecycle using a realistic business case.",
      "The project also creates a maintainable foundation for future improvement while deliberately limiting its first release to a manageable and testable operational scope.",
    ],
    stakeholders: [
      ["Pharmacy owner or Admin", "Controls users, settings, medicines, suppliers, purchases, sales, and reports."],
      ["Pharmacist", "Manages operational data but cannot manage users or dangerous system settings."],
      ["Cashier", "Processes sales and checks medicine availability without changing master or purchasing data."],
      ["University supervisor", "Reviews the project's academic quality, design decisions, implementation, and evidence."],
      ["System maintainer", "Applies migrations, manages deployments, monitors logs, and coordinates backups."],
    ],
    methodology: [
      "The project follows an iterative development method. Work begins with scope definition and process analysis, followed by logical and physical database design. Features are then implemented in small modules, integrated through protected workflows, and verified with linting, type checking, production builds, browser tests, database tests, and staged user-role acceptance tests.",
      "Each phase produces usable software and documentation. High-risk workflows such as sales, receiving, and role changes are tested at both the application and database layers before release.",
    ],
  },
  existingSystem: {
    description: [
      "The existing environment is assumed to use paper records, informal stock counting, spreadsheets, or separate applications for sales and purchasing. Such approaches can work for a very small inventory, but they become difficult to control as the number of products, batches, suppliers, and transactions increases.",
      "Data is often re-entered into several records. A purchase may be recorded in a notebook, stock may be changed in a spreadsheet, and sales totals may be calculated separately. Because these records are not connected, managers cannot easily confirm whether a figure is complete or current.",
    ],
    problems: [
      ["Stock accuracy", "Manual deductions and delayed updates can produce incorrect availability and purchasing decisions."],
      ["Expiry control", "Expiry dates may be checked visually instead of through systematic, configurable warnings."],
      ["Batch traceability", "The batch sold or received may not be connected to the related transaction."],
      ["Sales speed", "Manual medicine lookup, calculations, and receipt preparation slow down checkout."],
      ["Supplier records", "Contact information and order history can be scattered across notebooks or files."],
      ["Reporting", "Sales, stock value, expiry exposure, and purchase totals require repeated manual calculations."],
      ["Access control", "Shared spreadsheets or notebooks provide little separation between staff responsibilities."],
      ["Auditability", "It may be unclear who changed stock, when it changed, and which workflow caused the change."],
      ["Data recovery", "Paper can be lost and local files may not have a defined backup or recovery owner."],
    ],
    need:
      "A unified system is required to maintain one controlled operational record, connect stock movements to business transactions, reduce calculation errors, and provide timely information without overwhelming beginner users.",
  },
  proposedSystem: {
    overview: [
      "Darman is a responsive browser-based system for one pharmacy branch. It provides role-aware navigation and focused workflows for medicines, sales, suppliers, purchases, reports, settings, and dashboard analytics. The interface uses clear forms, searchable lists, confirmation dialogs, empty states, loading feedback, and actionable error messages.",
      "The database is the authoritative source for protected business operations. The browser requests a sale or purchase action, while PostgreSQL validates the user's role, checks the current records, locks affected data where required, calculates trusted values, and commits all related changes together.",
    ],
    scope: [
      ["Dashboard and analytics", "Daily and summary indicators, recent sales, low-stock alerts, expiry warnings, and a seven-day sales trend."],
      ["Medicine catalog", "Categories, generic and brand details, dosage form, strength, barcode, prices, supplier, reorder level, and active status."],
      ["Batch inventory", "Batch number, quantity, cost, selling price, received date, expiry date, and saleable-stock calculation."],
      ["Sales and POS", "Search, barcode input, stock-aware cart, discount, payment method, atomic completion, history, receipt, and PDF printing."],
      ["Suppliers", "Contact details, notes, active status, search, and purchase history."],
      ["Purchase orders", "Draft creation, ordered status, cancellation, delivery confirmation, batch entry, and atomic receiving."],
      ["Reports", "Sales, inventory, expiry, and purchase reports with filtering, search, pagination, CSV, and PDF export."],
      ["Users and settings", "Role management for existing Auth users and pharmacy identity, currency, receipt, and expiry settings."],
    ],
    roles: [
      ["Admin", "Full access to current application management, including users and settings."],
      ["Pharmacist", "Operational access to medicines, inventory, sales, suppliers, and purchase orders; settings are read-only."],
      ["Cashier", "Processes sales and views basic medicine availability; cannot change master, supplier, purchase, user, or settings data."],
    ],
    requirements: [
      ["Usability", "Common tasks must be understandable to a beginner user and remain usable on phone, tablet, and desktop widths."],
      ["Performance", "Lists use search, sorting, filtering, and pagination suitable for a small-to-medium single-branch dataset."],
      ["Security", "Authentication, route protection, role-aware interfaces, RLS, and database role checks must work together."],
      ["Integrity", "Sales and receiving must be atomic so partial stock changes cannot remain after a failure."],
      ["Maintainability", "Typed, validated, modular code and ordered database migrations must support controlled future releases."],
      ["Availability", "The cloud-hosted system requires a stable internet connection and documented service ownership."],
    ],
    exclusions: [
      "Patient medical records and EMR or EHR functions",
      "Prescription management and drug interaction checking",
      "Insurance claims and processing",
      "Multi-branch operation",
      "Loyalty programs and full accounting",
      "Telemedicine and native mobile applications",
      "AI demand forecasting",
      "SMS or email automation",
    ],
  },
  logicalDesign: {
    intro: [
      "The logical design describes what information enters and leaves the system, which processes transform it, and how the principal business entities relate. It is independent of detailed hosting or programming decisions.",
      "External actors include Admin, Pharmacist, Cashier, Supplier, Supabase Auth, and a business reviewer. Major processes cover authentication, catalog and inventory management, sales, purchasing, reporting, and administration. Data stores represent users, catalog records, batches, sales, purchases, adjustments, and settings.",
    ],
    dataRules: [
      "A medicine can have many inventory batches, while each batch belongs to one medicine.",
      "A sale contains one or more sale items, and each sale item identifies the allocated inventory batch.",
      "A supplier can have many purchase orders, and each purchase order contains one or more purchase items.",
      "Receiving an order creates or updates inventory batches and records inventory adjustments.",
      "Expired stock is retained for traceability but excluded from saleable quantity.",
      "Users receive one operational role through their profile.",
    ],
  },
  physicalDesign: {
    architecture: [
      "The application uses the Next.js App Router for server-rendered routes, protected navigation, and client-side interactive modules. Browser components use TanStack Query for server-state caching and mutations. React Hook Form and Zod provide controlled input handling and validation.",
      "Supabase provides PostgreSQL, email-and-password authentication, and browser-accessible APIs. Separate server and browser clients preserve the correct session context. Public Supabase keys are allowed in the browser, while RLS is the database security boundary. No service-role key is exposed to the client.",
      "Vercel hosts the Next.js application. Supabase hosts authentication and relational data. Production configuration requires the Supabase URL and one publishable or legacy anonymous key, plus the final application URL in Supabase Auth settings.",
    ],
    database: [
      ["profiles", "Staff identity, active status, and Admin, Pharmacist, or Cashier role."],
      ["medicine_categories", "Reusable category records for catalog organization."],
      ["suppliers", "Supplier identity, contact information, notes, and active status."],
      ["medicines", "Medicine master data, prices, barcode, reorder level, supplier reference, and status."],
      ["inventory_batches", "Batch-level stock, expiry, received date, quantity, and historical cost or selling price."],
      ["sales", "Sale header, cashier, payment method, subtotal, discount, total, status, and timestamps."],
      ["sale_items", "Medicine and allocated batch details for each completed sale."],
      ["purchase_orders", "Supplier order header, dates, status, totals, creator, and receiver information."],
      ["purchase_order_items", "Ordered medicine, quantity, pricing, receiving, batch, and expiry details."],
      ["inventory_adjustments", "Auditable stock changes linked to sales, purchases, or future controlled adjustments."],
      ["app_settings", "Pharmacy identity, currency, receipt note, and expiry warning configuration."],
      ["medicine_inventory_summary", "Database view that summarizes inventory for efficient operational reads."],
    ],
    workflows: [
      ["complete_sale", "Locks eligible batches, allocates stock by earliest expiry, recalculates trusted totals, creates sale records, deducts stock, and logs adjustments."],
      ["create_purchase_order", "Validates role and item data, calculates order totals, and creates the order and item records."],
      ["set_purchase_order_status", "Controls valid status transitions and prevents changes that would violate the order lifecycle."],
      ["receive_purchase_order", "Locks the order, validates delivery details, rejects repeat delivery, creates batches, updates stock metadata, and records adjustments atomically."],
      ["change_user_role", "Allows active Admin users to change another user's role while blocking self-role changes."],
    ],
    security: [
      "RLS is enabled on all application tables.",
      "Anonymous users have no operational table access.",
      "Routes and interface controls are role-aware, but database policies and functions independently verify authorization.",
      "Direct browser writes to sales, sale items, purchase records, batches, and adjustment logs are blocked where protected workflows apply.",
      "Hard deletion of important master records is avoided so historical references remain valid.",
      "Database constraints and Zod schemas reject malformed values before they become operational records.",
      "Security headers reduce framing, content-type, referrer, and browser-permission risks.",
    ],
    deployment: [
      "Five ordered SQL migrations define the schema and protected workflows.",
      "Staging uses a dedicated Supabase project and a Vercel deployment.",
      "Production deployment must apply migrations in filename order, configure production environment values, set Auth URLs, establish backup ownership, and complete smoke tests.",
      "Application releases use version control, linting, type checking, builds, staging verification, backups, deployment, and affected regression tests.",
    ],
  },
  tools: [
    ["Application framework", "Next.js 16 App Router", "Routes, layouts, server rendering, protected navigation, and production builds."],
    ["Programming language", "TypeScript", "Static typing for application, forms, queries, and database-facing code."],
    ["User interface", "React 19, Tailwind CSS, shadcn/ui, Radix UI", "Responsive pages, accessible controls, dialogs, tables, and reusable interface patterns."],
    ["Database", "Supabase PostgreSQL", "Relational schema, constraints, views, transactions, functions, and Row Level Security."],
    ["Authentication", "Supabase Auth", "Email-and-password sessions for controlled staff accounts."],
    ["Server state", "TanStack Query", "Fetching, caching, mutation handling, and targeted refresh after changes."],
    ["Forms and validation", "React Hook Form and Zod", "Validated forms with clear field-level error messages."],
    ["Charts", "Recharts", "Simple dashboard trends and operational visualization."],
    ["Document export", "jsPDF and CSV generation", "Receipts and filtered report downloads."],
    ["Diagramming", "draw.io", "Editable DFD and ERD documentation."],
    ["Testing and quality", "ESLint, TypeScript compiler, Next.js build, browser and database tests", "Code quality, compilation, responsive checks, workflow tests, and release verification."],
    ["Hosting", "Vercel and Supabase", "Managed application, authentication, and database hosting."],
    ["Version control", "Git", "Change tracking, review, release baselines, and rollback support."],
  ],
  costs: [
    ["Student development labor", "12 weeks", "Academic contribution", "0", "Not billed; represents the student's monograph work."],
    ["Internet and data", "3 months", "30", "90", "Development, research, staging, and deployment access."],
    ["Electricity and equipment use", "3 months", "20", "60", "Estimated power and personal computer use."],
    ["Custom domain", "1 year", "20", "20", "Optional professional project address."],
    ["Printing and binding", "1 set", "25", "25", "Proposal, monograph, and presentation copies."],
    ["Testing and demonstration materials", "1 allowance", "15", "15", "Sample labels, barcode tests, and presentation preparation."],
    ["Contingency", "1 allowance", "20", "20", "Unexpected academic or deployment expenses."],
    ["Total estimated direct cost", "", "", "230", "Student out-of-pocket project estimate."],
  ],
  optionalCosts: [
    ["Vercel", "Free tier is suitable for academic demonstration; paid plans depend on production usage."],
    ["Supabase", "Free tier is suitable for staging; production backup and resource requirements may require a paid plan."],
    ["Domain renewal", "Recurring annual cost depends on the selected registrar and domain."],
    ["Maintenance", "Future production support is outside the student's direct project budget."],
  ],
  timeline: [
    ["1", "Initiation and requirements", "Confirm problem, stakeholders, objectives, scope, exclusions, and success criteria.", "Approved requirements and scope statement."],
    ["2", "Existing-system analysis", "Study current workflows, pain points, roles, data, and operational risks.", "Problem analysis and process requirements."],
    ["3", "Logical and interface design", "Prepare DFDs, conceptual ER model, route plan, navigation, and core screens.", "Validated logical design and interface direction."],
    ["4", "Database foundation", "Create tables, relationships, constraints, indexes, profiles, settings, and initial RLS.", "Versioned initial migration."],
    ["5", "Authentication and roles", "Implement sign-in, protected routes, role-aware navigation, and permission handling.", "Admin, Pharmacist, and Cashier access."],
    ["6", "Medicine and inventory", "Build categories, medicine catalog, batch inventory, search, and validation.", "Catalog and inventory MVP."],
    ["7", "Dashboard and alerts", "Implement summary indicators, low-stock warnings, expiry filters, and trend chart.", "Operational dashboard."],
    ["8", "Sales and POS", "Build cashier workflow, barcode input, cart, FEFO sale transaction, history, and receipts.", "Protected sales workflow."],
    ["9", "Suppliers and purchases", "Implement supplier records, purchase orders, statuses, receiving, and stock increases.", "Protected purchasing workflow."],
    ["10", "Reports and settings", "Create reports, exports, search controls, pharmacy settings, and user-role management.", "Operational reporting and administration."],
    ["11", "Hardening and QA", "Run lint, type checks, builds, role tests, RLS tests, concurrency, rollback, responsive, and export tests.", "Release candidate and QA evidence."],
    ["12", "Deployment and documentation", "Deploy staging, prepare production steps, complete user guide, proposal, and presentation evidence.", "Staging release and final documentation."],
  ],
  risks: [
    ["Unauthorized data access", "High", "Medium", "Role-aware routes, RLS on all application tables, database role checks, disabled public signup, and denial tests.", "Low"],
    ["Incorrect stock after concurrent sales", "High", "Medium", "Transactional sale function, batch locking, FEFO allocation, trusted recalculation, and concurrency tests.", "Low"],
    ["Partial purchase receiving", "High", "Medium", "Atomic receiving function, order locking, duplicate-batch checks, rollback tests, and duplicate-delivery protection.", "Low"],
    ["Expired stock sold", "High", "Low", "Expiry-aware saleable stock, FEFO ordering, expiry validation, and dashboard warnings.", "Low"],
    ["User adoption difficulty", "Medium", "Medium", "Beginner-focused interface, limited role menus, clear messages, responsive layouts, and client guide.", "Low"],
    ["Cloud service or internet interruption", "Medium", "Medium", "Managed hosting, documented ownership, status monitoring, and operational communication. Offline mode is outside MVP scope.", "Medium"],
    ["Backup ownership not assigned", "High", "Medium", "Production launch gate requires named ownership, selected Supabase backup policy, and recovery verification.", "Medium until completed"],
    ["Production configuration error", "High", "Medium", "Ordered migrations, documented environment values, Auth URL checklist, staging baseline, and production smoke tests.", "Low after deployment checks"],
    ["Schedule pressure", "Medium", "Medium", "Twelve-week milestones, explicit exclusions, modular delivery, and priority on release-critical workflows.", "Low"],
    ["Future data growth", "Medium", "Low", "Indexes, pagination, filtered views, and a documented path toward database reporting functions if scale requires them.", "Low"],
  ],
  trustSignals: [
    "All five database migrations were applied successfully to a fresh staging project in filename order.",
    "Separate Admin, Pharmacist, and Cashier accounts passed route, interface, and database permission tests.",
    "Direct unauthorized transactional writes were rejected by RLS.",
    "FEFO allocation, concurrent sale locking, insufficient-stock rollback, purchase receiving rollback, and duplicate delivery protection passed staging tests.",
    "Receipts, CSV export, PDF export, report totals, settings, and role changes passed acceptance checks.",
    "Six operational pages passed responsive checks at 375, 768, 1024, and 1440 pixels.",
    "Linting, TypeScript checks, and production builds passed for the release candidate.",
    "The repository contains deployment, backup, recovery, rollback, QA, client guide, DFD, and ERD documentation.",
  ],
  conclusion: [
    "Darman Pharmacy Management System is a focused response to the operational needs of a single community pharmacy. Its design connects medicine records, batch inventory, purchasing, sales, alerts, users, and reports in one controlled system. The scope remains practical by excluding clinical records, prescriptions, insurance, multi-branch management, accounting, and automation features that would weaken the clarity of the first release.",
    "The project demonstrates a complete academic and professional software process: problem analysis, scope control, logical modeling, relational database design, role-based security, transactional workflows, responsive interface design, testing, deployment planning, and user documentation. Staging evidence shows that the release candidate performs its critical workflows correctly. Completion of the stated production setup and backup tasks will prepare the system for controlled real-world use.",
  ],
  references: [
    ["Darman project source of truth", "PROJECT_STATE.md, repository state dated June 23, 2026."],
    ["Darman deployment guide", "docs/DEPLOYMENT.md."],
    ["Darman client user manual", "docs/CLIENT_GUIDE.md."],
    ["Darman staging QA results", "docs/STAGING_QA_RESULTS.md, June 19, 2026."],
    ["Supabase documentation", "https://supabase.com/docs"],
    ["Next.js documentation", "https://nextjs.org/docs"],
    ["Vercel documentation", "https://vercel.com/docs"],
    ["PostgreSQL documentation", "https://www.postgresql.org/docs/"],
    ["OWASP", "OWASP Application Security Verification Standard and web security guidance, https://owasp.org/"],
  ],
};

const sections = [
  ["Executive Summary", "Executive Summary"],
  ["1", "Introduction"],
  ["2", "Existing System"],
  ["3", "Proposed System"],
  ["4", "Logical Design"],
  ["5", "Physical Design"],
  ["6", "Tools and Technologies"],
  ["7", "Project Time and Cost Estimation"],
  ["8", "Project Timeline"],
  ["9", "Risk Assessment and Trust Signals"],
  ["10", "Conclusion"],
  ["11", "References"],
  ...(refinedMode ? [] : [["Appendix A", "Detailed Logical and Physical Diagrams"]]),
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const paragraphHtml = (items) =>
  items.map((item) => `<p>${escapeHtml(item)}</p>`).join("");

const listHtml = (items) =>
  `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

const tableHtml = (headers, rows, className = "") => `
  <table class="${className}">
    <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody>
  </table>`;

const sectionTitleHtml = (number, title) =>
  `<h1>${number ? `${escapeHtml(number)}. ` : ""}${escapeHtml(title)}</h1>`;

function diagramHtml(diagram, appendix = false) {
  const image = `assets/${diagram.id}.png`;
  return `
    <section class="diagram-page landscape ${appendix ? "appendix-diagram" : ""}">
      <h2>${escapeHtml(diagram.title)}</h2>
      <div class="diagram-frame"><img src="${image}" alt="${escapeHtml(diagram.title)}"></div>
      <p class="caption">${escapeHtml(diagram.caption)}</p>
    </section>`;
}

function buildHtml() {
  const toc = sections
    .map(
      ([number, title]) =>
        `<li><span>${escapeHtml(number === title ? title : `${number}. ${title}`)}</span><span class="leader"></span></li>`,
    )
    .join("");

  const logicalDiagrams = diagrams
    .filter((item) => item.section === "logical")
    .map((item) => diagramHtml(item))
    .join("");
  const physicalDiagrams = diagrams
    .filter((item) => item.section === "physical")
    .map((item) => diagramHtml(item))
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${proposal.title} - ${proposal.subtitle}</title>
<style>
  @page { size: A4; margin: 18mm 18mm 19mm; }
  @page landscape { size: A4 landscape; margin: 14mm 16mm 16mm; }
  :root { --navy:#17324d; --blue:#1e5a85; --cyan:#2c8fb5; --pale:#eaf3f8; --ink:#1f2933; --muted:#52606d; --line:#b8c7d1; }
  * { box-sizing: border-box; }
  body { margin:0; color:var(--ink); font-family:"Aptos","Segoe UI",Arial,sans-serif; font-size:10.2pt; line-height:1.48; }
  .page { break-after:page; min-height:250mm; position:relative; }
  .cover { display:flex; flex-direction:column; min-height:258mm; border-top:12px solid var(--navy); padding:15mm 12mm 6mm; }
  .cover img { width:42mm; align-self:center; margin:8mm 0 12mm; }
  .cover .eyebrow { color:var(--cyan); letter-spacing:2px; text-transform:uppercase; text-align:center; font-size:10pt; font-weight:700; }
  .cover h1 { color:var(--navy); text-align:center; font-size:28pt; line-height:1.15; margin:7mm 0 3mm; }
  .cover h2 { color:var(--blue); text-align:center; font-size:16pt; font-weight:500; margin:0 0 12mm; }
  .meta { width:82%; margin:auto auto 8mm; border-collapse:collapse; }
  .meta td { border:none; border-bottom:1px solid var(--line); padding:3mm 2mm; }
  .meta td:first-child { width:34%; color:var(--muted); font-weight:700; }
  .cover .statement { margin:7mm auto 0; width:86%; color:var(--muted); text-align:center; font-size:9pt; }
  header { position:running(doc-header); }
  h1 { color:var(--navy); font-size:20pt; line-height:1.2; margin:0 0 7mm; padding-bottom:3mm; border-bottom:2px solid var(--cyan); }
  h2 { color:var(--blue); font-size:14pt; margin:7mm 0 3mm; break-after:avoid; }
  h3 { color:var(--navy); font-size:11.5pt; margin:5mm 0 2mm; break-after:avoid; }
  p { margin:0 0 3.2mm; text-align:justify; orphans:3; widows:3; }
  ul, ol { margin:2mm 0 4mm 7mm; padding-left:5mm; }
  li { margin:0 0 1.5mm; }
  .toc ol { list-style:none; padding:0; margin:8mm 0; }
  .toc li { display:flex; align-items:flex-end; gap:3mm; margin:3.3mm 0; color:var(--navy); font-weight:600; }
  .toc .leader { flex:1; border-bottom:1px dotted var(--line); transform:translateY(-1.5mm); }
  .notice { padding:4mm; background:var(--pale); border-left:4px solid var(--cyan); margin:4mm 0; }
  table { width:100%; border-collapse:collapse; margin:3mm 0 6mm; font-size:8.8pt; break-inside:auto; }
  tr { break-inside:avoid; }
  th { background:var(--navy); color:white; text-align:left; font-weight:700; padding:2.4mm; border:1px solid var(--navy); }
  td { vertical-align:top; padding:2.2mm; border:1px solid var(--line); }
  tbody tr:nth-child(even) td { background:#f7fafc; }
  .compact { font-size:8pt; }
  .cost td:nth-child(4), .cost th:nth-child(4) { text-align:right; }
  .diagram-page { page:landscape; break-before:page; break-after:page; min-height:174mm; display:flex; flex-direction:column; }
  .diagram-page h2 { margin:0 0 3mm; font-size:15pt; }
  .diagram-frame { flex:1; min-height:0; display:flex; align-items:center; justify-content:center; border:1px solid var(--line); padding:3mm; background:white; }
  .diagram-frame img { display:block; max-width:100%; max-height:150mm; object-fit:contain; }
  .caption { margin:2.5mm 0 0; text-align:center; color:var(--muted); font-size:8.5pt; font-style:italic; }
  .status-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:3mm; margin:4mm 0 6mm; }
  .status-card { border:1px solid var(--line); border-top:4px solid var(--cyan); padding:4mm; background:#fbfdfe; }
  .status-card strong { display:block; color:var(--navy); margin-bottom:1mm; }
  .footer-note { color:var(--muted); font-size:8.5pt; }
  .references li { margin-bottom:3mm; }
  .appendix-title { break-before:page; }
  a { color:var(--blue); text-decoration:none; }
</style>
</head>
<body>
  <section class="cover page">
    <div class="eyebrow">Academic Software Project Proposal</div>
    <img src="../../public/brand/darman-logo.png" alt="Darman logo">
    <h1>${proposal.title}</h1>
    <h2>${proposal.subtitle}</h2>
    ${tableHtml(["", ""], proposal.metadata, "meta")}
    <p class="statement">Submitted in partial fulfillment of the requirements for the assigned university software project.</p>
  </section>

  <section class="toc page">
    <h1>Table of Contents</h1>
    <ol>${toc}</ol>
    <div class="notice"><strong>Document status:</strong> This proposal describes the validated release candidate and the remaining controlled production deployment activities.</div>
  </section>

  <section class="page">
    ${sectionTitleHtml("", "Executive Summary")}
    ${paragraphHtml(proposal.executiveSummary)}
    <div class="status-grid">
      <div class="status-card"><strong>Product scope</strong>Single-branch pharmacy operations MVP</div>
      <div class="status-card"><strong>Academic plan</strong>Twelve development weeks</div>
      <div class="status-card"><strong>Direct cost</strong>USD 230 student budget</div>
    </div>
  </section>

  <section class="page">
    ${sectionTitleHtml("1", "Introduction")}
    <h2>1.1 Background</h2>${paragraphHtml(proposal.introduction.background)}
    <h2>1.2 Project Aim</h2><p>${escapeHtml(proposal.introduction.aim)}</p>
    <h2>1.3 Objectives</h2>${listHtml(proposal.introduction.objectives)}
    <h2>1.4 Significance of the Project</h2>${paragraphHtml(proposal.introduction.significance)}
    <h2>1.5 Stakeholders</h2>${tableHtml(["Stakeholder", "Interest and Responsibility"], proposal.introduction.stakeholders)}
    <h2>1.6 Development Methodology</h2>${paragraphHtml(proposal.introduction.methodology)}
  </section>

  <section class="page">
    ${sectionTitleHtml("2", "Existing System")}
    <h2>2.1 Current Operating Approach</h2>${paragraphHtml(proposal.existingSystem.description)}
    <h2>2.2 Identified Problems</h2>${tableHtml(["Area", "Existing Limitation"], proposal.existingSystem.problems)}
    <h2>2.3 Need for Change</h2><p>${escapeHtml(proposal.existingSystem.need)}</p>
  </section>

  <section class="page">
    ${sectionTitleHtml("3", "Proposed System")}
    <h2>3.1 Solution Overview</h2>${paragraphHtml(proposal.proposedSystem.overview)}
    <h2>3.2 Scope of Work</h2>${tableHtml(["Module", "Proposed Capability"], proposal.proposedSystem.scope)}
    <h2>3.3 User Roles</h2>${tableHtml(["Role", "Access"], proposal.proposedSystem.roles)}
    <h2>3.4 Non-Functional Requirements</h2>${tableHtml(["Requirement", "Expected Standard"], proposal.proposedSystem.requirements)}
    <h2>3.5 Explicit Exclusions</h2>${listHtml(proposal.proposedSystem.exclusions)}
  </section>

  <section class="page">
    ${sectionTitleHtml("4", "Logical Design")}
    <h2>4.1 Logical Architecture</h2>${paragraphHtml(proposal.logicalDesign.intro)}
    <h2>4.2 Core Data Rules</h2>${listHtml(proposal.logicalDesign.dataRules)}
    <div class="notice">The following validated diagrams present the system boundary, major processes, transaction-level flows, and conceptual data model. Editable draw.io sources are maintained in <strong>docs/diagrams</strong>.</div>
  </section>
  ${logicalDiagrams}

  <section class="page">
    ${sectionTitleHtml("5", "Physical Design")}
    <h2>5.1 Application Architecture</h2>${paragraphHtml(proposal.physicalDesign.architecture)}
    <h2>5.2 Database Structure</h2>${tableHtml(["Object", "Purpose"], proposal.physicalDesign.database, "compact")}
    <h2>5.3 Protected Database Workflows</h2>${tableHtml(["Database Function", "Responsibility"], proposal.physicalDesign.workflows)}
    <h2>5.4 Security Design</h2>${listHtml(proposal.physicalDesign.security)}
    <h2>5.5 Deployment Design</h2>${listHtml(proposal.physicalDesign.deployment)}
  </section>
  ${physicalDiagrams}

  <section class="page">
    ${sectionTitleHtml("6", "Tools and Technologies")}
    <p>The technology selection prioritizes maintainability, type safety, secure managed infrastructure, responsive interfaces, and low initial operating cost.</p>
    ${tableHtml(["Area", "Tool or Technology", "Use in the Project"], proposal.tools, "compact")}
  </section>

  <section class="page">
    ${sectionTitleHtml("7", "Project Time and Cost Estimation")}
    <h2>7.1 Estimation Basis</h2>
    <p>The estimate uses a student-budget model. Development and design labor are academic contributions and are not billed. Direct expenses cover the resources required to research, develop, test, demonstrate, print, and present the project.</p>
    ${tableHtml(["Item", "Quantity", "Unit Cost (USD)", "Total (USD)", "Basis"], proposal.costs, "cost")}
    <h2>7.2 Optional Production Costs</h2>
    ${tableHtml(["Item", "Budget Note"], proposal.optionalCosts)}
    <div class="notice"><strong>Estimated direct project cost: USD 230.</strong> Optional production hosting, backup features, domain renewal, and ongoing support depend on the service plans selected by the future system owner.</div>
  </section>

  <section class="page">
    ${sectionTitleHtml("8", "Project Timeline")}
    <p>The roadmap organizes the project into twelve weekly milestones. Each week produces a defined output that contributes to the final release candidate.</p>
    ${tableHtml(["Week", "Milestone", "Main Activities", "Deliverable"], proposal.timeline, "compact")}
  </section>

  <section class="page">
    ${sectionTitleHtml("9", "Risk Assessment and Trust Signals")}
    <h2>9.1 Risk Assessment</h2>
    ${tableHtml(["Risk", "Impact", "Likelihood", "Mitigation", "Residual Risk"], proposal.risks, "compact")}
    <h2>9.2 Verified Trust Signals</h2>${listHtml(proposal.trustSignals)}
    <h2>9.3 Remaining Production Conditions</h2>
    <div class="notice">Production approval remains conditional on assigning backup and recovery ownership, applying the five reviewed migrations to the production Supabase project, configuring production Supabase and Vercel values, completing production smoke tests, inspecting logs, and rotating or removing staging QA accounts.</div>
  </section>

  <section class="page">
    ${sectionTitleHtml("10", "Conclusion")}
    ${paragraphHtml(proposal.conclusion)}
  </section>

  <section class="page references">
    ${sectionTitleHtml("11", "References")}
    <ol>${proposal.references
      .map(
        ([name, value]) =>
          `<li><strong>${escapeHtml(name)}.</strong> ${value.startsWith("http") ? `<a href="${escapeHtml(value)}">${escapeHtml(value)}</a>` : escapeHtml(value)}</li>`,
      )
      .join("")}</ol>
  </section>

  ${
    refinedMode || finalMode
      ? ""
      : `
  <section class="page appendix-title">
    <h1>Appendix A. Detailed Logical and Physical Diagrams</h1>
    <p>The appendix reproduces the complete validated diagram set for review and presentation. The figures are based on the editable draw.io sources and correspond to the release-candidate database and workflows.</p>
    ${tableHtml(["Figure", "Diagram"], diagrams.map((item, index) => [`${index + 1}`, item.title]))}
  </section>
  ${diagrams.map((item) => diagramHtml(item, true)).join("")}
`
  }
</body>
</html>`;
}

const border = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: colors.line,
};

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: colors.white,
};

const bodyText = (text, options = {}) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Aptos",
        size: 21,
        color: colors.ink,
        ...options.run,
      }),
    ],
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { after: options.after ?? 150, line: 300, lineRule: LineRuleType.AUTO },
    keepNext: options.keepNext,
  });

const heading = (text, level = 1) =>
  new Paragraph({
    text,
    heading:
      level === 1
        ? HeadingLevel.HEADING_1
        : level === 2
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3,
    spacing: { before: level === 1 ? 0 : 220, after: 120 },
    keepNext: true,
  });

const bullets = (items) =>
  items.map(
    (item) =>
      new Paragraph({
        children: [new TextRun({ text: item, font: "Aptos", size: 21 })],
        numbering: { reference: "proposal-bullets", level: 0 },
        spacing: { after: 90, line: 280 },
      }),
  );

const staticTocEntries = [
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
];

const staticTocDocx = () =>
  staticTocEntries.map(
    (item) =>
      new Paragraph({
        children: [
          new TextRun({
            text: item,
            font: "Aptos",
            size: 22,
            bold: true,
            color: colors.navy,
          }),
        ],
        spacing: { after: 150, line: 280 },
      }),
  );

function docxTable(headers, rows, widths = undefined) {
  const header = new TableRow({
    tableHeader: true,
    children: headers.map(
      (value, index) =>
        new TableCell({
          width: widths
            ? { size: widths[index], type: WidthType.PERCENTAGE }
            : undefined,
          shading: {
            fill: colors.navy,
            type: ShadingType.CLEAR,
            color: "auto",
          },
          borders: { top: border, bottom: border, left: border, right: border },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: String(value),
                  bold: true,
                  color: colors.white,
                  font: "Aptos",
                  size: 18,
                }),
              ],
              spacing: { after: 0 },
            }),
          ],
        }),
    ),
  });

  const dataRows = rows.map(
    (row, rowIndex) =>
      new TableRow({
        ...(finalMode ? {} : { cantSplit: true }),
        children: row.map(
          (value, index) =>
            new TableCell({
              width: widths
                ? { size: widths[index], type: WidthType.PERCENTAGE }
                : undefined,
              shading:
                rowIndex % 2
                  ? { fill: "F7FAFC", type: ShadingType.CLEAR, color: "auto" }
                  : undefined,
              borders: {
                top: border,
                bottom: border,
                left: border,
                right: border,
              },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(value),
                      font: "Aptos",
                      size: 17,
                      color: colors.ink,
                    }),
                  ],
                  spacing: { after: 0, line: 240 },
                }),
              ],
            }),
        ),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...dataRows],
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
  });
}

const header = new Header({
  children: [
    new Paragraph({
      children: [
        new TextRun({
          text: "DARMAN PHARMACY MANAGEMENT SYSTEM",
          font: "Aptos",
          bold: true,
          color: colors.navy,
          size: 16,
        }),
      ],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: colors.cyan } },
      spacing: { after: 80 },
    }),
  ],
});

const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Monograph Project Proposal  |  Page ",
          font: "Aptos",
          color: colors.muted,
          size: 16,
        }),
        new TextRun({ children: [PageNumber.CURRENT], color: colors.muted, size: 16 }),
      ],
    }),
  ],
});

const portraitProperties = {
  type: SectionType.NEXT_PAGE,
  page: {
    size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
    margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
  },
};

const landscapeProperties = {
  type: SectionType.NEXT_PAGE,
  page: {
    size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
    margin: { top: 720, right: 820, bottom: 760, left: 820 },
  },
};

const commonSection = (children, properties = portraitProperties, first = false) => ({
  properties,
  headers: first || finalMode ? undefined : { default: header },
  footers: first || finalMode ? undefined : { default: footer },
  children,
});

function noticeDocx(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: colors.pale, type: ShadingType.CLEAR, color: "auto" },
            borders: {
              top: border,
              bottom: border,
              right: border,
              left: { style: BorderStyle.SINGLE, size: 18, color: colors.cyan },
            },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: [bodyText(text, { after: 0 })],
          }),
        ],
      }),
    ],
  });
}

function finalCostEstimateSection() {
  const directCosts = proposal.costs.map(
    ([item, quantity, unitCost, total, basis]) =>
      bodyText(
        `${item}: ${quantity ? `${quantity}; ` : ""}${unitCost ? `unit cost USD ${unitCost}; ` : ""}total USD ${total}. ${basis}`,
        { alignment: AlignmentType.LEFT, after: 110 },
      ),
  );

  const optionalCosts = proposal.optionalCosts.map(([item, note]) =>
    bodyText(`${item}: ${note}`, { alignment: AlignmentType.LEFT, after: 110 }),
  );

  return [
    heading("7. Project Time and Cost Estimation"),
    heading("7.1 Estimation Basis", 2),
    bodyText(
      "The estimate uses a student-budget model. Development and design labor are academic contributions and are not billed. Direct expenses cover the resources required to research, develop, test, demonstrate, print, and present the project.",
    ),
    heading("7.2 Direct Cost Estimate", 2),
    ...directCosts,
    bodyText("Total estimated direct cost: USD 230.", {
      alignment: AlignmentType.LEFT,
      run: { bold: true, color: colors.navy },
    }),
    heading("7.3 Optional Production Costs", 2),
    ...optionalCosts,
    bodyText(
      "Optional production hosting, backup features, domain renewal, and ongoing support depend on the service plans selected by the future system owner.",
    ),
  ];
}

function sectionFromParagraphs(number, title, content) {
  return commonSection([heading(`${number ? `${number}. ` : ""}${title}`), ...content]);
}

async function prepareImages() {
  await fs.mkdir(assetDir, { recursive: true });
  for (const diagram of diagrams) {
    const source = path.join(root, diagram.source);
    const target = path.join(assetDir, `${diagram.id}.png`);
    await sharp(source)
      .flatten({ background: "#ffffff" })
      .png({ compressionLevel: 9 })
      .toFile(target);
    diagram.png = target;
    diagram.meta = await sharp(target).metadata();
  }
}

async function imageRun(filePath, maxWidth, maxHeight) {
  const data = await fs.readFile(filePath);
  const metadata = await sharp(data).metadata();
  const ratio = Math.min(
    maxWidth / metadata.width,
    maxHeight / metadata.height,
    1,
  );
  return new ImageRun({
    data,
    type: "png",
    transformation: {
      width: Math.round(metadata.width * ratio),
      height: Math.round(metadata.height * ratio),
    },
  });
}

async function buildDocx() {
  const logo = await imageRun(
    path.join(root, "public", "brand", "darman-logo.png"),
    180,
    180,
  );

  const coverMeta = new Table({
    width: { size: 82, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: proposal.metadata.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              borders: { top: noBorder, left: noBorder, right: noBorder, bottom: border },
              margins: { top: 110, bottom: 110, left: 80, right: 80 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      bold: true,
                      color: colors.muted,
                      font: "Aptos",
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: { top: noBorder, left: noBorder, right: noBorder, bottom: border },
              margins: { top: 110, bottom: 110, left: 80, right: 80 },
              children: [bodyText(value, { alignment: AlignmentType.LEFT, after: 0 })],
            }),
          ],
        }),
    ),
  });

  const docSections = [
    commonSection(
      [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 360, after: 320 },
          children: [logo],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: "ACADEMIC SOFTWARE PROJECT PROPOSAL",
              bold: true,
              color: colors.cyan,
              font: "Aptos",
              size: 20,
              characterSpacing: 80,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: proposal.title,
              bold: true,
              color: colors.navy,
              font: "Aptos Display",
              size: 56,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 520 },
          children: [
            new TextRun({
              text: proposal.subtitle,
              color: colors.blue,
              font: "Aptos",
              size: 32,
            }),
          ],
        }),
        coverMeta,
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300 },
          children: [
            new TextRun({
              text: "Submitted in partial fulfillment of the requirements for the assigned university software project.",
              italics: true,
              color: colors.muted,
              font: "Aptos",
              size: 18,
            }),
          ],
        }),
      ],
      portraitProperties,
      true,
    ),
    commonSection([
      heading("Table of Contents"),
      ...(finalMode
        ? staticTocDocx()
        : [
            new TableOfContents("Table of Contents", {
              hyperlink: true,
              headingStyleRange: "1-3",
            }),
            new Paragraph({ children: [new PageBreak()] }),
          ]),
      noticeDocx(
        "Document status: This proposal describes the validated release candidate and the remaining controlled production deployment activities.",
      ),
    ]),
    sectionFromParagraphs("", "Executive Summary", [
      ...proposal.executiveSummary.map((item) => bodyText(item)),
      docxTable(
        ["Product Scope", "Academic Plan", "Direct Cost"],
        [["Single-branch pharmacy operations MVP", "Twelve development weeks", "USD 230 student budget"]],
        [40, 30, 30],
      ),
    ]),
    sectionFromParagraphs("1", "Introduction", [
      heading("1.1 Background", 2),
      ...proposal.introduction.background.map((item) => bodyText(item)),
      heading("1.2 Project Aim", 2),
      bodyText(proposal.introduction.aim),
      heading("1.3 Objectives", 2),
      ...bullets(proposal.introduction.objectives),
      heading("1.4 Significance of the Project", 2),
      ...proposal.introduction.significance.map((item) => bodyText(item)),
      heading("1.5 Stakeholders", 2),
      docxTable(
        ["Stakeholder", "Interest and Responsibility"],
        proposal.introduction.stakeholders,
        [30, 70],
      ),
      heading("1.6 Development Methodology", 2),
      ...proposal.introduction.methodology.map((item) => bodyText(item)),
    ]),
    sectionFromParagraphs("2", "Existing System", [
      heading("2.1 Current Operating Approach", 2),
      ...proposal.existingSystem.description.map((item) => bodyText(item)),
      heading("2.2 Identified Problems", 2),
      docxTable(["Area", "Existing Limitation"], proposal.existingSystem.problems, [26, 74]),
      heading("2.3 Need for Change", 2),
      bodyText(proposal.existingSystem.need),
    ]),
    sectionFromParagraphs("3", "Proposed System", [
      heading("3.1 Solution Overview", 2),
      ...proposal.proposedSystem.overview.map((item) => bodyText(item)),
      heading("3.2 Scope of Work", 2),
      docxTable(["Module", "Proposed Capability"], proposal.proposedSystem.scope, [28, 72]),
      heading("3.3 User Roles", 2),
      docxTable(["Role", "Access"], proposal.proposedSystem.roles, [25, 75]),
      heading("3.4 Non-Functional Requirements", 2),
      docxTable(["Requirement", "Expected Standard"], proposal.proposedSystem.requirements, [28, 72]),
      heading("3.5 Explicit Exclusions", 2),
      ...bullets(proposal.proposedSystem.exclusions),
    ]),
    sectionFromParagraphs("4", "Logical Design", [
      heading("4.1 Logical Architecture", 2),
      ...proposal.logicalDesign.intro.map((item) => bodyText(item)),
      heading("4.2 Core Data Rules", 2),
      ...bullets(proposal.logicalDesign.dataRules),
      noticeDocx(
        "The following validated diagrams present the system boundary, major processes, transaction-level flows, and conceptual data model. Editable draw.io sources are maintained in docs/diagrams.",
      ),
    ]),
  ];

  for (const diagram of diagrams.filter((item) => item.section === "logical")) {
    docSections.push(
      commonSection(
        [
          heading(diagram.title, 2),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [await imageRun(diagram.png, finalMode ? 640 : 980, finalMode ? 820 : 570)],
          }),
          bodyText(diagram.caption, {
            alignment: AlignmentType.CENTER,
            after: 0,
            run: { italics: true, color: colors.muted, size: 17 },
          }),
        ],
        finalMode ? portraitProperties : landscapeProperties,
      ),
    );
  }

  docSections.push(
    sectionFromParagraphs("5", "Physical Design", [
      heading("5.1 Application Architecture", 2),
      ...proposal.physicalDesign.architecture.map((item) => bodyText(item)),
      heading("5.2 Database Structure", 2),
      docxTable(["Object", "Purpose"], proposal.physicalDesign.database, [30, 70]),
      heading("5.3 Protected Database Workflows", 2),
      docxTable(["Database Function", "Responsibility"], proposal.physicalDesign.workflows, [32, 68]),
      heading("5.4 Security Design", 2),
      ...bullets(proposal.physicalDesign.security),
      heading("5.5 Deployment Design", 2),
      ...bullets(proposal.physicalDesign.deployment),
    ]),
  );

  for (const diagram of diagrams.filter((item) => item.section === "physical")) {
    docSections.push(
      commonSection(
        [
          heading(diagram.title, 2),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [await imageRun(diagram.png, finalMode ? 640 : 980, finalMode ? 820 : 570)],
          }),
          bodyText(diagram.caption, {
            alignment: AlignmentType.CENTER,
            after: 0,
            run: { italics: true, color: colors.muted, size: 17 },
          }),
        ],
        finalMode ? portraitProperties : landscapeProperties,
      ),
    );
  }

  docSections.push(
    sectionFromParagraphs("6", "Tools and Technologies", [
      bodyText(
        "The technology selection prioritizes maintainability, type safety, secure managed infrastructure, responsive interfaces, and low initial operating cost.",
      ),
      docxTable(["Area", "Tool or Technology", "Use in the Project"], proposal.tools, [22, 30, 48]),
    ]),
    finalMode
      ? commonSection(finalCostEstimateSection(), portraitProperties)
      : sectionFromParagraphs("7", "Project Time and Cost Estimation", [
          heading("7.1 Estimation Basis", 2),
          bodyText(
            "The estimate uses a student-budget model. Development and design labor are academic contributions and are not billed. Direct expenses cover the resources required to research, develop, test, demonstrate, print, and present the project.",
          ),
          docxTable(
            ["Item", "Quantity", "Unit Cost (USD)", "Total (USD)", "Basis"],
            proposal.costs,
            [25, 14, 16, 14, 31],
          ),
          heading("7.2 Optional Production Costs", 2),
          docxTable(["Item", "Budget Note"], proposal.optionalCosts, [28, 72]),
          noticeDocx(
            "Estimated direct project cost: USD 230. Optional production hosting, backup features, domain renewal, and ongoing support depend on the service plans selected by the future system owner.",
          ),
        ]),
    sectionFromParagraphs("8", "Project Timeline", [
      bodyText(
        "The roadmap organizes the project into twelve weekly milestones. Each week produces a defined output that contributes to the final release candidate.",
      ),
      docxTable(
        ["Week", "Milestone", "Main Activities", "Deliverable"],
        proposal.timeline,
        [8, 22, 46, 24],
      ),
    ]),
    sectionFromParagraphs("9", "Risk Assessment and Trust Signals", [
      heading("9.1 Risk Assessment", 2),
      docxTable(
        ["Risk", "Impact", "Likelihood", "Mitigation", "Residual Risk"],
        proposal.risks,
        [20, 10, 12, 43, 15],
      ),
      heading("9.2 Verified Trust Signals", 2),
      ...bullets(proposal.trustSignals),
      heading("9.3 Remaining Production Conditions", 2),
      noticeDocx(
        "Production approval remains conditional on assigning backup and recovery ownership, applying the five reviewed migrations to the production Supabase project, configuring production Supabase and Vercel values, completing production smoke tests, inspecting logs, and rotating or removing staging QA accounts.",
      ),
    ]),
    sectionFromParagraphs("10", "Conclusion", [
      ...proposal.conclusion.map((item) => bodyText(item)),
    ]),
    commonSection([
      heading("11. References"),
      ...proposal.references.map(
        ([name, value]) =>
          new Paragraph({
            numbering: { reference: "proposal-references", level: 0 },
            spacing: { after: 130, line: 280 },
            children: [
              new TextRun({ text: `${name}. `, bold: true, font: "Aptos", size: 20 }),
              value.startsWith("http") && !finalMode
                ? new ExternalHyperlink({
                    link: value,
                    children: [
                      new TextRun({
                        text: value,
                        style: "Hyperlink",
                        font: "Aptos",
                        size: 20,
                      }),
                    ],
                  })
                : new TextRun({ text: value, font: "Aptos", size: 20 }),
            ],
          }),
      ),
    ]),
  );

  if (!refinedMode && !finalMode) {
    docSections.push(
      commonSection([
        heading("Appendix A. Detailed Logical and Physical Diagrams"),
        bodyText(
          "The appendix reproduces the complete validated diagram set for review and presentation. The figures are based on the editable draw.io sources and correspond to the release-candidate database and workflows.",
        ),
        docxTable(
          ["Figure", "Diagram"],
          diagrams.map((item, index) => [String(index + 1), item.title]),
          [15, 85],
        ),
      ]),
    );

    for (const diagram of diagrams) {
      docSections.push(
        commonSection(
          [
            heading(`Appendix: ${diagram.title}`, 2),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
              children: [await imageRun(diagram.png, 980, 570)],
            }),
            bodyText(diagram.caption, {
              alignment: AlignmentType.CENTER,
              after: 0,
              run: { italics: true, color: colors.muted, size: 17 },
            }),
          ],
          landscapeProperties,
        ),
      );
    }
  }

  const document = new Document({
    creator: "Darman Pharmacy Management System Project",
    title: `${proposal.title} - ${proposal.subtitle}`,
    description:
      "Academic monograph proposal for a single-branch pharmacy management system.",
    styles: {
      default: {
        document: {
          run: { font: "Aptos", size: 21, color: colors.ink },
          paragraph: { spacing: { line: 300, after: 150 } },
        },
        heading1: {
          run: {
            font: "Aptos Display",
            size: 38,
            bold: true,
            color: colors.navy,
          },
          paragraph: {
            spacing: { before: 0, after: 220 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: colors.cyan },
            },
          },
        },
        heading2: {
          run: { font: "Aptos Display", size: 27, bold: true, color: colors.blue },
          paragraph: { spacing: { before: 240, after: 100 } },
        },
        heading3: {
          run: { font: "Aptos", size: 23, bold: true, color: colors.navy },
          paragraph: { spacing: { before: 180, after: 80 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "proposal-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 520, hanging: 260 } },
                run: { color: colors.cyan },
              },
            },
          ],
        },
        {
          reference: "proposal-references",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 520, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    sections: docSections,
  });

  await fs.writeFile(docxPath, await Packer.toBuffer(document));
}

async function buildHtmlFile(html) {
  await fs.writeFile(htmlPath, html, "utf8");
}

async function validateOutputs() {
  const docxStat = await fs.stat(docxPath);
  const docx = await fs.readFile(docxPath);
  if (!docx.subarray(0, 2).equals(Buffer.from("PK"))) {
    throw new Error("Generated DOCX does not have a valid ZIP signature.");
  }
  if (docxStat.size < 500_000) {
    throw new Error("Generated proposal DOCX is unexpectedly small.");
  }
  console.log(
    JSON.stringify(
      {
        docx: { path: docxPath, bytes: docxStat.size },
        html: htmlPath,
        diagrams: diagrams.length,
        directCostUsd: 230,
        timelineWeeks: proposal.timeline.length,
      },
      null,
      2,
    ),
  );
}

await fs.mkdir(outputDir, { recursive: true });
await prepareImages();
const html = buildHtml();
await Promise.all([buildDocx(), buildHtmlFile(html)]);
await validateOutputs();
