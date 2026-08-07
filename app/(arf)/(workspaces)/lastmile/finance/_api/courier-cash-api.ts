/**
 * Courier cash (COD / elde nakit) API façade.
 * TODO: Replace mock when backend is ready.
 */
export {
  listCourierCashBalancesLocal as listCourierCashBalances,
  getCourierCashBalanceLocal as getCourierCashBalance,
  listCourierCashMovementsLocal as listCourierCashMovements,
  getCourierCashBalancesKpiLocal as getCourierCashBalancesKpi,
  recordRemittanceLocal as recordRemittance,
  type RecordRemittanceInput,
} from '../_mock/courier-cash-store'
