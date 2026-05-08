import { Typography } from '@material-tailwind/react';
import { AvatarUser } from '../ui/AvatarUser.jsx';
import imgLogo from '../../../assets/img/logoBanco.png';

export const Navbar = () => {
  return (
    <nav className='bg-gray-100 shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <img src={imgLogo} alt='Kinal Sports Logo' className='h-8 md' />
          <Typography></Typography>
        </div>
        <AvatarUser />
      </div>
    </nav>
  )
}
