import React, { useEffect, useState } from 'react';
import { User, Wifi, Menu } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import { Button } from './ui/Button';

export const Topbar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const user = useAuth((state) => state.user);
  const { toggleSidebar } = useUI();

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu size={20} />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-slate-900">
            {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-xs text-slate-500">
            {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <Wifi size={14} />
            <span>Online</span>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User size={18} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.username || 'Staff'}</p>
            <p className="text-xs text-slate-500">Active Session</p>
          </div>
        </div>
      </div>
    </header>
  );
};