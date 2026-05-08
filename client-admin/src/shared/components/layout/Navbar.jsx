import { AvatarUser } from '../ui/AvatarUser.jsx'
import imgLogo from '../../../assets/img/logoBanco.png'

export const Navbar = () => {
  return (
    <nav className='bg-main-blue-dark shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <img src={imgLogo} alt='Logo' className='h-8' />
          <span className='text-white font-semibold tracking-wide'>
            Banking Dashboard
          </span>
        </div>

        <AvatarUser />
      </div>
    </nav>
  )
}