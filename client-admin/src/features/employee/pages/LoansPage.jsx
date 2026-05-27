import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLoans, approveLoan, rejectLoan } from '@/shared/apis/employee.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', icon: Clock, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  PENDIENTE: { label: 'Pendiente', icon: Clock, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  APPROVED: { label: 'Aprobado', icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  APROBADO: { label: 'Aprobado', icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  REJECTED: { label: 'Rechazado', icon: XCircle, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  RECHAZADO: { label: 'Rechazado', icon: XCircle, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

function RejectModal({ loan, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(loan, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
        <h3 className="text-base font-semibold mb-1">Rechazar solicitud</h3>
        <p className="text-sm text-muted-foreground mb-4">
          ¿Estás seguro de rechazar el préstamo de <span className="text-foreground font-medium">{loan.clientName || loan.userId || '—'}</span>?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del rechazo (opcional)..."
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/20 resize-none transition-all mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/30 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = async () => {
    try {
      const res = await getLoans();
      const list = Array.isArray(res?.loans) ? res.loans : Array.isArray(res) ? res : [];
      setLoans(list);
      setBackendAvailable(true);
    } catch (err) {
      if (err.response?.status === 404 || !err.response) {
        setBackendAvailable(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (loan) => {
    try {
      await approveLoan(loan._id || loan.id);
      toast.success('Préstamo aprobado.');
      setLoans((prev) =>
        prev.map((l) => (l._id === loan._id || l.id === loan.id) ? { ...l, status: 'APPROVED', estado: 'APROBADO' } : l)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al aprobar.');
    }
  };

  const handleReject = async (loan, reason) => {
    try {
      await rejectLoan(loan._id || loan.id, reason);
      toast.success('Préstamo rechazado.');
      setLoans((prev) =>
        prev.map((l) => (l._id === loan._id || l.id === loan.id) ? { ...l, status: 'REJECTED', estado: 'RECHAZADO' } : l)
      );
      setRejectTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al rechazar.');
    }
  };

  const filtered = (Array.isArray(loans) ? loans : []).filter((l) => {
    if (filterStatus === 'ALL') return true;
    const s = (l.status || l.estado || '').toUpperCase();
    return s === filterStatus;
  });

  const safeLoans = Array.isArray(loans) ? loans : [];
  const counts = {
    pending: safeLoans.filter((l) => ['PENDING', 'PENDIENTE'].includes((l.status || l.estado || '').toUpperCase())).length,
    approved: safeLoans.filter((l) => ['APPROVED', 'APROBADO'].includes((l.status || l.estado || '').toUpperCase())).length,
    rejected: safeLoans.filter((l) => ['REJECTED', 'RECHAZADO'].includes((l.status || l.estado || '').toUpperCase())).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Préstamos</h1>
        <p className="text-sm text-muted-foreground mt-1">Aprueba o rechaza solicitudes de préstamos.</p>
      </div>

      {!backendAvailable && (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Módulo de préstamos no disponible</p>
            <p className="text-xs mt-1 opacity-80">El backend de préstamos está pendiente de implementación. Esta vista está lista para conectarse cuando el endpoint <code className="font-mono">/loans</code> esté disponible.</p>
          </div>
        </div>
      )}

      <div className="grid gap-3 grid-cols-3">
        {[
          { label: 'Pendientes', value: counts.pending, bg: 'bg-amber-500/10', text: 'text-amber-400', status: 'PENDING' },
          { label: 'Aprobados', value: counts.approved, bg: 'bg-emerald-500/10', text: 'text-emerald-400', status: 'APPROVED' },
          { label: 'Rechazados', value: counts.rejected, bg: 'bg-rose-500/10', text: 'text-rose-400', status: 'REJECTED' },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() => setFilterStatus(filterStatus === s.status ? 'ALL' : s.status)}
            className={`p-4 rounded-xl border transition-all text-left ${
              filterStatus === s.status ? `${s.bg} border-current ${s.text}` : 'bg-card/60 border-border/50 hover:border-primary/20'
            }`}
          >
            <p className={`text-2xl font-bold ${filterStatus === s.status ? '' : 'text-foreground'}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${filterStatus === s.status ? '' : 'text-muted-foreground'}`}>{s.label}</p>
          </button>
        ))}
      </div>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando préstamos...
            </div>
          ) : !backendAvailable || filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/30 mb-3">
                <ClipboardList className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {!backendAvailable ? 'Endpoint pendiente de implementación' : 'No hay solicitudes'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Cliente</th>
                    <th className="text-left px-6 py-3">Monto</th>
                    <th className="text-left px-6 py-3">Plazo</th>
                    <th className="text-left px-6 py-3">Fecha</th>
                    <th className="text-left px-6 py-3">Estado</th>
                    <th className="text-right px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loan) => {
                    const statusKey = (loan.status || loan.estado || 'PENDING').toUpperCase();
                    const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
                    const StatusIcon = cfg.icon;
                    const isPending = ['PENDING', 'PENDIENTE'].includes(statusKey);
                    const date = loan.createdAt || loan.fecha;
                    return (
                      <tr key={loan._id || loan.id} className="border-b border-border/30 hover:bg-background/40 transition-colors">
                        <td className="px-6 py-4 font-medium">{loan.clientName || loan.userName || loan.userId || '—'}</td>
                        <td className="px-6 py-4 font-mono">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: loan.currency || 'GTQ' }).format(loan.amount || loan.monto || 0)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{loan.term || loan.plazo ? `${loan.term || loan.plazo} meses` : '—'}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {date ? format(new Date(date), 'dd/MM/yyyy') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isPending ? (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleApprove(loan)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                              </button>
                              <button
                                onClick={() => setRejectTarget(loan)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Rechazar
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-right">—</p>
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

      {rejectTarget && (
        <RejectModal
          loan={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}
