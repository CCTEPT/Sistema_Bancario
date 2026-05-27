import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Eye, ChevronRight, Loader2, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClients } from '@/shared/apis/employee.js';

const PAGE_SIZE = 10;

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Listado de clientes registrados en el sistema.</p>
      </div>

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
                            {client.profilePicture ? (
                              <img src={client.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <UserCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <span className="font-medium text-foreground">
                            {[client.name, client.surname].filter(Boolean).join(' ') || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">@{client.username || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{client.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          client.isEmailVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${client.isEmailVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {client.isEmailVerified ? 'Verificado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/dashboard/employee/clients/${client.id || client._id}`}>
                          <button className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Ver historial
                          </button>
                        </Link>
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
