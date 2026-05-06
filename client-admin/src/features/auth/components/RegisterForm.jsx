import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'
//import { useEffect, useState } from 'react';
export const RegisterForm = ({ onSwitch, onPreview }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'photo' && value.photo && value.photo.length > 0) {
                const url = URL.createObjectURL(value.photo[0]);
                setPreview(url);
                onPreview(url);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setPreview]);

    const onSubmit = (data) => {
        console.log(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fadeIn">

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                    Nombre
                </label>
                <input
                    type="text"
                    id="name"
                    placeholder="Juan Pérez"
                    className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
            `}
                    {...register("name", { required: "Este campo es requerido" })}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                    Apellido
                </label>
                <input
                    type="text"
                    id="name"
                    placeholder="Juan Pérez"
                    className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
            `}
                    {...register("name", { required: "Este campo es requerido" })}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                    Username
                </label>
                <input
                    type="text"
                    id="name"
                    placeholder="Juan Pérez"
                    className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
            `}
                    {...register("name", { required: "Este campo es requerido" })}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Correo electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    placeholder="correo@example.com"
                    className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
          `}
                    {...register("email", { required: "Este campo es requerido" })}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1.5">{errors.email.message}</p>}
            </div>



            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
          `}
                    {...register("password", { required: "Este campo es requerido" })}
                />
                {errors.password && <p className="text-red-600 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                    Telefono
                </label>
                <input
                    type="text"
                    id="name"
                    placeholder="Juan Pérez"
                    className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800
            placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200
            focus:border-main-blue focus:ring-4 focus:ring-main-blue/15
            ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
            `}
                    {...register("name", { required: "Este campo es requerido" })}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            {/* Imagen */}
            <div className='flex flex-col md:col-span-2'>
                <label className='text-sm font-semibold text-gray-700 mb-1'>Foto de perfill</label>
                <input
                    type='file'
                    className='w-full px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 
                                hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition cursor-pointer'
                    accept='image/*'
                    {...register('photo')}
                />
            </div>

            <button
                type="submit"
                className="
          w-full rounded-xl bg-main-blue px-4 py-3 text-sm font-semibold text-white
          shadow-md shadow-main-blue/25 transition-all duration-200
          hover:-translate-y-0.5 hover:bg-main-blue-dark hover:shadow-lg
          active:translate-y-0
        "
            >
                Registrarse
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
