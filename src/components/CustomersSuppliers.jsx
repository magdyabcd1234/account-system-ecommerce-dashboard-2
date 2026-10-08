import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Modal } from './Modal';
import { ContactPrintModal } from './ContactPrintModal';
import { Users, UserPlus, Search, Phone, Mail, MapPin, Edit3, Trash2, Printer } from 'lucide-react';

export const CustomersSuppliers = () => {
  const { data, addCustomer, updateCustomer, deleteCustomer, addSupplier, updateSupplier, deleteSupplier, t, lang } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedContactForPrint, setSelectedContactForPrint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    phone: '',
    email: '',
    address: '',
    balance: 0
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      nameEn: '',
      phone: '',
      email: '',
      address: '',
      balance: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'customers') {
      if (editingItem) {
        updateCustomer({ ...formData, id: editingItem.id });
      } else {
        addCustomer(formData);
      }
    } else {
      if (editingItem) {
        updateSupplier({ ...formData, id: editingItem.id });
      } else {
        addSupplier(formData);
      }
    }
    setIsModalOpen(false);
  };

  const list = activeTab === 'customers' ? data.customers : data.suppliers;

  const filteredList = list.filter(item => {
    return (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (item.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>{activeTab === 'customers' ? t.customers : t.suppliers}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'دليل بيانات التواصل وأرصدة كشوف الحسابات القابلة للطباعة' : 'Contact directories & client/supplier printable account statements'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>{activeTab === 'customers' ? t.newCustomer : t.newSupplier}</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl max-w-md text-xs font-bold">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === 'customers' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.customers} ({data.customers.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === 'suppliers' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.suppliers} ({data.suppliers.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((c) => (
          <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-md space-y-3 relative hover:border-purple-500/40 transition-all">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">{c.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{lang === 'ar' ? c.name : (c.nameEn || c.name)}</h3>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Print Account Statement */}
                <button
                  onClick={() => setSelectedContactForPrint(c)}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-1.5 bg-emerald-50 dark:bg-slate-800 rounded-lg transition"
                  title={lang === 'ar' ? 'طباعة كشف الحساب' : 'Print Statement'}
                >
                  <Printer className="w-4 h-4" />
                </button>
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="text-slate-400 hover:text-blue-500 p-1.5 transition"
                  title={t.edit}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {/* Delete Button */}
                <button
                  onClick={() => activeTab === 'customers' ? deleteCustomer(c.id) : deleteSupplier(c.id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 transition"
                  title={t.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.balance}:</span>
              <span className={`font-mono font-bold text-sm ${
                c.balance > 0 ? 'text-amber-600 dark:text-amber-400' : (c.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')
              }`}>
                {fmt(c.balance)} {currency}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Modal with Smooth Animation Wrapper */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem 
          ? (activeTab === 'customers' ? 'تعديل بيانات العميل' : 'تعديل بيانات المورد')
          : (activeTab === 'customers' ? t.newCustomer : t.newSupplier)
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">{t.name} (عربي)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">الرصيد الافتتاحي ({currency})</label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">{t.phone}</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">{t.email}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">{t.address}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">{t.cancel}</button>
            <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow">{t.save}</button>
          </div>

        </form>
      </Modal>

      {/* Printable Account Statement Modal */}
      {selectedContactForPrint && (
        <ContactPrintModal
          contact={selectedContactForPrint}
          type={activeTab === 'customers' ? 'customer' : 'supplier'}
          onClose={() => setSelectedContactForPrint(null)}
        />
      )}

    </div>
  );
};
