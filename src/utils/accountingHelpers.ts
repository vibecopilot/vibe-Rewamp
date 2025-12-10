/**
 * Accounting Utility Functions
 * Reusable helper functions for the accounting module
 */

interface InvoiceItem {
  amount?: number | string;
  tax_amount?: number | string;
}

interface JournalLine {
  debit_amount?: number | string;
  credit_amount?: number | string;
}

interface InvoiceTotals {
  subtotal: string;
  taxAmount: string;
  total: string;
}

interface LineItemAmounts {
  amount: string;
  taxAmount: string;
  total: string;
}

interface JournalBalance {
  totalDebit: string;
  totalCredit: string;
  difference: string;
  isBalanced: boolean;
}

type StatusType = "invoice" | "journal" | "payment";
type DateFormatType = "short" | "long" | "full";
type InvoiceNumberFormat = "simple" | "date" | "year";

/**
 * Format currency amount to Indian Rupees
 */
export const formatCurrency = (amount: number | undefined, currency = "INR"): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format date to localized string
 */
export const formatDate = (date: string | Date | undefined, format: DateFormatType = "short"): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Record<DateFormatType, Intl.DateTimeFormatOptions> = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    long: { year: "numeric", month: "long", day: "numeric" },
    full: { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" },
  };

  return dateObj.toLocaleDateString("en-IN", options[format] || options.short);
};

/**
 * Get status badge color classes
 */
export const getStatusColor = (status: string, type: StatusType = "invoice"): string => {
  const statusColors: Record<StatusType, Record<string, string>> = {
    invoice: {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      partially_paid: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-600",
    },
    journal: {
      draft: "bg-gray-100 text-gray-800",
      posted: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    },
    payment: {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    },
  };

  return statusColors[type]?.[status] || "bg-gray-100 text-gray-800";
};

/**
 * Calculate invoice totals from line items
 */
export const calculateInvoiceTotals = (items: InvoiceItem[] = []): InvoiceTotals => {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(String(item.amount || 0)), 0);
  const taxAmount = items.reduce((sum, item) => sum + parseFloat(String(item.tax_amount || 0)), 0);
  const total = subtotal + taxAmount;

  return {
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
  };
};

/**
 * Calculate line item amounts with tax
 */
export const calculateLineItemAmounts = (
  quantity: number | string,
  unitPrice: number | string,
  taxRate: number | string = 0
): LineItemAmounts => {
  const amount = parseFloat(String(quantity || 0)) * parseFloat(String(unitPrice || 0));
  const taxAmount = (amount * parseFloat(String(taxRate || 0))) / 100;
  const total = amount + taxAmount;

  return {
    amount: amount.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
  };
};

/**
 * Validate journal entry balance
 */
export const validateJournalBalance = (lines: JournalLine[] = []): JournalBalance => {
  const totalDebit = lines.reduce((sum, line) => sum + parseFloat(String(line.debit_amount || 0)), 0);
  const totalCredit = lines.reduce((sum, line) => sum + parseFloat(String(line.credit_amount || 0)), 0);
  const difference = totalDebit - totalCredit;

  return {
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    difference: difference.toFixed(2),
    isBalanced: Math.abs(difference) < 0.01,
  };
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (
  prefix = "INV",
  sequence = 1,
  format: InvoiceNumberFormat = "simple"
): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const paddedSequence = String(sequence).padStart(4, "0");

  const formats: Record<InvoiceNumberFormat, string> = {
    simple: `${prefix}-${paddedSequence}`,
    date: `${prefix}-${year}${month}-${paddedSequence}`,
    year: `${prefix}-${year}-${paddedSequence}`,
  };

  return formats[format] || formats.simple;
};

/**
 * Calculate due date from invoice date
 */
export const calculateDueDate = (invoiceDate: string | Date, paymentTerms = 30): string => {
  const date = typeof invoiceDate === "string" ? new Date(invoiceDate) : new Date(invoiceDate);
  date.setDate(date.getDate() + paymentTerms);
  return date.toISOString().split("T")[0];
};

/**
 * Check if invoice is overdue
 */
export const isInvoiceOverdue = (dueDate: string | Date, status: string): boolean => {
  if (status === "paid" || status === "cancelled") return false;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return due < new Date();
};

/**
 * Format account type for display
 */
export const formatAccountType = (type: string): string => {
  const types: Record<string, string> = {
    asset: "Assets",
    liability: "Liabilities",
    equity: "Equity",
    revenue: "Revenue",
    expense: "Expenses",
  };
  return types[type] || type;
};

/**
 * Export data to CSV
 */
export const exportToCSV = <T extends Record<string, unknown>>(data: T[], filename = "export.csv"): void => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : String(value);
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Group array of objects by a key
 */
export const groupBy = <T extends Record<string, unknown>>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result: Record<string, T[]>, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(func: T, wait = 300): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number | undefined): string => {
  return new Intl.NumberFormat("en-IN").format(num || 0);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): string => {
  if (!total || total === 0) return "0.00";
  return ((value / total) * 100).toFixed(2);
};

/**
 * Get financial year from date
 */
export const getFinancialYear = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (month >= 3) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string | undefined, length = 50): string => {
  if (!text || text.length <= length) return text || "";
  return text.substring(0, length) + "...";
};

/**
 * Sort array of objects by key
 */
export const sortByKey = <T extends Record<string, unknown>>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === undefined || aVal === null) return order === "asc" ? 1 : -1;
    if (bVal === undefined || bVal === null) return order === "asc" ? -1 : 1;
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export default {
  formatCurrency,
  formatDate,
  getStatusColor,
  calculateInvoiceTotals,
  calculateLineItemAmounts,
  validateJournalBalance,
  generateInvoiceNumber,
  calculateDueDate,
  isInvoiceOverdue,
  formatAccountType,
  exportToCSV,
  groupBy,
  debounce,
  isValidEmail,
  formatNumber,
  calculatePercentage,
  getFinancialYear,
  truncateText,
  sortByKey,
};
