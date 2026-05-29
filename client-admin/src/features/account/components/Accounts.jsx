import { useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2, Plus, Star, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../features/auth/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  approveAccountRequest,
  createBankAccount,
  getAccountRequests,
  getAllAccounts,
  getUserAccounts,
  rejectAccountRequest,
  updateAccountStatus,
} from "@/shared/apis/bank";
import { getCurrencies } from "@/shared/apis/financial";
import {
  getAccountId as getFavoriteAccountId,
  loadFavoriteAccounts,
  toggleFavoriteAccount,
  pruneInactiveFavorites,
} from "@/shared/utils/accountFavorites";

const FALLBACK_CURRENCIES = [
  { code: "GTQ", name: "Quetzal guatemalteco" },
  { code: "USD", name: "Dolar estadounidense" },
  { code: "EUR", name: "Euro" },
];

const ACCOUNT_TYPES = [
  { value: "ahorro", label: "Ahorro" },
  { value: "corriente", label: "Corriente" },
];

const ROLE_LABELS = {
  ADMIN_ROLE: "Administrador",
  EMPLOYEE_ROLE: "Empleado",
  USER_ROLE: "Cliente",
};

function getAccountId(account) {
  return getFavoriteAccountId(account);
}

function getAccountNumber(account) {
  return (
    account?.numeroCuenta ||
    account?.accountNumber ||
    account?.number ||
    account?.raw?.numeroCuenta ||
    account?.raw?.accountNumber ||
    ""
  );
}

function getRequestId(request) {
  return request?.idSolicitud || request?._id || request?.id;
}

function getOwnerName(account) {
  return (
    account?.ownerName ||
    account?.nombrePropietario ||
    account?.usuario?.nombre ||
    account?.usuario?.name ||
    account?.user?.nombre ||
    account?.user?.name ||
    account?.owner?.nombre ||
    account?.owner?.name ||
    (account?.ownerFirstName
      ? `${account.ownerFirstName} ${account.ownerLastName || ""}`.trim()
      : null) ||
    null
  );
}

function normalizeAccount(account) {
  return {
    ...account,
    id: getAccountId(account),
    accountNumber: getAccountNumber(account),
    tipoCuenta: account?.tipoCuenta || account?.accountType || "cuenta",
    divisa: (account?.divisa || account?.currency || "GTQ").toUpperCase(),
    saldo: Number(account?.saldo ?? account?.balance ?? 0),
    estado: account?.estado || account?.status || "ACTIVE",
    ownerName: getOwnerName(account),
    ownerUserId: account?.idUsuario || account?.userId || account?.user?.id || account?.user?._id,
  };
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function CreateAccountModal({ open, onClose, onCreate, currencies, creating, existingAccounts, existingRequests, isReviewer }) {
  const [tipoCuenta, setTipoCuenta] = useState("ahorro");
  const [divisa, setDivisa] = useState("GTQ");

  const selectedExists = existingAccounts.some((a) => a.tipoCuenta === tipoCuenta && a.divisa === divisa);
  const selectedPending = existingRequests.some((r) => r.tipoCuenta === tipoCuenta && r.divisa === divisa);

  useEffect(() => {
    if (open && currencies.length > 0 && !currencies.some((c) => c.code === divisa)) {
      setDivisa(currencies[0].code);
    }
  }, [currencies, divisa, open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onCreate({ tipoCuenta, divisa });
    if (result?.success) {
      setTipoCuenta("ahorro");
      setDivisa(currencies[0]?.code || "GTQ");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar modal" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Crear cuenta bancaria</h2>
            <p className="text-xs text-muted-foreground">Selecciona el tipo de cuenta y la divisa.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Tipo de cuenta</span>
            <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30">
              {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Divisa</span>
            <select value={divisa} onChange={(e) => setDivisa(e.target.value)} className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30">
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.name || c.code}</option>)}
            </select>
          </label>
          {selectedExists && (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              Ya tienes una cuenta {tipoCuenta} en {divisa}.
            </p>
          )}
          {!selectedExists && selectedPending && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Ya existe una solicitud pendiente para una cuenta {tipoCuenta} en {divisa}.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">Cancelar</button>
          <button type="submit" disabled={creating || selectedPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isReviewer ? "Crear cuenta" : "Solicitar cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Tabla reutilizable ───────────────────────────────────────────────────────

function AccountsTable({ accounts, favoriteAccountIds, canToggleAccountStatus, savingAccountId, showOwner, onToggleFavorite, onToggleStatus }) {
  return (
    <ScrollArea className="max-h-[60vh] rounded-md border border-border/50">
      <table className="w-full min-w-full text-left text-sm">
        <thead className="text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Numero</th>
            {showOwner && <th className="px-4 py-3">Propietario</th>}
            <th className="px-4 py-3">Favorita</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Divisa</th>
            <th className="px-4 py-3">Saldo</th>
            <th className="px-4 py-3">Estado</th>
            {canToggleAccountStatus && <th className="px-4 py-3">Activacion</th>}
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => {
            const acctKey = account.idCuenta || account.id || account._id;
            const isSaving = savingAccountId === acctKey;
            const isFav = favoriteAccountIds.includes(String(account.id));
            return (
              <tr key={account.id} className="border-t border-border/50 even:bg-slate-950/40">
                <td className="px-4 py-3 font-mono">{account.accountNumber || <span className="text-muted-foreground">Sin numero</span>}</td>
                {showOwner && (
                  <td className="px-4 py-3">
                    {account.ownerName
                      ? <span className="font-medium text-foreground">{account.ownerName}</span>
                      : <span className="text-xs text-muted-foreground italic">Sin nombre</span>}
                  </td>
                )}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(account)}
                    disabled={account.estado !== "ACTIVE"}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                      account.estado !== "ACTIVE"
                        ? "opacity-40 cursor-not-allowed border-border/30 text-muted-foreground/50"
                        : isFav
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                        : "border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    aria-label={isFav ? "Quitar cuenta favorita" : "Marcar cuenta favorita"}
                  >
                    <Star className="h-4 w-4" fill={account.estado !== "ACTIVE" ? "none" : isFav ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3 capitalize">{account.tipoCuenta}</td>
                <td className="px-4 py-3">{account.divisa}</td>
                <td className="px-4 py-3 font-mono">{formatMoney(account.saldo, account.divisa)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${account.estado === "ACTIVE" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-rose-500/20 bg-rose-500/10 text-rose-400"}`}>
                    {account.estado === "ACTIVE" ? "Activa" : "Desactivada"}
                  </span>
                </td>
                {canToggleAccountStatus && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(account)}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        account.estado === "ACTIVE"
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                      {account.estado === "ACTIVE" ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollArea>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const Accounts = () => {
  const { user } = useAuthStore();
  const [ownAccounts, setOwnAccounts] = useState([]);
  const [clientAccounts, setClientAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [currencies, setCurrencies] = useState(FALLBACK_CURRENCIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [savingAccountId, setSavingAccountId] = useState(null);
  const [favoriteAccountIds, setFavoriteAccountIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "Usuario";
  const currentUserId = user?.id || user?._id || user?.Id;
  const isReviewer = user?.role === "ADMIN_ROLE" || user?.role === "EMPLOYEE_ROLE";
  const canToggleAccountStatus = true;

  const normalizedOwn = useMemo(() => ownAccounts.map(normalizeAccount), [ownAccounts]);

  // Para el modal — cuentas y solicitudes propias
  const currentUserRequests = useMemo(() => {
    if (!currentUserId || isReviewer) return requests;
    return requests.filter((r) => r.idUsuario === currentUserId);
  }, [currentUserId, isReviewer, requests]);

  const loadOwnAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserAccounts();
      const fetched = response.accounts || [];
      setOwnAccounts(fetched);
      const pruned = pruneInactiveFavorites(currentUserId, fetched);
      setFavoriteAccountIds(pruned);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "No se pudieron cargar las cuentas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Llamar a /accounts/manage solo si es admin o employee
  const loadClientAccounts = async () => {
    if (!isReviewer) return;
    try {
      setIsLoadingClients(true);
      const response = await getAllAccounts();
      const all = (response.accounts || []).map(normalizeAccount);
      // Excluir las cuentas propias del revisor
      setClientAccounts(all.filter((a) => a.ownerUserId && a.ownerUserId !== currentUserId));
    } catch {
      setClientAccounts([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await getAccountRequests();
      setRequests(response.requests || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    setFavoriteAccountIds(loadFavoriteAccounts(currentUserId));
    loadOwnAccounts();
    loadClientAccounts();
    loadRequests();

    const loadCurrencies = async () => {
      try {
        const data = await getCurrencies();
        const loaded = (data || [])
          .map((c) => ({ code: c.code?.toUpperCase(), name: c.name || c.code }))
          .filter((c) => c.code);
        if (loaded.length > 0) setCurrencies(loaded);
      } catch {
        setCurrencies(FALLBACK_CURRENCIES);
      }
    };
    loadCurrencies();
  }, [currentUserId]);

  const toggleFavorite = (account) => {
    if (account.estado !== "ACTIVE") {
      toast.error("No se puede agregar una cuenta desactivada a favoritos");
      return;
    }
    const accountId = getAccountId(account);
    const next = toggleFavoriteAccount(currentUserId, accountId);
    setFavoriteAccountIds(next);
    toast.success(next.includes(accountId) ? "Cuenta anclada al dashboard" : "Cuenta retirada del dashboard");
  };

  const createAccount = async ({ tipoCuenta, divisa }) => {
    try {
      setIsCreating(true);
      const response = await createBankAccount({ tipoCuenta, divisa });
      if (response.request) {
        setRequests((cur) => [response.request, ...cur]);
        toast.success(response.message || "Solicitud de cuenta enviada");
      } else {
        toast.success(`Cuenta ${divisa} creada correctamente`);
      }
      await loadOwnAccounts();
      await loadClientAccounts();
      await loadRequests();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || "No se pudo crear la cuenta.";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAccountStatus = async (account) => {
    const accountId = account.idCuenta || account.id || account._id;
    const nextStatus = account.estado === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      setSavingAccountId(accountId);
      await updateAccountStatus(accountId, nextStatus);
      toast.success(nextStatus === "ACTIVE" ? "Cuenta activada" : "Cuenta desactivada");
      await loadOwnAccounts();
      await loadClientAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "No se pudo actualizar la cuenta");
    } finally {
      setSavingAccountId(null);
    }
  };

  const tableProps = {
    favoriteAccountIds,
    canToggleAccountStatus,
    savingAccountId,
    onToggleFavorite: toggleFavorite,
    onToggleStatus: toggleAccountStatus,
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#83fb7f]">
            {isReviewer ? "Gestión de Cuentas" : "Mis Cuentas"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isReviewer
              ? "Crea cuentas directamente y administra las cuentas del sistema."
              : "Solicita cuentas por divisa; un empleado o administrador debe aprobarlas."}{" "}
            Rol actual: {roleLabel}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {isReviewer ? "Nueva cuenta" : "Solicitar cuenta"}
        </button>
      </div>

      {/* ── Mis cuentas ── */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {isReviewer ? "Mis cuentas" : "Cuentas activas"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando cuentas...
            </p>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <button type="button" onClick={loadOwnAccounts} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary">Reintentar</button>
            </div>
          ) : normalizedOwn.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium">No se encontraron cuentas activas.</p>
              <p className="mt-1 text-xs text-muted-foreground">Crea una cuenta en GTQ, USD, EUR u otra divisa configurada.</p>
              <button type="button" onClick={() => setModalOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                {isReviewer ? "Crear cuenta" : "Solicitar cuenta"}
              </button>
            </div>
          ) : (
            <AccountsTable accounts={normalizedOwn} showOwner={false} {...tableProps} />
          )}
        </CardContent>
      </Card>

      {/* ── Cuentas de clientes (solo admin/employee) ── */}
      {isReviewer && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Cuentas de clientes
              {!isLoadingClients && clientAccounts.length > 0 && (
                <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {clientAccounts.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando cuentas de clientes...
              </p>
            ) : clientAccounts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">No hay cuentas de clientes registradas.</p>
              </div>
            ) : (
              <AccountsTable accounts={clientAccounts} showOwner={true} {...tableProps} />
            )}
          </CardContent>
        </Card>
      )}

      <CreateAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createAccount}
        currencies={currencies}
        creating={isCreating}
        existingAccounts={normalizedOwn}
        existingRequests={currentUserRequests}
        isReviewer={isReviewer}
      />
    </div>
  );
};