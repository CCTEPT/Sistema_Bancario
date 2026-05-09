import { useState } from "react";

export const UserDetailModal = ({ user, isOpen, onClose, onSave }) => {
  const [newRole, setNewRole] = useState(user?.role || "USER_ROLE");

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Editar Rol de {user.username}</h2>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="ADMIN_ROLE">ADMIN_ROLE</option>
          <option value="EMPLOYEE_ROLE">EMPLOYEE_ROLE</option>
          <option value="USER_ROLE">USER_ROLE</option>
          <option value="CLIENT_ROLE">CLIENT_ROLE</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
          <button onClick={() => onSave(user, newRole)} className="px-4 py-2 rounded bg-main-blue text-white">Guardar</button>
        </div>
      </div>
    </div>
  );
};
