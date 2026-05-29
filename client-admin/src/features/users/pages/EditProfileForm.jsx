import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Spinner } from '../../../features/auth/components/Spinner.jsx';
import { updateProfile, getUserProfile as getUserProfile } from '../../../shared/apis/auth.js';

/**
 * EditProfileForm
 *
 * Props:
 *  - onSuccess  : () => void   — callback al guardar exitosamente
 *  - onCancel   : () => void   — callback al cancelar / volver
 *  - onPreview  : (url) => void — actualiza la preview de foto en el padre (igual que RegisterForm)
 */
export const EditProfileForm = ({ onSuccess, onCancel, onPreview }) => {
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [apiError, setApiError]   = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Cargar datos actuales del perfil al montar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile(); // GET /api/v1/Auth/profile con token
        if (res?.data) {
          reset({
            name:     res.data.name     ?? '',
            surname:  res.data.surname  ?? '',
            username: res.data.username ?? '',
            phone:    res.data.phone    ?? '',
          });
        }
      } catch {
        setApiError('No se pudo cargar el perfil.');
      } finally {
        setFetching(false);
      }
    };
    loadProfile();
  }, [reset]);

  const submit = async (values) => {
    setLoading(true);
    setApiError('');
    setApiSuccess('');

    const formData = new FormData();
    formData.append('Name',    values.name);
    formData.append('Surname', values.surname);
    formData.append('Username', values.username);
    formData.append('Phone',   values.phone);
    if (values.profilePicture?.[0]) {
      formData.append('ProfilePicture', values.profilePicture[0]);
    }

    try {
      const res = await updateProfile(formData); // PATCH /api/v1/Auth/profile
      if (res?.status === 200) {
        setApiSuccess('¡Perfil actualizado exitosamente!');
        onSuccess?.();
      }
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className='flex justify-center items-center py-16'>
        <Spinner />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn'
    >
      {/* Nombre */}
      <div>
        <label htmlFor='name' className='block text-sm font-medium text-white mb-2'>
          Nombre
        </label>
        <input
          {...register('name', {
            required: 'Este campo es requerido',
            minLength: { value: 3, message: 'Debe contener al menos 3 caracteres' },
            maxLength: { value: 25, message: 'Máximo 25 caracteres' },
            validate: (v) =>
              /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v) || 'Solo letras permitidas',
          })}
          type='text'
          id='name'
          placeholder='Nombre'
          className={`w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30 ${
            errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
          }`}
        />
        {errors.name && <p className='text-red-400 text-xs mt-1.5'>{errors.name.message}</p>}
      </div>

      {/* Apellido */}
      <div>
        <label htmlFor='surname' className='block text-sm font-medium text-white mb-2'>
          Apellido
        </label>
        <input
          {...register('surname', {
            required: 'Este campo es requerido',
            minLength: { value: 3, message: 'Debe contener al menos 3 caracteres' },
            maxLength: { value: 25, message: 'Máximo 25 caracteres' },
            validate: (v) =>
              /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(v) || 'Solo letras permitidas',
          })}
          type='text'
          id='surname'
          placeholder='Apellido'
          className={`w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30 ${
            errors.surname ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
          }`}
        />
        {errors.surname && (
          <p className='text-red-400 text-xs mt-1.5'>{errors.surname.message}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <label htmlFor='username' className='block text-sm font-medium text-white mb-2'>
          Username
        </label>
        <input
          {...register('username', {
            required: 'Este campo es requerido',
            minLength: { value: 3, message: 'Debe contener al menos 3 caracteres' },
            maxLength: { value: 30, message: 'Máximo 30 caracteres' },
          })}
          type='text'
          id='username'
          placeholder='Nombre de Usuario'
          className={`w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30 ${
            errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
          }`}
        />
        {errors.username && (
          <p className='text-red-400 text-xs mt-1.5'>{errors.username.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor='phone' className='block text-sm font-medium text-white mb-2'>
          Número de Teléfono
        </label>
        <input
          {...register('phone', {
            required: 'Este campo es requerido',
            pattern: {
              value: /^[0-9]{8}$/,
              message: 'Debe ser numérico y exactamente 8 dígitos',
            },
          })}
          type='text'
          id='phone'
          placeholder='12345678'
          className={`w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30 ${
            errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
          }`}
        />
        {errors.phone && <p className='text-red-400 text-xs mt-1.5'>{errors.phone.message}</p>}
      </div>

      {/* Foto de perfil */}
      <div className='flex flex-col md:col-span-2'>
        <label className='block text-sm font-medium text-white mb-2'>
          Foto de perfil <span className='text-gray-400 font-normal'>(opcional)</span>
        </label>
        <input
          type='file'
          accept='image/*'
          className='w-full px-3 py-4 rounded-xl border-2 border-dashed border-white/30 bg-[#0d1f35]/40 text-white hover:border-main-blue focus:outline-none focus:ring-2 focus:ring-main-blue/30 transition cursor-pointer'
          {...register('profilePicture')}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onPreview?.(url);
            }
          }}
        />
        <p className='text-gray-400 text-xs mt-1.5'>
          Deja vacío para mantener la foto actual. Máx. 10 MB.
        </p>
      </div>

      {/* Mensajes de feedback */}
      {apiError   && <p className='text-red-400  text-sm text-center md:col-span-2'>{apiError}</p>}
      {apiSuccess && <p className='text-emerald-400 text-sm text-center md:col-span-2'>{apiSuccess}</p>}

      {/* Botones */}
      <div className='flex justify-center gap-4 md:col-span-2 mt-4'>
        <button
          type='button'
          onClick={onCancel}
          className='px-8 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors duration-200'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={loading}
          className='px-8 py-3 rounded-full bg-gradient-to-r from-main-blue to-emerald-500 text-white font-semibold shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
        >
          {loading ? <Spinner small /> : 'Guardar cambios'}
        </button>
      </div>

      <p className='text-center text-sm text-gray-300 md:col-span-2'>
        <button
          type='button'
          onClick={onCancel}
          className='font-medium text-main-blue hover:underline hover:cursor-pointer'
        >
          ← Volver al perfil
        </button>
      </p>
    </form>
  );
};