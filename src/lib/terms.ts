export type TermDef = { term: string; def: string };

export const TERMS = {
  moac: {
    term: "MOAC",
    def: "Multi-Org Access Control. Security that lets one Fusion instance serve many legal entities: you define data access sets, assign them to users, and each user only sees the ledgers and ledger sets they can access.",
  },
  sla: {
    term: "Subledger Accounting",
    def: "The accounting engine that turns every sub-ledger transaction into a double-entry GL journal using accounting rules and account derivation. Abbreviated SLA; its tables are XLA_*.",
  },
  xla: {
    term: "XLA",
    def: "The SLA table family — XLA_AE_HEADERS and XLA_AE_LINES hold the accounting entries SLA creates for each transaction.",
  },
  clearingAccount: {
    term: "clearing account",
    def: "A balance sheet account that temporarily holds a transaction mid-flow — cash cleared to a bank, or a PO accrual — until the offsetting entry nets it out at close.",
  },
  ledger: {
    term: "ledger",
    def: "The set of books: a chart of accounts, calendar, currency, and accounting method. Every journal posts to exactly one ledger.",
  },
  legalEntity: {
    term: "legal entity",
    def: "A registered company that owns the balance sheet and must report. Legal entities are assigned ledgers; transactions flow through them for reporting.",
  },
  businessUnit: {
    term: "business unit",
    def: "A unit that processes transactions — invoices, payments, POs — within a legal entity. One legal entity can have many BUs; each transaction is owned by one.",
  },
  chartOfAccounts: {
    term: "chart of accounts",
    def: "The account flexfield structure: the segments (company, cost center, account…) that every account combination must follow.",
  },
  accountCombination: {
    term: "account combination",
    def: "A full account flexfield value across all segments, e.g. 01-6900-100. The 'code combination'; the row stored in GL_CODE_COMBINATIONS_ALL.",
  },
  balancingSegment: {
    term: "balancing segment",
    def: "The COA segment (usually company or legal entity) that must balance in every journal line — each balancing segment value's debits equal its credits.",
  },
  subledger: {
    term: "sub-ledger",
    def: "A module that records detailed transactions before they reach the GL: Payables, Receivables, Cash Management, Fixed Assets, Expenses.",
  },
  journal: {
    term: "journal",
    def: "A batch of debits and credits posted to the GL — manual, imported, recurring, allocation, or revaluation. Lives in the GL_JE_* tables.",
  },
  posting: {
    term: "posting",
    def: "The step that moves journal lines from entered to posted status and updates GL_BALANCES with the period activity.",
  },
  period: {
    term: "period",
    def: "An open or closed window in a ledger's accounting calendar. Transactions only post to open periods.",
  },
  revaluation: {
    term: "revaluation",
    def: "Re-measuring open foreign-currency balances at the period-end rate and posting the resulting gain or loss (the GL Revalue Balances job).",
  },
  translation: {
    term: "translation",
    def: "Converting an entire ledger's period balances from its functional currency to a reporting currency at a specified rate — translate, not re-measure.",
  },
  consolidation: {
    term: "consolidation",
    def: "Rolling up multiple ledgers or companies into one reporting ledger to produce group financial statements.",
  },
  intercompany: {
    term: "intercompany",
    def: "A transaction between two legal entities. Intercompany accounting generates balancing entries so each entity's books stay in balance.",
  },
  prepayment: {
    term: "prepayment",
    def: "An AP invoice paid in advance of goods or services; a balance kept on account to apply once the real invoice arrives.",
  },
  distribution: {
    term: "distribution",
    def: "The account combination a sub-ledger line posts to. AP invoice lines and tax lines each carry their own distributions.",
  },
  holds: {
    term: "holds",
    def: "AP blocks that stop an invoice from being paid until resolved — placed automatically by validation or matching, or manually.",
  },
  matching: {
    term: "PO matching",
    def: "Comparing the supplier invoice to the purchase order (2-way) or also to the receipt (3-way) against price, quantity, and amount tolerances.",
  },
  ppr: {
    term: "PPR",
    def: "Payment Process Request — the Payables engine that selects approved invoices and generates payment files in your bank's format.",
  },
  lockbox: {
    term: "lockbox",
    def: "A bank service that scans customer checks into a payment file; Receivables imports it as receipts via AR_PAYMENTS_INTERFACE_ALL.",
  },
  autocash: {
    term: "AutoCash",
    def: "The Receivables rule set that automatically applies receipts to open transactions using matching criteria.",
  },
  automatch: {
    term: "AutoMatch",
    def: "The AutoCash step that scores and matches a receipt to an invoice by amount, reference, and date.",
  },
  autoinvoice: {
    term: "AutoInvoice",
    def: "The Receivables bulk billing engine that reads interface lines and creates AR invoices and credit memos in one batch job.",
  },
  bai2: {
    term: "BAI2",
    def: "A common bank statement file format that Cash Management imports to reconcile bank accounts.",
  },
  reconciliation: {
    term: "reconciliation",
    def: "Matching bank statement lines to internal cash transactions (payments, receipts, transfers) so the GL cash balance agrees with the bank.",
  },
  depreciation: {
    term: "depreciation",
    def: "Writing off an asset's cost over its useful life. Calculate Depreciation posts the period charge to the depreciation expense and accumulated depreciation accounts.",
  },
  massAdditions: {
    term: "mass additions",
    def: "Bulk asset additions created from AP invoices, receiving, projects, or legacy data, then reviewed and accepted into the asset books.",
  },
  fbdi: {
    term: "FBDI",
    def: "File-Based Data Import — the bulk file-load channel: CSV data plus an XML control file uploaded to UCM and run as an ESS job.",
  },
  ess: {
    term: "ESS",
    def: "Enterprise Scheduler Service — Fusion's background job scheduler that runs FBDI loads, reports, and processes like Calculate Depreciation.",
  },
  bip: {
    term: "BIP",
    def: "Business Intelligence Publisher — Fusion's report engine that renders data into formatted PDF and Excel documents.",
  },
  otbi: {
    term: "OTBI",
    def: "Oracle Transactional Business Intelligence — the ad-hoc analytics tool over Fusion's transactional data.",
  },
  idr: {
    term: "IDR",
    def: "Intelligent Document Recognition — Payables' document capture that scans supplier invoices into the invoice entry flow.",
  },
  dff: {
    term: "DFF",
    def: "Descriptive Flexfield — custom extensible fields on Fusion pages. KFF (Key Flexfield) is the coded-segment variant, like the account flexfield.",
  },
  expenseReport: {
    term: "expense report",
    def: "An employee's claim for business spend — lines, categories, receipts — that is approved and then reimbursed through Payables.",
  },
} as const;

export type TermKey = keyof typeof TERMS;
