import React, { useState, useEffect } from 'react';
import { db, ICustomer } from '../db';
import { Plus, Edit2, Trash2, Search, User, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);
  const [formData, setFormData] = useState<Partial<ICustomer>>({
    name: '',
    phone: '',
    email: '',
    totalSpent: 0,
  });

  // Delete Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(null);

  const fetchCustomers = async () => {
    const data = await db.customers.toArray();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleOpenModal = (customer?: ICustomer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ ...customer });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '', totalSpent: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCustomer && editingCustomer.id) {
      if (editingCustomer.name === 'Walk-in Customer') {
        alert('Cannot edit the default Walk-in Customer.');
        return;
      }
      await db.customers.update(editingCustomer.id, formData);
    } else {
      await db.customers.add(formData as ICustomer);
    }

    setIsModalOpen(false);
    fetchCustomers();
  };

  const handleDelete = (customer: ICustomer) => {
    if (customer.name === 'Walk-in Customer') {
      alert('Cannot delete the default Walk-in Customer.');
      return;
    }
    setCustomerToDelete(customer);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete?.id) {
      await db.customers.delete(customerToDelete.id);
      fetchCustomers();
      setIsConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-500">Manage customer profiles and view purchase history.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          icon={<Search size={18} />}
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-right">Total Spent</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => {
              const isDefaultCustomer = customer.name === 'Walk-in Customer';
              return (
              <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <User size={16} />
                    </div>
                    {customer.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{customer.phone || '-'}</td>
                <td className="px-6 py-4 text-slate-600">{customer.email || '-'}</td>
                <td className="px-6 py-4 text-right font-medium text-emerald-600">
                  ${customer.totalSpent.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenModal(customer)} 
                      className="text-blue-600 hover:bg-blue-50"
                      disabled={isDefaultCustomer}
                      title={isDefaultCustomer ? "Cannot edit default customer" : "Edit"}
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(customer)} 
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      disabled={isDefaultCustomer}
                      title={isDefaultCustomer ? "Cannot delete default customer" : "Delete"}
                    >
                        <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            )})}
            {filteredCustomers.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No customers found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCustomer ? 'Edit Customer' : 'New Customer'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
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
                    Save Customer
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};