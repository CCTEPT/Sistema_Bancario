import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowDownRight, ArrowUpRight, ArrowRightLeft,
  Banknote, Loader2, UserCircle, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClients, getClientAccounts, getClientMovements } from '@/shared/apis/employee.js';
import { format } from 'date-fns';

const TX_CONFIG = {
  DEPOSIT: { label: 'Depósito', icon: ArrowDownRight, bg: 'bg-emerald-500/10', color: 'text-emerald-400', amountColor: 'text-emerald-400', prefix: '+' },
  WITHDRAW: { label: 'Retiro', icon: ArrowUpRight, bg: 'bg-rose-500/10', color: 'text-rose-400', amountColor: 'text-rose-400', prefix: '-' },
  TRANSFER_OUT: { label: 'Transferencia saliente', icon: ArrowRightLeft, bg: 'bg-blue-500/10', color: 'text-blue-400', amountColor: 'text-rose-400', prefix: '-' },
  TRANSFER_IN: { label: 'Transferencia entrante', icon: ArrowRightLeft, bg: 'bg-blue-500/10', color: 'text-blue-400', amountColor: 'text-emerald-400', prefix: '+' },
  CHECK_CASH: { label: 'Cheque', icon: Banknote, bg: 'bg-purple-500/10', color: 'text-purple-400', amountColor: 'text-foreground', prefix: '' },
  CONVERSION: { label: 'Conversión', icon: RefreshCw, bg: 'bg-orange-500/10', color: 'text-orange-400', amountColor: 'text-foreground', prefix: '' },
};

function fmt(amount, currency = 'GTQ') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0);
}

export default function ClientHistoryPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, accountsRes] = await Promise.allSettled([
          getClients(),
          getClientAccounts(clientId),
        ]);

        if (clientsRes.status === 'fulfilled') {
          const found = clientsRes.value.clients.find(
            (c) => c.id === clientId || c._id === clientId
          );
          setClient(found || { id: clientId, username: clientId });
        }

        if (accountsRes.status === 'fulfilled') {
          const accs = accountsRes.value.accounts || [];
          setAccounts(accs);
          if (accs.length > 0) {
            setSelectedAccount(accs[0]);
          }
        }
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  useEffect(() => {
    if (!selectedAccount) return;
    const accountId = selectedAccount._id || selectedAccount.idCuenta || selectedAccount.id;
    if (!accountId) return;

    setMovementsLoading(true);
    getClientMovements(accountId, { limit: 100 })
      .then((res) => setMovements(res.data || res.movements || []))
      .catch(() => setMovements([]))
      .finally(() => setMovementsLoading(false));
  }, [selectedAccount]);

  const totalDeposited = movements
    .filter((m) => ['DEPOSIT', 'TRANSFER_IN'].includes(m.movementType))
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);

  const totalWithdrawn = movements
    .filter((m) => ['WITHDRAW', 'TRANSFER_OUT'].includes(m.movementType))
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-start gap-4">
        <Link to="/dashboard/employee/clients">
          <button className="p-2 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {client?.profilePicture ? (
              <img src={client.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <UserCircle className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              {[client?.name, client?.surname].filter(Boolean).join(' ') || client?.username || '—'}
            </h1>
            <p className="text-sm text-muted-foreground">@{client?.username} · Historial de transacciones</p>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">Este cliente no tiene cuentas bancarias.</p>
            <Link to="/dashboard/employee/create-account" className="mt-3 text-xs text-primary underline">
              Crear cuenta para este cliente
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {accounts.map((acc) => {
              const id = acc._id || acc.idCuenta || acc.id;
              const selId = selectedAccount?._id || selectedAccount?.idCuenta || selectedAccount?.id;
              const isSelected = id === selId;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`px-4 py-2.5 rounded-xl text-sm border transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                      : 'bg-card/60 border-border/50 text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  <span className="font-mono">{acc.numeroCuenta || id}</span>
                  <span className="ml-2 text-xs opacity-70">{acc.tipoCuenta} · {acc.divisa}</span>
                </button>
              );
            })}
          </div>

          {selectedAccount && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-4 rounded-xl bg-card/60 border border-border/50">
                  <p className="text-xs text-muted-foreground">Saldo actual</p>
                  <p className="text-xl font-bold mt-1">{fmt(selectedAccount.saldo, selectedAccount.divisa)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedAccount.tipoCuenta}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">Total ingresado</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{fmt(totalDeposited, selectedAccount.divisa)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Depósitos + entradas</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <p className="text-xs text-muted-foreground">Total egresado</p>
                  <p className="text-xl font-bold text-rose-400 mt-1">{fmt(totalWithdrawn, selectedAccount.divisa)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Retiros + salidas</p>
                </div>
              </div>

              <Card className="bg-card/60 backdrop-blur border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Movimientos de {selectedAccount.numeroCuenta || 'cuenta'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {movementsLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Cargando movimientos...
                    </div>
                  ) : movements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ArrowRightLeft className="h-6 w-6 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">Sin movimientos en esta cuenta</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {movements.map((tx, i) => {
                        const cfg = TX_CONFIG[tx.movementType] || TX_CONFIG.DEPOSIT;
                        const Icon = cfg.icon;
                        const date = tx.date || tx.createdAt || tx.updatedAt;
                        return (
                          <div key={tx._id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-background/30 transition-colors">
                            <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{cfg.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {date ? format(new Date(date), 'dd MMM yyyy, HH:mm') : '—'}
                                {tx.description ? ` · ${tx.description}` : ''}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-semibold ${cfg.amountColor}`}>
                                {cfg.prefix}{fmt(tx.amount, tx.currency || selectedAccount.divisa)}
                              </p>
                              <p className="text-xs text-muted-foreground uppercase">{tx.status || '—'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
