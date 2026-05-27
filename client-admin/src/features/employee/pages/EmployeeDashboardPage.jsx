import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, CreditCard, ArrowRightLeft, ClipboardList,
  ChevronRight, Loader2, UserCheck, TrendingUp, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/store/authStore.js';
import { getClients, getAllMovements, getLoans } from '@/shared/apis/employee.js';
import { format } from 'date-fns';

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, href }) {
  const inner = (
    <Card className="bg-card/60 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          {href && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

function QuickAction({ href, icon: Icon, label, description, colorClass }) {
  return (
    <Link to={href}>
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background/20 hover:bg-background/60 hover:border-primary/30 transition-all duration-200 cursor-pointer">
        <div className={`p-2 rounded-lg ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </Link>
  );
}

const TX_TYPE = {
  DEPOSIT: { label: 'Depósito', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  WITHDRAW: { label: 'Retiro', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  TRANSFER_OUT: { label: 'Transferencia', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  TRANSFER_IN: { label: 'Transferencia', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  CHECK_CASH: { label: 'Cheque', color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export default function EmployeeDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ clients: 0, movements: 0, pendingLoans: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buen día';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, movementsRes] = await Promise.allSettled([
          getClients(),
          getAllMovements({ limit: 20 }),
        ]);

        let loansPending = 0;
        try {
          const loansRes = await getLoans();
          loansPending = (loansRes.loans || []).filter(
            (l) => l.status === 'PENDING' || l.estado === 'PENDIENTE'
          ).length;
        } catch {
          loansPending = 0;
        }

        const rawClients = clientsRes.status === 'fulfilled' ? clientsRes.value : {};
        const clients = Array.isArray(rawClients?.clients) ? rawClients.clients
          : Array.isArray(rawClients?.data) ? rawClients.data
          : Array.isArray(rawClients) ? rawClients
          : [];

        const rawMov = movementsRes.status === 'fulfilled' ? movementsRes.value : {};
        const movements = Array.isArray(rawMov?.movements) ? rawMov.movements
          : Array.isArray(rawMov?.data?.movements) ? rawMov.data.movements
          : Array.isArray(rawMov?.data) ? rawMov.data
          : Array.isArray(rawMov) ? rawMov
          : [];

        setStats({
          clients: clients.length,
          movements: movements.length,
          pendingLoans: loansPending,
        });
        setRecentTx(movements.slice(0, 6));
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">
            {user?.name ? user.name.split(' ')[0] : user?.username || 'Empleado'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Panel de operaciones — gestiona clientes y operaciones del banco.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-card/50 border border-border/40 rounded-lg px-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Empleado activo
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Clientes registrados"
          value={stats.clients}
          subtitle="Usuarios con rol cliente"
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          href="/dashboard/employee/clients"
        />
        <StatCard
          title="Operaciones recientes"
          value={stats.movements}
          subtitle="Últimas transacciones"
          icon={ArrowRightLeft}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          href="/dashboard/employee/transactions"
        />
        <StatCard
          title="Préstamos pendientes"
          value={stats.pendingLoans}
          subtitle="Requieren aprobación"
          icon={ClipboardList}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          href="/dashboard/employee/loans"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 bg-card/60 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Últimas transacciones del sistema</p>
              </div>
              <Link to="/dashboard/employee/transactions">
                <button className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground flex items-center">
                  Ver todo <ChevronRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-3">
                  <ArrowRightLeft className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTx.map((tx, i) => {
                  const cfg = TX_TYPE[tx.movementType] || { label: tx.movementType, color: 'text-foreground', bg: 'bg-muted/30' };
                  const date = tx.date || tx.createdAt || tx.updatedAt;
                  return (
                    <div key={tx._id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background/50 transition-colors">
                      <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
                        <ArrowRightLeft className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {date ? format(new Date(date), 'dd MMM yyyy, HH:mm') : '—'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${cfg.color}`}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency || 'GTQ' }).format(tx.amount || 0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card className="bg-card/60 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Acciones rápidas</CardTitle>
              <p className="text-xs text-muted-foreground">Operaciones frecuentes</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <QuickAction
                href="/dashboard/employee/clients"
                icon={Users}
                label="Ver clientes"
                description="Consultar clientes registrados"
                colorClass="bg-primary/10 text-primary"
              />
              <QuickAction
                href="/dashboard/employee/create-account"
                icon={CreditCard}
                label="Abrir cuenta"
                description="Crear cuenta para un cliente"
                colorClass="bg-emerald-500/10 text-emerald-400"
              />
              <QuickAction
                href="/dashboard/employee/loans"
                icon={ClipboardList}
                label="Préstamos"
                description="Aprobar o rechazar solicitudes"
                colorClass="bg-amber-500/10 text-amber-400"
              />
              <QuickAction
                href="/dashboard/employee/transactions"
                icon={ArrowRightLeft}
                label="Transacciones"
                description="Consulta y soporte de operaciones"
                colorClass="bg-blue-500/10 text-blue-400"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
