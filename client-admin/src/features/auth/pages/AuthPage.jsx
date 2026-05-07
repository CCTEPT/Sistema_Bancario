import { LoginForm } from "../components/LoginForm.jsx"
import { ForgotPass } from "../components/ForgotPass.jsx"
import { RegisterForm } from "../components/RegisterForm.jsx"
import { useState } from "react"

export const AuthPage = () => {
    const [isForgot, setIsForgot] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [preview, setPreview] = useState(null);
    return (
        <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-4'>

            <div className='absolute inset-0'>
                <div className='absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-main-blue/30 blur-[120px]' />
                <div className='absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-emerald-400/20 blur-[120px]' />
                <div className='absolute top-1/3 left-1/2 h-[280px] w-[280px] rounded-full bg-white/10 blur-[100px]' />
            </div>

            <div className='relative w-full max-w-xl rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl md:p-10'>

                <div className='flex justify-center mb-6'>
                    <div className='rounded-3xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md'>
                        {isRegister && preview ? (
                            <img src="{preview}" alt="Foto Perfil" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                        <img
                            src='/src/assets/img/logoBanco.png'
                            alt='NovaBank Logo'
                            className='h-20 w-auto rounded-2xl'
                        />
                        )}
                        
                    </div>
                </div>

                <div className='text-center mb-6'>
                    <h1 className='text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight'>
                        {isForgot ? 'Recuperar Contraseña' : isRegister ? 'Crear cuenta' : 'Bienvenido de nuevo'}
                    </h1>

                    <p className='text-white/60 text-base max-w-md mx-auto'>
                        {isForgot
                            ? 'Ingresa tu correo para recuperar tu contraseña'
                            : isRegister
                            ? ' Completa los datos para poder registrarte'
                            : 'Ingresa a tu cuenta de administrador'}
                    </p>
                </div>

                {isForgot ? (
                    <ForgotPass
                        onChange={() => {
                            setIsForgot(false)
                        }}
                    />
                ): isRegister ? (
                    <RegisterForm 
                        onSwitch={() => {
                            setIsRegister(false)
                        }}
                        onPreview={setPreview}
                    />
                ) : (
                    <LoginForm
                        onForgot={() => {
                            setIsForgot(true)
                        }}
                        onRegister={() => {
                            setIsRegister(true)
                        }}
                    />
                )}
            </div>
        </div>
    )
}