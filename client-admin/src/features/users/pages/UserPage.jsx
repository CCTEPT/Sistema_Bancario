import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
//import { UserModal } from "./UserModal.jsx";
import { showError } from '../../../shared/utils/toast.js';

const PAGE_SIZE = 8;

export const UserPage = () => {
  const { users, loading, error, getAllUsers } = useUserManagementStore();
  const currentUser = useAuthStore((state) => state.user);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);



  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.name || ''} ${u.surname || ''}`.trim().toLowerCase();
      const username = (u.username || '').toLowerCase();
      const role = (u.role || '').toUpperCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        username.includes(normalizedSearch);
      const matchesRole = roleFilter === 'ALL' ? true : role === roleFilter.toUpperCase();
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  /*const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setOpenDetailModal(true);
  };

  const handleSaveRole = async (user, newRole) => {
    const res = await updateUserRole(user.id, newRole);
    if (res.success) {
      showSuccess("Rol actualizado correctamente");
      setOpenDetailModal(false);
      setSelectedUser(null);
      await getAllUsers(undefined, { force: true });
    } else {
      showError(res.error || "Error al actualizar rol");
    }
  };*/

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-main-blue'>Usuarios</h1>
          <p className='text-gray-500 text-sm'>Listado de usuarios registrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por nombre o username...'
            className='md:col-span-2 w-full px-3 py-2 border rounded-lg'
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='ALL'>Todos los roles</option>
            <option value='ADMIN_ROLE'>ADMIN_ROLE</option>
            <option value='EMPLOYEE_ROLE'>EMPLOYEE_ROLE</option>
            <option value='USER_ROLE'>USER_ROLE</option>
            <option value='CLIENT_ROLE'>CLIENT_ROLE</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className='bg-green-200 rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50 text-gray-700'>
              <tr>
                <th className='text-left px-4 py-3'>Nombre</th>
                <th className='text-left px-4 py-3'>Username</th>
                <th className='text-left px-4 py-3'>Rol</th>
                {currentUser?.role === "ADMIN_ROLE" && (
                  <th className="text-right px-4 py-3">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 py-6 text-center text-gray-500'>
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className='border-t hover:bg-gray-50'>
                    <td className='px-4 py-3 font-medium text-gray-800'>
                      {[u.name, u.surname].filter(Boolean).join(' ') || '-'}
                    </td>
                    <td className='px-4 py-3 text-gray-700'>@{u.username}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN_ROLE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    {currentUser?.role === "ADMIN_ROLE" && (
                      <td className="px-4 py-3 text-right">
                        <button
                          //onClick={() => handleOpenDetail(u)}
                          className="px-3 py-1.5 rounded-lg bg-main-blue text-black text-xs font-semibold hover:opacity-90"
                        >
                          Ver / Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
