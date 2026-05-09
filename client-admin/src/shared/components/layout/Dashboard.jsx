import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Dashboard = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#11151c] via-[#141823] to-[#11151c] text-white">
      <Navbar user={user} onLogout={onLogout} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 animate-fadeIn">{children}</main>
      </div>
    </div>
  );
};
