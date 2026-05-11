import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRightLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { getUserAccounts, transferBetweenAccounts } from "@/shared/apis/bank";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function TransferPage() {
  const user = useAuthStore((state) => state.user);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [fromAccountId, setFromAccountId] = useState("");
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const formatMoney = (amount, currency) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const ownerName = user?.name || user?.username || user?.email || "Usuario";
  const fromAccount = accounts.find((a) => String(a.id) === fromAccountId);
  const numAmount = parseFloat(amount);
  const hasInsufficientFunds = fromAccount && !Number.isNaN(numAmount) && numAmount > fromAccount.balance;

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
          ownerName,
          currency: account.divisa,
          accountNumber: account.numeroCuenta,
          balance: account.saldo,
          raw: account,
        }));

        setAccounts(loadedAccounts);
      } catch (error) {
        setAccountsError(
          error.response?.data?.message || error.message || "No fue posible cargar tus cuentas."
        );
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, [ownerName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const destinationAccount = destinationAccountNumber.trim();

    if (!fromAccountId || !destinationAccount || !amount) return;

    if (fromAccount?.accountNumber === destinationAccount) {
      showToast("Transferencia invalida", "La cuenta origen y destino deben ser distintas.", "destructive");
      return;
    }

    if (Number.isNaN(numAmount) || numAmount <= 0) {
      showToast("Monto invalido", "Ingresa un monto mayor a 0.", "destructive");
      return;
    }

    if (hasInsufficientFunds) {
      showToast("Fondos insuficientes", "No tienes saldo suficiente en la cuenta origen.", "destructive");
      return;
    }

    setIsPending(true);

    try {
      await transferBetweenAccounts({
        sourceAccount: fromAccount.id,
        destinationAccount,
        amount: numAmount,
        description,
      });

      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === fromAccount.id
            ? { ...account, balance: account.balance - numAmount }
            : account
        )
      );

      setSuccess(true);
      setAmount("");
      setDestinationAccountNumber("");
      setDescription("");
      showToast(
        "Transferencia completada",
        `Se transfirieron ${formatMoney(numAmount, fromAccount.currency)} correctamente.`
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo procesar la transferencia.";

      showToast("Transferencia fallida", message, "destructive");
    } finally {
      setIsPending(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Funds</h1>
        <p className="text-muted-foreground mt-1">Mueve dinero hacia la cuenta de otro usuario.</p>
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
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            New Transfer
          </CardTitle>
          <CardDescription>Selecciona tu cuenta origen e ingresa el numero de cuenta destino.</CardDescription>
          {accountsLoading ? (
            <p className="text-sm text-muted-foreground mt-2">Cargando tus cuentas...</p>
          ) : accountsError ? (
            <p className="text-sm text-destructive mt-2">{accountsError}</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">Necesitas al menos una cuenta activa para transferir.</p>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-4">
              <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cuenta origen</p>
                <p className="font-semibold mt-2">
                  {fromAccount ? fromAccount.currency : "Seleccione una cuenta"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fromAccount ? fromAccount.accountNumber : "Selecciona cuenta origen"}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Saldo origen</p>
                <p className="font-semibold mt-2">
                  {fromAccount ? formatMoney(fromAccount.balance, fromAccount.currency) : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Se actualiza al transferir.</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="from-account">From Account</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger id="from-account" data-testid="select-from-account" className="bg-background/50">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.ownerName} - {a.currency} - {a.accountNumber} ({formatMoney(a.balance, a.currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination-account">Destination Account Number</Label>
              <Input
                id="destination-account"
                data-testid="input-destination-account"
                placeholder="NB123456789012"
                value={destinationAccountNumber}
                onChange={(e) => setDestinationAccountNumber(e.target.value)}
                className="bg-background/50 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount {fromAccount ? `(${fromAccount.currency})` : ""}</Label>
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
              {fromAccount && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatMoney(fromAccount.balance, fromAccount.currency)}
                </p>
              )}
              {hasInsufficientFunds && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  Fondos insuficientes
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Note (optional)</Label>
              <Input
                id="description"
                data-testid="input-description"
                placeholder="Concepto de la transferencia"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={
                isPending ||
                accountsLoading ||
                !fromAccountId ||
                !destinationAccountNumber ||
                !amount ||
                !!hasInsufficientFunds
              }
              variant={hasInsufficientFunds ? "destructive" : "default"}
              data-testid="button-submit-transfer"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
              ) : (
                <ArrowRightLeft className="h-4 w-4 mr-2" />
              )}
              {isPending ? "Processing..." : success ? "Transferred!" : "Transfer Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
