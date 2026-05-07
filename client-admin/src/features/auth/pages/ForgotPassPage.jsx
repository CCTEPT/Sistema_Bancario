import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'
import { resetPassword } from '../../../shared/apis/auth.js';

export const ForgotPassPage = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitted },
    } = useForm();

    const navigate = useNavigate();

    const submit = async (data) => {
        try {
            const res = await resetPassword(data.token, data.newPassword);
            if(res){
                navigate('/login');
                reset();
            }
        } catch (err) {
            console.error('Error al enviar correo de recuperación', err);
        }
        
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
            <div>
                <label htmlFor='forgotPassword' className='block text-sm font-medium text-gray-800 mb-1.5'>
                    Ingresa Token
                </label>

                <input 
                    type='text'
                    id='token'
                    placeholder='Token de recuperación'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    {...register('token', { required: 'Este campo es requerido'})}
                />
                {errors.token && <p className='text-red-500 text-sm mt-1'>{errors.token.message}</p>}
            </div>

            <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-1.5"> Nueva Contraseña</label>
                <input
                    {...register("newPassword", { required: "Este campo es requerido" })}
                    type="password"
                    id="newPassword"
                    placeholder="••••••••"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.newPassword && <p className="text-red-600 text-xs mt-1.5">{errors.newPassword.message}</p>}
            </div>



            <button
                type = 'submit'
                className='w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm'

            >
                {isSubmitted ? 'Guardando...' : 'Guardar contraseña'}
            </button>
            <p className='text-center text-sm'>
                <button
                    type='button'
                    className='text-main-green hover:underline hover:cursor-pointer'
                    onClick={() => navigate('/login')}
                >
                    Iniciar sesión
                </button>
            </p>
        </form>
    )
}
