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
        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
            <div>
                <label htmlFor='forgotPassword' className='block text-sm font-medium text-gray-800 mb-1.5'>
                    Recuperar contrasena
                </label>

                <input 
                    type='email'
                    id='forgotPassword'
                    placeholder='correo@example.com'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    {...register('forgotPassword', { required: 'Este campo es requerido'})}
                />
                {errors.forgotPassword && <p className='text-red-500 text-sm mt-1'>{errors.forgotPassword.message}</p>}
            </div>

            <button
                type = 'submit'
                className='w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm'

            >
                {loading ? <Spinner /> : 'Enviar correo de recuperación'}
            </button>
            <p className='text-center text-sm'>
                <button
                    type='button'
                    className='text-main-green hover:underline hover:cursor-pointer'
                    onClick={onChange}
                >
                    Iniciar sesión
                </button>
            </p>
        </form>
    )
}
