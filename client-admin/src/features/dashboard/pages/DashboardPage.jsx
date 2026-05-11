import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2, ArrowUpRight, ArrowDownRight, ArrowRightLeft,
    DollarSign, TrendingUp, TrendingDown, Wallet, Send,
    Plus, Minus, RefreshCw, ChevronRight, Eye, EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/authStore.js";
import { getUserAccounts, getUserMovements } from "@/shared/apis/bank";

function formatMoney(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

function buildChartData(transactions) {
    if (!transactions || transactions.length === 0) return [];

    const byDay = {};
    transactions.forEach((tx) => {
        const date = tx.date || tx.createdAt || tx.updatedAt;
        if (!date) return;

        const day = format(new Date(date), "MMM d");
        if (!byDay[day]) byDay[day] = { day, deposits: 0, withdrawals: 0, transfers: 0 };
        if (tx.dashboardType === "deposit") byDay[day].deposits += Number(tx.amount);
        else if (tx.dashboardType === "withdrawal") byDay[day].withdrawals += Number(tx.amount);
        else if (tx.dashboardType === "transfer") byDay[day].transfers += Number(tx.amount);
    });

    return Object.values(byDay);
}

const txTypeConfig = {
    deposit: {
        label: "Deposit",
        icon: ArrowDownRight,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
        amountColor: "text-emerald-400",
        prefix: "+",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    withdrawal: {
        label: "Withdrawal",
        icon: ArrowUpRight,
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-400",
        amountColor: "text-rose-400",
        prefix: "-",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    transfer: {
        label: "Transfer",
        icon: ArrowRightLeft,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-400",
        amountColor: "text-foreground",
        prefix: "",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    conversion: {
        label: "Conversion",
        icon: RefreshCw,
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-400",
        amountColor: "text-foreground",
        prefix: "",
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl text-xs space-y-1.5">
            <p className="text-muted-foreground font-medium mb-1">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground capitalize">{entry.name}</span>
                    <span className="ml-auto font-mono font-semibold text-foreground pl-4">
                        {formatMoney(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendLabel }) {
    return (
        <Card className="bg-card/60 backdrop-blur border-border/50 hover:border-primary/20 transition-all duration-200">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${iconBg}`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    {trend !== undefined && (
                        <div
                            className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-rose-400"
                                }`}
                        >
                            {trend >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {trendLabel}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function QuickAction({ href, icon: Icon, label, description, colorClass }) {
    return (
        <Link to={href}>
            <div className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background/20 hover:bg-background/60 hover:border-primary/30 transition-all duration-200 cursor-pointer">
                <div
                    className={`p-2 rounded-lg ${colorClass} group-hover:scale-110 transition-transform duration-200`}
                >
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

export default function DashboardPage() {
    const { isAuthenticated } = useAuth();
    const user = useAuthStore((state) => state.user);

    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [accountsError, setAccountsError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [transactionsError, setTransactionsError] = useState(null);
    const [visibleAccountNumbers, setVisibleAccountNumbers] = useState({});

    const accountById = new Map(accounts.map((account) => [String(account._id), account]));
    const primaryAccount = accounts[0];
    const normalizedTransactions = transactions.map((tx) => {
        const account = accountById.get(String(tx.accountId));
        const balanceBefore = Number(tx.balanceBefore);
        const balanceAfter = Number(tx.balanceAfter);
        const dashboardType =
            tx.movementType === "DEPOSIT" || tx.movementType === "TRANSFER_IN"
                ? "deposit"
                : tx.movementType === "CHECK_CASH" && balanceAfter > balanceBefore
                    ? "deposit"
                    : tx.movementType === "WITHDRAW" || tx.movementType === "TRANSFER_OUT" || tx.movementType === "CHECK_CASH"
                    ? "withdrawal"
                    : "transfer";

        return {
            ...tx,
            id: tx._id,
            dashboardType,
            currency: tx.currency || account?.divisa || "GTQ",
            accountNumber: tx.accountNumber || account?.numeroCuenta,
            createdAt: tx.date || tx.createdAt || tx.updatedAt,
        };
    });

    const summary = {
        totalBalanceUsd: accounts.reduce((total, account) => total + (Number(account.saldo) || 0), 0),
        accountCount: accounts.length,
        totalDeposited: normalizedTransactions
            .filter((tx) => tx.dashboardType === "deposit")
            .reduce((total, tx) => total + (Number(tx.amount) || 0), 0),
        totalWithdrawn: normalizedTransactions
            .filter((tx) => tx.dashboardType === "withdrawal")
            .reduce((total, tx) => total + (Number(tx.amount) || 0), 0),
        totalTransferred: normalizedTransactions
            .filter((tx) => tx.movementType === "TRANSFER_OUT" || tx.movementType === "TRANSFER_IN")
            .reduce((total, tx) => total + (Number(tx.amount) || 0), 0),
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setAccountsLoading(true);
                setTransactionsLoading(true);
                setAccountsError(null);
                setTransactionsError(null);

                const [accountsResponse, movementsResponse] = await Promise.all([
                    getUserAccounts(),
                    getUserMovements({ limit: 100 }),
                ]);

                setAccounts(accountsResponse.accounts || []);
                setTransactions(
                    (movementsResponse.data || []).sort(
                        (a, b) => new Date(b.date || b.createdAt || b.updatedAt) - new Date(a.date || a.createdAt || a.updatedAt)
                    )
                );
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'No se pudieron cargar los datos del dashboard.';
                setAccountsError(message);
                setTransactionsError(message);
            } finally {
                setAccountsLoading(false);
                setTransactionsLoading(false);
            }
        };

        loadDashboard();

        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const chartData = buildChartData(normalizedTransactions);

    const getAccountId = (account) => String(account._id || account.idCuenta || account.id || account.numeroCuenta);

    const getAccountNumber = (account) =>
        account.numeroCuenta || account.accountNumber || account.raw?.numeroCuenta || account._id || "";

    const maskAccountNumber = (accountNumber = "") => {
        if (!accountNumber) return "-";
        const visibleDigits = accountNumber.slice(-4);
        return `${"*".repeat(Math.max(accountNumber.length - 4, 0))}${visibleDigits}`;
    };

    const toggleAccountNumber = (accountId) => {
        setVisibleAccountNumbers((prev) => ({
            ...prev,
            [accountId]: !prev[accountId],
        }));
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buen día";
        if (hour < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Cargando NovaBank...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Header greeting */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{greeting()}</p>
                    <h1 className="text-2xl font-bold tracking-tight mt-0.5">
                        {user?.name ? user.name.split(" ")[0] : user?.email || "Bienvenido"}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Revisa tu saldo, cuentas activas y la actividad reciente.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-card/50 border border-border/40 rounded-lg px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live data
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Balance"
                    value={formatMoney(summary?.totalBalanceUsd || 0)}
                    subtitle={`${summary?.accountCount || 0} active account${(summary?.accountCount || 0) !== 1 ? "s" : ""}`}
                    icon={Wallet}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                />
                <StatCard
                    title="Total Deposited"
                    value={formatMoney(summary?.totalDeposited || 0)}
                    subtitle="All time incoming"
                    icon={ArrowDownRight}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    trendLabel="Incoming"
                    trend={1}
                />
                <StatCard
                    title="Total Withdrawn"
                    value={formatMoney(summary?.totalWithdrawn || 0)}
                    subtitle="All time outgoing"
                    icon={ArrowUpRight}
                    iconBg="bg-rose-500/10"
                    iconColor="text-rose-400"
                    trendLabel="Outgoing"
                    trend={-1}
                />
                <StatCard
                    title="Transferred"
                    value={formatMoney(summary?.totalTransferred || 0)}
                    subtitle="Total volume moved"
                    icon={ArrowRightLeft}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-400"
                />
            </div>

            <Card className="bg-card/60 backdrop-blur border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <CardTitle className="text-base font-semibold">Tus cuentas</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Resumen de tus cuentas activas.</p>
                        </div>
                        {accountsLoading && (
                            <span className="text-xs text-muted-foreground">Cargando cuentas...</span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {accountsError ? (
                        <p className="text-sm text-destructive">{accountsError}</p>
                    ) : accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No se encontraron cuentas activas.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account) => {
                                const accountId = getAccountId(account);
                                const accountNumber = getAccountNumber(account);

                                return (
                                <div key={accountId} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-[0.25em]">{account.tipoCuenta || 'Cuenta'}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <p className="font-semibold font-mono text-sm">
                                            {visibleAccountNumbers[accountId]
                                                ? accountNumber || "Sin numero"
                                                : maskAccountNumber(accountNumber)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => toggleAccountNumber(accountId)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background"
                                            aria-label={visibleAccountNumbers[accountId] ? "Ocultar numero de cuenta" : "Mostrar numero de cuenta"}
                                            title={visibleAccountNumbers[accountId] ? "Ocultar numero de cuenta" : "Mostrar numero de cuenta"}
                                            disabled={!accountNumber}
                                        >
                                            {visibleAccountNumbers[accountId] ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{account.divisa}</p>
                                    <p className="mt-3 text-lg font-semibold">{formatMoney(account.saldo, account.divisa)}</p>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activity chart — only shown if there is data */}
            {chartData.length > 0 && (
                <Card className="bg-card/60 backdrop-blur border-border/50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-base font-semibold">Activity Overview</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Recent transaction volume</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    Deposits
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                                    Withdrawals
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    Transfers
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="withdrawalGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="transferGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--border) / 0.4)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) =>
                                            `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                                        }
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="deposits"
                                        name="deposits"
                                        stroke="#4ade80"
                                        strokeWidth={2}
                                        fill="url(#depositGrad)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: "#4ade80", strokeWidth: 0 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="withdrawals"
                                        name="withdrawals"
                                        stroke="#f87171"
                                        strokeWidth={2}
                                        fill="url(#withdrawalGrad)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: "#f87171", strokeWidth: 0 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="transfers"
                                        name="transfers"
                                        stroke="#60a5fa"
                                        strokeWidth={2}
                                        fill="url(#transferGrad)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bottom row */}
            <div className="grid gap-6 md:grid-cols-5">
                {/* Recent transactions */}
                <Card className="md:col-span-3 bg-card/60 backdrop-blur border-border/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Your latest transactions</p>
                            </div>
                            <Link to="/dashboard/transactions">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
                                >
                                    View all
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {transactionsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando actividad...
                            </div>
                        ) : transactionsError ? (
                            <div className="text-center py-12 text-sm text-destructive">{transactionsError}</div>
                        ) : normalizedTransactions.length > 0 ? (
                            <div className="space-y-1">
                                {normalizedTransactions.slice(0, 6).map((tx) => {
                                    const cfg = txTypeConfig[tx.dashboardType] || txTypeConfig.transfer;
                                    const Icon = cfg.icon;
                                    return (
                                        <div
                                            key={tx.id}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-background/50 transition-colors duration-150"
                                        >
                                            <div className={`p-2 rounded-lg ${cfg.iconBg} shrink-0`}>
                                                <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-medium">{cfg.label}</p>
                                                    <span
                                                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${cfg.badge}`}
                                                    >
                                                        {tx.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {tx.accountNumber || "Cuenta"} - {format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-semibold ${cfg.amountColor}`}>
                                                    {cfg.prefix}
                                                    {formatMoney(tx.amount, tx.currency)}
                                                </p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                    {tx.currency}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 rounded-full bg-muted/30 mb-3">
                                    <ArrowRightLeft className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Make your first deposit to get started
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right column */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    {/* Quick actions */}
                    <Card className="bg-card/60 backdrop-blur border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                            <p className="text-xs text-muted-foreground">Move money instantly</p>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                            <QuickAction
                                href="/dashboard/transfer"
                                icon={Send}
                                label="Transfer"
                                description="Move between accounts"
                                colorClass="bg-blue-500/10 text-blue-400"
                            />
                            <QuickAction
                                href="/dashboard/deposit"
                                icon={Plus}
                                label="Deposit"
                                description="Add funds to account"
                                colorClass="bg-emerald-500/10 text-emerald-400"
                            />
                            <QuickAction
                                href="/dashboard/withdraw"
                                icon={Minus}
                                label="Withdraw"
                                description="Take out funds"
                                colorClass="bg-rose-500/10 text-rose-400"
                            />
                            <QuickAction
                                href="/dashboard/convert"
                                icon={RefreshCw}
                                label="Convert"
                                description="Exchange currencies"
                                colorClass="bg-purple-500/10 text-purple-400"
                            />
                        </CardContent>
                    </Card>

                    {/* Accounts promo card */}
                    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 backdrop-blur">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-primary/15">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                </div>
                                <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                    Multi-currency
                                </Badge>
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Manage Accounts</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                View all your balances across currencies in one place.
                            </p>
                            {primaryAccount && (
                                <div className="rounded-lg bg-background/40 border border-border/50 px-3 py-2 mb-3">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cuenta principal</p>
                                    <p className="text-sm font-mono font-semibold mt-1">{getAccountNumber(primaryAccount)}</p>
                                    <p className="text-xs text-muted-foreground">{primaryAccount.divisa} - {primaryAccount.tipoCuenta}</p>
                                </div>
                            )}
                            <Link to="/dashboard/accounts">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-8 border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                                >
                                    View Accounts
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
