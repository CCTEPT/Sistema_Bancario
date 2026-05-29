import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle, Loader2, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClients, createAccountForClient } from '@/shared/apis/employee.js';
import toast from 'react-hot-toast';

function generateAccountNumber() {
  const digits = Math.floor(Math.random() * 1_000_000_000_000).toString().padStart(12, '0');
  return `NB${digits}`;
}

export default function CreateAccountPage() {
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [tipoCuenta, setTipoCuenta] = useState('ahorro');
  const [divisa, setDivisa] = useState('GTQ');

  useEffect(() => {
    getClients()
      .then((res) => {
        const list = Array.isArray(res?.clients) ? res.clients : Array.isArray(res) ? res : [];
        setClients(list);
      })
      .catch(() => {})
      .finally(() => setClientsLoading(false));
  }, []);

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return true;
    const name = `${c.name || ''} ${c.surname || ''}`.toLowerCase();
    const username = (c.username || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    return name.includes(q) || username.includes(q) || email.includes(q);
  });

  const handleCreate = async () => {
    if (!selectedClient) {
      toast.error('Selecciona un cliente primero.');
      return;
    }
    try {
      setSubmitting(true);
      const result = await createAccountForClient({
        idUsuario: selectedClient.id || selectedClient._id,
        numeroCuenta: generateAccountNumber(),
        tipoCuenta,
        divisa,
      });
      setSuccess(result);
      toast.success('Cuenta creada correctamente.');
      setSelectedClient(null);
      setClientSearch('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-3xl'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-primary'>Abrir cuenta bancaria</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Crea una cuenta bancaria para un cliente existente.
        </p>
      </div>

      {success && (
        <div className='flex items-start gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'>
          <CheckCircle className='h-5 w-5 mt-0.5 shrink-0' />
          <div>
            <p className='text-sm font-semibold'>Cuenta creada exitosamente</p>
            {success.account?.numeroCuenta && (
              <p className='text-xs mt-1 opacity-80'>
                Número de cuenta:{' '}
                <span className='font-mono font-bold'>{success.account.numeroCuenta}</span>
              </p>
            )}
            <button
              onClick={() => setSuccess(null)}
              className='text-xs underline mt-1 opacity-70 hover:opacity-100'
            >
              Crear otra cuenta
            </button>
          </div>
        </div>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Selector de cliente */}
        <Card className='bg-card/60 backdrop-blur border-border/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <Search className='h-4 w-4 text-primary' /> Seleccionar cliente
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <input
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder='Buscar cliente...'
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all'
            />
            <div className='max-h-64 overflow-y-auto space-y-1 pr-1'>
              {clientsLoading ? (
                <div className='flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm'>
                  <Loader2 className='h-4 w-4 animate-spin' /> Cargando...
                </div>
              ) : filteredClients.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-6'>Sin resultados</p>
              ) : (
                filteredClients.map((c) => {
                  const isSelected = selectedClient?.id === c.id || selectedClient?._id === c._id;
                  return (
                    <button
                      key={c.id || c._id}
                      type='button'
                      onClick={() => setSelectedClient(c)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'border-transparent hover:bg-background/60 hover:border-border/50'
                      }`}
                    >
                      <div className='w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0'>
                        <UserCircle className='w-4 h-4 text-muted-foreground' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>
                          {[c.name, c.surname].filter(Boolean).join(' ') || c.username}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>@{c.username}</p>
                      </div>
                      {isSelected && <CheckCircle className='h-4 w-4 shrink-0' />}
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel de confirmación */}
        <Card className='bg-card/60 backdrop-blur border-border/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <CreditCard className='h-4 w-4 text-primary' /> Confirmar apertura
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {selectedClient ? (
              <div className='p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1'>
                <p className='text-xs text-muted-foreground'>Cliente seleccionado</p>
                <p className='text-sm font-semibold text-primary'>
                  {[selectedClient.name, selectedClient.surname].filter(Boolean).join(' ') ||
                    selectedClient.username}
                </p>
                <p className='text-xs text-muted-foreground'>@{selectedClient.username}</p>
                {selectedClient.email && (
                  <p className='text-xs text-muted-foreground'>{selectedClient.email}</p>
                )}
              </div>
            ) : (
              <div className='p-4 rounded-xl bg-muted/20 border border-border/30 text-center'>
                <p className='text-xs text-muted-foreground'>
                  Selecciona un cliente para continuar
                </p>
              </div>
            )}

            {selectedClient && (
              <div className='space-y-3'>
                <select
                  value={tipoCuenta}
                  onChange={(e) => setTipoCuenta(e.target.value)}
                  className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all'
                >
                  <option value='ahorro'>Ahorro</option>
                  <option value='corriente'>Corriente</option>
                </select>

                <select
                  value={divisa}
                  onChange={(e) => setDivisa(e.target.value)}
                  className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all'
                >
                  <option value='GTQ'>Quetzales (GTQ)</option>
                  <option value='USD'>Dólares (USD)</option>
                  <option value='EUR'>Euros (EUR)</option>
                </select>
              </div>
            )}

            <button
              type='button'
              onClick={handleCreate}
              disabled={submitting || !selectedClient}
              className='w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {submitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' /> Creando cuenta...
                </>
              ) : (
                <>
                  <CreditCard className='h-4 w-4' /> Abrir cuenta
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}