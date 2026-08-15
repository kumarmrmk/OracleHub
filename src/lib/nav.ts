export type NavPage = {
  href: string;
  title: string;
  description: string;
  badge?: string;
};

export type NavGroup = {
  id: string;
  title: string;
  href: string;
  description?: string;
  pages: NavPage[];
  subgroups?: NavGroup[];
};

export type NavSection = {
  id: string;
  title: string;
  accent?: "fusion" | "oic" | "vbcs" | "generic";
  pages: NavPage[];
  groups?: NavGroup[];
};

export const navSections: NavSection[] = [
  {
    id: "fusion",
    title: "Oracle Fusion Cloud",
    accent: "fusion",
    pages: [
      {
        href: "/fusion/overview",
        title: "Overview",
        description: "What Fusion Cloud is, its architecture, and how it fits the modern enterprise stack.",
      },
      {
        href: "/fusion/modules",
        title: "Application Modules",
        description: "ERP, SCM, HCM, CX, and the two strategic pillars every integration touches.",
      },
      {
        href: "/fusion/enterprise-structures",
        title: "Enterprise Structures",
        description: "Ledgers, legal entities, business units, data access sets, and MOAC — the org model behind every transaction.",
        badge: "foundation",
      },
      {
        href: "/fusion/flexfields",
        title: "Flexfields & Value Sets",
        description: "Key/descriptive/extensible flexfields, value sets, segment validation, and the chart of accounts as a KFF.",
      },
      {
        href: "/fusion/subledger-accounting",
        title: "Subledger Accounting (SLA)",
        description: "How every transaction becomes a GL entry: events, accounting methods, journal line rules, and XLA tables.",
        badge: "foundation",
      },
      {
        href: "/fusion/tax",
        title: "Tax",
        description: "Fusion Tax: regimes, taxes, rates, rules, and how indirect tax lands on transactions.",
      },
    ],
    groups: [
      {
        id: "cycles",
        title: "Business Cycles",
        href: "/fusion/financials/cycles",
        description: "The spine before the parts: end-to-end flows that cross modules — learn P2P, O2C, and R2R before any single module.",
        pages: [
          {
            href: "/fusion/financials/cycles",
            title: "Business Cycles — overview",
            description: "The three journeys (R2R, P2P, O2C), how they connect, and which modules each one touches.",
          },
          {
            href: "/fusion/financials/cycles/r2r",
            title: "Record-to-Report (R2R)",
            description: "Journal → close → consolidation → financial statements, one step at a time.",
          },
          {
            href: "/fusion/financials/cycles/p2p",
            title: "Procure-to-Pay (P2P)",
            description: "Purchase order → goods → AP invoice → payment → bank reconciliation.",
          },
          {
            href: "/fusion/financials/cycles/o2c",
            title: "Order-to-Cash (O2C)",
            description: "Order → shipment → AR invoice → receipt → lockbox → collections.",
          },
        ],
      },
      {
        id: "financials",
        title: "ERP Financials",
        href: "/fusion/financials",
        description: "Hub for the Financials suite: GL, Payables, Receivables, Cash, Fixed Assets, Expenses — the modules the three cycles flow through.",
        pages: [
          {
            href: "/fusion/financials",
            title: "ERP Financials — overview",
            description: "How the suite hangs together, the learning path, and the functional↔technical reference.",
          },
        ],
        subgroups: [
          {
            id: "gl",
            title: "General Ledger (GL)",
            href: "/fusion/financials/gl",
            description: "The system of record: chart of accounts, ledgers, periods, journals, close.",
            pages: [
              {
                href: "/fusion/financials/gl",
                title: "GL — overview",
                description: "Ledgers, account combinations, periods, journals — functional & technical.",
              },
              {
                href: "/fusion/financials/gl/journals",
                title: "Journals & Posting",
                description: "Journal types, GL_INTERFACE import, validation, approval, AutoPost, reversal.",
              },
              {
                href: "/fusion/financials/gl/multi-currency",
                title: "Multi-Currency & Rates",
                description: "Currencies, rate types, daily rates, revaluation, translation, FX revaluation.",
              },
              {
                href: "/fusion/financials/gl/secondary-ledgers",
                title: "Secondary Ledgers & Reporting Currencies",
                description: "Ledger sets, controlled replication, reporting currencies, balance initialization.",
              },
              {
                href: "/fusion/financials/gl/allocations",
                title: "Allocations & Recurring Entries",
                description: "Recurring journals, Calculation Manager, allocation rules, rule sets, generation.",
              },
              {
                href: "/fusion/financials/gl/intercompany",
                title: "Intercompany Accounting",
                description: "Intercompany transactions, balancing rules, agreements, cross-ledger allocations.",
              },
              {
                href: "/fusion/financials/gl/period-close",
                title: "GL Period Close & Period Status",
                description: "GL period status (Open/Future-entry/Closed), the GL close sequence, clearing accounts, year-end close.",
              },
              {
                href: "/fusion/financials/gl/budgets",
                title: "Budgets & Budgetary Control",
                description: "Budget balances, budget pools, encumbrances, and the control engine that enforces spend limits.",
              },
              {
                href: "/fusion/financials/gl/accounting-hub",
                title: "Financial Accounting Hub (FAH)",
                description: "Bring external and custom sub-ledger transactions into SLA and the GL.",
              },
            ],
          },
          {
            id: "payables",
            title: "Payables (AP)",
            href: "/fusion/financials/payables",
            description: "Money out: suppliers, invoices, holds & matching, payments, withholding tax.",
            pages: [
              {
                href: "/fusion/financials/payables",
                title: "Payables — overview",
                description: "Suppliers, invoices, payments — functional & technical.",
              },
              {
                href: "/fusion/financials/payables/invoices",
                title: "Invoice Entry & Validation",
                description: "Invoice paths, status chain, prepayments, recurring, corrections, IDR capture.",
              },
              {
                href: "/fusion/financials/payables/holds-matching",
                title: "Holds & PO Matching",
                description: "Hold types, 2-way/3-way matching, tolerances, variance accounts, releasing holds.",
              },
              {
                href: "/fusion/financials/payables/payments",
                title: "Payments & PPR",
                description: "Payment Process Request, formats (EFT/ACH/SEPA/check), transmission, bank returns.",
              },
              {
                href: "/fusion/financials/payables/withholding-tax",
                title: "Withholding Tax & 1099",
                description: "WHT setup, certificates & exceptions, US 1099 reporting.",
              },
            ],
          },
          {
            id: "receivables",
            title: "Receivables (AR)",
            href: "/fusion/financials/receivables",
            description: "Money in: customers, AutoInvoice, receipts & lockbox, revenue, credit & collections.",
            pages: [
              {
                href: "/fusion/financials/receivables",
                title: "Receivables — overview",
                description: "Customers, AR invoices, receipts — functional & technical.",
              },
              {
                href: "/fusion/financials/receivables/autoinvoice",
                title: "AutoInvoice",
                description: "AutoInvoice end-to-end, grouping & ordering rules, interface tables, execution.",
              },
              {
                href: "/fusion/financials/receivables/receipts",
                title: "Receipts & Lockbox",
                description: "Receipts, AutoCash/AutoMatch, lockbox, direct debit, application rules, reversals.",
              },
              {
                href: "/fusion/financials/receivables/revenue",
                title: "Revenue & Credit Memos",
                description: "Revenue policies, contingencies, event-based recognition, credit/debit memos, deferred.",
              },
              {
                href: "/fusion/financials/receivables/credit-collections",
                title: "Credit Management & Collections",
                description: "Credit profiles, scoring, collections strategies, dunning, case folders, promises.",
              },
            ],
          },
          {
            id: "cash-management",
            title: "Cash Management",
            href: "/fusion/financials/cash-management",
            description: "Banks, bank accounts, statements, reconciliation, cash forecasting.",
            pages: [
              {
                href: "/fusion/financials/cash-management",
                title: "Cash Management — overview",
                description: "Bank accounts, bank transactions, statements, reconciliation.",
              },
              {
                href: "/fusion/financials/cash-management/bank-setup",
                title: "Banks, Branches & Accounts",
                description: "Bank/branch/account hierarchy, internal vs external accounts, payment documents.",
              },
              {
                href: "/fusion/financials/cash-management/statements",
                title: "Bank Statements & BAI2",
                description: "Statement import, parse rule sets, transaction type mapping, BAI2, tolerance rules.",
              },
              {
                href: "/fusion/financials/cash-management/reconciliation",
                title: "Reconciliation & Forecasting",
                description: "Matching rules, automatic/manual reconciliation, cash positioning & pools.",
              },
            ],
          },
          {
            id: "fixed-assets",
            title: "Fixed Assets",
            href: "/fusion/financials/fixed-assets",
            description: "Capital assets: books, categories, additions, depreciation, retirements.",
            pages: [
              {
                href: "/fusion/financials/fixed-assets",
                title: "Fixed Assets — overview",
                description: "Assets, asset books, additions, depreciation.",
              },
              {
                href: "/fusion/financials/fixed-assets/books-setup",
                title: "Asset Books & Setup",
                description: "Corporate/tax books, calendars, conventions, capitalization thresholds, categories.",
              },
              {
                href: "/fusion/financials/fixed-assets/additions",
                title: "Additions & Mass Additions",
                description: "Additions, mass additions from AP/receiving/projects, CIP lifecycle, leases.",
              },
              {
                href: "/fusion/financials/fixed-assets/depreciation",
                title: "Depreciation & Revaluation",
                description: "Depreciation methods, running depreciation, group assets, revaluation.",
              },
              {
                href: "/fusion/financials/fixed-assets/transactions",
                title: "Transfers, Retirements & Impairment",
                description: "Transfers & reclassification, retirements, impairment, physical inventory.",
              },
            ],
          },
          {
            id: "expenses",
            title: "Expenses",
            href: "/fusion/financials/expenses",
            description: "Expense reports: templates, policies, card programs, approval & reimbursement.",
            pages: [
              {
                href: "/fusion/financials/expenses",
                title: "Expenses — overview",
                description: "Expense reports, lines, templates, approvals.",
              },
              {
                href: "/fusion/financials/expenses/templates-policies",
                title: "Templates, Expense Types & Policies",
                description: "Templates vs types vs categories, mileage/meals/airfare policies, policy enforcement.",
              },
              {
                href: "/fusion/financials/expenses/card-programs",
                title: "Corporate Card Programs",
                description: "Card programs, card file processing, tokenization, company-pay vs employee-pay.",
              },
              {
                href: "/fusion/financials/expenses/approval-audit",
                title: "Approval, Audit & Reimbursement",
                description: "Approval rules, audit & receipt rules, reimbursement to Payables, cash advances.",
              },
            ],
          },
        ],
      },
      {
        id: "scm",
        title: "Supply Chain & Procurement",
        href: "/fusion/procurement",
        description: "Buy, store, and fulfill: procurement, sourcing, inventory, order management — the operational engine that turns money into goods and goods into revenue.",
        pages: [],
        subgroups: [
          {
            id: "procurement",
            title: "Procurement",
            href: "/fusion/procurement",
            description: "The buying flow: requisitions, purchase orders, receiving, suppliers.",
            pages: [
              {
                href: "/fusion/procurement",
                title: "Procurement — overview",
                description: "From requisition to receipt: the buying side of the business, functional and technical.",
              },
              {
                href: "/fusion/procurement/suppliers",
                title: "Suppliers & Agreements",
                description: "The supplier master (party, sites, bank) and blanket/contract agreements that standing POs draw on.",
              },
              {
                href: "/fusion/procurement/sourcing",
                title: "Sourcing & Auctions",
                description: "RFQs, sourcing projects, reverse auctions, and awards that become agreements or POs.",
              },
              {
                href: "/fusion/procurement/requisitions",
                title: "Requisitions",
                description: "Request → approve → convert: how a need becomes a requisition and passes to a buyer.",
              },
              {
                href: "/fusion/procurement/purchase-orders",
                title: "Purchase Orders",
                description: "The contract to buy: document types, lines, distributions, approval, change orders.",
              },
              {
                href: "/fusion/procurement/receiving",
                title: "Receiving",
                description: "What arrives: receipts, returns, inspection, and the RCV interface tables.",
              },
            ],
          },
          {
            id: "inventory",
            title: "Inventory",
            href: "/fusion/inventory",
            description: "Where goods are stored, tracked, and moved: items, on-hand, transfers, cycle counting.",
            pages: [
              {
                href: "/fusion/inventory",
                title: "Inventory — overview",
                description: "How stock is tracked and valued between receiving (buy) and shipping (sell).",
              },
              {
                href: "/fusion/inventory/items",
                title: "Items & Item Master",
                description: "The item master and attributes — everything else references it.",
              },
              {
                href: "/fusion/inventory/onhand",
                title: "On-hand, Transfers & Reservations",
                description: "Quantity that exists, moves, and gets committed to orders.",
              },
              {
                href: "/fusion/inventory/counting",
                title: "Cycle Counting & Adjustments",
                description: "Reconciling book stock to physical stock and posting variances.",
              },
            ],
          },
          {
            id: "order-management",
            title: "Order Management",
            href: "/fusion/order-management",
            description: "From sales order to shipment: order capture, fulfillment, and shipping (WSH).",
            pages: [
              {
                href: "/fusion/order-management",
                title: "Order Management — overview",
                description: "How a customer order becomes a shipment and hands off to billing.",
              },
              {
                href: "/fusion/order-management/sales-orders",
                title: "Sales Orders & Fulfillment",
                description: "Order capture, scheduling, availability, and the path to ship-ready.",
              },
              {
                href: "/fusion/order-management/shipping",
                title: "Shipping & Logistics (WSH)",
                description: "Deliveries, trips, packing, and ship confirmation against inventory.",
              },
            ],
          },
          {
            id: "cost-management",
            title: "Cost Management",
            href: "/fusion/cost-management",
            description: "Valuing inventory: costing methods, landed cost, and the GL postings.",
            pages: [
              {
                href: "/fusion/cost-management",
                title: "Cost Management — overview",
                description: "How on-hand quantity becomes balance-sheet value and expense.",
              },
              {
                href: "/fusion/cost-management/costing-methods",
                title: "Costing Methods",
                description: "Standard vs actual cost, cost maintenance, and variance accounts.",
              },
              {
                href: "/fusion/cost-management/landed-cost",
                title: "Landed Cost",
                description: "Freight, insurance, and duties rolled into the true item cost.",
              },
            ],
          },
        ],
      },
      {
        id: "technical-layer",
        title: "Technical Layer",
        href: "/fusion/rest-api",
        description: "How data moves in and out of Fusion: REST resources, FBDI file loads, interface tables, and the ESS jobs that process them.",
        pages: [
          {
            href: "/fusion/rest-api",
            title: "REST API Fundamentals",
            description: "REST resources, endpoint structure, pagination, ETags, and auth for custom code.",
          },
          {
            href: "/fusion/fbdi",
            title: "FBDI & ADFdi",
            description: "File-based data import, .zip/.csv templates, load order, and ADFdi Spreadsheet Integration.",
          },
          {
            href: "/fusion/interface-tables",
            title: "Interface Tables",
            description: "The import pipeline: how REST and FBDI stage data into interface tables before base tables — the tables every load touches.",
          },
          {
            href: "/fusion/scheduled-processes",
            title: "Scheduled Processes (ESS)",
            description: "Every background job — FBDI imports, reports, close — its lifecycle and how to drive it.",
          },
          {
            href: "/fusion/erp-processes",
            title: "Driving ESS via REST (erpProcesses)",
            description: "Submit scheduled processes programmatically — Import Journals, Create Accounting, Post Mass Additions and more.",
          },
          {
            href: "/fusion/tool-matrix",
            title: "Tool Matrix",
            description: "The implementer's lookup: 'I need to do X' → REST/FBDI/job → where the data lands.",
            badge: "reference",
          },
        ],
      },
      {
        id: "reporting-layer",
        title: "Reporting Layer",
        href: "/fusion/reporting",
        description: "Getting data back out: the OTBI / OAC / OBIEE analytics engines, BI Publisher, the approvals that release documents, and the financial close that produces statements.",
        pages: [
          {
            href: "/fusion/reporting",
            title: "Reporting & Analytics",
            description: "OTBI, BI Publisher, Financial Reporting, and Smart View — plus how every report runs as a job.",
          },
          {
            href: "/fusion/approvals",
            title: "Approvals & Workflow",
            description: "BPM workflow, approval groups, routing, Groovy conditions, and the worklist.",
          },
          {
            href: "/fusion/financial-close",
            title: "Financial Close & Consolidation",
            description: "The month-end close sequence, revaluation, translation, consolidation, and period status.",
          },
          {
            href: "/fusion/modify-report",
            title: "Walkthrough: Modify a Report",
            description: "Change a BIP or OTBI report end to end: edit the definition, secure it, test, migrate artifacts across environments, and go live with rollback.",
            badge: "scenario",
          },
        ],
        subgroups: [
          {
            id: "analytics",
            title: "Analytics — OTBI · OAC · OBIEE",
            href: "/fusion/analytics",
            description: "The Oracle BI family: OTBI embedded in Fusion, OAC on OCI, and the on-prem OBIEE classic — and when to use which.",
            pages: [
              {
                href: "/fusion/analytics",
                title: "Analytics — Overview",
                description: "Which engine when: OTBI vs OAC vs OBIEE, the family tree, and the shared BI vocabulary.",
              },
              {
                href: "/fusion/analytics/otbi",
                title: "OTBI — Transactional BI",
                description: "Subject areas and real-time vs warehouse facts, analyses, dashboards, drill-to-detail, catalog and security.",
              },
              {
                href: "/fusion/analytics/oac",
                title: "Oracle Analytics Cloud (OAC)",
                description: "Data visualization and data flows, semantic models, ML, and connecting OAC to Fusion via OAuth.",
              },
              {
                href: "/fusion/analytics/obiee",
                title: "OBIEE — On-Prem BI",
                description: "The .rpd repository's three layers, Answers and dashboards, BI Apps, and the migration path to OAC.",
              },
            ],
          },
        ],
      },
      {
        id: "reference",
        title: "Reference & Setup",
        href: "/fusion/concepts",
        description: "The supporting pieces you reach for as needed: core concepts, document numbering, security, implementation, and the table catalog.",
        pages: [
          {
            href: "/fusion/concepts",
            title: "Core Concepts",
            description: "Flexfields, value sets, trees, attachments (UCM), and batch processing.",
          },
          {
            href: "/fusion/document-sequencing",
            title: "Document Sequencing",
            description: "How invoices, receipts, and payments get their numbers: sequences, ranges, and gapless control.",
          },
          {
            href: "/fusion/security",
            title: "Security & Roles",
            description: "Role-based access control, duties, privileges, and data security.",
          },
          {
            href: "/fusion/implementation",
            title: "Implementation & Data Migration",
            description: "FAS setup, configuration packages, and the migration load order that makes go-live clean.",
          },
          {
            href: "/fusion/tables",
            title: "Fusion Tables",
            description: "The Financials data model, alphabetical and searchable: primary keys, foreign keys, and purpose for every table.",
            badge: "reference",
          },
        ],
      },
    ],
  },
  {
    id: "sql",
    title: "Oracle SQL",
    accent: "generic",
    pages: [
      {
        href: "/sql/overview",
        title: "Overview & Learning Path",
        description: "Where to start: the full SQL roadmap from schema and SELECT to analytic functions, partitioning, and PL/SQL, in reading order.",
        badge: "learning-path",
      },
    ],
    groups: [
      {
        id: "sql-foundations",
        title: "Foundations",
        href: "/sql/database-foundations",
        description: "What a database, schema, table, and key are, plus Oracle's data types and the tools (SQL Developer, SQLcl).",
        pages: [
          {
            href: "/sql/database-foundations",
            title: "Database Foundations",
            description: "Schema, table, row, column, primary and foreign keys; the DDL/DML/DCL/TCL families; the data dictionary; SQL Developer and SQLcl.",
          },
          {
            href: "/sql/data-types",
            title: "Oracle Data Types",
            description: "VARCHAR2, CHAR, NUMBER, DATE/TIMESTAMP, CLOB, BLOB, RAW, ROWID, and NULL with three-valued logic.",
          },
        ],
      },
      {
        id: "sql-querying",
        title: "Querying",
        href: "/sql/basic-querying",
        description: "Reading and shaping rows: the SELECT toolkit, filters, functions, and grouping with aggregates.",
        pages: [
          {
            href: "/sql/basic-querying",
            title: "Basic Querying",
            description: "SELECT, DISTINCT, aliases, arithmetic, WHERE, ORDER BY, FETCH FIRST / OFFSET, and the legacy ROWNUM.",
          },
          {
            href: "/sql/filtering",
            title: "Filtering",
            description: "Comparison operators, AND/OR/NOT, IN, BETWEEN, LIKE wildcards, IS NULL, EXISTS vs NOT EXISTS.",
          },
          {
            href: "/sql/single-row-functions",
            title: "Single-Row Functions",
            description: "Character, number, date, and conversion functions; NVL/NVL2/NULLIF/COALESCE; CASE and DECODE.",
          },
          {
            href: "/sql/grouping-aggregates",
            title: "Grouping & Aggregate Functions",
            description: "COUNT, SUM, AVG, MIN, MAX; GROUP BY and HAVING; ROLLUP, CUBE, GROUPING SETS, GROUPING and GROUPING_ID.",
          },
        ],
      },
      {
        id: "sql-combining",
        title: "Combining & Comparing",
        href: "/sql/joins",
        description: "Putting tables together and comparing result sets: joins, subqueries, and set operators.",
        pages: [
          {
            href: "/sql/joins",
            title: "Joins",
            description: "Inner, outer, cross, and self joins; equi vs non-equi; ANSI JOIN syntax and the legacy (+) operator.",
          },
          {
            href: "/sql/subqueries",
            title: "Subqueries",
            description: "Single-row, multiple-row, and correlated subqueries; inline views; scalar subqueries; ANY/ALL; WITH CTEs, recursive.",
          },
          {
            href: "/sql/set-operators",
            title: "Set Operators",
            description: "UNION, UNION ALL, INTERSECT, and MINUS (Oracle's EXCEPT) — including the column and ordering rules.",
          },
        ],
      },
      {
        id: "sql-dml",
        title: "Changing Data",
        href: "/sql/dml",
        description: "Inserting, updating, deleting, and the transaction discipline behind them.",
        pages: [
          {
            href: "/sql/dml",
            title: "DML — Changing Data",
            description: "INSERT, UPDATE, DELETE, MERGE upserts, INSERT ALL, multi-table inserts, and RETURNING INTO.",
          },
          {
            href: "/sql/transactions",
            title: "Transactions",
            description: "COMMIT, ROLLBACK, SAVEPOINT; read consistency; locks and concurrency; isolation levels.",
          },
        ],
      },
      {
        id: "sql-objects",
        title: "Database Objects",
        href: "/sql/ddl",
        description: "Defining the containers: tables, constraints, views, and the objects that shape and order them.",
        pages: [
          {
            href: "/sql/ddl",
            title: "DDL — Database Objects",
            description: "CREATE/ALTER/DROP/TRUNCATE/RENAME; tables and temporary tables; views, sequences, synonyms, indexes, constraints.",
          },
          {
            href: "/sql/constraints",
            title: "Constraints & Data Integrity",
            description: "PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, defaults, enable/disable, and cascading deletes.",
          },
          {
            href: "/sql/views",
            title: "Views",
            description: "Simple and complex views, updatable views, WITH CHECK OPTION, WITH READ ONLY, and materialized views.",
          },
          {
            href: "/sql/sequences-identity",
            title: "Sequences & Identity Columns",
            description: "CREATE SEQUENCE, NEXTVAL/CURRVAL, cache/cycle/increment settings, and 12c+ identity columns.",
          },
        ],
      },
      {
        id: "sql-advanced",
        title: "Advanced SQL",
        href: "/sql/advanced-querying",
        description: "The shape-shifters: hierarchies, pivots, regex, string aggregation, window functions, and Oracle's own idioms.",
        pages: [
          {
            href: "/sql/advanced-querying",
            title: "Advanced Querying",
            description: "CONNECT BY and START WITH, PIVOT/UNPIVOT, REGEXP functions, LISTAGG, and reading JSON/XML in SQL.",
          },
          {
            href: "/sql/analytic-functions",
            title: "Analytic / Window Functions",
            description: "OVER, PARTITION BY, ROWS/RANGE frames, ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD, running totals, NTILE.",
          },
          {
            href: "/sql/oracle-specific",
            title: "Oracle-Specific SQL",
            description: "DUAL, ROWNUM and ROWID, NVL and DECODE, CONNECT BY, date/number format models, and the dictionary views.",
          },
        ],
      },
      {
        id: "sql-performance",
        title: "Performance & Scale",
        href: "/sql/indexes-performance",
        description: "Making it fast and keeping it scalable: indexes, plans, and partitioning.",
        pages: [
          {
            href: "/sql/indexes-performance",
            title: "Indexes & Performance",
            description: "B-tree, bitmap, and function-based indexes; EXPLAIN PLAN and DBMS_XPLAN; join methods; statistics and bind variables.",
          },
          {
            href: "/sql/partitioning",
            title: "Partitioning & Large Data",
            description: "Range/list/hash/interval partitioning, partition pruning, local vs global indexes, and parallel SQL.",
          },
        ],
      },
      {
        id: "sql-beyond",
        title: "Security & Modern SQL",
        href: "/sql/security",
        description: "Controlling access and working with modern data shapes: security, JSON, and XML.",
        pages: [
          {
            href: "/sql/security",
            title: "Security",
            description: "Users and roles, system vs object privileges, GRANT/REVOKE, profiles, synonyms, and VPD basics.",
          },
          {
            href: "/sql/json-xml",
            title: "JSON, XML & Modern SQL",
            description: "JSON columns and IS JSON, JSON_VALUE/QUERY/TABLE, XMLTYPE, and SQL macros in modern Oracle.",
          },
        ],
      },
      {
        id: "sql-plsql",
        title: "PL/SQL",
        href: "/sql/plsql",
        description: "The procedural language inside Oracle: blocks, control flow, cursors, stored programs, bulk processing, triggers, and deployment — in learning order.",
        pages: [
          {
            href: "/sql/plsql",
            title: "Overview & Learning Path",
            description: "Where to start: the full PL/SQL roadmap from blocks to production code, with the roadmap ranked for Fusion/OIC work.",
            badge: "learning-path",
          },
        ],
        subgroups: [
          {
            id: "plsql-core",
            title: "Core Language",
            href: "/sql/plsql/blocks",
            description: "The block skeleton, variables, control flow, SQL inside PL/SQL, exceptions, and cursors.",
            pages: [
              {
                href: "/sql/plsql/blocks",
                title: "Blocks, Variables & Scope",
                description: "DECLARE/BEGIN/EXCEPTION/END, anonymous blocks, DBMS_OUTPUT, %TYPE/%ROWTYPE, bind variables, and scope.",
              },
              {
                href: "/sql/plsql/control",
                title: "Control Statements",
                description: "IF/ELSIF/ELSE, CASE, the three loops, and EXIT / EXIT WHEN / CONTINUE.",
              },
              {
                href: "/sql/plsql/dml",
                title: "SQL Inside PL/SQL",
                description: "SELECT INTO, INSERT/UPDATE/DELETE/MERGE, transaction control, and dynamic SQL with EXECUTE IMMEDIATE.",
              },
              {
                href: "/sql/plsql/exceptions",
                title: "Exception Handling",
                description: "Predefined exceptions, WHEN OTHERS, user-defined exceptions, RAISE / RAISE_APPLICATION_ERROR, SQLCODE and SQLERRM.",
              },
              {
                href: "/sql/plsql/cursors",
                title: "Cursors",
                description: "Implicit cursor attributes, explicit OPEN/FETCH/CLOSE, cursor FOR loops, parameterized cursors, FOR UPDATE, and SYS_REFCURSOR.",
              },
            ],
          },
          {
            id: "plsql-programs",
            title: "Stored Programs",
            href: "/sql/plsql/procedures",
            description: "Procedures and functions, packages, and triggers — the deployable, grantable units that run in the database.",
            pages: [
              {
                href: "/sql/plsql/procedures",
                title: "Procedures & Functions",
                description: "CREATE/REPLACE/DROP, IN/OUT/IN OUT parameters, defaults, return types, calling from SQL, and overloading.",
              },
              {
                href: "/sql/plsql/packages",
                title: "Packages",
                description: "Specification vs body, public vs private, package variables and initialization, and the built-ins DBMS_OUTPUT, UTL_FILE, DBMS_SCHEDULER.",
              },
              {
                href: "/sql/plsql/triggers",
                title: "Triggers",
                description: "BEFORE/AFTER/INSTEAD OF, row vs statement level, :OLD/:NEW, auditing triggers, and the mutating-table error.",
              },
            ],
          },
          {
            id: "plsql-advanced",
            title: "Data in Memory & Bulk",
            href: "/sql/plsql/collections",
            description: "Collections, records, and the bulk-processing patterns that make PL/SQL fast at scale.",
            pages: [
              {
                href: "/sql/plsql/collections",
                title: "Collections",
                description: "Associative arrays, nested tables, VARRAYs, and the methods COUNT, FIRST, LAST, NEXT, DELETE, EXTEND.",
              },
              {
                href: "/sql/plsql/records",
                title: "Records & Object Types",
                description: "User-defined records, %ROWTYPE table records, and object types with member methods.",
              },
              {
                href: "/sql/plsql/bulk",
                title: "Bulk Processing",
                description: "BULK COLLECT, FORALL, LIMIT, SAVE EXCEPTIONS, SQL%BULK_EXCEPTIONS, and avoiding row-by-row processing.",
              },
            ],
          },
          {
            id: "plsql-production",
            title: "Integration & Production",
            href: "/sql/plsql/files",
            description: "Files and REST, performance discipline, and the security and deployment ceremonies that ship trustworthy code.",
            pages: [
              {
                href: "/sql/plsql/files",
                title: "Files & External Integration",
                description: "UTL_FILE and DIRECTORY objects, calling REST services, and processing JSON and XML from PL/SQL.",
              },
              {
                href: "/sql/plsql/performance",
                title: "Performance & Best Practices",
                description: "Avoiding SQL in loops, bulk operations, logging, deliberate commits, bind variables, and instrumentation.",
              },
              {
                href: "/sql/plsql/security",
                title: "Security & Deployment",
                description: "AUTHID definer vs invoker rights, grants, dependencies and recompilation, compile errors/warnings, and source control.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "oic",
    title: "Oracle Integration Cloud",
    accent: "oic",
    pages: [
      {
        href: "/oic/overview",
        title: "Overview",
        description: "OIC as an iPaaS: the console, workspace, projects, and where it sits in the stack.",
      },
      {
        href: "/oic/concepts",
        title: "Key Concepts",
        description: "Connections & adapters, lookups, agents, libraries, and OIC packages.",
      },
      {
        href: "/oic/styles",
        title: "Integration Styles",
        description: "App-driven, scheduled, and event-driven integrations — and when to pick each.",
      },
      {
        href: "/oic/mapping",
        title: "Mapping & Transformation",
        description: "The data mapping editor, XSLT, map functions, flatten/unflatten, and JSON/XML/CSV envelopes.",
      },
      {
        href: "/oic/adapters",
        title: "Adapters & Connectivity",
        description: "File/FTP/SFTP, database, OCI, SaaS, SOAP, and messaging adapters — and how to choose.",
      },
      {
        href: "/oic/orchestration",
        title: "Orchestration & Flow",
        description: "The flow toolbox: assign, map, invoke, switch, for-each, scopes, and fault handlers.",
      },
      {
        href: "/oic/fbdi-integration",
        title: "FBDI Integration with Fusion",
        description: "The classic pattern: app-driven integration that imports data into Fusion via FBDI.",
      },
      {
        href: "/oic/rest",
        title: "REST & RESTful APIs",
        description: "Connecting to Fusion REST, exposing integration REST endpoints, and OAuth.",
      },
      {
        href: "/oic/process",
        title: "Process Automation",
        description: "Process Builder, Decisions, human tasks, and approval flows.",
      },
      {
        href: "/oic/use-cases",
        title: "Official Use Cases",
        description: "The ten Oracle-documented automations — AI extraction, human-in-the-loop, B2B EDI, RPA, and decisions — summarized.",
        badge: "reference",
      },
      {
        href: "/oic/security",
        title: "Security & Authentication",
        description: "Auth types, OAuth 2.0, certificates, credentials vault, agent protection, and roles.",
      },
      {
        href: "/oic/errors",
        title: "Error Handling",
        description: "Fault handlers, business errors, resubmission, retries, and alerting.",
      },
      {
        href: "/oic/monitoring",
        title: "Monitoring & Tracking",
        description: "Tracking fields, flow traces, message inspection, dashboards, and reports.",
      },
      {
        href: "/oic/deployment",
        title: "Deployment & Lifecycle",
        description: "Packages, export/import, config variables, connection overrides, and promotion.",
      },
      {
        href: "/oic/mft",
        title: "Managed File Transfer (MFT)",
        description: "Governed partner file exchange: hosting, PGP encryption and signing, and transfer status.",
      },
      {
        href: "/oic/gen3",
        title: "OIC Gen 3 Orientation",
        description: "The current-generation console: environment-based tenancy, OCI IAM, and what changed vs Gen 2.",
      },
      {
        href: "/oic/limitations",
        title: "Service Limits & Considerations",
        description: "The enforced service limits: payload sizes, concurrency, flow duration, retention — and the design rules they imply.",
        badge: "reference",
      },
      {
        href: "/oic/modify-existing",
        title: "Walkthrough: Modify + Migrate",
        description: "Modify an existing integration end to end: edit the draft, remap connections and config, test, promote through environments, activate, and roll back.",
        badge: "scenario",
      },
    ],
  },
  {
    id: "vbcs",
    title: "Visual Builder Cloud Service",
    accent: "vbcs",
    pages: [
      {
        href: "/vbcs/overview",
        title: "Overview",
        description: "VBCS at a glance: low-code front-end development for Fusion and OIC apps.",
      },
      {
        href: "/vbcs/concepts",
        title: "Application & Page Model",
        description: "Scratch apps, app shells, page model, variables, actions, and fragments.",
      },
      {
        href: "/vbcs/business-objects",
        title: "Business Objects & REST",
        description: "Business objects, REST data sources, and exposing your own REST endpoints.",
      },
      {
        href: "/vbcs/connecting",
        title: "Connecting to Fusion & OIC",
        description: "Service connections, OAuth clients, and embedding OIC REST/process flows in a page.",
      },
      {
        href: "/vbcs/ui",
        title: "UI Components & Patterns",
        description: "Design canvas, OJET components, templating, and responsive layouts.",
      },
      {
        href: "/vbcs/advanced",
        title: "Advanced: JavaScript & Quick Starts",
        description: "Custom JavaScript functions, third-party libraries, Quick Starts, and custom code.",
      },
      {
        href: "/vbcs/pwa",
        title: "Progressive Web Apps (PWA)",
        description: "Installable web apps: manifest, icons, splash screens, offline fallback, and QR distribution.",
      },
      {
        href: "/vbcs/security",
        title: "Security & Roles",
        description: "Identity, application roles, page access, anonymous access, business object APIs, and SSO.",
      },
      {
        href: "/vbcs/deploy",
        title: "Deployment & Lifecycle",
        description: "Environments, staging, export/import archives, and going live.",
      },
      {
        href: "/vbcs/modify-existing",
        title: "Walkthrough: Edit + Migrate",
        description: "Enhance an existing app end to end: modify the business object, extend the Edit action chain, test, stage, and publish to production.",
        badge: "scenario",
      },
    ],
  },
  {
    id: "arch",
    title: "Architecture & Scenarios",
    accent: "generic",
    pages: [
      {
        href: "/architecture",
        title: "End-to-End Architecture",
        description: "How Fusion, OIC, and VBCS fit together in one enterprise landscape.",
      },
      {
        href: "/scenarios/po-approval",
        title: "Scenario: PO Approval",
        description: "Full walkthrough: a purchase order flows through OIC and VBCS with approvals.",
      },
      {
        href: "/glossary",
        title: "Glossary",
        description: "Every acronym and term you will meet, explained in plain language.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Errors",
    accent: "generic",
    pages: [
      {
        href: "/troubleshooting",
        title: "Overview",
        description: "The diagnosis method and the three failure layers: REST, FBDI, and ESS.",
      },
      {
        href: "/troubleshooting/rest-api",
        title: "REST API Errors",
        description: "HTTP status codes, error bodies, headers, and the five causes behind most API failures.",
      },
      {
        href: "/troubleshooting/fbdi",
        title: "FBDI Import Errors",
        description: "Import stages, reading output.txt, and the rejection patterns behind failed rows.",
      },
      {
        href: "/troubleshooting/ess",
        title: "ESS Job Errors",
        description: "Job statuses, output vs log, common failures, and safe retry rules.",
      },
      {
        href: "/troubleshooting/gl",
        title: "General Ledger",
        description: "Posting, periods, accounts, balances — symptom to fix.",
      },
      {
        href: "/troubleshooting/payables",
        title: "Payables",
        description: "Invoice validation, holds, suppliers, payments — symptom to fix.",
      },
      {
        href: "/troubleshooting/receivables",
        title: "Receivables",
        description: "AutoInvoice, receipts, customers — symptom to fix.",
      },
      {
        href: "/troubleshooting/cash-management",
        title: "Cash Management",
        description: "Statements, reconciliation, bank accounts — symptom to fix.",
      },
      {
        href: "/troubleshooting/fixed-assets",
        title: "Fixed Assets",
        description: "Depreciation runs, additions, retirements — symptom to fix.",
      },
      {
        href: "/troubleshooting/expenses",
        title: "Expenses",
        description: "Approvals, card transactions, accounting — symptom to fix.",
      },
      {
        href: "/troubleshooting/procurement",
        title: "Procurement",
        description: "Requisitions, purchase orders, receiving, suppliers — symptom to fix.",
      },
      {
        href: "/troubleshooting/inventory",
        title: "Inventory",
        description: "Items, on-hand, transfers, reservations, counting — symptom to fix.",
      },
      {
        href: "/troubleshooting/order-management",
        title: "Order Management",
        description: "Sales orders, fulfillment, shipping — symptom to fix.",
      },
    ],
  },
];

export function sectionPages(section: NavSection): NavPage[] {
  const direct = section.pages;
  const nested = (section.groups ?? []).flatMap((g) => {
    const own = g.pages;
    const subs = (g.subgroups ?? []).flatMap((s) => s.pages);
    return [...own, ...subs];
  });
  return [...direct, ...nested];
}

export const allPages: NavPage[] = navSections.flatMap(sectionPages);

export function findPage(href: string): NavPage | undefined {
  return allPages.find((p) => p.href === href);
}