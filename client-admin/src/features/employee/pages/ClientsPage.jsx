import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Eye, Loader2, UserCircle,
  CreditCard, History, X, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClients, getClientAccounts, getClientMovements } from '@/shared/apis/employee.js';
import { getAccountRequests, approveAccountRequest, rejectAccountRequest } from '@/shared/apis/bank.js';

const PAGE_SIZE = 10;

function formatMoney(amount, currency = 'GTQ') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency}`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function movementIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('deposit') || t.includes('deposito')) return <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />;
  if (t.includes('withdraw') || t.includes('retiro')) return <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />;
  return <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />;
}

// ─── Drawer de detalle de cliente ────────────────────────────────────────────

function ClientDrawer({ client, onClose }) {
  const [tab, setTab] = useState('accounts'); // 'accounts' | 'movements'
  const [accounts, setAccounts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const clientId = client?.id || client?._id;
  const displayName = [client?.name, client?.surname].filter(Boolean).join(' ') || client?.username || '—';

  // Cargar cuentas al abrir
  useEffect(() => {
    if (!clientId) return;
    setAccounts([]);
    setMovements([]);
    setSelectedAccount(null);

    const load = async () => {
      try {
        setLoadingAccounts(true);
        const res = await getClientAccounts(clientId);
        setAccounts(res.accounts || []);
      } catch {
        setAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    };
    load();
  }, [clientId]);

  // Cargar movimientos de la cuenta seleccionada
  useEffect(() => {
    if (!selectedAccount) { setMovements([]); return; }
    const accountId = selectedAccount._id;

    const load = async () => {
      try {
        setLoadingMovements(true);
        const res = await getClientMovements(accountId, { limit: 30 });
        setMovements(res.movements);
      } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        setMovements([]);
      } finally {
        setLoadingMovements(false);
      }
    };
    load();
  }, [selectedAccount]);

  const totalBalance = useMemo(() =>
    accounts.reduce((sum, a) => sum + Number(a.saldo || a.balance || 0), 0),
    [accounts]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">@{client?.username || '—'} · {client?.email || '—'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Balance total */}
        <div className="border-b border-border bg-primary/5 px-5 py-3 flex items-center gap-3">
          <Wallet className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Saldo total aproximado (GTQ)</p>
            {loadingAccounts
              ? <p className="text-sm text-muted-foreground">Calculando...</p>
              : <p className="text-base font-bold text-foreground">{formatMoney(totalBalance, 'GTQ')}</p>
            }
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { key: 'accounts', label: 'Cuentas', icon: CreditCard },
            { key: 'movements', label: 'Transacciones', icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* ── Tab Cuentas ── */}
          {tab === 'accounts' && (
            loadingAccounts ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando cuentas...
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <CreditCard className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Este cliente no tiene cuentas.</p>
              </div>
            ) : (
              accounts.map((account) => {
                const acctId = account.idCuenta || account._id;
                const isSelected = selectedAccount && (selectedAccount.idCuenta || selectedAccount._id) === acctId;
                return (
                  <div
                    key={acctId}
                    className={`rounded-lg border p-4 transition-colors cursor-pointer ${isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/60 bg-background/50 hover:border-border hover:bg-background/80'
                      }`}
                    onClick={() => {
                      setSelectedAccount(isSelected ? null : account);
                      setTab('movements');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {account.tipoCuenta || 'Cuenta'} · {account.divisa || 'GTQ'}
                        </p>
                        <p className="font-mono text-sm font-medium text-foreground mt-0.5">
                          {account.numeroCuenta || '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-foreground">
                          {formatMoney(account.saldo ?? account.balance ?? 0, account.divisa || 'GTQ')}
                        </p>
                        <span className={`text-xs font-medium ${account.estado === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                          {account.estado === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-primary/70">
                      Clic para ver transacciones →
                    </p>
                  </div>
                );
              })
            )
          )}

          {/* ── Tab Transacciones ── */}
          {tab === 'movements' && (
            <>
              {/* Selector de cuenta */}
              {accounts.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {accounts.map((account) => {
                    const acctId = account.idCuenta || account._id;
                    const isSelected = selectedAccount && (selectedAccount.idCuenta || selectedAccount._id) === acctId;
                    return (
                      <button
                        key={acctId}
                        type="button"
                        onClick={() => setSelectedAccount(isSelected ? null : account)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isSelected
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          }`}
                      >
                        {account.numeroCuenta || acctId} · {account.divisa}
                      </button>
                    );
                  })}
                </div>
              )}

              {!selectedAccount ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <History className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Selecciona una cuenta para ver sus transacciones.</p>
                </div>
              ) : loadingMovements ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando transacciones...
                </div>
              ) : movements.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay transacciones para esta cuenta.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {movements.map((mov, i) => {
                    const id = mov.idMovimiento || mov._id || i;
                    const amount = mov.amount ?? 0;
                    const type = mov.movementType || '';
                    const isPositive = /deposit|deposito|credito|credit/i.test(type);
                    return (
                      <div key={id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 px-4 py-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isPositive
                          ? 'border-emerald-500/20 bg-emerald-500/10'
                          : 'border-rose-500/20 bg-rose-500/10'
                          }`}>
                          {movementIcon(type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground capitalize truncate">
                            {mov.descripcion || mov.description || type || 'Movimiento'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(mov.fecha || mov.createdAt || mov.date)}
                          </p>
                        </div>
                        <p className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                          {isPositive ? '+' : '-'}{formatMoney(Math.abs(amount), selectedAccount.divisa || 'GTQ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3">
          <Link to={`/dashboard/employee/clients/${clientId}`}>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Eye className="h-4 w-4" /> Ver perfil completo
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const loadRequests = async () => {
    try {
      setRequestError(null);
      setRequestsLoading(true);
      const res = await getAccountRequests();
      setRequests(res.requests || []);
    } catch (err) {
      setRequestError(err.response?.data?.message || 'No se pudieron cargar las solicitudes.');
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const approveRequest = async (request) => {
    const requestId = request.idSolicitud || request._id || request.id;
    try {
      setReviewingId(requestId);
      await approveAccountRequest(requestId);
      await loadRequests();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'No se pudo aprobar la solicitud.');
    } finally {
      setReviewingId(null);
    }
  };

  const rejectRequest = async (request) => {
    const requestId = request.idSolicitud || request._id || request.id;
    try {
      setReviewingId(requestId);
      await rejectAccountRequest(requestId, 'Solicitud rechazada por el administrador');
      await loadRequests();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'No se pudo rechazar la solicitud.');
    } finally {
      setReviewingId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClients();
        setClients(res.clients || []);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar los clientes.');
      } finally {
        setLoading(false);
      }
    };
    load();
    loadRequests();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const fullName = `${c.name || ''} ${c.surname || ''}`.toLowerCase();
      const username = (c.username || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return fullName.includes(q) || username.includes(q) || email.includes(q);
    });
  }, [clients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id || c._id, c])),
    [clients]
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Listado de clientes registrados en el sistema.
        </p>
      </div>

      {/* ── Solicitudes ── */}
      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold">Solicitudes de apertura de cuenta</CardTitle>
            <p className="text-sm text-muted-foreground">
              {requestsLoading ? 'Cargando...' : `${requests.length} solicitud${requests.length !== 1 ? 'es' : ''}`}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {requestsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando solicitudes...
            </div>
          ) : requestError ? (
            <p className="text-sm text-destructive text-center py-10">{requestError}</p>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No hay solicitudes de apertura de cuenta.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Cuando los clientes soliciten una cuenta, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Cliente</th>
                    <th className="text-left px-6 py-3">Tipo</th>
                    <th className="text-left px-6 py-3">Divisa</th>
                    <th className="text-left px-6 py-3">Estado</th>
                    <th className="text-right px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const client = clientMap.get(request.idUsuario);
                    const requestId = request.idSolicitud || request._id || request.id;
                    const statusValue = request.estado || request.status || 'PENDIENTE';
                    const isPending = /pendiente|pending/i.test(statusValue);
                    return (
                      <tr key={requestId} className="border-b border-border/30 hover:bg-background/40 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground">
                          {client
                            ? `${client.name || '—'} ${client.surname || ''}`.trim()
                            : request.idUsuario || 'Usuario desconocido'}
                        </td>
                        <td className="px-6 py-4 capitalize">{request.tipoCuenta || '—'}</td>
                        <td className="px-6 py-4 uppercase">{request.divisa || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium border-amber-500/20 bg-amber-500/10 text-amber-400">
                            {statusValue}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <div className="flex justify-end gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => approveRequest(request)}
                                disabled={reviewingId === requestId}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectRequest(request)}
                                disabled={reviewingId === requestId}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{statusValue}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Tabla de clientes ── */}
      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold">
              {loading ? 'Cargando...' : `${filtered.length} cliente${filtered.length !== 1 ? 's' : ''}`}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre, usuario o email..."
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 w-72 transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando clientes...
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-10">{error}</p>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/30 mb-3">
                <Users className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No se encontraron clientes</p>
              {search && <p className="text-xs text-muted-foreground/60 mt-1">Intenta con otro término de búsqueda</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Cliente</th>
                    <th className="text-left px-6 py-3">Username</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Estado</th>
                    <th className="text-right px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((client) => (
                    <tr key={client.id || client._id} className="border-b border-border/30 hover:bg-background/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {client.profilePicture
                              ? <img src={client.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                              : <UserCircle className="w-4 h-4 text-primary" />}
                          </div>
                          <span className="font-medium text-foreground">
                            {[client.name, client.surname].filter(Boolean).join(' ') || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">@{client.username || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{client.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${client.isEmailVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${client.isEmailVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {client.isEmailVerified ? 'Verificado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* ── Botones de acción ── */}
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedClient(client)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                            title="Ver cuentas y transacciones"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Cuentas
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedClient(client); }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title="Ver transacciones"
                          >
                            <History className="w-3.5 h-3.5" /> Movimientos
                          </button>
                          <Link to={`/dashboard/employee/clients/${client.id || client._id}`}>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                              title="Ver perfil completo"
                            >
                              <Eye className="w-3.5 h-3.5" /> Perfil
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Página {safePage} de {totalPages} — {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border/50 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Anterior
                </button>
                <button disabled={safePage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border/50 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer de detalle */}
      {selectedClient && (
        <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
}