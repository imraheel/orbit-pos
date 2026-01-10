import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { useAuth } from '../store/useAuth';
import { Lock, Delete } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

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
      // Find user with this PIN
      const user = await db.users.where('pinCode').equals(pin).first();
      console.log('Login attempt with PIN:', pin, 'Found user:', user);

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

  // Auto-submit when pin reaches 4 digits
  React.useEffect(() => {
    if (pin.length === 4) {
      handleLogin();
    }
  }, [pin]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Orbit POS</h1>
          <p className="text-gray-500">Enter your PIN to continue</p>
        </div>

        {/* PIN Display */}
        <div className="mb-8 flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={clsx(
                'h-4 w-4 rounded-full transition-all duration-200',
                i < pin.length ? 'scale-125 bg-blue-600' : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              disabled={loading}
              className="flex h-16 items-center justify-center rounded-xl bg-gray-50 text-2xl font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center">
             {/* Empty slot for alignment */}
          </div>
          <button
            onClick={() => handleNumClick('0')}
            disabled={loading}
            className="flex h-16 items-center justify-center rounded-xl bg-gray-50 text-2xl font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={loading}
            className="flex h-16 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition-all"
          >
            <Delete size={24} />
          </button>
        </div>
        
        <div className="mt-8 flex justify-center">
            <p className="text-xs text-gray-400">Default PIN: 1234</p>
        </div>
      </div>
    </div>
  );
};
