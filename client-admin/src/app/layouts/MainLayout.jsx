import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRightLeft, Banknote, DollarSign, History,
  LayoutDashboard, Loader2, LogOut, Menu, MinusCircle,
  PlusCircle, X, Users, CreditCard, ClipboardList,
  UserCog, ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore.js";

const NAV_BY_ROLE = {
  USER_ROLE: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mis cuentas", href: "/dashboard/accounts", icon: CreditCard },
    { label: "Transacciones", href: "/dashboard/transactions", icon: History },
    { label: "Transferir", href: "/dashboard/transfer", icon: ArrowRightLeft },
    { label: "Depositar", href: "/dashboard/deposit", icon: PlusCircle },
    { label: "Retirar", href: "/dashboard/withdraw", icon: MinusCircle },
    { label: "Convertir", href: "/dashboard/convert", icon: DollarSign },
    { label: "Cheques", href: "/dashboard/checks", icon: Banknote },
  ],
  EMPLOYEE_ROLE: [
    { label: "Panel empleado", href: "/dashboard/employee", icon: LayoutDashboard, exact: true },
    { label: "Clientes", href: "/dashboard/employee/clients", icon: Users },
    { label: "Abrir cuenta", href: "/dashboard/employee/create-account", icon: CreditCard },
    { label: "Préstamos", href: "/dashboard/employee/loans", icon: ClipboardList },
    { label: "Historial / Soporte", href: "/dashboard/employee/transactions", icon: History },
  ],
  ADMIN_ROLE: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Cuentas", href: "/dashboard/accounts", icon: CreditCard },
    { label: "Cheques", href: "/dashboard/checks", icon: Banknote },
    { label: "Movimientos", href: "/dashboard/transactions", icon: History },
    { label: "Usuarios", href: "/dashboard/users", icon: ShieldCheck },
    { divider: true, label: "Operaciones" },
    { label: "Depositar", href: "/dashboard/deposit", icon: PlusCircle },
    { label: "Retirar", href: "/dashboard/withdraw", icon: MinusCircle },
    { label: "Transferir", href: "/dashboard/transfer", icon: ArrowRightLeft },
    { label: "Convertir", href: "/dashboard/convert", icon: DollarSign },
    { divider: true, label: "Empleado" },
    { label: "Panel empleado", href: "/dashboard/employee", icon: UserCog, exact: true },
    { label: "Clientes", href: "/dashboard/employee/clients", icon: Users },
    { label: "Abrir cuenta", href: "/dashboard/employee/create-account", icon: CreditCard },
    { label: "Préstamos", href: "/dashboard/employee/loans", icon: ClipboardList },
    { label: "Soporte transacciones", href: "/dashboard/employee/transactions", icon: ArrowRightLeft },
  ],
};

export function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoadingAuth);

  const role = user?.role || "USER_ROLE";
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.USER_ROLE;

  const firstName = user?.name || user?.Name || "";
  const surname = user?.surname || user?.Surname || "";
  const username = user?.username || user?.Username || "";
  const email = user?.email || user?.Email || "";
  const displayName = `${firstName} ${surname}`.trim() || username || email || "Usuario";

  const roleLabel = { USER_ROLE: "Cliente", EMPLOYEE_ROLE: "Empleado", ADMIN_ROLE: "Administrador" }[role] || role;

  useEffect(() => {
    if (!isAuthenticated && currentPath !== "/login" && currentPath !== "/register") {
      navigate("/login");
    }
  }, [isAuthenticated, currentPath, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const renderNavItem = (item, closeOnClick = false) => {
    if (item.divider) {
      return (
        <div key={item.label} className="pt-3 pb-1 px-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">{item.label}</p>
        </div>
      );
    }

    const Icon = item.icon;
    const isActive = item.exact
      ? currentPath === item.href
      : currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));

    const itemLink = (
      <Link
        key={item.href}
        to={item.href}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );

    return closeOnClick ? (
      <div key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
        {itemLink}
      </div>
    ) : itemLink;
  };

  const userFooter = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{displayName}</span>
        <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              N
            </div>
            NovaBank
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-4 overflow-y-auto">
          {navItems.map((item, i) => (
            <div key={item.href || `divider-${i}`}>
              {renderNavItem(item)}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            userFooter
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-card p-4 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
              N
            </div>
            NovaBank
          </Link>

          <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Cerrar menu"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-bold text-primary"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                    N
                  </div>
                  NovaBank
                </Link>
                <Button variant="ghost" size="icon" aria-label="Cerrar menu" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex-1 space-y-0.5 px-4 py-4 overflow-y-auto">
                {navItems.map((item, i) => (
                  <div key={item.href || `divider-${i}`}>
                    {renderNavItem(item, true)}
                  </div>
                ))}
              </nav>

              <div className="border-t border-border p-4">
                {userFooter}
              </div>
            </aside>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
