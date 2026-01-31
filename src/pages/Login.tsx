import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, IUser } from '../db';
import { useAuth } from '../store/useAuth';
import { Lock, Delete, ChevronDown, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | string>('');
  
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await db.users.toArray();
      setUsers(allUsers);
      if (allUsers.length > 0) {
        setSelectedUserId(allUsers[0].id!);
      }
    };
    fetchUsers();
  }, []);

  const handleNumClick = (num: string) => {
    if (loading) return;
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      
      if (e.key >= '0' && e.key <= '9') {
        handleNumClick(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, pin.length]);

  const handleLogin = async () => {
    if (pin.length !== 4) return;
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }
    
    setLoading(true);

    try {
      const user = users.find(u => u.id === Number(selectedUserId));
      
      // Simulate network delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 500));

      if (user && user.pinCode === pin && user.isActive) {
        login(user);
        navigate('/');
      } else {
        setError('Invalid PIN');
        setPin('');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (pin.length === 4) {
      handleLogin();
    }
  }, [pin]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900 overflow-hidden relative">
      {/* Background Elements - Enhanced for dark mode */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl z-10 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white/95 dark:bg-slate-900/95 dark:backdrop-blur-xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/30 grid md:grid-cols-2"
        >
            {/* Left Panel: Logo & User Selection */}
            <div className="p-8 md:p-12 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-700/50">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-500/30">
                    <Lock size={40} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight text-center">Orbit POS</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-center mb-8">Secure Access Portal</p>
                
                {/* User Selection */}
                <div className="w-full max-w-xs mb-8">
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select User</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <User size={18} />
                    </div>
                    <select
                      value={selectedUserId}
                      onChange={(e) => {
                        setSelectedUserId(Number(e.target.value));
                        setPin('');
                        setError('');
                      }}
                      className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-3.5 pl-11 pr-10 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-400"
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                      {users.length === 0 && <option disabled>No users found</option>}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-auto text-center">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">System Ready • v1.0.0</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Default PIN: 1234</p>
                </div>
            </div>

            {/* Right Panel: PIN Entry */}
            <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900/50">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Enter PIN</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Please enter your 4-digit security PIN</p>
                </div>

                {/* PIN Dots */}
                <div className="mb-8 flex justify-center gap-6 h-8 items-center">
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                        key={i}
                        animate={{ 
                            scale: i < pin.length ? 1 : 0.8,
                            backgroundColor: i < pin.length ? '#2563eb' : '#e2e8f0'
                        }}
                        className={cn(
                            'h-4 w-4 rounded-full shadow-sm',
                            error ? 'bg-red-500 dark:bg-red-400' : ''
                        )}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="rounded-xl bg-red-50 dark:bg-red-500/20 p-3 text-center text-sm font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30">
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                    key={num}
                    onClick={() => handleNumClick(num.toString())}
                    disabled={loading}
                    className="flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
                    >
                    {num}
                    </button>
                ))}
                <div className="flex items-center justify-center opacity-0">
                    {/* Empty slot */}
                </div>
                <button
                    onClick={() => handleNumClick('0')}
                    disabled={loading}
                    className="flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
                >
                    0
                </button>
                <button
                    onClick={handleBackspace}
                    disabled={loading}
                    className="flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-500/20 hover:border-red-200 dark:hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-red-500/10 active:scale-95 transition-all disabled:opacity-50"
                >
                    <Delete size={28} />
                </button>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};