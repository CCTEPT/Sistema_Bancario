import { useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/store/authStore'

const SIDEBAR_ITEMS_BY_ROLE = {
    ADMIN_ROLE: [
        { label: 'Accounts', to: '/dashboard/accounts' },
        { label: 'Checks', to: '/dashboard/checks' },
        { label: 'Movements', to: '/dashboard/movements' },
    ],
    USER_ROLE: [
        { label: 'Movements', to: '/dashboard/movements' },
    ],
}

export const Sidebar = () => {
    const location = useLocation()
    const { user } = useAuthStore()

    const items = SIDEBAR_ITEMS_BY_ROLE[user.role] ?? []

    return (
        <aside className="w-64 bg-black min-h-[calc(100vh-4rem)] px-4 py-6 border-r border-gray-800">
            <p className="mb-6 px-2 text-xs uppercase tracking-widest text-gray-500">
                Navigation
            </p>

            <ul className="space-y-1">
                {items.map(item => {
                    const active = location.pathname === item.to

                    return (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={`
                  flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all
                  ${active
                                        ? 'bg-gray-900 text-main-blue border-l-2 border-main-blue'
                                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                                    }
                `}
                            >
                                {item.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </aside>
    )
}