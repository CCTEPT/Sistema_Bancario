import { useForm } from 'react-hook-form'
import { Spinner } from "../../../features/auth/components/Spinner.jsx"
//import { useNavigate } from 'react-router-dom'; 
import { createUser } from '../../../shared/apis/auth.js';

export const RegisterForm = ({ loading, error, onSwitch }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    ///const navigate = useNavigate();

    const submit = async (values) => {
        const formData = new FormData();
        formData.append('Name', values.name);
        formData.append('Surname', values.surname);
        formData.append('Username', values.username);
        formData.append('Email', values.email);
        formData.append('Password', values.password);
        formData.append('Phone', values.phone);
        if (values.profilePicture?.[0]) {
        formData.append('ProfilePicture', values.profilePicture[0]);
        }
        
        const ok = await createUser(formData);
        if(ok){
            onSwitch();
            reset();
        }

    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-5 animate-fadeIn">

            <div>
                <label htmlFor="name"className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                <input
                    {...register("name", { required: "Este campo es requerido" })}
                    type="text"
                    id="name"
                    placeholder="Nombre"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="surname"className="block text-sm font-semibold text-gray-700 mb-1.5">Apellido</label>
                <input
                    {...register("surname", { required: "Este campo es requerido" })}
                    type="text"
                    id="surname"
                    placeholder="Apellido"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.surname ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.surname && <p className="text-red-600 text-xs mt-1.5">{errors.surname.message}</p>}
            </div>

            <div>
                <label htmlFor="username"className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                <input
                    {...register("username", { required: "Este campo es requerido" })}
                    type="text"
                    id="username"
                    placeholder="Nombre de Usuario"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.username && <p className="text-red-600 text-xs mt-1.5">{errors.username.message}</p>}
            </div>

            <div>
                <label htmlFor="email"className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico</label>
                <input
                    {...register("email", { required: "Este campo es requerido" })}
                    type="email"
                    id="email"
                    placeholder="correo@example.com"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1.5">{errors.email.message}</p>}
            </div>


            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                <input
                    {...register("password", { required: "Este campo es requerido" })}
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.password && <p className="text-red-600 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
                <label htmlFor="phone"className="block text-sm font-semibold text-gray-700 mb-1.5">Número de Teléfono</label>
                <input
                    {...register("phone", { required: "Este campo es requerido" })}
                    type="text"
                    id="phone"
                    placeholder="12345678"
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
                        placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
                        focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
                        ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1.5">{errors.phone.message}</p>}
            </div>

            {/* Imagen */}
            <div className='flex flex-col md:col-span-2'>
                <label className='text-sm font-semibold text-gray-700 mb-1'>Foto de perfill</label>
                <input
                    type='file'
                    className='w-full px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 
                                hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition cursor-pointer'
                    accept='image/*'
                    {...register('profilePicture')}
                />
            </div>
            {error && <p className='text-red-600 text-sm text-center'>{error}</p>}

            <button
                type="submit"
                className="
                    w-full rounded-xl bg-main-blue px-4 py-3 text-sm font-semibold text-white
                    shadow-md shadow-main-blue/25 transition-all duration-200
                    hover:-translate-y-0.5 hover:bg-main-blue-dark hover:shadow-lg
                    active:translate-y-0"
            >
                {loading ? <Spinner small/> : 'Registrarse'}
            </button>

            <p className="text-center text-sm text-gray-500">
                <button
                    type="button"
                    onClick={onSwitch}
                    className="font-medium text-main-blue hover:underline hover:cursor-pointer"
                >
                    ¿Ya tienes cuenta? Inicia sesión
                </button>
            </p>
        </form>
    )
}
