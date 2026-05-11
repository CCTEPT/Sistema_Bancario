import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getUserAccounts, getUserMovements } from "@/shared/apis/bank";

const typeConfig = {
  DEPOSIT: {
    label: "Deposit",
    filter: "deposit",
    icon: ArrowDownRight,
    iconClass: "bg-emerald-500/10 text-emerald-500",
    amountClass: "text-emerald-500",
    prefix: "+",
  },
  WITHDRAW: {
    label: "Withdrawal",
    filter: "withdrawal",
    icon: ArrowUpRight,
    iconClass: "bg-rose-500/10 text-rose-500",
    amountClass: "text-rose-500",
    prefix: "-",
  },
  TRANSFER_OUT: {
    label: "Transfer sent",
    filter: "transfer",
    icon: ArrowRightLeft,
    iconClass: "bg-blue-500/10 text-blue-500",
    amountClass: "text-rose-500",
    prefix: "-",
  },
  TRANSFER_IN: {
    label: "Transfer received",
    filter: "transfer",
    icon: ArrowRightLeft,
    iconClass: "bg-blue-500/10 text-blue-500",
    amountClass: "text-emerald-500",
    prefix: "+",
  },
};

export default function TransactionPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account._id, account])),
    [accounts]
  );

  const formatMoney = (amount, currency) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const accountsResponse = await getUserAccounts();
        const loadedAccounts = accountsResponse.accounts || [];
        setAccounts(loadedAccounts);

        const historyResponse = await getUserMovements({ limit: 100 });
        const loadedTransactions = (historyResponse.data || [])
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        setTransactions(loadedTransactions);
      } catch (error) {
        setError(
          error.response?.data?.message || error.message || "No fue posible cargar el historial."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const config = typeConfig[tx.movementType];
    const matchesType = typeFilter === "all" || config?.filter === typeFilter;
    const matchesAccount = accountFilter === "all" || String(tx.accountId) === accountFilter;
    return matchesType && matchesAccount;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground mt-1">Review your real movement history across accounts.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-56">
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account._id} value={account._id}>
                    {account.divisa} - {account.numeroCuenta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando historial...
            </div>
          ) : error ? (
            <div className="text-center p-12 text-destructive">{error}</div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredTransactions.map((tx) => {
                const config = typeConfig[tx.movementType] || typeConfig.TRANSFER_OUT;
                const Icon = config.icon;
                const account = accountById.get(String(tx.accountId));
                const currency = tx.currency || account?.divisa || "GTQ";
                const date = tx.date || tx.createdAt || tx.updatedAt;

                return (
                  <div key={tx._id} className="flex items-center justify-between gap-4 p-4 hover:bg-background/40 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2.5 rounded-full ${config.iconClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{config.label}</p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{tx.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tx.accountNumber || account?.numeroCuenta || "Cuenta"} · {tx.channel || "APP"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {date ? format(new Date(date), "MMM d, yyyy h:mm a") : "Sin fecha"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-semibold ${config.amountClass}`}>
                        {config.prefix}
                        {formatMoney(tx.amount, currency)}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-primary/20 text-primary">
                          {tx.status || "CONFIRMED"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              {transactions.length === 0
                ? "No hay movimientos registrados todavia. Realiza un deposito, retiro o transferencia para ver historial."
                : "No transactions match the selected filters."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
