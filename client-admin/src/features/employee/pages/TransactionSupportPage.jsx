import { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, ArrowDownRight, ArrowUpRight, ArrowRightLeft,
  Banknote, RefreshCw, Loader2, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllMovements } from '@/shared/apis/employee.js';
import { format } from 'date-fns';

const TX_CONFIG = {
  DEPOSIT: { label: 'Depósito', icon: ArrowDownRight, bg: 'bg-emerald-500/10', color: 'text-emerald-400', amountColor: 'text-emerald-400', prefix: '+', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  WITHDRAW: { label: 'Retiro', icon: ArrowUpRight, bg: 'bg-rose-500/10', color: 'text-rose-400', amountColor: 'text-rose-400', prefix: '-', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  TRANSFER_OUT: { label: 'Transferencia', icon: ArrowRightLeft, bg: 'bg-blue-500/10', color: 'text-blue-400', amountColor: 'text-blue-400', prefix: '', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  TRANSFER_IN: { label: 'Transferencia', icon: ArrowRightLeft, bg: 'bg-blue-500/10', color: 'text-blue-400', amountColor: 'text-blue-400', prefix: '', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CHECK_CASH: { label: 'Cheque', icon: Banknote, bg: 'bg-purple-500/10', color: 'text-purple-400', amountColor: 'text-foreground', prefix: '', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  CONVERSION: { label: 'Conversión', icon: RefreshCw, bg: 'bg-orange-500/10', color: 'text-orange-400', amountColor: 'text-foreground', prefix: '', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
};

const PAGE_SIZE = 15;

function fmt(amount, currency = 'GTQ') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0);
}

export default function TransactionSupportPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAllMovements({ limit: 500 })
      .then((res) => {
        const list = Array.isArray(res?.movements) ? res.movements
          : Array.isArray(res?.data?.movements) ? res.data.movements
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res
          : [];
        setAll(list);
      })
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (Array.isArray(all) ? all : []).filter((tx) => {
      const matchType = typeFilter === 'ALL' || tx.movementType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || (tx.status || '').toUpperCase() === statusFilter;
      const matchSearch = !q
        || (tx.accountNumber || '').toLowerCase().includes(q)
        || (tx.description || '').toLowerCase().includes(q)
        || (tx._id || '').toLowerCase().includes(q)
        || (tx.amount?.toString() || '').includes(q);
      return matchType && matchStatus && matchSearch;
    });
  }, [all, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  const hasFilters = search || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  const types = ['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER_OUT', 'TRANSFER_IN', 'CHECK_CASH'];
  const statuses = ['ALL', 'COMPLETED', 'PENDING', 'FAILED'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Soporte de transacciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Consulta y filtra todas las operaciones del sistema.</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/50 border border-border/40 rounded-lg px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {all.length} operaciones cargadas
          </div>
        )}
      </div>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" /> Limpiar filtros
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por número de cuenta, descripción o ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setPage(1); }}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    typeFilter === t
                      ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                      : 'border-border/50 text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {t === 'ALL' ? 'Todos los tipos' : (TX_CONFIG[t]?.label || t)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 border-l border-border/40 pl-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    statusFilter === s
                      ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                      : 'border-border/50 text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {s === 'ALL' ? 'Todos los estados' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {loading ? 'Cargando...' : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando operaciones...
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/30 mb-3">
                <ArrowRightLeft className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No se encontraron operaciones</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-primary underline mt-2">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Tipo</th>
                    <th className="text-left px-6 py-3">Cuenta</th>
                    <th className="text-left px-6 py-3">Monto</th>
                    <th className="text-left px-6 py-3">Fecha</th>
                    <th className="text-left px-6 py-3">Estado</th>
                    <th className="text-left px-6 py-3">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx, i) => {
                    const cfg = TX_CONFIG[tx.movementType] || TX_CONFIG.DEPOSIT;
                    const Icon = cfg.icon;
                    const date = tx.date || tx.createdAt || tx.updatedAt;
                    return (
                      <tr key={tx._id || i} className="border-b border-border/30 hover:bg-background/40 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${cfg.bg} shrink-0`}>
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                          {tx.accountNumber || tx.accountId || '—'}
                        </td>
                        <td className={`px-6 py-3 font-semibold font-mono ${cfg.amountColor}`}>
                          {cfg.prefix}{fmt(tx.amount, tx.currency)}
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">
                          {date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '—'}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                            tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : tx.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {tx.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                          {tx.description || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Página {safePage} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border/50 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border/50 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
