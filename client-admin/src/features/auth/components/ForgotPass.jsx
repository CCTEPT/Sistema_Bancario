import { useForm } from 'react-hook-form';
import { Spinner } from "../../../features/auth/components/Spinner.jsx"
import { toast } from 'react-hot-toast';
import { forgotPassword } from '../../../shared/apis/auth.js';

export const ForgotPass = ({ onChange, loading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const submit = async (data) => {
        try {
            const res = await forgotPassword(data.forgotPassword);
            if(res){
                toast.success('Correo de recuperación enviado');
                onChange();
                reset();
            }
        } catch (err) {
            console.error('Error al enviar correo de recuperación', err);
        }
        
    }

    return (
        <form className="space-y-6 animate-fadeIn" onSubmit={handleSubmit(submit)}>
            <div>
                <label htmlFor='forgotPassword' className='block text-sm font-medium text-gray-300 mb-2'>
                    Recuperar contrasena
                </label>

                <input 
                    type='email'
                    id='forgotPassword'
                    placeholder='correo@example.com'
                    className='w-full rounded-lg border border-[#83fb7f] bg-[#11151c] px-4 py-3 text-sm text-white
                    placeholder:text-gray-500 outline-none transition-all duration-200
                    focus:border-[#83fb7f] focus:ring-2 focus:ring-[#83fb7f]/40'
                    
                    {...register('forgotPassword', { required: 'Este campo es requerido'})}
                />
                {errors.forgotPassword && <p className='text-red-400 text-xs mt-1'>{errors.forgotPassword.message}</p>}
            </div>

            <button
                type = 'submit'
                className='w-full rounded-lg bg-[#83fb7f] px-4 py-3 text-sm font-semibold text-[#11151c] shadow-md transition-all duration-200 hover:bg-[#68e865] hover:-translate-y-0.5 active:translate-y-0'

            >
                {loading ? <Spinner /> : 'Enviar correo de recuperación'}
            </button>
            <p className='text-center text-sm text-gray-400'>
                <button
                    type='button'
                    className='text-[#83fb7f] hover:text-[#68e865] transition-colors hover:underline hover:cursor-pointer'
                    onClick={onChange}
                >
                    Iniciar sesión
                </button>
            </p>
        </form>
    )
}
