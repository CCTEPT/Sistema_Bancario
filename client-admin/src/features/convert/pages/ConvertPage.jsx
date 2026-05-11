import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRightLeft, TrendingUp } from "lucide-react";
import { convertCurrency, getCurrencies, getExchangeRates } from "@/shared/apis/financial";

const FALLBACK_CURRENCIES = [
  { code: "GTQ", name: "Quetzal guatemalteco", symbol: "Q" },
  { code: "USD", name: "Dolar estadounidense", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "EUR" },
];

export default function Convert() {
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

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
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value);
    } catch {
      return `${Number(value).toFixed(6)} ${currency}`;
    }
  };

  const showToast = (title, description, variant = "default") => {
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

  useEffect(() => {
    const loadFinancialConfig = async () => {
      try {
        setIsLoading(true);
        const [currencyResponse, rateResponse] = await Promise.all([
          getCurrencies(),
          getExchangeRates(),
        ]);

        const loadedCurrencies = (currencyResponse || []).map((currency) => ({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol || currency.code,
        }));

        setCurrencies(loadedCurrencies);
        setRates(rateResponse || []);

        const defaultFrom = loadedCurrencies.find((currency) => currency.code === "USD")?.code || loadedCurrencies[0]?.code || "USD";
        const defaultTo = loadedCurrencies.find((currency) => currency.code === "GTQ")?.code || loadedCurrencies[1]?.code || defaultFrom;

        setFromCurrency((current) => current || defaultFrom);
        setToCurrency((current) => current || defaultTo);
      } catch (error) {
        setCurrencies(FALLBACK_CURRENCIES);
        setFromCurrency((current) => current || "USD");
        setToCurrency((current) => current || "GTQ");
        showToast(
          "No se pudo cargar FinancialConfig",
          error.response?.data?.error || error.message || "Verifica que el servicio este activo.",
          "destructive"
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

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (!fromCurrency || !toCurrency || Number.isNaN(numAmount) || numAmount <= 0) {
      showToast("Datos invalidos", "Completa las monedas y un monto mayor a 0.", "destructive");
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult({ toAmount: numAmount, rate: 1, source: "local" });
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
        source: "service",
      });
    } catch (error) {
      const localRate = findLocalRate(fromCurrency, toCurrency);

      if (localRate) {
        setResult({
          toAmount: numAmount * localRate,
          rate: localRate,
          source: "local",
        });
        showToast("Conversion local", "Se uso la tasa disponible en la lista de tasas.", "default");
      } else {
        showToast(
          "No se pudo convertir",
          error.response?.data?.error || error.message || "No hay tasa configurada para esta conversion.",
          "destructive"
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const topRates = rates.slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Currency Converter</h1>
        <p className="text-muted-foreground mt-1">Convierte usando las tasas configuradas en FinancialConfig.</p>
      </div>

      {toastMsg && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            toastMsg.variant === "destructive"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}
        >
          <p className="font-semibold">{toastMsg.title}</p>
          <p className="text-xs mt-0.5 opacity-80">{toastMsg.description}</p>
        </div>
      )}

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Convert
          </CardTitle>
          <CardDescription>Ingresa un monto y selecciona las divisas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              data-testid="input-amount"
              type="number"
              step="any"
              min="0"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background/50 font-mono text-xl h-12"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={isLoading}>
                <SelectTrigger data-testid="select-from-currency" className="bg-background/50">
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Moneda origen"} />
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
              type="button"
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              data-testid="button-swap-currencies"
              className="mb-[2px] hover:text-primary hover:border-primary transition-colors"
              disabled={isLoading || !fromCurrency || !toCurrency}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency} disabled={isLoading}>
                <SelectTrigger data-testid="select-to-currency" className="bg-background/50">
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Moneda destino"} />
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
            className="w-full font-medium"
            data-testid="button-convert"
          >
            {(isPending || isLoading) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isLoading ? "Cargando..." : isPending ? "Calculando..." : "Calcular"}
          </Button>

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">Resultado</p>
              <p className="text-3xl font-bold text-primary">
                {formatAmount(result.toAmount, toCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">
                1 {fromCurrency} = {result.rate.toFixed(6)} {toCurrency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {topRates.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Tasas configuradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topRates.map((rate) => {
                const from = availableCurrencies.find((currency) => currency.code === rate.from);
                const to = availableCurrencies.find((currency) => currency.code === rate.to);

                return (
                  <button
                    key={rate._id || `${rate.from}-${rate.to}`}
                    type="button"
                    className="text-left flex items-center justify-between p-3 rounded-md bg-background/30 border border-border/50 hover:border-primary/30 transition-colors"
                    onClick={() => { setFromCurrency(rate.from); setToCurrency(rate.to); }}
                    data-testid={`rate-card-${rate.from}-${rate.to}`}
                  >
                    <div>
                      <p className="text-xs font-medium">{rate.from} to {rate.to}</p>
                      <p className="text-xs text-muted-foreground">
                        {from?.symbol || rate.from} {"->"} {to?.symbol || rate.to}
                      </p>
                    </div>
                    <p className="text-sm font-mono font-bold">{Number(rate.rate).toFixed(4)}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Updated: {latestUpdate ? latestUpdate.toLocaleString() : "Sin fecha"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
