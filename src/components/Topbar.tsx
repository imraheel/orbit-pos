import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../store/useAuth';

export const Topbar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const user = useAuth((state) => state.user);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        <p className="text-sm text-gray-500">
          {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-full bg-gray-100 px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <User size={18} />
        </div>
        <div className="text-sm">
          <p className="font-medium text-gray-700">{user?.username || 'Unknown User'}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
      </div>
    </header>
  );
};
