import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import { usePermission } from '@/hooks/usePermission';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/', permission: 'view_pos' as const },
  { icon: ShoppingCart, label: 'POS', to: '/pos', permission: 'view_pos' as const },
  { icon: History, label: 'History', to: '/history', permission: 'view_history' as const },
  { icon: Package, label: 'Inventory', to: '/inventory', permission: 'view_inventory' as const },
  { icon: Users, label: 'Customers', to: '/customers', permission: 'view_customers' as const },
  { icon: Settings, label: 'Settings', to: '/settings', permission: 'view_settings' as const },
];

export const Sidebar: React.FC = () => {
  const logout = useAuth((state) => state.logout);
  const { isSidebarOpen } = useUI();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const visibleNavItems = navItems.filter((item) => hasPermission(item.permission));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out overflow-hidden",
        "dark:border-slate-800 dark:bg-slate-900",
        isSidebarOpen ? "w-64" : "w-0 border-none"
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800 min-w-[16rem]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            O
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Orbit POS</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 min-w-[16rem]">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                // Dark mode styles
                isActive
                  ? 'dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500'
                  : 'dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400",
                    isActive ? "dark:text-blue-400" : "dark:text-slate-500"
                  )} 
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

       <div className="border-t border-slate-200 dark:border-slate-800 p-4 min-w-[16rem]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 dark:text-slate-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};
