import { LoginForm } from "../components/LoginForm.jsx"
import { ForgotPass } from "../components/ForgotPass.jsx"
import { RegisterForm } from "../components/RegisterForm.jsx"
import { useState } from "react"

export const AuthPage = () => {
    const [isForgot, setIsForgot] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [preview, setPreview] = useState(null);
    return (
        <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-[#11151c] p-4'>
            <div className="absolute inset-0">
                {/* Gradiente base */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#11151c] via-[#141823] to-[#11151c]" />
                {/* Patrón geométrico */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#83fb7f20_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 animate-pulse" />
                {/* Halo neón */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[600px] h-[600px] rounded-full bg-[#83fb7f]/10 blur-[160px]" />
                </div>
            </div>
            <div className='relative w-full max-w-md rounded-2xl border border-[#83fb7f] bg-[#141823] p-8 shadow-lg'>

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full border-2 border-[#83fb7f] bg-[#11151c] shadow-md overflow-hidden flex items-center justify-center">
                        {isRegister && preview ? (
                            <img src={preview} alt="Foto Perfil" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <img
                                src="/src/assets/img/logoBanco.png"
                                alt="NovaBank Logo"
                                className="w-16 h-16 object-contain"
                            />
                        )}
                    </div>
                </div>


                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-bold text-white mb-2'>
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
                ) : isRegister ? (
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