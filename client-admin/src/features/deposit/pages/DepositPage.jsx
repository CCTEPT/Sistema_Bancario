import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { depositToAccount, getUserAccounts } from "@/shared/apis/bank";

const QUICK_AMOUNTS = [100, 500, 1000, 5000];
const CHANNELS = ["CASHIER", "ATM", "APP", "INTERNAL_TRANSFER"];

const createIdempotencyKey = () => {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function DepositPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("CASHIER");
  const [success, setSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const formatMoney = (amount, currency) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const selectedAccount = accounts.find((a) => String(a.id) === accountId);

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
          error.response?.data?.message || error.message || "No fue posible cargar las cuentas."
        );
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !amount || !channel) return;

    const numAmount = parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      showToast("Monto inválido", "Ingresa un monto mayor a 0.", "destructive");
      return;
    }

    setIsPending(true);

    try {
      const response = await depositToAccount({
        accountId: selectedAccount.id,
        amount: numAmount,
        description,
        channel,
        idempotencyKey: createIdempotencyKey(),
      });

      const newBalance = response?.data?.balanceAfter;
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === selectedAccount.id
            ? { ...account, balance: newBalance ?? account.balance + numAmount }
            : account
        )
      );

      setSuccess(true);
      setAmount("");
      setDescription("");
      showToast(
        "Depósito exitoso",
        `Se acreditaron ${formatMoney(numAmount, selectedAccount.currency)} a la cuenta.`
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo procesar el depósito.";

      showToast("No se pudo depositar", message, "destructive");
    } finally {
      setIsPending(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground mt-1">Acredita fondos en una cuenta activa.</p>
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
            <ArrowDownRight className="h-5 w-5 text-emerald-500" />
            New Deposit
          </CardTitle>
          <CardDescription>Selecciona una cuenta, monto y canal para registrar el depósito.</CardDescription>
          {accountsLoading ? (
            <p className="text-sm text-muted-foreground mt-2">Cargando cuentas...</p>
          ) : accountsError ? (
            <p className="text-sm text-destructive mt-2">{accountsError}</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No se encontraron cuentas activas.</p>
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
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Saldo actual</p>
                <p className="font-semibold mt-2">
                  {selectedAccount ? formatMoney(selectedAccount.balance, selectedAccount.currency) : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">El saldo se actualiza al depositar.</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="account" className="bg-background/50">
                  <SelectValue placeholder="Select account to credit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.currency} - {a.accountNumber} ({formatMoney(a.balance, a.currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quick amounts {selectedAccount ? `(${selectedAccount.currency})` : ""}</Label>
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant={amount === String(q) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(String(q))}
                    className="font-mono"
                  >
                    {selectedAccount ? formatMoney(q, selectedAccount.currency) : q}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount {selectedAccount ? `(${selectedAccount.currency})` : ""}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50 font-mono text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger id="channel" className="bg-background/50">
                  <SelectValue placeholder="Select deposit channel" />
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

            <div className="space-y-2">
              <Label htmlFor="description">Note (optional)</Label>
              <Input
                id="description"
                placeholder="Deposit source or note"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isPending || accountsLoading || !accountId || !amount || !channel}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-2" />
              )}
              {isPending ? "Processing..." : success ? "Deposited!" : "Deposit Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
