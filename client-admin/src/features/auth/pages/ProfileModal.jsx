import { Dialog } from '@headlessui/react';

export const ProfileModal = ({ user, open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center'
    >
      <Dialog.Overlay className='fixed inset-0 bg-black/50' />
      <div className='bg-[#0d1f35] rounded-xl shadow-lg p-6 w-full max-w-md relative z-10'>
        <Dialog.Title className='text-lg font-semibold text-white mb-4'>
          Perfil de Usuario
        </Dialog.Title>
        <div className='flex flex-col items-center gap-4'>
          <img
            src={user?.profilePicture || '/assets/img/avatar.png'}
            alt={user?.username}
            className='w-20 h-20 rounded-full object-cover border border-white/20'
            onError={(e) => {
              e.target.src = '/assets/img/avatar.png';
            }}
          />
          <p className='text-white font-medium'>
            {user?.name} {user?.surname}
          </p>
          <p className='text-gray-300 text-sm'>@{user?.username}</p>
          <p className='text-gray-400 text-sm'>{user?.email}</p>
          <p className='text-gray-500 text-xs'>{user?.role}</p>
        </div>
        <button
          onClick={onClose}
          className='mt-6 px-4 py-2 rounded-lg bg-main-blue text-white hover:bg-main-blue/80 transition'
        >
          Cerrar
        </button>
      </div>
    </Dialog>
  );
};
