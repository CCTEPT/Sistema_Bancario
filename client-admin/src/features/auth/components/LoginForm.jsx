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
    if (res.success) {
      const role = useAuthStore.getState().user?.role;
      if (role === 'ADMIN_ROLE') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
      toast.success('Bienvenido de nuevo!', { duration: 3000 });
    }
  };

  const enterDemo = (role) => {
    const user = DEMO_USERS[role];
    useAuthStore.setState({
      user,
      token: `demo-token-${role}`,
      isAuthenticated: true,
      isLoadingAuth: false,
      role,
    });
    const dest = role === 'EMPLOYEE_ROLE' ? '/dashboard/employee'
      : role === 'ADMIN_ROLE' ? '/dashboard'
        : '/dashboard';
    toast.success(`Demo: entrando como ${user.name} (${role.replace('_ROLE', '')})`, { duration: 2000 });
    navigate(dest);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fadeIn">
      <div>
        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-300 mb-2">
          Email o Username
        </label>
        <input
          type="text"
          id="emailOrUsername"
          placeholder="correo@example.com o username"
          className={`
            w-full rounded-lg border border-[#83fb7f] bg-[#11151c] px-4 py-3 text-sm text-white
            placeholder:text-gray-500 outline-none transition-all duration-200
            focus:border-[#83fb7f] focus:ring-2 focus:ring-[#83fb7f]/40 ${errors.emailOrUsername ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`
          }
          {...register("emailOrUsername", { required: "Este campo es requerido" })}
        />
        {errors.emailOrUsername && (
          <p className='text-red-400 text-xs mt-1'>{errors.emailOrUsername.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          placeholder="••••••••"
          className={`
            w-full rounded-lg border border-[#83fb7f] bg-[#11151c] px-4 py-3 text-sm text-white
            placeholder:text-gray-500 outline-none transition-all duration-200
            focus:border-[#83fb7f] focus:ring-2 focus:ring-[#83fb7f]/40
            ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}
          `}
          {...register("password", { required: "Este campo es requerido" })}
        />
        {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}

        <p className="text-right text-sm mt-2">
          <button
            type="button"
            onClick={onForgot}
            className="text-[#83fb7f] hover:text-[#68e865] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-[#83fb7f] px-4 py-3 text-sm font-semibold text-[#11151c] shadow-md transition-all duration-200 hover:bg-[#68e865] hover:-translate-y-0.5 active:translate-y-0"
        disabled={loading}
      >
        {loading ? "Iniciando sesión..." : "Authenticate"}
      </button>

      <p className="text-center text-sm text-gray-400">
        <button
          type="button"
          onClick={onRegister}
          className="text-[#83fb7f] hover:text-[#68e865] transition-colors"
        >
          ¿No tienes cuenta? Inicializa una
        </button>
      </p>
    </form>
  );
}
