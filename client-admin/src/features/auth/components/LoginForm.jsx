import { useForm } from 'react-hook-form'
//import { useAuthStore } from '../store/authStore.js'
export const LoginForm = ({ onForgot }) => {
  const {
    register,
    formState: { errors }
  } = useForm()

  return (
    <form className='space-y-5 animate-fadeIn'>
      <div>
        <label
          htmlFor='emailOrUsername'
          className='block text-sm font-semibold text-gray-700 mb-1.5'
        >
          Email o Username
        </label>

        <input
          type='text'
          id='emailOrUsername'
          placeholder='correo@example.com o username'
          className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.emailOrUsername ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
          `}
          {
            ...register('emailOrUsername', {
              required: 'Este campo es requerido'
            })
          }
        />

        {errors.emailOrUsername && (
          <p className='text-red-600 text-xs mt-1.5'>
            {errors.emailOrUsername.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor='password'
          className='block text-sm font-semibold text-gray-700 mb-1.5'
        >
          Contraseña
        </label>

        <input
          type='password'
          id='password'
          placeholder='••••••••'
          className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
          `}
          {
            ...register('password', {
              required: 'Este campo es requerido'
            })
          }
        />

        {errors.password && (
          <p className='text-red-600 text-xs mt-1.5'>
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type='submit'
        className='
          w-full rounded-xl bg-main-blue px-4 py-3 text-sm font-semibold text-white
          shadow-md shadow-main-blue/25 transition-all duration-200
          hover:-translate-y-0.5 hover:bg-main-blue-dark hover:shadow-lg
          active:translate-y-0
        '
      >
        Iniciar Sesión
      </button>

      <p className='text-center text-sm text-gray-500'>
        <button
          type='button'
          onClick={onForgot}
          className='font-medium text-main-blue hover:underline hover:cursor-pointer'
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>
    </form>
  )
}