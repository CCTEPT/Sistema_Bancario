import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import toast from 'react-hot-toast'

export const LoginForm = ({ onForgot, onRegister }) => {
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    const res = await login(data);
    if(res.success){
      const role = useAuthStore.getState().user?.role;
      if(role === "ADMIN_ROLE"){
          navigate('/dashboard');
      }else{
        navigate('/users')
      }
      toast.success("Bienvenido de nuevo!", {duration: 3000});
    }
    console.log(res);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 animate-fadeIn'>
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
            w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/30
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
            w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/30
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

        <p className='text-right text-sm text-gray-500'>
        <button
          type='button'
          onClick={onForgot}
          className='font-medium text-main-blue hover:underline hover:cursor-pointer'
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>
      </div>
      
        {error && <p className='text-red-750 text-sm text-center'>{error}</p>}
      <button
        type='submit'
        className='
          w-full rounded-xl bg-main-blue px-4 py-3 text-sm font-semibold text-white
          shadow-md shadow-main-blue/25 transition-all duration-200
          hover:-translate-y-0.5 hover:bg-main-blue-dark hover:shadow-lg
          active:translate-y-0
        '
        disabled={loading}
      >
        {loading ? "Iniciado sesión..." : "Iniciar sesión"}
      </button>


      <p className='text-center text-sm text-gray-500'>
        <button
          type='button'
          onClick={onRegister}
          className='font-medium text-main-blue hover:underline hover:cursor-pointer'
        >
          Aún no tienes una cuenta? Registrate aquí
        </button>
      </p>
    </form>
  )
}