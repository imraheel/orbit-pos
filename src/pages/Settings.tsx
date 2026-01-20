import React, { useState, useEffect } from 'react';
import { db, IUser } from '../db';
import { Plus, Trash2, Edit2, Save, X, Search, ShieldCheck, ShieldAlert, Users, Settings as SettingsIcon, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useSettings } from '../store/useSettings';
import { cn } from '../lib/utils';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    pinCode: '',
    isActive: true,
  });

  // Delete Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const fetchUsers = async () => {
    const allUsers = await db.users.toArray();
    setUsers(allUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (user?: IUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        pinCode: user.pinCode,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({ username: '', pinCode: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.pinCode) return;

    if (editingUser && editingUser.id) {
      if (editingUser.username === 'admin') {
        alert('Cannot edit the default admin user.');
        return;
      }
      await db.users.update(editingUser.id, formData);
    } else {
      await db.users.add(formData);
    }

    setIsModalOpen(false);
    fetchUsers();
  };

  const handleDelete = (user: IUser) => {
    if (user.username === 'admin') {
      alert('Cannot delete the default admin user.');
      return;
    }
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete?.id) {
      await db.users.delete(userToDelete.id);
      fetchUsers();
      setIsConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">User List</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage access and permissions.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          icon={<Search size={18} />}
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">PIN Code</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredUsers.map((user) => {
              const isDefaultAdmin = user.username === 'admin';
              return (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user.username}</td>
                <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 tracking-widest">••••</td>
                <td className="px-6 py-4">
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? (
                      <div className="flex items-center gap-1">
                        <ShieldCheck size={12} /> Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <ShieldAlert size={12} /> Inactive
                      </div>
                    )}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenModal(user)} 
                      className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                      disabled={isDefaultAdmin}
                      title={isDefaultAdmin ? "Cannot edit default admin" : "Edit"}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(user)} 
                      className="text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
                      disabled={isDefaultAdmin}
                      title={isDefaultAdmin ? "Cannot delete default admin" : "Delete"}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            )})}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-800/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                  <Input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. jdoe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">PIN Code (4 digits)</label>
                  <Input
                    type="password"
                    maxLength={4}
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="••••"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="peer h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                    Active Account
                  </label>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save size={18} className="mr-2" />
                    Save User
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.username}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

const SystemSettings: React.FC = () => {
    const { currencySymbol, theme, updateSetting, isLoading } = useSettings();
    const [localSymbol, setLocalSymbol] = useState(currencySymbol);

    useEffect(() => {
        setLocalSymbol(currencySymbol);
    }, [currencySymbol]);

    const handleSave = async () => {
        await updateSetting('currencySymbol', localSymbol);
        alert('Settings saved!');
    };

    const handleThemeToggle = async (newTheme: 'light' | 'dark') => {
        console.log('Toggling to', newTheme);
        await updateSetting('theme', newTheme);
        console.log('Theme updated to', newTheme);
    };

    return (
        <div className="flex h-full flex-col p-6 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">General Configuration</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure global application settings.</p>
            </div>

            <div className="max-w-2xl space-y-8">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <DollarSign size={18} className="text-blue-600" />
                        Currency Settings
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency Symbol</label>
                            <Input
                                value={localSymbol}
                                onChange={(e) => setLocalSymbol(e.target.value)}
                                placeholder="$"
                                maxLength={3}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">This symbol will be used across the application (e.g. $, €, £, ¥).</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <SettingsIcon size={18} className="text-blue-600" />
                        Appearance
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Choose between light and dark mode.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Current: {theme === 'light' ? 'Light' : 'Dark'}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={theme === 'dark'}
                                        onChange={(e) => handleThemeToggle(e.target.checked ? 'dark' : 'light')}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading}>
                        <Save size={18} className="mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users');
  const { fetchSettings } = useSettings();

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
        <div className="flex h-full flex-col">
           <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-700 px-6 bg-white dark:bg-slate-900 pt-2">
          <button
             onClick={() => setActiveTab('users')}
             className={cn(
               "flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors",
               activeTab === 'users' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
             )}
          >
             <Users size={18} />
             User Management
          </button>
          <button
             onClick={() => setActiveTab('system')}
             className={cn(
               "flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors",
               activeTab === 'system' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
             )}
          >
             <SettingsIcon size={18} />
             System Settings
          </button>
       </div>

        <div className="flex-1 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
          {activeTab === 'users' ? <UserManagement /> : <SystemSettings />}
       </div>
    </div>
  );
};