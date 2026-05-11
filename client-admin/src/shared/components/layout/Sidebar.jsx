import { useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";

const SIDEBAR_ITEMS_BY_ROLE = {
    ADMIN_ROLE: [
        { label: "Accounts", to: "/dashboard/accounts" },
        { label: "Checks", to: "/dashboard/checks" },
        { label: "Movements", to: "/dashboard/transactions" },
        { label: "Users", to: "/dashboard/users"}
    ],
    USER_ROLE: [
        { label: "Accounts", to: "/dashboard/accounts" },
        { label: "Deposit", to: "/dashboard/deposit" },
        { label: "Movements", to: "/dashboard/transactions" },
    ],
    EMPLOYEE_ROLE: [
        { label: "Accounts", to: "/dashboard/accounts" },
        { label: "Deposit", to: "/dashboard/deposit" },
    ],
};

export const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const items = SIDEBAR_ITEMS_BY_ROLE[user.role] ?? [];

    return (
        <aside className="w-64 bg-[#141823] min-h-[calc(100vh-4rem)] px-4 py-6 border-r border-[#83fb7f]/30">
            <p className="mb-6 px-2 text-xs uppercase tracking-widest text-gray-400">
                Navigation
            </p>
            <ul className="space-y-2">
                {items.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={`
                                    flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-all
                                    ${active ? "bg-[#11151c] text-[#83fb7f] border-l-4 border-[#83fb7f]" : "text-gray-400 hover:bg-[#11151c] hover:text-white"}
                                `}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};
