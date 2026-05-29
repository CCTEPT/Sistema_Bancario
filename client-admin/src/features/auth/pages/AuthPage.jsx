import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPass } from '../components/ForgotPass.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { useState, useEffect, useRef } from 'react';

export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [preview, setPreview] = useState(null);

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      className='relative min-h-screen flex items-center justify-center overflow-hidden bg-[#11151c] p-4'
    >
      <div
        className='absolute inset-0 pointer-events-none transition-opacity duration-150'
        style={{
          background: `radial-gradient(circle 450px at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(62, 172, 99, 0.25) 0%, rgba(129, 229, 156, 0.08) 50%, transparent 80%)`,
        }}
      />
      <div className='relative w-full max-w-md rounded-2xl border border-[#83fb7f] bg-[#141823] p-8 shadow-lg'>
        <div className='flex justify-center mb-6'>
          <div className='w-20 h-20 rounded-full border-2 border-[#83fb7f] bg-[#11151c] shadow-md overflow-hidden flex items-center justify-center'>
            {isRegister && preview ? (
              <img
                src={preview}
                alt='Foto Perfil'
                className='w-full h-full object-cover rounded-full'
              />
            ) : (
              <img
                src='/src/assets/img/icon.png'
                alt='NovaBank Logo'
                className='w-20 h-20 object-contain'
              />
            )}
          </div>
        </div>

        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-white mb-2'>
            {isForgot
              ? 'Recuperar Contraseña'
              : isRegister
                ? 'Crear cuenta'
                : 'Bienvenido de nuevo'}
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
              setIsForgot(false);
            }}
          />
        ) : isRegister ? (
          <RegisterForm
            onSwitch={() => {
              setIsRegister(false);
              setPreview(null);
            }}
            onPreview={setPreview}
          />
        ) : (
          <LoginForm
            onForgot={() => {
              setIsForgot(true);
            }}
            onRegister={() => {
              setIsRegister(true);
            }}
          />
        )}
      </div>
    </div>
  );
};
