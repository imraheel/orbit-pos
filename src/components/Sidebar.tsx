import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: ShoppingCart, label: 'POS', to: '/pos' },
  { icon: History, label: 'History', to: '/history' },
  { icon: Package, label: 'Inventory', to: '/inventory' },
  { icon: Users, label: 'Customers', to: '/customers' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export const Sidebar: React.FC = () => {
  const logout = useAuth((state) => state.logout);
  const { isSidebarOpen } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden",
        isSidebarOpen ? "w-64" : "w-0 border-none"
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-700 min-w-[16rem]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            O
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Orbit POS</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 min-w-[16rem]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                 isActive
                   ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                   : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-blue-600" : "text-slate-400 dark:text-slate-500"} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

       <div className="border-t border-slate-200 dark:border-slate-700 p-4 min-w-[16rem]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};