import { useState, useEffect } from "react";
import { useAuthStore } from "../../../features/auth/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserAccounts } from "@/shared/apis/bank";

export const Accounts = () => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true);
        const response = await getUserAccounts();
        setAccounts(response.accounts || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'No se pudieron cargar las cuentas.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[#83fb7f]">{user?.role === "ADMIN_ROLE" ? "Gestión de Cuentas" : "Mis Cuentas"}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {user?.role === "ADMIN_ROLE"
            ? "Administra todas las cuentas del sistema."
            : "Revisa tus cuentas activas y los saldos disponibles."}
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>{user?.role === "ADMIN_ROLE" ? "Cuentas del banco" : "Cuentas del cliente"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando cuentas...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se encontraron cuentas activas.</p>
          ) : (
            <ScrollArea className="max-h-[60vh] rounded-md border border-border/50">
              <table className="w-full min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Número</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Divisa</th>
                    <th className="px-4 py-3">Saldo</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account._id} className="border-t border-border/50 even:bg-slate-950/40">
                      <td className="px-4 py-3">{account.numeroCuenta}</td>
                      <td className="px-4 py-3">{account.tipoCuenta}</td>
                      <td className="px-4 py-3">{account.divisa}</td>
                      <td className="px-4 py-3 font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: account.divisa }).format(account.saldo)}</td>
                      <td className="px-4 py-3">{account.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
