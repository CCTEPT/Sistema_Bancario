import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckSquare, ArrowDownRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cashCheck, getChecks, getUserAccounts, issueCheck } from "@/shared/apis/bank";

const statusConfig = {
  EMITIDO: { label: "Emitido", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  COBRADO: { label: "Cobrado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: ArrowDownRight },
  ANULADO: { label: "Anulado", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: XCircle },
  RECHAZADO: { label: "Rechazado", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: XCircle },
  PENDING: { label: "Pendiente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
};

const mapAccount = (account) => ({
  id: account._id,
  currency: account.divisa,
  accountNumber: account.numeroCuenta,
  balance: account.saldo,
});

export default function CheckPage() {
  const [accounts, setAccounts] = useState([]);
  const [checks, setChecks] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [checksLoading, setChecksLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState("issue");

  const [issueAccountId, setIssueAccountId] = useState("");
  const [issueAmount, setIssueAmount] = useState("");
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState(false);

  const [checkNumber, setCheckNumber] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [cashLoading, setCashLoading] = useState(false);
  const [cashSuccess, setCashSuccess] = useState(false);

  const [toastMsg, setToastMsg] = useState(null);

  const issueAccount = accounts.find((account) => account.id === issueAccountId);
  const cashAccount = accounts.find((account) => account.id === cashAccountId);
  const ownCheckToCash = checks.find(
    (check) => check.checkNumber.toLowerCase() === checkNumber.trim().toLowerCase()
  );
  const issueNumAmount = parseFloat(issueAmount);
  const hasInsufficientFunds =
    issueAccount && !Number.isNaN(issueNumAmount) && issueNumAmount > issueAccount.balance;

  const formatMoney = (amount, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const formatDate = (value) => {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Sin fecha" : format(date, "MMM d, yyyy");
  };

  const showToast = (title, description, variant = "default") => {
    setToastMsg({ title, description, variant });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const refreshChecks = async () => {
    setChecksLoading(true);
    const response = await getChecks();
    setChecks(response.data || []);
    setChecksLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setAccountsLoading(true);
        setChecksLoading(true);
        setLoadError(null);

        const [accountsResponse, checksResponse] = await Promise.all([
          getUserAccounts(),
          getChecks(),
        ]);

        setAccounts((accountsResponse.accounts || []).map(mapAccount));
        setChecks(checksResponse.data || []);
      } catch (error) {
        setLoadError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "No fue posible cargar la informacion de cheques."
        );
      } finally {
        setAccountsLoading(false);
        setChecksLoading(false);
      }
    };

    loadData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();

    if (!issueAccountId || Number.isNaN(issueNumAmount) || issueNumAmount <= 0) {
      showToast("Datos invalidos", "Selecciona una cuenta e ingresa un monto valido.", "destructive");
      return;
    }

    if (hasInsufficientFunds) {
      showToast("Saldo insuficiente", "La cuenta emisora no tiene saldo suficiente.", "destructive");
      return;
    }

    setIssueLoading(true);

    try {
      const response = await issueCheck({
        issuingAccountId: issueAccountId,
        amount: issueNumAmount,
      });

      const newCheck = response.data?.check;
      if (newCheck) {
        setChecks((prev) => [newCheck, ...prev]);
      } else {
        await refreshChecks();
      }

      setIssueAmount("");
      setIssueAccountId("");
      setIssueSuccess(true);
      showToast("Cheque emitido", `${newCheck?.checkNumber || "Cheque"} creado exitosamente.`);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo emitir el cheque.";

      showToast("No se pudo emitir", message, "destructive");
    } finally {
      setIssueLoading(false);
      setTimeout(() => setIssueSuccess(false), 3000);
    }
  };

  const handleCash = async (e) => {
    e.preventDefault();
    const trimmedCheckNumber = checkNumber.trim();

    if (!trimmedCheckNumber || !cashAccountId) {
      showToast("Datos invalidos", "Ingresa el numero de cheque y selecciona una cuenta.", "destructive");
      return;
    }

    if (ownCheckToCash) {
      showToast(
        "Cheque propio",
        "No puedes cobrar un cheque emitido por tus propias cuentas.",
        "destructive"
      );
      return;
    }

    setCashLoading(true);

    try {
      const response = await cashCheck({
        checkNumber: trimmedCheckNumber,
        receivingAccountId: cashAccountId,
      });

      const cashedCheck = response.data?.check;
      const receiverBalance = response.data?.receiverMovement?.balanceAfter;

      if (cashedCheck) {
        setChecks((prev) =>
          prev.map((item) => item._id === cashedCheck._id ? cashedCheck : item)
        );
      } else {
        await refreshChecks();
      }

      if (receiverBalance !== undefined) {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === cashAccountId ? { ...account, balance: receiverBalance } : account
          )
        );
      }

      setCheckNumber("");
      setCashAccountId("");
      setCashSuccess(true);
      showToast("Cheque cobrado", `${cashedCheck?.checkNumber || trimmedCheckNumber} depositado exitosamente.`);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo cobrar el cheque.";

      showToast("No se pudo cobrar", message, "destructive");
    } finally {
      setCashLoading(false);
      setTimeout(() => setCashSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cheques</h1>
        <p className="text-muted-foreground mt-1">Emite y cobra cheques desde tus cuentas.</p>
      </div>

      {toastMsg && (
        <div className={`text-sm px-4 py-3 rounded-lg border ${
          toastMsg.variant === "destructive"
            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        }`}>
          <p className="font-semibold">{toastMsg.title}</p>
          <p className="text-xs mt-0.5 opacity-80">{toastMsg.description}</p>
        </div>
      )}

      {loadError && (
        <div className="text-sm px-4 py-3 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-400">
          {loadError}
        </div>
      )}

      <div className="flex gap-2 p-1 bg-card/50 border border-border/50 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("issue")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "issue" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Emitir cheque
        </button>
        <button
          type="button"
          onClick={() => setTab("cash")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "cash" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Cobrar cheque
        </button>
      </div>

      {tab === "issue" && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Emitir nuevo cheque
            </CardTitle>
            <CardDescription>El cheque tendra vigencia de 90 dias desde su emision.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssue} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="issue-account">Cuenta emisora</Label>
                <Select value={issueAccountId} onValueChange={setIssueAccountId}>
                  <SelectTrigger id="issue-account" className="bg-background/50">
                    <SelectValue placeholder={accountsLoading ? "Cargando cuentas..." : "Selecciona una cuenta"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.currency} - {account.accountNumber} ({formatMoney(account.balance, account.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-amount">Monto {issueAccount ? `(${issueAccount.currency})` : ""}</Label>
                <Input
                  id="issue-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={issueAmount}
                  onChange={(event) => setIssueAmount(event.target.value)}
                  className={`bg-background/50 font-mono text-lg ${hasInsufficientFunds ? "border-destructive" : ""}`}
                />
                {issueAccount && (
                  <p className="text-xs text-muted-foreground">
                    Disponible: {formatMoney(issueAccount.balance, issueAccount.currency)}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-medium"
                disabled={issueLoading || accountsLoading || !issueAccountId || !issueAmount || !!hasInsufficientFunds}
              >
                {issueLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : issueSuccess ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <CheckSquare className="h-4 w-4 mr-2" />
                )}
                {issueLoading ? "Procesando..." : issueSuccess ? "Emitido" : "Emitir cheque"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "cash" && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-emerald-500" />
              Cobrar cheque
            </CardTitle>
            <CardDescription>Ingresa el numero de cheque y la cuenta donde deseas recibirlo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCash} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="check-number">Numero de cheque</Label>
                <Input
                  id="check-number"
                  placeholder="CHK-..."
                  value={checkNumber}
                  onChange={(event) => setCheckNumber(event.target.value)}
                  className="bg-background/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash-account">Cuenta receptora</Label>
                <Select value={cashAccountId} onValueChange={setCashAccountId}>
                  <SelectTrigger id="cash-account" className="bg-background/50">
                    <SelectValue placeholder={accountsLoading ? "Cargando cuentas..." : "Selecciona una cuenta"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.currency} - {account.accountNumber} ({formatMoney(account.balance, account.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cashAccount && (
                  <p className="text-xs text-muted-foreground">
                    Saldo actual: {formatMoney(cashAccount.balance, cashAccount.currency)}
                  </p>
                )}
                {ownCheckToCash && (
                  <p className="text-xs text-destructive">
                    Este cheque pertenece a tus cuentas y no puede cobrarse aqui.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-medium"
                disabled={cashLoading || accountsLoading || !checkNumber || !cashAccountId || !!ownCheckToCash}
              >
                {cashLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : cashSuccess ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                )}
                {cashLoading ? "Procesando..." : cashSuccess ? "Cobrado" : "Cobrar cheque"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-base font-semibold mb-3">Historial de cheques</h2>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-0">
            {checksLoading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando cheques...
              </div>
            ) : checks.length > 0 ? (
              <div className="divide-y divide-border/50">
                {checks.map((check) => {
                  const cfg = statusConfig[check.status] || statusConfig.PENDING;
                  const StatusIcon = cfg.icon;
                  const account = accounts.find((item) => item.id === String(check.issuingAccount));

                  return (
                    <div key={check._id} className="flex items-center justify-between p-4 hover:bg-background/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <CheckSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium font-mono truncate">{check.checkNumber}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {account ? `${account.currency} - ${account.accountNumber}` : "Cuenta emisora"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Emitido: {formatDate(check.issueDate)} -{" "}
                            Vence: {formatDate(check.expiryDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-semibold">
                          {formatMoney(check.amount, account?.currency || "USD")}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border mt-1 ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 text-muted-foreground text-sm">
                No hay cheques registrados aun.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
