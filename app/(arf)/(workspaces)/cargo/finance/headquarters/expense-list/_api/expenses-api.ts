import {
  getExpenses,
  getExpensesSummary,
} from "../_mock/expenses-mock-data"
import type {
  ExpenseRecord,
  ExpenseSummary,
} from "../_types/expense"

// TODO: Remove mock when API is ready
export async function fetchExpenses(): Promise<ExpenseRecord[]> {
  return getExpenses()
}

// TODO: Remove mock when API is ready
export async function fetchExpensesSummary(): Promise<ExpenseSummary> {
  return getExpensesSummary()
}
