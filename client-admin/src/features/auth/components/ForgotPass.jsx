
export const ForgotPass = ({ onSwitch }) => {
    return (
        <p className='text-center text-sm'>
            <button
                type='button'
                onClick={onSwitch}
                className='text-main-blue hover:underline hover:cursor-pointer'
            >
                Iniciar Sesión
            </button>
        </p>
    )
}
