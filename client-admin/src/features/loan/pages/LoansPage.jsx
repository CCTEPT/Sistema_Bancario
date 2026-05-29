import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Landmark,
  CheckCircle2,
  BadgeDollarSign,
  CalendarDays,
  FileText,
  TrendingDown,
  Clock,
  AlertCircle,
  CreditCard,
  X,
} from "lucide-react";
import { requestLoan, getUserLoans, getUserAccounts, payLoan } from "@/shared/apis/bank";

// ─── Constants ────────────────────────────────────────────────────────────────

const TERM_OPTIONS = [
  { value: 6,  label: "6 meses"  },
  { value: 12, label: "12 meses" },
  { value: 24, label: "24 meses" },
  { value: 36, label: "36 meses" },
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];
const MONTHLY_RATE  = 0.012; // 12% anual / 12

const LOAN_STATUS_CONFIG = {
  PENDING:  { label: "Pendiente",  color: "text-amber-400",   bg: "bg-amber-500/10  border-amber-500/30"  },
  ACTIVE:   { label: "Activo",     color: "text-sky-400",     bg: "bg-sky-500/10    border-sky-500/30"    },
  REJECTED: { label: "Rechazado",  color: "text-rose-400",    bg: "bg-rose-500/10   border-rose-500/30"   },
  PAID:     { label: "Pagado",     color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/30" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMoney = (amount, currency = "GTQ") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount ?? 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("es-GT", {
    year: "numeric", month: "short", day: "numeric",
  });

const calcMonthlyPayment = (amount, termMonths) => {
  if (!amount || !termMonths) return null;
  const r = MONTHLY_RATE;
  const n = termMonths;
  return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = LOAN_STATUS_CONFIG[status] ?? {
    label: status, color: "text-muted-foreground", bg: "bg-muted border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

// ─── Pay Modal ────────────────────────────────────────────────────────────────

function PayModal({ loan, accounts, onClose, onSuccess }) {
  const [payAccountId, setPayAccountId] = useState("");
  const [payAmount, setPayAmount]       = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const currency     = loan.currency ?? "GTQ";
  const remaining    = loan.remainingBalance ?? loan.totalPayment ?? 0;
  const monthly      = loan.monthlyPayment ?? 0;
  const selectedAcc  = accounts.find((a) => String(a.id) === payAccountId);
  const numPayAmount = parseFloat(payAmount);
  const isValid      = payAccountId && !isNaN(numPayAmount) && numPayAmount > 0;

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      await payLoan({ loanId: loan._id, accountId: payAccountId, amount: numPayAmount });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 space-y-5">

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-sky-400" />
              Pagar préstamo
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Puedes pagar la cuota exacta o cualquier monto parcial.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/30 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/50 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Saldo pendiente</p>
            <p className="font-semibold font-mono text-sky-400 mt-1">{formatMoney(remaining, currency)}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Cuota mensual</p>
            <p className="font-semibold font-mono mt-1">{formatMoney(monthly, currency)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pay-account">Cuenta de débito</Label>
          <Select value={payAccountId} onValueChange={setPayAccountId}>
            <SelectTrigger id="pay-account" className="bg-background/50">
              <SelectValue placeholder="Selecciona una cuenta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.currency} · {a.accountNumber} ({formatMoney(a.balance, a.currency)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAcc && (
            <p className="text-xs text-muted-foreground">
              Saldo disponible:{" "}
              <span className="font-mono font-medium">{formatMoney(selectedAcc.balance, selectedAcc.currency)}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Pago rápido</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button" size="sm"
              variant={payAmount === String(monthly.toFixed(2)) ? "default" : "outline"}
              onClick={() => setPayAmount(String(monthly.toFixed(2)))}
              className="font-mono text-xs"
            >
              Cuota · {formatMoney(monthly, currency)}
            </Button>
            <Button
              type="button" size="sm"
              variant={payAmount === String(remaining.toFixed(2)) ? "default" : "outline"}
              onClick={() => setPayAmount(String(remaining.toFixed(2)))}
              className="font-mono text-xs"
            >
              Total · {formatMoney(remaining, currency)}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pay-amount">Otro monto ({currency})</Label>
          <Input
            id="pay-amount" type="number" step="0.01" min="0.01" placeholder="0.00"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="bg-background/50 font-mono"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handlePay} disabled={!isValid || loading}>
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Procesando...</>
              : <><CreditCard className="h-4 w-4 mr-2" />Confirmar pago</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Loan Card ────────────────────────────────────────────────────────────────

function LoanCard({ loan, accounts, onPaySuccess }) {
  const [payOpen, setPayOpen] = useState(false);
  const currency  = loan.currency ?? "GTQ";
  const isActive  = loan.status === "ACTIVE";
  const remaining = loan.remainingBalance ?? loan.totalPayment ?? 0;
  const paidPct   = loan.totalPayment
    ? Math.min(100, Math.round(((loan.amountPaid ?? 0) / loan.totalPayment) * 100))
    : 0;

  return (
    <>
      <div className="rounded-lg border border-border/50 bg-background/60 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold font-mono text-base">{formatMoney(loan.amount, currency)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {loan.description || "Sin descripción"}
            </p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {loan.termMonths} meses
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            {formatMoney(loan.monthlyPayment, currency)}/mes
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(loan.createdAt)}
          </span>
        </div>

        {isActive && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Pagado: <span className="font-mono font-medium text-foreground">
                  {formatMoney(loan.amountPaid ?? 0, currency)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Restante: <span className="font-mono font-medium text-sky-400">
                  {formatMoney(remaining, currency)}
                </span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{paidPct}% completado</p>
          </div>
        )}

        {isActive && (
          <Button
            size="sm" variant="outline"
            className="w-full border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/50"
            onClick={() => setPayOpen(true)}
          >
            <CreditCard className="h-3.5 w-3.5 mr-2" />
            Realizar pago
          </Button>
        )}
      </div>

      {payOpen && (
        <PayModal
          loan={loan}
          accounts={accounts}
          onClose={() => setPayOpen(false)}
          onSuccess={onPaySuccess}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoanRequestPage() {
  const [accounts, setAccounts]               = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError]     = useState(null);
  const [loans, setLoans]                     = useState([]);
  const [loansLoading, setLoansLoading]       = useState(true);

  const [accountId, setAccountId]     = useState("");
  const [amount, setAmount]           = useState("");
  const [termMonths, setTermMonths]   = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending]     = useState(false);
  const [success, setSuccess]         = useState(false);
  const [toastMsg, setToastMsg]       = useState(null);

  const selectedAccount = accounts.find((a) => String(a.id) === accountId);
  const numAmount       = parseFloat(amount);
  const monthly         = calcMonthlyPayment(isNaN(numAmount) ? 0 : numAmount, parseInt(termMonths));

  const showToast = (title, desc, variant = "default") => {
    setToastMsg({ title, description: desc, variant });
    setTimeout(() => setToastMsg(null), 4500);
  };

  const loadAccounts = async () => {
    try {
      const res = await getUserAccounts();
      setAccounts(
        (res.accounts || []).map((a) => ({
          id: a._id, currency: a.divisa, accountNumber: a.numeroCuenta, balance: a.saldo,
        }))
      );
    } catch (err) {
      setAccountsError(err.response?.data?.message || err.message || "Error al cargar cuentas.");
    } finally {
      setAccountsLoading(false);
    }
  };

  const loadLoans = async () => {
    try {
      setLoansLoading(true);
      const res = await getUserLoans();
      setLoans(res.loans || res || []);
    } catch {
      setLoans([]);
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => { loadAccounts(); }, []);
  useEffect(() => { loadLoans(); }, []);

  const handlePaySuccess = async () => {
    showToast("Pago registrado", "Tu pago fue procesado correctamente.");
    await loadAccounts();
    await loadLoans();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !amount || !termMonths) return;
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast("Monto inválido", "Ingresa un monto mayor a 0.", "destructive");
      return;
    }
    setIsPending(true);
    try {
      await requestLoan({
        accountId: selectedAccount.id,
        amount: numAmount,
        termMonths: parseInt(termMonths),
        description,
      });
      setSuccess(true);
      setAmount(""); setTermMonths(""); setDescription(""); setAccountId("");
      showToast("Solicitud enviada", "Tu préstamo está siendo revisado.");
      await loadLoans();
    } catch (err) {
      showToast(
        "Error al solicitar",
        err.response?.data?.message || err.message || "No se pudo enviar la solicitud.",
        "destructive"
      );
    } finally {
      setIsPending(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const isFormValid   = !isPending && !accountsLoading && accountId && amount && parseFloat(amount) > 0 && termMonths;
  const hasActiveLoan = loans.some((l) => l.status === "ACTIVE" || l.status === "PENDING");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
        <p className="text-muted-foreground mt-1">Solicita un préstamo o realiza pagos de uno activo.</p>
      </div>

      {toastMsg && (
        <div className={`text-sm px-4 py-3 rounded-lg border flex items-start gap-3 ${
          toastMsg.variant === "destructive"
            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        }`}>
          {toastMsg.variant === "destructive"
            ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            : <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
          <div>
            <p className="font-semibold">{toastMsg.title}</p>
            <p className="text-xs mt-0.5 opacity-80">{toastMsg.description}</p>
          </div>
        </div>
      )}

      {/* Formulario solo si no tiene préstamo activo o pendiente */}
      {!hasActiveLoan && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-sky-500" />
              Nueva solicitud
            </CardTitle>
            <CardDescription>Selecciona la cuenta de destino, el monto y el plazo deseado.</CardDescription>

            {!accountsLoading && !accountsError && accounts.length > 0 && (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mt-4">
                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cuenta destino</p>
                  <p className="font-semibold mt-2 truncate">{selectedAccount ? selectedAccount.accountNumber : "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedAccount ? selectedAccount.currency : "Selecciona una cuenta"}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Monto solicitado</p>
                  <p className="font-semibold mt-2 font-mono">
                    {amount && !isNaN(parseFloat(amount)) ? formatMoney(parseFloat(amount), selectedAccount?.currency ?? "GTQ") : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{termMonths ? `a ${termMonths} meses` : "Elige el plazo"}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cuota estimada</p>
                  <p className="font-semibold mt-2 font-mono text-sky-400">
                    {monthly && monthly > 0 ? `~${formatMoney(monthly, selectedAccount?.currency ?? "GTQ")}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">por mes · tasa ref. 12% anual</p>
                </div>
              </div>
            )}

            {accountsLoading && <p className="text-sm text-muted-foreground mt-4">Cargando cuentas...</p>}
            {accountsError   && <p className="text-sm text-destructive mt-4">{accountsError}</p>}
            {!accountsLoading && !accountsError && accounts.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No tienes cuentas activas.</p>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="account" className="flex items-center gap-1.5">
                  <BadgeDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Cuenta de destino
                </Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger id="account" className="bg-background/50">
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.currency} · {a.accountNumber} ({formatMoney(a.balance, a.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                  Montos rápidos
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {QUICK_AMOUNTS.map((q) => (
                    <Button
                      key={q} type="button"
                      variant={amount === String(q) ? "default" : "outline"}
                      size="sm" onClick={() => setAmount(String(q))} className="font-mono"
                    >
                      {selectedAccount ? formatMoney(q, selectedAccount.currency) : new Intl.NumberFormat("en-US").format(q)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto{selectedAccount ? ` (${selectedAccount.currency})` : ""}</Label>
                <Input
                  id="amount" type="number" step="0.01" min="100" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="bg-background/50 font-mono text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="term" className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  Plazo
                </Label>
                <Select value={termMonths} onValueChange={setTermMonths}>
                  <SelectTrigger id="term" className="bg-background/50">
                    <SelectValue placeholder="Selecciona el plazo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TERM_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={String(t.value)}>
                        {t.label}
                        {amount && !isNaN(parseFloat(amount)) && (
                          <span className="ml-2 text-xs text-muted-foreground font-mono">
                            (~{formatMoney(calcMonthlyPayment(parseFloat(amount), t.value), selectedAccount?.currency ?? "GTQ")}/mes)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Motivo <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  id="description" placeholder="Ej. Compra de equipo, gastos médicos..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                La cuota es estimada al 12% anual. Las condiciones finales las define el banco al aprobar.
              </p>

              <Button type="submit" className="w-full font-medium" disabled={!isFormValid}>
                {isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando solicitud...</>
                  : success
                  ? <><CheckCircle2 className="h-4 w-4 mr-2" />¡Solicitud enviada!</>
                  : <><Landmark className="h-4 w-4 mr-2" />Solicitar préstamo</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Mis préstamos</h2>

        {loansLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 py-10 text-center">
            <Landmark className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No tienes préstamos registrados.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tu primera solicitud aparecerá aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                accounts={accounts}
                onPaySuccess={handlePaySuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}