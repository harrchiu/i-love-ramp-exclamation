import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { EndpointCacheKey } from "src/utils/fetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithCache, clearCacheByEndpoint, getCacheKey, loading } = useCustomFetch()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue, employeeId }) => {
      await fetchWithCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      /*
       ** After updating a transaction, we must clear the paginatedTransactions/all-employees cache
       ** as well as the employee-specific transaction cache.
       **  1. It is acknowledged that the user must still refetch the current transaction group upon revisit
       **     but this solution does preserve the cache of untouched transaction groups
       **     (i.e. employees that aren't relevant will still be cached).
       **  2. An alternative solution is to keep the cache up-to-date with the BE manually, done for ex. by:
       **     1) converting caches for all-emps. & employee-specific to objects
       **     2) applying transaction updates (can be generalized to change any field) to objects
       **     3) updating both caches by re-mapping to stringified object
       **  3. In the interest of time and using provided functions, and since both ideas have their tradeoffs
       **     (refetching unnecessarily vs. manually syncing cache), the current solution is given as is.
       **  4. Thank you for reading!
       */
      const employeeEndpoint: EndpointCacheKey = getCacheKey("transactionsByEmployee", { employeeId })
      clearCacheByEndpoint(["paginatedTransactions", employeeEndpoint])
    },
    [fetchWithCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
