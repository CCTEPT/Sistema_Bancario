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
            if (res) {
                navigate('/login');
                reset();
            }
        } catch (err) {
            console.error('Error al enviar correo de recuperación', err);
        }

    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11151c] via-[#141823] to-[#11151c] p-4'>
            <div className='w-full max-w-md rounded-2xl border border-[#83fb7f] bg-[#141823]/90 p-8 shadow-lg'>
                <h1 className='text-2xl font-bold text-white mb-6 text-center'>
                    Restablecer Contraseña
                </h1>
                <form className='space-y-6 animate-fadeIn' onSubmit={handleSubmit(submit)}>
                    <div>
                        <label htmlFor='forgotPassword' className='block text-sm font-medium text-gray-300 mb-2'>
                            Ingresa Token
                        </label>

                        <input
                            type='text'
                            id='token'
                            placeholder='Token de recuperación'
                            className='w-full rounded-lg border border-[#83fb7f] bg-[#11151c] px-4 py-3 text-sm text-white
                            placeholder:text-gray-500 outline-none transition-all duration-200
                            focus:border-[#83fb7f] focus:ring-2 focus:ring-[#83fb7f]/40'
                            {...register('token', { required: 'Este campo es requerido' })}
                        />
                        {errors.token && <p className='text-red-400 text-sm mt-1'>{errors.token.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Nueva Contraseña
                        </label>
                        <input
                            {...register("newPassword", { required: "Este campo es requerido" })}
                            type="password"
                            id="newPassword"
                            placeholder="••••••••"
                            className={`
                            w-full rounded-lg border border-[#83fb7f] bg-[#11151c] px-4 py-3 text-sm text-white
                            placeholder:text-gray-500 outline-none transition-all duration-200
                            focus:border-[#83fb7f] focus:ring-2 focus:ring-[#83fb7f]/40
                            ${errors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}
                            `}
                        />
                        {errors.newPassword && <p className="text-red-600 text-xs mt-1.5">{errors.newPassword.message}</p>}
                    </div>



                    <button
                        type='submit'
                        className='w-full rounded-lg bg-[#83fb7f] px-4 py-3 text-sm font-semibold text-[#11151c] shadow-md transition-all duration-200 hover:bg-[#68e865] hover:-translate-y-0.5 active:translate-y-0'

                    >
                        {isSubmitted ? 'Guardando...' : 'Guardar contraseña'}
                    </button>
                    <p className='text-center text-sm text-gray-400'>
                        <button
                            type='button'
                            className='text-[#83fb7f] hover:text-[#68e865] transition-colors hover:underline hover:cursor-pointer'
                            onClick={() => navigate('/login')}
                        >
                            Iniciar sesión
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )
}
