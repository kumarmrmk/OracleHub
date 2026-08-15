import type { ToolRow } from "@/components/ui/ToolMatrix";

export const toolMatrixRows: ToolRow[] = [
  // ---- Master data / setup
  { task: "Create a supplier", area: "Payables / Procurement", tool: "Supplier FBDI → Import Trading Community Data in Bulk", kind: "FBDI → Job", table: "HZ_PARTIES → POZ_SUPPLIERS" },
  { task: "Create a supplier site", area: "Payables / Procurement", tool: "Supplier Sites FBDI (Procurement guide)", kind: "FBDI → Job", table: "POZ_SUPPLIER_SITES_ALL" },
  { task: "Create a customer (party + account + sites)", area: "Receivables", tool: "Customer Import FBDI → Import Trading Community Data in Bulk", kind: "FBDI → Job", table: "HZ_PARTIES / HZ_CUST_ACCOUNTS / HZ_CUST_ACCT_SITES_ALL" },
  { task: "Define an item (master)", area: "Inventory / PIM", tool: "items REST · Item Import FBDI", kind: "FBDI", table: "EGP_SYSTEM_ITEMS_B" },
  { task: "Check a GL/AP/AR period is open", area: "GL", tool: "accountingPeriodsLOV REST (GET)", kind: "REST", table: "GL_PERIOD_STATUSES" },
  { task: "Query account balances", area: "GL", tool: "ledgerBalances REST (GET)", kind: "REST", table: "GL_BALANCES" },

  // ---- Procurement / SCM
  { task: "Create a requisition (one-off)", area: "Procurement", tool: "requisitionLines REST (POST)", kind: "REST", table: "POR_REQ_HEADERS_ALL / POR_REQ_LINES_ALL" },
  { task: "Bulk-load requisitions", area: "Procurement", tool: "Requisition Import FBDI → Import Requisitions", kind: "FBDI → Job", table: "POR_REQ_HEADERS_ALL" },
  { task: "Create a purchase order", area: "Procurement", tool: "purchaseOrders REST (POST/PATCH)", kind: "REST", table: "PO_HEADERS_ALL / PO_LINES_ALL" },
  { task: "Bulk import purchase orders", area: "Procurement", tool: "Import Purchase Orders FBDI", kind: "FBDI → Job", table: "PO_HEADERS_ALL / PO_LINES_ALL / PO_DISTRIBUTIONS_ALL" },
  { task: "Receive goods against a PO", area: "Procurement", tool: "receipts / receivingTransactions REST · Import Receipts FBDI", kind: "FBDI → Job", table: "RCV_HEADERS_INTERFACE / RCV_TRANSACTIONS" },
  { task: "Run a sourcing/RFQ award", area: "Procurement", tool: "sourcingProjects REST · Sourcing import", kind: "REST", table: "POR_SOURCING_PROJECT_HEADERS" },
  { task: "Load opening on-hand balances", area: "Inventory", tool: "On-Hand Quantity Import FBDI", kind: "FBDI → Job", table: "MTL_ON_HAND_QUANTITIES_OIF" },
  { task: "Transfer inventory between orgs", area: "Inventory", tool: "inventoryTransfers REST (POST)", kind: "REST", table: "MTL_TRANSACTIONS" },
  { task: "Record a cycle count entry", area: "Inventory", tool: "cycleCountHeaders / cycleCountEntries REST", kind: "REST", table: "MTL_CYCLE_COUNT_ENTRIES" },
  { task: "Create a sales order", area: "Order Management", tool: "salesOrders REST (POST)", kind: "REST", table: "OE_ORDER_HEADERS / OE_ORDER_LINES" },
  { task: "Bulk import sales orders", area: "Order Management", tool: "Sales Order Import FBDI", kind: "FBDI → Job", table: "OE_ORDER_HEADERS / OE_ORDER_LINES" },
  { task: "Create a shipment / delivery", area: "Shipping", tool: "shipments / deliveries REST · Shipment Import FBDI", kind: "FBDI → Job", table: "WSH_DELIVERY_* (WSH_DELIVERIES / WSH_DELIVERY_DETAILS)" },
  { task: "Load item standard costs", area: "Cost Management", tool: "Item Costs Import FBDI", kind: "FBDI → Job", table: "CST_ITEM_COSTS" },
  { task: "Add freight/duty (landed cost)", area: "Cost Management", tool: "Landed Cost Import FBDI · landedCostCharges REST", kind: "FBDI → Job", table: "LND_LANDED_COST_CHARGES / LND_LANDED_COST_DISTRIBUTIONS" },

  // ---- Financials / ERP
  { task: "Create a supplier invoice (one-off)", area: "Payables", tool: "invoices REST (POST)", kind: "REST", table: "AP_INVOICES_ALL / AP_INVOICE_LINES_ALL" },
  { task: "Bulk import supplier invoices", area: "Payables", tool: "Payables Standard Invoice Import → Import Payables Invoices", kind: "FBDI → Job", table: "AP_INVOICES_ALL (via AP_INVOICES_INTERFACE)" },
  { task: "Validate an AP invoice", area: "Payables", tool: "invoices validateInvoice action · Validate Payables Invoices job", kind: "REST", table: "AP_INVOICES_ALL (status)" },
  { task: "Record a payment / run PPR", area: "Payables", tool: "payablesPayments REST · Submit Payment Process Request via erpProcesses", kind: "Job", table: "IBY_PAYMENTS_ALL / AP_INVOICE_PAYMENTS_ALL" },
  { task: "Create an AR invoice (one-off)", area: "Receivables", tool: "receivablesInvoices REST (POST)", kind: "REST", table: "RA_CUSTOMER_TRX_ALL" },
  { task: "Bulk create AR invoices", area: "Receivables", tool: "AutoInvoice Import FBDI → Import AutoInvoice", kind: "FBDI → Job", table: "RA_CUSTOMER_TRX_ALL (via RA_INTERFACE_LINES_ALL)" },
  { task: "Import customer receipts (lockbox)", area: "Receivables", tool: "Receivables Standard Receipt Import → Process Receipts Through Lockbox", kind: "FBDI → Job", table: "AR_CASH_RECEIPTS_ALL / AR_PAYMENTS_INTERFACE_ALL" },
  { task: "Load a GL journal", area: "GL", tool: "Journal Import FBDI → Import Journals", kind: "FBDI → Job", table: "GL_JE_BATCHES/HEADERS/LINES (via GL_INTERFACE)" },
  { task: "Load daily conversion rates", area: "GL", tool: "Import and Calculate Daily Rates FBDI", kind: "FBDI → Job", table: "GL_DAILY_RATES" },
  { task: "Load budget balances", area: "GL", tool: "Import General Ledger Budget Balances → Validate and Upload Budgets", kind: "FBDI → Job", table: "GL_BUDGETS / GL_BUDGET_INTERFACE" },
  { task: "Revalue / translate / allocate at close", area: "GL", tool: "Revalue Balances · Translate Balances · Allocate Balances via erpProcesses", kind: "Job", table: "GL_JE_* → GL_BALANCES" },
  { task: "Import a bank statement", area: "Cash Management", tool: "Cash Management Bank Statement Data Import → Import Bank Statement", kind: "FBDI → Job", table: "CE_STATEMENT_HEADERS / CE_STATEMENT_LINES" },
  { task: "Run automatic reconciliation", area: "Cash Management", tool: "Automatic Reconciliation via erpProcesses", kind: "Job", table: "CE_STATEMENT_LINES (matched) / CE_CASH_TRANSACTIONS" },
  { task: "Load fixed asset additions", area: "Fixed Assets", tool: "Fixed Asset Mass Additions Import → Post Mass Additions", kind: "FBDI → Job", table: "FA_ADDITIONS_B / FA_BOOKS (via FA_MASS_ADDITIONS)" },
  { task: "Run depreciation", area: "Fixed Assets", tool: "Calculate Depreciation via erpProcesses", kind: "Job", table: "FA_DEPRN_SUMMARY / FA_DEPRN_DETAIL" },
  { task: "Create an expense report", area: "Expenses", tool: "expenseReports REST (POST)", kind: "REST", table: "EXM_EXPENSE_REPORTS / LINES" },
  { task: "Bring external data into the GL (custom sub-ledger)", area: "GL", tool: "Financial Accounting Hub (accountingHub*) REST / FBDI", kind: "REST", table: "XLA_AE_HEADERS / XLA_AE_LINES" },
  { task: "Submit any background job (import/post/close)", area: "Cross-module", tool: "erpProcesses REST (POST)", kind: "REST", table: "ESS job — lands in module base tables" },
];