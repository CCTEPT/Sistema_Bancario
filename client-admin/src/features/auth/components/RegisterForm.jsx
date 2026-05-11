import { useForm } from 'react-hook-form'
import { Spinner } from "../../../features/auth/components/Spinner.jsx"
import { createUser } from '../../../shared/apis/auth.js';

export const RegisterForm = ({ loading, error, onSwitch, onPreview }) => {
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
        formData.append('TipoCuenta', values.tipoCuenta);
        formData.append('Divisa', values.divisa);
        if (values.profilePicture?.[0]) {
            formData.append('ProfilePicture', values.profilePicture[0]);
        }

        const ok = await createUser(formData);
        if (ok?.status === 201) {
            localStorage.setItem(
                'pending_bank_account',
                JSON.stringify({ tipoCuenta: values.tipoCuenta, divisa: values.divisa })
            );
            onSwitch();
            reset();
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Nombre</label>
                <input
                    {...register("name", {
                        required: "Este campo es requerido",
                        minLength:{
                            value: 3,
                            message: 'Debe contener al menos 3 caracteres'
                        },
                        validate: (value) => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value) || 'Solo letras permitidas'
                    })}
                    type="text"
                    id="name"
                    placeholder="Nombre"
                    className={`
                        w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30
                        ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="surname" className="block text-sm font-medium text-white mb-2">Apellido</label>
                <input
                    {...register("surname", {
                        required: "Este campo es requerido",
                        minLength:{
                            value: 3,
                            message: 'Debe contener al menos 3 caracteres'
                        },
                        validate: (value) => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value) || "Solo letras permitidas"
                    })}
                    type="text"
                    id="surname"
                    placeholder="Apellido"
                    className={`
                        w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30"
                        ${errors.surname ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.surname && <p className="text-red-400 text-xs mt-1.5">{errors.surname.message}</p>}
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">Username</label>
                <input
                    {...register("username", { 
                        required: "Este campo es requerido",
                        minLength:{
                            value: 3,
                            message: 'Debe contener al menos 3 caracteres'
                        }
                    })}
                    type="text"
                    id="username"
                    placeholder="Nombre de Usuario"
                    className={`
                        w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30"
                        ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.username && <p className="text-red-400 text-xs mt-1.5">{errors.username.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Correo Electrónico</label>
                <input
                    {...register("email", { 
                        required: "Este campo es requerido",
                        pattern:{
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Correo invalido'
                        } 
                    
                    })}
                    type="email"
                    id="email"
                    placeholder="correo@example.com"
                    className={`
                        w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30"
                        ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>


            <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Contraseña</label>
                <input
                    {...register("password", { 
                        required: "Este campo es requerido", 
                        minLength:{
                            value: 8,
                            message: 'Debe contener al menos 8 carácteres'
                        }
                    })}
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className={`
                        w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30"
                        ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">Número de Teléfono</label>
                <input
                    {...register("phone", { 
                        required: "Este campo es requerido", 
                        pattern: {
                            value: /^[0-9]{8,}$/,
                            message: 'Debe ser númerico y con 8 carácteres'

                        }
                    })}
                    type="text"
                    id="phone"
                    placeholder="12345678"
                    className={`
                        w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-main-blue focus:ring-4 focus:ring-main-blue/30"
                        ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>}
            </div>

            <div>
                <label htmlFor="tipoCuenta" className="block text-sm font-medium text-white mb-2">Tipo de Cuenta</label>
                <select
                    {...register('tipoCuenta', { required: 'Este campo es requerido' })}
                    id="tipoCuenta"
                    className={`w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white focus:border-main-blue focus:ring-4 focus:ring-main-blue/30 ${errors.tipoCuenta ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                >
                    <option value="" disabled>Selecciona tipo de cuenta</option>
                    <option value="ahorro">Ahorro</option>
                    <option value="corriente">Corriente</option>
                </select>
                {errors.tipoCuenta && <p className="text-red-400 text-xs mt-1.5">{errors.tipoCuenta.message}</p>}
            </div>

            <div>
                <label htmlFor="divisa" className="block text-sm font-medium text-white mb-2">Divisa</label>
                <select
                    {...register('divisa', { required: 'Este campo es requerido' })}
                    id="divisa"
                    className={`w-full rounded-xl border border-white/20 bg-[#0d1f35]/70 px-4 py-3 text-sm text-white focus:border-main-blue focus:ring-4 focus:ring-main-blue/30 ${errors.divisa ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}`}
                >
                    <option value="" disabled>Selecciona divisa</option>
                    <option value="GTQ">GTQ</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
                {errors.divisa && <p className="text-red-400 text-xs mt-1.5">{errors.divisa.message}</p>}
            </div>

            {/* Imagen */}
            <div className='flex flex-col md:col-span-2'>
                <label className='block text-sm font-medium text-white mb-2'>Foto de perfill</label>
                <input
                    type='file'
                    className='w-full px-3 py-4 rounded-xl border-2 border-dashed border-white/30 bg-[#0d1f35]/40 text-white hover:border-main-blue focus:outline-none focus:ring-2 focus:ring-main-blue/30 transition cursor-pointer'
                    accept='image/*'
                    {...register('profilePicture')}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const url = URL.createObjectURL(file);
                            onPreview(url); // actualiza el estado en AuthPage
                        }
                    }}
                />
            </div>
            {error && <p className='text-red-600 text-sm text-center'>{error}</p>}

            <div className="flex justify-center md:col-span-2 mt-4">
                <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-main-blue to-emerald-500 text-white font-semibold shadow-md hover:scale-105 transition-transform duration-200"
                >
                    {loading ? <Spinner small /> : 'Registrarse'}
                </button>
            </div>


            <p className="text-center text-sm text-gray-300 md:col-span-2">
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
