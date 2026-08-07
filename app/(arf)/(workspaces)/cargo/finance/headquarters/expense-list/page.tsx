import { fetchExpenses, fetchExpensesSummary } from "./_api/expenses-api"
import { ExpensesPageContent } from "./_components/expenses-page-content"

export default async function ExpenseListPage() {
  const [rows, summary] = await Promise.all([
    fetchExpenses(),
    fetchExpensesSummary(),
  ])

  return <ExpensesPageContent rows={rows} summary={summary} />
}
