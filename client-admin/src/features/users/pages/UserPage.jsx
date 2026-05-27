import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Search, Loader2, ShieldCheck, User, UserCog, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const ROLES = ['USER_ROLE', 'EMPLOYEE_ROLE', 'ADMIN_ROLE'];

const ROLE_STYLE = {
  ADMIN_ROLE:     { label: 'Admin',     bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20' },
  EMPLOYEE_ROLE:  { label: 'Empleado',  bg: 'bg-primary/10',    text: 'text-primary',    border: 'border-primary/20' },
  USER_ROLE:      { label: 'Cliente',   bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_STYLE[role] || { label: role, bg: 'bg-muted/20', text: 'text-muted-foreground', border: 'border-border/40' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function RoleSelector({ user, onSave, saving }) {
  const [selected, setSelected] = useState(user.role || 'USER_ROLE');
  const changed = selected !== user.role;

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="text-xs rounded-lg border border-border bg-background/60 px-2 py-1.5 outline-none focus:border-primary/60 transition-colors"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_STYLE[r]?.label || r}</option>
        ))}
      </select>
      {changed && (
        <button
          onClick={() => onSave(user, selected)}
          disabled={saving}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Guardar
        </button>
      )}
    </div>
  );
}

export const UserPage = () => {
  const { users, loading, getAllUsers, updateUserRole } = useUserManagementStore();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === 'ADMIN_ROLE';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return safeUsers.filter((u) => {
      const fullName = `${u.name || ''} ${u.surname || ''}`.toLowerCase();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const matchSearch = !q || fullName.includes(q) || username.includes(q) || email.includes(q);
      const matchRole = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter;
      return matchSearch && matchRole;
    });
  }, [safeUsers, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safePage]);

  const handleSaveRole = async (user, newRole) => {
    const id = user.id || user._id;
    setSavingId(id);
    const res = await updateUserRole(id, newRole);
    setSavingId(null);
    if (res.success) {
      toast.success(`Rol actualizado a ${ROLE_STYLE[newRole]?.label || newRole}`);
    } else {
      toast.error(res.error || 'Error al actualizar el rol');
    }
  };

  const counts = {
    total: safeUsers.length,
    admins: safeUsers.filter((u) => u.role === 'ADMIN_ROLE').length,
    employees: safeUsers.filter((u) => u.role === 'EMPLOYEE_ROLE').length,
    clients: safeUsers.filter((u) => u.role === 'USER_ROLE').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona los usuarios registrados y sus roles.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, icon: Users, color: 'text-foreground', bg: 'bg-muted/20' },
          { label: 'Admins', value: counts.admins, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Empleados', value: counts.employees, icon: UserCog, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Clientes', value: counts.clients, icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card/60 backdrop-blur border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre, username o email..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['ALL', ...ROLES].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  roleFilter === r
                    ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                    : 'border-border/50 text-muted-foreground hover:border-primary/20'
                }`}
              >
                {r === 'ALL' ? 'Todos' : (ROLE_STYLE[r]?.label || r)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {loading && safeUsers.length === 0
              ? 'Cargando...'
              : `${filteredUsers.length} usuario${filteredUsers.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && safeUsers.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando usuarios...
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/30 mb-3">
                <Users className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Usuario</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Rol actual</th>
                    {isAdmin && <th className="text-left px-6 py-3">Cambiar rol</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u) => {
                    const id = u.id || u._id;
                    const displayName = [u.name, u.surname].filter(Boolean).join(' ') || u.username || '—';
                    return (
                      <tr key={id} className="border-b border-border/30 hover:bg-background/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground uppercase">
                              {(u.name || u.username || '?')[0]}
                            </div>
                            <div>
                              <p className="font-medium">{displayName}</p>
                              <p className="text-xs text-muted-foreground">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{u.email || '—'}</td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role} />
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <RoleSelector
                              user={u}
                              onSave={handleSaveRole}
                              saving={savingId === id}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">Página {safePage} de {totalPages}</p>
              <div className="flex gap-2">
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
};
