export type FusionTable = {
  table: string;
  module: string;
  purpose: string;
  pk: string;
  fk: string;
};

const sep = " · ";

export const fusionTables: FusionTable[] = [
  // Party / TCA
  { table: "HZ_PARTIES", module: "Party", purpose: "Party master — every person and organization (customer, supplier, employee) has one party row", pk: "PARTY_ID", fk: `PARENT_PARTY_ID → HZ_PARTIES (self-ref)` },
  { table: "HZ_PARTY_SITES", module: "Party", purpose: "Physical sites (addresses) assigned to a party", pk: "PARTY_SITE_ID", fk: `PARTY_ID → HZ_PARTIES${sep}LOCATION_ID → HZ_LOCATIONS` },
  { table: "HZ_LOCATIONS", module: "Party", purpose: "Address location master referenced by party sites", pk: "LOCATION_ID", fk: `—` },
  { table: "HZ_CUST_ACCOUNTS", module: "Party", purpose: "Customer account — the bill-to/collect-from relationship a party has with your business", pk: "CUST_ACCOUNT_ID", fk: `PARTY_ID → HZ_PARTIES` },
  { table: "HZ_CUST_ACCT_SITES_ALL", module: "Party", purpose: "Customer account sites (addresses under a customer account)", pk: "CUST_ACCT_SITE_ID", fk: `CUST_ACCOUNT_ID → HZ_CUST_ACCOUNTS${sep}PARTY_SITE_ID → HZ_PARTY_SITES` },
  { table: "HZ_CUST_SITE_USES_ALL", module: "Party", purpose: "Site uses — the bill-to / ship-to / pay-to roles of a customer site", pk: "SITE_USE_ID", fk: `CUST_ACCT_SITE_ID → HZ_CUST_ACCT_SITES_ALL` },
  { table: "HZ_CUST_ACCOUNT_ROLES", module: "Party", purpose: "Roles linking a contact party to a customer account (e.g. primary contact)", pk: "CUST_ACCOUNT_ROLE_ID", fk: `CUST_ACCOUNT_ID → HZ_CUST_ACCOUNTS${sep}PARTY_ID → HZ_PARTIES` },

  // Suppliers
  { table: "POZ_SUPPLIERS", module: "Suppliers", purpose: "Supplier master — a party you buy from", pk: "SUPPLIER_ID", fk: `PARTY_ID → HZ_PARTIES` },
  { table: "POZ_SUPPLIER_SITES_ALL", module: "Suppliers", purpose: "Supplier sites — the address/legal locations of a supplier used on transactions", pk: "VENDOR_SITE_ID", fk: `SUPPLIER_ID → POZ_SUPPLIERS${sep}PARTY_SITE_ID → HZ_PARTY_SITES` },
  { table: "POZ_SUPPLIER_CONTACTS", module: "Suppliers", purpose: "Contacts for a supplier site", pk: "PARTY_ID", fk: `SUPPLIER_ID → POZ_SUPPLIERS${sep}VENDOR_SITE_ID → POZ_SUPPLIER_SITES_ALL` },
  { table: "POZ_SUPPLIER_BANK_ACCOUNTS", module: "Suppliers", purpose: "Bank accounts used to pay a supplier", pk: "SUPPLIER_BANK_ACCOUNT_ID", fk: `SUPPLIER_ID → POZ_SUPPLIERS${sep}BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },

  // Procurement — Requisitions
  { table: "POR_REQ_HEADERS_ALL", module: "Procurement", purpose: "Requisition header — the request to buy", pk: "REQUISITION_HEADER_ID", fk: `BUYER_ID → POZ_SUPPLIERS (buyer)${sep}CREATED_BY (requester)` },
  { table: "POR_REQ_LINES_ALL", module: "Procurement", purpose: "Requisition lines — item, quantity, need-by date", pk: "REQUISITION_LINE_ID", fk: `REQUISITION_HEADER_ID → POR_REQ_HEADERS_ALL${sep}ITEM_ID → EGP_SYSTEM_ITEMS_B` },
  { table: "POR_REQ_DISTRIBUTIONS_ALL", module: "Procurement", purpose: "Requisition distributions — the charge accounts", pk: "REQUISITION_LINE_DISTRIBUTION_ID", fk: `REQUISITION_LINE_ID → POR_REQ_LINES_ALL${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },

  // Procurement — Purchase Orders
  { table: "PO_HEADERS_ALL", module: "Procurement", purpose: "Purchase order header — the commitment to buy", pk: "PO_HEADER_ID", fk: `VENDOR_ID → POZ_SUPPLIERS${sep}VENDOR_SITE_ID → POZ_SUPPLIER_SITES_ALL${sep}BUYER_ID → POZ_SUPPLIERS` },
  { table: "PO_LINES_ALL", module: "Procurement", purpose: "Purchase order lines — item, quantity, price", pk: "PO_LINE_ID", fk: `PO_HEADER_ID → PO_HEADERS_ALL${sep}ITEM_ID → EGP_SYSTEM_ITEMS_B` },
  { table: "PO_LINE_LOCATIONS_ALL", module: "Procurement", purpose: "PO line shipments — quantity, need date, receiving info", pk: "LINE_LOCATION_ID", fk: `PO_HEADER_ID → PO_HEADERS_ALL${sep}PO_LINE_ID → PO_LINES_ALL` },
  { table: "PO_DISTRIBUTIONS_ALL", module: "Procurement", purpose: "PO distributions — the charge accounts the PO lines post to", pk: "PO_DISTRIBUTION_ID", fk: `PO_HEADER_ID → PO_HEADERS_ALL${sep}PO_LINE_ID → PO_LINES_ALL${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "PO_DISTRIBUTIONS_INTERFACE", module: "Procurement", purpose: "PO import interface — staged header/line/distribution rows", pk: "INTERFACE_ID", fk: `VENDOR_ID → POZ_SUPPLIERS` },

  // Procurement — Receiving
  { table: "RCV_HEADERS_INTERFACE", module: "Procurement", purpose: "Receiving import interface — staged receipt headers", pk: "RECEIPT_HEADER_ID", fk: `VENDOR_ID → POZ_SUPPLIERS` },
  { table: "RCV_TRANSACTIONS_INTERFACE", module: "Procurement", purpose: "Receiving import interface — staged receiving lines/transactions", pk: "INTERFACE_TRANSACTION_ID", fk: `RECEIPT_HEADER_ID → RCV_HEADERS_INTERFACE${sep}PO_LINE_ID → PO_LINES_ALL` },
  { table: "RCV_TRANSACTIONS", module: "Procurement", purpose: "Receiving transactions — the actual receipts created against PO lines", pk: "TRANSACTION_ID", fk: `PO_HEADER_ID → PO_HEADERS_ALL${sep}PO_LINE_ID → PO_LINES_ALL` },
  { table: "RCV_SHIPMENT_HEADERS", module: "Procurement", purpose: "Receipt header master — the summary of a receive against a shipment", pk: "SHIPMENT_HEADER_ID", fk: `VENDOR_SITE_ID → POZ_SUPPLIER_SITES_ALL` },

  // Procurement — Sourcing
  { table: "POR_SOURCING_PROJECT_HEADERS", module: "Sourcing", purpose: "Sourcing project (RFQ / RFP) header — the competitive buy event", pk: "PROJECT_ID", fk: `BUYER_ID (owner)` },
  { table: "POR_SOURCING_RESPONSES", module: "Sourcing", purpose: "Supplier responses/bids to a sourcing project or auction", pk: "RESPONSE_ID", fk: `PROJECT_ID → POR_SOURCING_PROJECT_HEADERS${sep}SUPPLIER_ID → POZ_SUPPLIERS` },

  // Procurement — Items (shared with SCM)
  { table: "EGP_SYSTEM_ITEMS_B", module: "Items", purpose: "Item master — every buyable/stockable item and its attributes", pk: "INVENTORY_ITEM_ID", fk: `— (shared master used by Procurement, Inventory, OM)` },
  { table: "MTL_SYSTEM_ITEMS_B", module: "Items", purpose: "Legacy item master view (EBS naming retained for compatibility)", pk: "INVENTORY_ITEM_ID", fk: `—` },

  // Inventory
  { table: "MTL_ON_HAND_QUANTITIES_OIF", module: "Inventory", purpose: "On-hand quantities per item / org / subinventory — the current stock balance", pk: "INVENTORY_ITEM_ID + INVENTORY_ORG_ID (composite)", fk: `INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B${sep}INVENTORY_ORG_ID → INV_ORG` },
  { table: "MTL_TRANSACTIONS", module: "Inventory", purpose: "Inventory transactions — every movement that changes quantity (receive, transfer, ship, adjust)", pk: "TRANSACTION_ID", fk: `INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B${sep}TRANSACTION_TYPE_ID → MTL_TRANSACTION_TYPES` },
  { table: "MTL_TRANSACTION_TYPES", module: "Inventory", purpose: "Transaction type definitions (Receipt, Transfer, Issue, Adjustment…)", pk: "TRANSACTION_TYPE_ID", fk: `—` },
  { table: "MTL_MATERIAL_TRANSACTIONS", module: "Inventory", purpose: "Material transaction detail — the audited movement rows behind changes to on-hand and cost", pk: "TRANSACTION_ID", fk: `INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B${sep}TRANSACTION_TYPE_ID → MTL_TRANSACTION_TYPES` },
  { table: "MTL_RESERVATIONS", module: "Inventory", purpose: "Reservations — available quantity set aside for sales orders or projects", pk: "RESERVATION_ID", fk: `INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B${sep}DEMAND_SOURCE (order/project)` },
  { table: "MTL_CYCLE_COUNT_ENTRIES", module: "Inventory", purpose: "Cycle count entries — counted quantities awaiting comparison/adjustment", pk: "COUNT_ID", fk: `INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B${sep}INVENTORY_ORG_ID → INV_ORG` },

  // Order Management
  { table: "OE_ORDER_HEADERS", module: "Order Mgmt", purpose: "Sales order header — the customer order (booked, fulfilled, shipped)", pk: "HEADER_ID", fk: `SOLD_TO_ORG_ID (customer)${sep}INVENTORY_ORG_ID → INV_ORG` },
  { table: "OE_ORDER_LINES", module: "Order Mgmt", purpose: "Sales order lines — item, requested/shipped quantity, price", pk: "LINE_ID", fk: `HEADER_ID → OE_ORDER_HEADERS${sep}INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B` },
  { table: "OE_ORDER_HOLDS_ALL", module: "Order Mgmt", purpose: "Order holds — credit/validation blocks that stop fulfillment", pk: "HOLD_ID", fk: `HEADER_ID → OE_ORDER_HEADERS` },

  // Shipping (WSH)
  { table: "WSH_DELIVERIES", module: "Shipping", purpose: "Deliveries — grouping of fulfilled order lines shipping together", pk: "DELIVERY_ID", fk: `SHIP_FROM_ORG_ID → INV_ORG${sep}CUSTOMER_ID → HZ_CUST_ACCOUNTS` },
  { table: "WSH_DELIVERY_DETAILS", module: "Shipping", purpose: "Delivery detail lines — each order line included in a delivery", pk: "DELIVERY_DETAIL_ID", fk: `DELIVERY_ID → WSH_DELIVERIES${sep}SOURCE_LINE_ID → OE_ORDER_LINES${sep}INVENTORY_ITEM_ID → EGP_SYSTEM_ITEMS_B` },
  { table: "WSH_TRIPS", module: "Shipping", purpose: "Trips — route/carrier planning for deliveries", pk: "TRIP_ID", fk: `CARRIER_ID → WSH_CARRIERS` },

  // Cost Management
  { table: "CST_ITEM_COSTS", module: "Cost", purpose: "Item costs per organization / cost type — the value applied to on-hand", pk: "COST_ID", fk: `ITEM_ID → EGP_SYSTEM_ITEMS_B${sep}ORGANIZATION_ID → INV_ORG${sep}COST_TYPE → CST_COST_TYPES` },
  { table: "CST_COST_TYPES", module: "Cost", purpose: "Cost type definitions (User, Standard, etc.) and valuation rules", pk: "COST_TYPE_ID", fk: `—` },
  { table: "CST_TRANSACTIONS", module: "Cost", purpose: "Cost transactions — valued inventory movements with cost and GL impact", pk: "COST_TRANSACTION_ID", fk: `INVENTORY_TRANSACTION_ID → MTL_MATERIAL_TRANSACTIONS` },
  { table: "CST_COST_UPDATES", module: "Cost", purpose: "Cost updates / rollover runs — recalculating standard costs and revaluing on-hand", pk: "COST_UPDATE_ID", fk: `ORGANIZATION_ID → INV_ORG` },
  { table: "LND_LANDED_COST_CHARGES", module: "Cost", purpose: "Landed cost charges (freight, insurance, duty) attached to receipts", pk: "CHARGE_ID", fk: `RECEIPT_ID → RCV_SHIPMENT_HEADERS` },
  { table: "LND_LANDED_COST_DISTRIBUTIONS", module: "Cost", purpose: "How landed cost charges spread across received lines", pk: "DISTRIBUTION_ID", fk: `CHARGE_ID → LND_LANDED_COST_CHARGES${sep}PO_LINE_ID → PO_LINES_ALL` },

  // Payables
  { table: "AP_INVOICES_ALL", module: "Payables", purpose: "Supplier invoice header — the bill to be paid", pk: "INVOICE_ID", fk: `VENDOR_ID → POZ_SUPPLIERS${sep}VENDOR_SITE_ID → POZ_SUPPLIER_SITES_ALL${sep}SET_OF_BOOKS_ID → GL_LEDGERS` },
  { table: "AP_INVOICE_LINES_ALL", module: "Payables", purpose: "Supplier invoice lines — what was bought", pk: "INVOICE_LINE_ID", fk: `INVOICE_ID → AP_INVOICES_ALL` },
  { table: "AP_INVOICE_DISTRIBUTIONS_ALL", module: "Payables", purpose: "Invoice distributions — the accounts an invoice posts to", pk: "INVOICE_DISTRIBUTION_ID", fk: `INVOICE_ID → AP_INVOICES_ALL${sep}INVOICE_LINE_ID → AP_INVOICE_LINES_ALL${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "AP_INVOICE_PAYMENTS_ALL", module: "Payables", purpose: "Link table between an invoice and its payment", pk: "INVOICE_PAYMENT_ID", fk: `INVOICE_ID → AP_INVOICES_ALL${sep}CHECK_ID → IBY_PAYMENTS_ALL` },
  { table: "AP_PAYMENT_SCHEDULES_ALL", module: "Payables", purpose: "Invoice payment schedule / installments (due dates, amounts due)", pk: "INVOICE_PAYMENT_ID", fk: `INVOICE_ID → AP_INVOICES_ALL` },
  { table: "AP_HOLDS_ALL", module: "Payables", purpose: "Invoice holds — automatic or manual holds that block payment", pk: "INVOICE_HOLD_ID", fk: `INVOICE_ID → AP_INVOICES_ALL` },
  { table: "AP_TERMS_TL", module: "Payables", purpose: "Payment terms (NET30 etc.) with translated descriptions", pk: "TERM_ID", fk: `—` },
  { table: "AP_INVOICES_INTERFACE", module: "Payables", purpose: "Invoice import interface — staging header rows for Import Payables Invoices", pk: "INVOICE_ID", fk: `VENDOR_ID → POZ_SUPPLIERS${sep}VENDOR_SITE_ID → POZ_SUPPLIER_SITES_ALL` },
  { table: "AP_INVOICE_LINES_INTERFACE", module: "Payables", purpose: "Invoice import interface — staged line and distribution rows", pk: "INVOICE_LINE_ID", fk: `INVOICE_ID → AP_INVOICES_INTERFACE` },
  { table: "AP_PAYMENT_REQUESTS_INT", module: "Payables", purpose: "Payment request import interface for external payees", pk: "PAYMENT_REQUEST_ID", fk: `VENDOR_ID → POZ_SUPPLIERS` },

  // Payments
  { table: "IBY_PAYMENTS_ALL", module: "Payments", purpose: "Payment master — the payment record created by a payment process", pk: "PAYMENT_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS${sep}CUSTOMER_VENDOR_ID → POZ_SUPPLIERS / HZ_CUST_ACCOUNTS` },
  { table: "IBY_PAYMENT_DOCUMENTS", module: "Payments", purpose: "Payment documents / checkbooks defined per bank account", pk: "PAYMENT_DOCUMENT_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },
  { table: "IBY_EXT_PAYEES", module: "Payments", purpose: "External payees without a full supplier record", pk: "PAYEE_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },

  // Receivables
  { table: "RA_CUSTOMER_TRX_ALL", module: "Receivables", purpose: "AR transaction (invoice / credit memo / debit memo) header", pk: "CUSTOMER_TRX_ID", fk: `BILL_TO_CUSTOMER_ID → HZ_CUST_ACCOUNTS${sep}SOLD_TO_CUSTOMER_ID → HZ_CUST_ACCOUNTS` },
  { table: "RA_CUSTOMER_TRX_LINES_ALL", module: "Receivables", purpose: "AR transaction lines (items, amounts, tax)", pk: "CUSTOMER_TRX_LINE_ID", fk: `CUSTOMER_TRX_ID → RA_CUSTOMER_TRX_ALL` },
  { table: "RA_CUST_TRX_LINE_GL_DIST_ALL", module: "Receivables", purpose: "AR transaction distributions — the accounts an invoice posts to", pk: "CUST_TRX_LINE_GL_DIST_ID", fk: `CUSTOMER_TRX_ID → RA_CUSTOMER_TRX_ALL${sep}CUSTOMER_TRX_LINE_ID → RA_CUSTOMER_TRX_LINES_ALL${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "AR_CASH_RECEIPTS_ALL", module: "Receivables", purpose: "Receipt master — money collected from customers", pk: "CASH_RECEIPT_ID", fk: `CUSTOMER_ID → HZ_CUST_ACCOUNTS${sep}BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },
  { table: "AR_RECEIVABLE_APPLICATIONS_ALL", module: "Receivables", purpose: "Receipt applications — how a receipt is applied to invoices", pk: "CASH_RECEIPT_APPLICATION_ID", fk: `CASH_RECEIPT_ID → AR_CASH_RECEIPTS_ALL${sep}CUSTOMER_TRX_ID → RA_CUSTOMER_TRX_ALL${sep}PAYMENT_SCHEDULE_ID → AR_PAYMENT_SCHEDULES_ALL` },
  { table: "AR_PAYMENT_SCHEDULES_ALL", module: "Receivables", purpose: "AR payment schedule — the open receivable per transaction", pk: "PAYMENT_SCHEDULE_ID", fk: `CUSTOMER_TRX_ID → RA_CUSTOMER_TRX_ALL` },
  { table: "RA_INTERFACE_LINES_ALL", module: "Receivables", purpose: "AutoInvoice interface — staged transaction lines before the import job runs", pk: "INTERFACE_LINE_ID", fk: `CUSTOMER_TRX_ID → RA_CUSTOMER_TRX_ALL (for linked memos)` },
  { table: "RA_INTERFACE_DISTRIBUTIONS_ALL", module: "Receivables", purpose: "AutoInvoice interface — staged distributions", pk: "INTERFACE_DISTRIBUTION_ID", fk: `INTERFACE_LINE_ID → RA_INTERFACE_LINES_ALL` },
  { table: "RA_INTERFACE_SALESCREDITS_ALL", module: "Receivables", purpose: "AutoInvoice interface — staged sales credits", pk: "INTERFACE_SALES_CREDIT_ID", fk: `INTERFACE_LINE_ID → RA_INTERFACE_LINES_ALL` },
  { table: "AR_PAYMENTS_INTERFACE_ALL", module: "Receivables", purpose: "Receipt import (lockbox) interface — staged receipts before Process Receipts Through Lockbox", pk: "INTERFACE_RECEIPT_ID", fk: `CUSTOMER_ID → HZ_CUST_ACCOUNTS` },

  // GL
  { table: "GL_LEDGERS", module: "GL", purpose: "Ledger master — accounts, calendar, currency; the unit that holds balances", pk: "LEDGER_ID", fk: `CURRENCY_CODE${sep}PERIOD_SET_NAME → GL_PERIOD_SETS` },
  { table: "GL_PERIOD_SETS", module: "GL", purpose: "Accounting calendars (period sets) with 12/13/52 periods", pk: "PERIOD_SET_NAME", fk: `—` },
  { table: "GL_PERIOD_STATUSES", module: "GL", purpose: "Period open/close status per ledger — the gatekeeper for posting", pk: "LEDGER_ID + PERIOD_NAME + PERIOD_YEAR (composite)", fk: `LEDGER_ID → GL_LEDGERS` },
  { table: "GL_CODE_COMBINATIONS", module: "GL", purpose: "Account combinations — one row per valid combination of COA segments", pk: "CODE_COMBINATION_ID", fk: `CHART_OF_ACCOUNTS_ID → FND_ID_FLEX_STRUCTURES` },
  { table: "GL_JE_BATCHES", module: "GL", purpose: "Journal batch — a group of journal headers", pk: "JE_BATCH_ID", fk: `LEDGER_ID → GL_LEDGERS` },
  { table: "GL_JE_HEADERS", module: "GL", purpose: "Journal header — source, category, date, status (Unposted/Posted)", pk: "JE_HEADER_ID", fk: `JE_BATCH_ID → GL_JE_BATCHES${sep}LEDGER_ID → GL_LEDGERS` },
  { table: "GL_JE_LINES", module: "GL", purpose: "Journal lines — per-segment accounts with debit/credit amounts", pk: "JE_HEADER_ID + JE_LINE_NUM (composite)", fk: `JE_HEADER_ID → GL_JE_HEADERS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "GL_BALANCES", module: "GL", purpose: "Account balances per ledger, period, and currency", pk: "LEDGER_ID + PERIOD_NAME + CODE_COMBINATION_ID + CURRENCY_CODE (composite)", fk: `LEDGER_ID → GL_LEDGERS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "GL_DAILY_RATES", module: "GL", purpose: "Daily conversion rates per currency pair, date, and rate type", pk: "FROM_CURRENCY + TO_CURRENCY + CONVERSION_DATE + CONVERSION_TYPE (composite)", fk: `—` },
  { table: "GL_DAILY_RATES_INTERFACE", module: "GL", purpose: "Rate import interface for Import and Calculate Daily Rates", pk: "GROUP_ID + ROW_NUM (composite)", fk: `—` },
  { table: "GL_INTERFACE", module: "GL", purpose: "Journal import interface — staged journal lines for Import Journals", pk: "GROUP_ID + ROW_NUM (composite)", fk: `LEDGER_ID → GL_LEDGERS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "GL_BUDGETS", module: "GL", purpose: "Budget master — budget versions per ledger", pk: "BUDGET_ID", fk: `LEDGER_ID → GL_LEDGERS` },
  { table: "GL_BUDGET_INTERFACE", module: "GL", purpose: "Budget balance import interface", pk: "GROUP_ID + ROW_NUM (composite)", fk: `LEDGER_ID → GL_LEDGERS` },

  // Flexfields
  { table: "FND_ID_FLEX_STRUCTURES", module: "Flexfields", purpose: "Key flexfield structure (e.g. the chart of accounts) — the segment layout", pk: "ID_FLEX_STRUCTURE_ID", fk: `APPLICATION_ID → FND_APPLICATION` },
  { table: "FND_ID_FLEX_SEGMENTS", module: "Flexfields", purpose: "Segments of a key flexfield structure", pk: "ID_FLEX_SEGMENT_ID", fk: `ID_FLEX_STRUCTURE_ID → FND_ID_FLEX_STRUCTURES${sep}FLEX_VALUE_SET_ID → FND_FLEX_VALUE_SETS` },
  { table: "FND_FLEX_VALUE_SETS", module: "Flexfields", purpose: "Value sets — the lists of valid values a segment can take", pk: "FLEX_VALUE_SET_ID", fk: `—` },
  { table: "FND_FLEX_VALUES", module: "Flexfields", purpose: "Values inside a value set (segment values, descriptions, enabled flags)", pk: "FLEX_VALUE_ID", fk: `FLEX_VALUE_SET_ID → FND_FLEX_VALUE_SETS` },
  { table: "FND_FLEX_VALUE_NORM_HIERARCHY", module: "Flexfields", purpose: "Parent/child relationships between values (trees)", pk: "HIERARCHY_ID + FLEX_VALUE_ID (composite)", fk: `FLEX_VALUE_SET_ID → FND_FLEX_VALUE_SETS` },
  { table: "FND_DESCRIPTIVE_FLEXS", module: "Flexfields", purpose: "Descriptive flexfield definitions", pk: "DESCRIPTIVE_FLEXFIELD_NAME", fk: `APPLICATION_ID → FND_APPLICATION` },
  { table: "FND_LOOKUP_VALUES", module: "Flexfields", purpose: "Lookup codes — static lists like status flags", pk: "LOOKUP_TYPE + LOOKUP_CODE + LANGUAGE (composite)", fk: `—` },

  // SLA
  { table: "XLA_TRANSACTION_ENTITIES", module: "SLA", purpose: "Transaction entities — the sub-ledger transaction an accounting entry is built from", pk: "ENTITY_ID", fk: `LEDGER_ID → GL_LEDGERS${sep}SOURCE_ID_INT_1 (source transaction reference)` },
  { table: "XLA_EVENTS", module: "SLA", purpose: "Events — the business events (create invoice, pay, etc.) that trigger accounting", pk: "EVENT_ID", fk: `ENTITY_ID → XLA_TRANSACTION_ENTITIES` },
  { table: "XLA_AE_HEADERS", module: "SLA", purpose: "Accounting entry headers — one per set of accounting lines", pk: "AE_HEADER_ID", fk: `LEDGER_ID → GL_LEDGERS${sep}EVENT_ID → XLA_EVENTS` },
  { table: "XLA_AE_LINES", module: "SLA", purpose: "Accounting entry lines — the debit/credit lines of an accounting entry", pk: "AE_HEADER_ID + AE_LINE_NUM (composite)", fk: `AE_HEADER_ID → XLA_AE_HEADERS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "XLA_DISTRIBUTION_LINKS", module: "SLA", purpose: "Links a source distribution (e.g. an invoice distribution) to its accounting line", pk: "DISTRIBUTION_LINK_ID", fk: `AE_HEADER_ID → XLA_AE_HEADERS${sep}AE_LINE_NUM → XLA_AE_LINES` },

  // Cash Management
  { table: "CE_BANK_ACCOUNTS", module: "Cash Mgmt", purpose: "Bank account master — bank, branch, account number, currency", pk: "BANK_ACCOUNT_ID", fk: `BANK_BRANCH_ID → HZ_PARTIES (branch party)${sep}CUST_VENDOR_ID → POZ_SUPPLIERS / HZ_CUST_ACCOUNTS` },
  { table: "CE_BANK_ACCOUNT_USES_ALL", module: "Cash Mgmt", purpose: "Bank account uses — business-unit assignment and the GL cash account", pk: "BANK_ACCOUNT_USE_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "CE_STATEMENT_HEADERS", module: "Cash Mgmt", purpose: "Bank statement header — a period's statement from the bank", pk: "STATEMENT_HEADER_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },
  { table: "CE_STATEMENT_LINES", module: "Cash Mgmt", purpose: "Bank statement lines — each movement on the account", pk: "STATEMENT_LINE_ID", fk: `STATEMENT_HEADER_ID → CE_STATEMENT_HEADERS${sep}CASH_TRANSACTION_ID → CE_CASH_TRANSACTIONS (matched)` },
  { table: "CE_CASH_TRANSACTIONS", module: "Cash Mgmt", purpose: "Cash transactions — the payments/receipts/charges on an account", pk: "CASH_TRANSACTION_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS${sep}STATEMENT_LINE_ID → CE_STATEMENT_LINES (matched)` },
  { table: "CE_STATEMENT_HEADERS_INT", module: "Cash Mgmt", purpose: "Statement import interface — staged statement headers", pk: "STATEMENT_HEADER_INT_ID", fk: `BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },
  { table: "CE_STATEMENT_LINES_INT", module: "Cash Mgmt", purpose: "Statement import interface — staged statement lines", pk: "STATEMENT_LINE_INT_ID", fk: `STATEMENT_HEADER_INT_ID → CE_STATEMENT_HEADERS_INT` },
  { table: "CE_BANK_ACCOUNT_TRANSFERS_ALL", module: "Cash Mgmt", purpose: "Bank account transfers — movement between two bank accounts", pk: "TRANSFER_ID", fk: `BANK_ACCOUNT_ID_FROM → CE_BANK_ACCOUNTS${sep}BANK_ACCOUNT_ID_TO → CE_BANK_ACCOUNTS` },
  { table: "CE_CASH_POOLS_ALL", module: "Cash Mgmt", purpose: "Cash pools — notional/physical pooling structures", pk: "CASH_POOL_ID", fk: `—` },
  { table: "CE_CASH_POOL_MEMBERS", module: "Cash Mgmt", purpose: "Members of a cash pool (bank accounts or nested pools)", pk: "CASH_POOL_MEMBER_ID", fk: `CASH_POOL_ID → CE_CASH_POOLS_ALL${sep}BANK_ACCOUNT_ID → CE_BANK_ACCOUNTS` },

  // Fixed Assets
  { table: "FA_ADDITIONS_B", module: "Fixed Assets", purpose: "Asset master — one row per asset", pk: "ASSET_ID", fk: `ASSET_CATEGORY_ID → FA_CATEGORIES_B` },
  { table: "FA_ADDITIONS_TL", module: "Fixed Assets", purpose: "Translatable asset descriptions", pk: "ASSET_ID + LANGUAGE (composite)", fk: `ASSET_ID → FA_ADDITIONS_B` },
  { table: "FA_BOOK_CONTROLS", module: "Fixed Assets", purpose: "Asset book definitions — method, life, conventions", pk: "BOOK_TYPE_CODE", fk: `—` },
  { table: "FA_BOOKS", module: "Fixed Assets", purpose: "Asset-to-book assignment — cost, reserve, depreciation state", pk: "ASSET_ID + BOOK_TYPE_CODE (composite)", fk: `ASSET_ID → FA_ADDITIONS_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_CATEGORIES_B", module: "Fixed Assets", purpose: "Asset categories — grouping that drives capitalization and depreciation defaults", pk: "CATEGORY_ID", fk: `—` },
  { table: "FA_CATEGORY_BOOKS", module: "Fixed Assets", purpose: "Category defaults per book (method, life, capitalize flag)", pk: "CATEGORY_ID + BOOK_TYPE_CODE (composite)", fk: `CATEGORY_ID → FA_CATEGORIES_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_DEPRN_PERIODS", module: "Fixed Assets", purpose: "Depreciation calendar — the periods a run can post to", pk: "BOOK_TYPE_CODE + PERIOD_COUNTER (composite)", fk: `BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_DEPRN_DETAIL", module: "Fixed Assets", purpose: "Per-asset, per-period depreciation schedule", pk: "ASSET_ID + BOOK_TYPE_CODE + PERIOD_COUNTER (composite)", fk: `ASSET_ID → FA_ADDITIONS_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_DEPRN_SUMMARY", module: "Fixed Assets", purpose: "Running totals — period amount, YTD, and accumulated reserve", pk: "ASSET_ID + BOOK_TYPE_CODE + PERIOD_COUNTER (composite)", fk: `ASSET_ID → FA_ADDITIONS_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_DISTRIBUTION_HISTORY", module: "Fixed Assets", purpose: "Account + location assignment per asset/book", pk: "DISTRIBUTION_ID", fk: `ASSET_ID → FA_ADDITIONS_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS${sep}LOCATION_ID → FA_LOCATIONS` },
  { table: "FA_LOCATIONS", module: "Fixed Assets", purpose: "Physical location master used on distributions", pk: "LOCATION_ID", fk: `—` },
  { table: "FA_MASS_ADDITIONS", module: "Fixed Assets", purpose: "Mass addition staging — assets from AP/receiving/projects/legacy", pk: "MASS_ADDITIONS_ID", fk: `ASSET_CATEGORY_ID → FA_CATEGORIES_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_MASSADD_DISTRIBUTIONS", module: "Fixed Assets", purpose: "Mass addition distributions — accounts/locations per staged addition", pk: "MASS_ADD_DISTRIBUTION_ID", fk: `MASS_ADDITIONS_ID → FA_MASS_ADDITIONS${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "FA_TRANSACTIONS", module: "Fixed Assets", purpose: "Asset transactions — additions, transfers, reclassifications, retirements", pk: "TRANSACTION_ID", fk: `ASSET_ID → FA_ADDITIONS_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_RETIREMENT_HISTORY", module: "Fixed Assets", purpose: "Retirement events (disposal, sale)", pk: "RETIREMENT_ID", fk: `ASSET_ID → FA_ADDITIONS_B${sep}BOOK_TYPE_CODE → FA_BOOK_CONTROLS` },
  { table: "FA_ASSET_HISTORY", module: "Fixed Assets", purpose: "Asset event log — every change to an asset", pk: "ASSET_ID + DATE_EFFECTIVE (composite)", fk: `ASSET_ID → FA_ADDITIONS_B` },

  // Expenses
  { table: "EXM_EXPENSE_REPORTS", module: "Expenses", purpose: "Expense report header — the submitted claim", pk: "EXPENSE_REPORT_ID", fk: `PERSON_ID (employee)${sep}PAYMENT_REQUEST_ID → AP_PAYMENT_REQUESTS_INT` },
  { table: "EXM_EXPENSE_REPORT_LINES", module: "Expenses", purpose: "Expense report lines — each spend on the report", pk: "EXPENSE_REPORT_LINE_ID", fk: `EXPENSE_REPORT_ID → EXM_EXPENSE_REPORTS${sep}EXPENSE_TYPE_ID → EXM_EXPENSE_TYPES${sep}CARD_TRANSACTION_ID → EXM_CARD_TRANSACTIONS` },
  { table: "EXM_EXPENSE_REPORT_DISTRIBUTIONS", module: "Expenses", purpose: "Expense distributions — the accounts each line posts to", pk: "EXPENSE_REPORT_DISTRIBUTION_ID", fk: `EXPENSE_REPORT_LINE_ID → EXM_EXPENSE_REPORT_LINES${sep}CODE_COMBINATION_ID → GL_CODE_COMBINATIONS` },
  { table: "EXM_EXPENSE_TYPES", module: "Expenses", purpose: "Expense types — the configurable spend categories", pk: "EXPENSE_TYPE_ID", fk: `—` },
  { table: "EXM_CARD_PROGRAMS", module: "Expenses", purpose: "Corporate card programs — card issuers and who-pays rules", pk: "CARD_PROGRAM_ID", fk: `—` },
  { table: "EXM_CARD_TRANSACTIONS", module: "Expenses", purpose: "Corporate card transactions imported from card issuers", pk: "CARD_TRANSACTION_ID", fk: `CARD_PROGRAM_ID → EXM_CARD_PROGRAMS${sep}PERSON_ID (card holder)` },
  { table: "EXM_CASH_ADVANCES", module: "Expenses", purpose: "Employee cash advances — request, receive, apply to reports", pk: "CASH_ADVANCE_ID", fk: `PERSON_ID (employee)${sep}EXPENSE_REPORT_ID → EXM_EXPENSE_REPORTS (settlement)` },

  // Intercompany
  { table: "FUN_INTERFACE_BATCHES", module: "Intercompany", purpose: "Intercompany interface batches — header for the Intercompany Transaction Import", pk: "BATCH_ID", fk: `—` },
  { table: "FUN_INTERFACE_HEADERS", module: "Intercompany", purpose: "Intercompany interface headers — one per intercompany transaction", pk: "INTERFACE_HEADER_ID", fk: `BATCH_ID → FUN_INTERFACE_BATCHES` },
  { table: "FUN_INTERFACE_DIST_LINES", module: "Intercompany", purpose: "Intercompany distribution lines — the entries per legal entity", pk: "INTERFACE_DIST_LINE_ID", fk: `INTERFACE_HEADER_ID → FUN_INTERFACE_HEADERS` },
];

export const fusionTableModules = [...new Set(fusionTables.map((t) => t.module))];
