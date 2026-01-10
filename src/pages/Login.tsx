import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { useAuth } from '../store/useAuth';
import { Lock, Delete } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleLogin = async () => {
    if (pin.length !== 4) return;
    setLoading(true);

    try {
      const user = await db.users.where('pinCode').equals(pin).first();
      
      // Simulate network delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 500));

      if (user && user.isActive) {
        login(user);
        navigate('/');
      } else {
        setError('Invalid PIN or inactive account');
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
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md z-10 p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden border border-white/20"
        >
            <div className="p-8 pb-6 flex flex-col items-center border-b border-slate-100">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <Lock size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orbit POS</h1>
                <p className="text-slate-500 font-medium mt-1">Enter your PIN to continue</p>
            </div>

            <div className="p-8 pt-6">
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
                            error ? 'bg-red-500' : ''
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
                            <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600 border border-red-100">
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                    key={num}
                    onClick={() => handleNumClick(num.toString())}
                    disabled={loading}
                    className="flex h-20 items-center justify-center rounded-2xl bg-slate-50 text-3xl font-bold text-slate-700 shadow-sm border border-slate-100 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
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
                    className="flex h-20 items-center justify-center rounded-2xl bg-slate-50 text-3xl font-bold text-slate-700 shadow-sm border border-slate-100 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                    0
                </button>
                <button
                    onClick={handleBackspace}
                    disabled={loading}
                    className="flex h-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-sm border border-slate-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                    <Delete size={28} />
                </button>
                </div>
            </div>
            
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <p className="text-xs font-medium text-slate-400">System Ready • v1.0.0</p>
                <p className="text-[10px] text-slate-300 mt-1">Default PIN: 1234</p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};