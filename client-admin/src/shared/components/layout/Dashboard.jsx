import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Dashboard = ({user, onLogout, children }) => {
  return (
    <div className='min-h-screen bg-gray-500 flex flex-col'>
      <Navbar user={user} onLogout={onLogout} />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  )
}
