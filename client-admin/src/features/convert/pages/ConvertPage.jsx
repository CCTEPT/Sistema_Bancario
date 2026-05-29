import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRightLeft, TrendingUp, Wallet } from 'lucide-react';
import { convertCurrency, getCurrencies, getExchangeRates, setExchangeRate } from '@/shared/apis/financial';
import { getUserAccounts } from '@/shared/apis/bank';
import { useAuthStore } from '@/features/auth/store/authStore';

const FALLBACK_CURRENCIES = [
  { code: 'GTQ', name: 'Quetzal guatemalteco', symbol: 'Q' },
  { code: 'USD', name: 'Dolar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: 'EUR' },
];

const RATE_CURRENCIES = [
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GTQ', name: 'Quetzal (QTLZ)', symbol: 'Q' },
];

export default function Convert() {
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('100');
  const [rateFromCurrency, setRateFromCurrency] = useState('USD');
  const [rateToCurrency, setRateToCurrency] = useState('GTQ');
  const [rate, setRate] = useState('');
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [result, setResult] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const user = useAuthStore((state) => state.user);
  const canManageRates = user?.role === 'ADMIN_ROLE' || user?.role === 'EMPLOYEE_ROLE';

  const availableCurrencies = currencies.length > 0 ? currencies : FALLBACK_CURRENCIES;

  const latestUpdate = useMemo(() => {
    const dates = rates
      .map((rate) => rate.effectiveDate || rate.updatedAt || rate.createdAt)
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()));

    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [rates]);

  const formatAmount = (value, currency) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value);
    } catch {
      return `${Number(value).toFixed(6)} ${currency}`;
    }
  };

  const showToast = (title, description, variant = 'default') => {
    setToastMsg({ title, description, variant });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const findLocalRate = (from, to) => {
    if (from === to) return 1;

    const direct = rates.find((rate) => rate.from === from && rate.to === to);
    if (direct) return direct.rate;

    const inverse = rates.find((rate) => rate.from === to && rate.to === from);
    if (inverse?.rate) return 1 / inverse.rate;

    return null;
  };

  const selectedRate = useMemo(() => {
    return rates.find(
      (rateItem) => rateItem.from === rateFromCurrency && rateItem.to === rateToCurrency
    );
  }, [rates, rateFromCurrency, rateToCurrency]);

  useEffect(() => {
    if (canManageRates) {
      setRate(selectedRate?.rate?.toString() || '');
    }
  }, [selectedRate, canManageRates]);

  useEffect(() => {
    const loadFinancialConfig = async () => {
      try {
        setIsLoading(true);
        const [currencyResponse, rateResponse, accountsResponse] = await Promise.all([
          getCurrencies(),
          getExchangeRates(),
          getUserAccounts().catch(() => ({ accounts: [] })),
        ]);

        const loadedCurrencies = (currencyResponse || []).map((currency) => ({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol || currency.code,
        }));

        setCurrencies(loadedCurrencies);
        setRates(rateResponse || []);
        setUserAccounts(accountsResponse?.accounts || []);

        const defaultFrom =
          loadedCurrencies.find((currency) => currency.code === 'USD')?.code ||
          loadedCurrencies[0]?.code ||
          'USD';
        const defaultTo =
          loadedCurrencies.find((currency) => currency.code === 'GTQ')?.code ||
          loadedCurrencies[1]?.code ||
          defaultFrom;

        setFromCurrency((current) => current || defaultFrom);
        setToCurrency((current) => current || defaultTo);
      } catch (error) {
        setCurrencies(FALLBACK_CURRENCIES);
        setFromCurrency((current) => current || 'USD');
        setToCurrency((current) => current || 'GTQ');
        showToast(
          'No se pudo cargar FinancialConfig',
          error.response?.data?.error || error.message || 'Verifica que el servicio este activo.',
          'destructive'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialConfig();
  }, []);

  useEffect(() => {
    setResult(null);
  }, [fromCurrency, toCurrency, amount]);

  const handleSaveRate = async () => {
    if (!rateFromCurrency || !rateToCurrency) {
      showToast('Monedas inválidas', 'Selecciona monedas origen y destino para la tasa.', 'destructive');
      return;
    }

    const numRate = parseFloat(rate);
    if (Number.isNaN(numRate) || numRate <= 0) {
      showToast('Tasa inválida', 'Ingresa una tasa mayor a 0.', 'destructive');
      return;
    }

    if (rateFromCurrency === rateToCurrency) {
      showToast('Monedas iguales', 'Selecciona monedas diferentes para la tasa.', 'destructive');
      return;
    }

    setIsSavingRate(true);
    try {
      await setExchangeRate({ from: rateFromCurrency, to: rateToCurrency, rate: numRate });
      const rateResponse = await getExchangeRates();
      setRates(rateResponse || []);
      showToast(
        'Tasa guardada',
        `Tasa ${rateFromCurrency} → ${rateToCurrency} actualizada.`,
        'default'
      );
    } catch (error) {
      showToast(
        'No se pudo guardar la tasa',
        error.response?.data?.error || error.message || 'Verifica que tengas permiso para editar tasas.',
        'destructive'
      );
    } finally {
      setIsSavingRate(false);
    }
  };

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (!fromCurrency || !toCurrency || Number.isNaN(numAmount) || numAmount <= 0) {
      showToast('Datos invalidos', 'Completa las monedas y un monto mayor a 0.', 'destructive');
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult({ toAmount: numAmount, rate: 1, source: 'local' });
      return;
    }

    setIsPending(true);

    try {
      const response = await convertCurrency({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
      });

      const converted = Number(response.converted);
      setResult({
        toAmount: converted,
        rate: converted / numAmount,
        source: 'service',
      });
    } catch (error) {
      const localRate = findLocalRate(fromCurrency, toCurrency);

      if (localRate) {
        setResult({
          toAmount: numAmount * localRate,
          rate: localRate,
          source: 'local',
        });
        showToast('Conversion local', 'Se uso la tasa disponible en la lista de tasas.', 'default');
      } else {
        showToast(
          'No se pudo convertir',
          error.response?.data?.error ||
            error.message ||
            'No hay tasa configurada para esta conversion.',
          'destructive'
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleRateFromCurrencyChange = (value) => {
    setRateFromCurrency(value);
    if (value === rateToCurrency) {
      const fallback = RATE_CURRENCIES.find((currency) => currency.code !== value)?.code;
      setRateToCurrency(fallback || value);
    }
  };

  const handleRateToCurrencyChange = (value) => {
    setRateToCurrency(value);
    if (value === rateFromCurrency) {
      const fallback = RATE_CURRENCIES.find((currency) => currency.code !== value)?.code;
      setRateFromCurrency(fallback || value);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const filteredRateFromOptions = RATE_CURRENCIES.filter((currency) => currency.code !== rateToCurrency);
  const filteredRateToOptions = RATE_CURRENCIES.filter((currency) => currency.code !== rateFromCurrency);
  const topRates = rates.slice(0, 6);

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Currency Converter</h1>
        <p className='text-muted-foreground mt-1'>
          Convierte usando las tasas configuradas en FinancialConfig.
        </p>
      </div>

      {toastMsg && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            toastMsg.variant === 'destructive'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          <p className='font-semibold'>{toastMsg.title}</p>
          <p className='text-xs mt-0.5 opacity-80'>{toastMsg.description}</p>
        </div>
      )}

      <Card className='bg-card/50 backdrop-blur border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ArrowRightLeft className='h-5 w-5 text-primary' />
            Convert
          </CardTitle>
          <CardDescription>Ingresa un monto y selecciona las divisas.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='amount'>Amount</Label>
            <Input
              id='amount'
              data-testid='input-amount'
              type='number'
              step='any'
              min='0'
              placeholder='100'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='bg-background/50 font-mono text-xl h-12'
            />
          </div>

          <div className='grid grid-cols-[1fr_auto_1fr] gap-3 items-end'>
            <div className='space-y-2'>
              <Label>From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={isLoading}>
                <SelectTrigger data-testid='select-from-currency' className='bg-background/50'>
                  <SelectValue placeholder={isLoading ? 'Cargando...' : 'Moneda origen'} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={swapCurrencies}
              data-testid='button-swap-currencies'
              className='mb-[2px] hover:text-primary hover:border-primary transition-colors'
              disabled={isLoading || !fromCurrency || !toCurrency}
            >
              <ArrowRightLeft className='h-4 w-4' />
            </Button>

            <div className='space-y-2'>
              <Label>To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency} disabled={isLoading}>
                <SelectTrigger data-testid='select-to-currency' className='bg-background/50'>
                  <SelectValue placeholder={isLoading ? 'Cargando...' : 'Moneda destino'} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={isPending || isLoading || !amount || !fromCurrency || !toCurrency}
            className='w-full font-medium'
            data-testid='button-convert'
          >
            {(isPending || isLoading) && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
            {isLoading ? 'Cargando...' : isPending ? 'Calculando...' : 'Calcular'}
          </Button>

          {result && (
            <div className='animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center space-y-1'>
              <p className='text-sm text-muted-foreground'>Resultado</p>
              <p className='text-3xl font-bold text-primary'>
                {formatAmount(result.toAmount, toCurrency)}
              </p>
              <p className='text-xs text-muted-foreground'>
                1 {fromCurrency} = {result.rate.toFixed(6)} {toCurrency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='bg-card/50 backdrop-blur border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-primary' />
            {canManageRates ? 'Administrar tasa de cambio' : 'Tasas configuradas'}
          </CardTitle>
          <CardDescription>
            {canManageRates
              ? 'Solo admin y empleado pueden guardar o actualizar tasas.'
              : 'Consulta todas las tasas de cambio disponibles.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {canManageRates && (
            <div className='space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='space-y-2'>
                  <Label htmlFor='rate-from'>Moneda origen</Label>
                  <Select
                    id='rate-from'
                    value={rateFromCurrency}
                    onValueChange={handleRateFromCurrencyChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className='bg-background/50'>
                      <SelectValue placeholder='Moneda origen' />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRateFromOptions.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='rate-to'>Moneda destino</Label>
                  <Select
                    id='rate-to'
                    value={rateToCurrency}
                    onValueChange={handleRateToCurrencyChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className='bg-background/50'>
                      <SelectValue placeholder='Moneda destino' />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRateToOptions.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='rate-value'>Tasa</Label>
                  <Input
                    id='rate-value'
                    type='number'
                    step='any'
                    min='0'
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder='0.00'
                    className='bg-background/50'
                  />
                </div>
              </div>

              <Button
                type='button'
                onClick={handleSaveRate}
                disabled={
                  isSavingRate ||
                  !rateFromCurrency ||
                  !rateToCurrency ||
                  rateFromCurrency === rateToCurrency ||
                  Number.isNaN(parseFloat(rate)) ||
                  parseFloat(rate) <= 0
                }
                className='w-full font-medium'
              >
                {isSavingRate ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                Guardar tasa
              </Button>
            </div>
          )}

          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div>
                <p className='text-sm font-medium'>Tasas configuradas</p>
                <p className='text-xs text-muted-foreground'>Listado de tasas disponibles.</p>
              </div>
              <p className='text-xs text-muted-foreground'>
                Updated: {latestUpdate ? latestUpdate.toLocaleString() : 'Sin fecha'}
              </p>
            </div>

            {rates.length === 0 ? (
              <div className='rounded-lg border border-dashed border-border/50 bg-background/60 p-4 text-sm text-muted-foreground'>
                No hay tasas configuradas. Agrega una tasa para que aparezca en el listado.
              </div>
            ) : (
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {topRates.map((rateItem) => {
                  const from = availableCurrencies.find((currency) => currency.code === rateItem.from);
                  const to = availableCurrencies.find((currency) => currency.code === rateItem.to);

                  return (
                    <button
                      key={rateItem._id || `${rateItem.from}-${rateItem.to}`}
                      type='button'
                      className='text-left flex items-center justify-between p-3 rounded-md bg-background/30 border border-border/50 hover:border-primary/30 transition-colors'
                      onClick={() => {
                        setFromCurrency(rateItem.from);
                        setToCurrency(rateItem.to);
                      }}
                      data-testid={`rate-card-${rateItem.from}-${rateItem.to}`}
                    >
                      <div>
                        <p className='text-xs font-medium'>
                          {rateItem.from} to {rateItem.to}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {from?.symbol || rateItem.from} {'->'} {to?.symbol || rateItem.to}
                        </p>
                      </div>
                      <p className='text-sm font-mono font-bold'>{Number(rateItem.rate).toFixed(4)}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {userAccounts.length > 0 &&
        (() => {
          // Solo cuentas activas, antes de agrupar y sumar por divisa
          const balancesByDivisa = userAccounts
            .filter((account) => {
              const status = String(account.estado || '').toUpperCase();
              return status === 'ACTIVE' || status === 'ACTIVA';
            })
            .reduce((acc, account) => {
              const code = account.divisa?.toUpperCase();
              if (!code) return acc;
              if (!acc[code]) acc[code] = 0;
              acc[code] += account.saldo || 0;
              return acc;
            }, {});

          return (
            <Card className='bg-card/50 backdrop-blur border-border/50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <Wallet className='h-4 w-4' />
                  Tus divisas
                </CardTitle>
                <CardDescription>Saldo total por moneda en tus cuentas activas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  {Object.entries(balancesByDivisa).map(([code, saldo]) => {
                    const currencyInfo = availableCurrencies.find((c) => c.code === code);
                    return (
                      <button
                        key={code}
                        type='button'
                        className='text-left p-3 rounded-md bg-background/30 border border-border/50 hover:border-primary/30 transition-colors'
                        onClick={() => setFromCurrency(code)}
                      >
                        <p className='text-xs text-muted-foreground'>
                          {currencyInfo?.symbol || code} {code}
                        </p>
                        <p className='text-lg font-bold font-mono text-primary'>
                          {saldo.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {currencyInfo?.name || code}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })()}
    </div>
  );
}
