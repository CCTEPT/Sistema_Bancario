import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Pencil, X } from 'lucide-react';
import { EditProfileForm } from '@/features/users/pages/EditProfileForm.jsx';

export const ProfileModal = ({ user, open, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleClose = () => {
    setEditing(false);
    setPreview(null);
    onClose();
  };

  const handleSuccess = () => {
    setEditing(false);
    setPreview(null);
    // opcional: recargar datos del store si lo necesitas
  };

  const avatarSrc = preview || user?.profilePicture || '/assets/img/avatar.png';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className='fixed inset-0 z-50 flex items-center justify-center'
    >
      <div className='fixed inset-0 bg-black/50' aria-hidden='true' />

      <div className='bg-[#0d1f35] rounded-xl shadow-lg p-6 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Dialog.Title className='text-lg font-semibold text-white'>
            {editing ? 'Editar perfil' : 'Perfil de Usuario'}
          </Dialog.Title>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-white transition'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {editing ? (
          /* ── MODO EDICIÓN ── */
          <EditProfileForm
            onSuccess={handleSuccess}
            onCancel={() => setEditing(false)}
            onPreview={setPreview}
          />
        ) : (
          /* ── MODO VISTA ── */
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <img
                src={avatarSrc}
                alt={user?.username}
                className='w-24 h-24 rounded-full object-cover border-2 border-white/20'
                onError={(e) => { e.target.src = '/assets/img/avatar.png'; }}
              />
            </div>

            <p className='text-white font-semibold text-lg'>
              {user?.name} {user?.surname}
            </p>
            <p className='text-gray-300 text-sm'>@{user?.username}</p>
            <p className='text-gray-400 text-sm'>{user?.email}</p>
            <p className='text-gray-500 text-xs uppercase tracking-wide'>{user?.role}</p>

            <div className='flex gap-3 mt-4'>
              <button
                onClick={() => setEditing(true)}
                className='flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-main-blue to-emerald-500 text-white font-semibold text-sm hover:scale-105 transition-transform duration-200'
              >
                <Pencil className='w-4 h-4' />
                Editar perfil
              </button>
              <button
                onClick={handleClose}
                className='px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors duration-200'
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};