import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { getUserAccounts, withdrawFromAccount } from "@/shared/apis/bank";

const CHANNELS = ["APP", "ATM", "CASHIER"];

export default function WithdrawPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("APP");
  const [success, setSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const formatMoney = (amount, currency) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const selectedAccount = accounts.find((a) => String(a.id) === accountId);
  const numAmount = parseFloat(amount);
  const hasInsufficientFunds = selectedAccount && !isNaN(numAmount) && numAmount > selectedAccount.balance;

  const showToast = (title, description, variant = "default") => {
    setToastMsg({ title, description, variant });
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setAccountsLoading(true);
        setAccountsError(null);

        const response = await getUserAccounts();
        const loadedAccounts = (response.accounts || []).map((account) => ({
          id: account._id,
          currency: account.divisa,
          accountNumber: account.numeroCuenta,
          balance: account.saldo,
          raw: account,
        }));

        setAccounts(loadedAccounts);
      } catch (error) {
        setAccountsError(
          error.response?.data?.message || error.message || 'No fue posible cargar tus cuentas.'
        );
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !amount) return;

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast("Invalid amount", "Please enter a valid positive amount.", "destructive");
      return;
    }

    if (hasInsufficientFunds) {
      showToast("Insufficient funds", "You don't have enough balance in this account.", "destructive");
      return;
    }

    setIsPending(true);

    try {
      const response = await withdrawFromAccount({
        accountId: selectedAccount.id,
        amount: numAmount,
        description,
        channel,
      });

      const newBalance = response?.data?.balanceAfter;
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === selectedAccount.id
            ? { ...account, balance: newBalance ?? account.balance - numAmount }
            : account
        )
      );

      setSuccess(true);
      setAmount("");
      setDescription("");
      showToast(
        "Withdrawal successful",
        `Retiraste ${formatMoney(numAmount, selectedAccount.currency)}.`
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.status ||
        error.message ||
        'No se pudo procesar el retiro.';

      showToast("Withdrawal failed", message, "destructive");
    } finally {
      setIsPending(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
        <p className="text-muted-foreground mt-1">Request a simulated withdrawal from your account.</p>
      </div>

      {toastMsg && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            toastMsg.variant === "destructive"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}
        >
          <p className="font-semibold">{toastMsg.title}</p>
          <p className="text-xs mt-0.5 opacity-80">{toastMsg.description}</p>
        </div>
      )}

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-rose-500" />
            New Withdrawal
          </CardTitle>
          <CardDescription>Retira desde una de tus cuentas activas y revisa el saldo en tiempo real.</CardDescription>
          {accountsLoading ? (
            <p className="text-sm text-muted-foreground mt-2">Cargando tus cuentas...</p>
          ) : accountsError ? (
            <p className="text-sm text-destructive mt-2">{accountsError}</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No se encontraron cuentas activas. Crea una cuenta para comenzar a retirar.</p>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-4">
              <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cuenta seleccionada</p>
                <p className="font-semibold mt-2">
                  {selectedAccount ? selectedAccount.currency : "Seleccione una cuenta"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedAccount ? selectedAccount.accountNumber : "Selecciona una cuenta para ver el saldo"}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Saldo disponible</p>
                <p className="font-semibold mt-2">
                  {selectedAccount ? formatMoney(selectedAccount.balance, selectedAccount.currency) : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  El saldo se actualiza al retirar.
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="account" data-testid="select-account" className="bg-background/50">
                  <SelectValue placeholder="Select account to debit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.currency} — {a.accountNumber} ({formatMoney(a.balance, a.currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount {selectedAccount ? `(${selectedAccount.currency})` : ""}</Label>
              <Input
                id="amount"
                data-testid="input-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`bg-background/50 font-mono text-lg ${hasInsufficientFunds ? "border-destructive" : ""}`}
              />
              {selectedAccount && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatMoney(selectedAccount.balance, selectedAccount.currency)}
                </p>
              )}
              {hasInsufficientFunds && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  Insufficient funds
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Note (optional)</Label>
              <Input
                id="description"
                data-testid="input-description"
                placeholder="Reason for withdrawal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger id="channel" className="bg-background/50">
                  <SelectValue placeholder="Select withdrawal channel" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isPending || accountsLoading || !accountId || !amount || !channel || !!hasInsufficientFunds}
              variant={hasInsufficientFunds ? "destructive" : "default"}
              data-testid="button-submit-withdraw"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-2" />
              )}
              {isPending ? "Processing..." : success ? "Withdrawn!" : "Withdraw Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
