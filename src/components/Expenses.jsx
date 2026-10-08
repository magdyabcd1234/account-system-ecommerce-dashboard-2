import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Modal } from './Modal';
import { TrendingDown, Plus, Search, Edit3, Trash2, Printer, Save } from 'lucide-react';

export const Expenses = ({ onSelectExpense }) => {
  const { data, addExpense, updateExpense, deleteExpense, t, lang } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'إيجارات',
    amount: 1000,
    paymentMethod: 'Cash',
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'إيجارات',
      amount: 1000,
      paymentMethod: 'Cash',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({ ...exp });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExpense) {
      updateExpense({ ...formData, id: editingExpense.id });
    } else {
      addExpense(formData);
    }
    setIsModalOpen(false);
  };

  const filteredExpenses = data.expenses.filter(e => {
    return e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           e.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>{t.expenses}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'تسجيل وتعديل وطباعة المصروفات التشغيلية، الإيجارات والفواتير' : 'Record, edit, & print operational expenses'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newExpense}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
        />
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-3.5">{t.id}</th>
                <th className="p-3.5">{t.date}</th>
                <th className="p-3.5">عنوان المصروف</th>
                <th className="p-3.5">{t.category}</th>
                <th className="p-3.5">{t.paymentMethod}</th>
                <th className="p-3.5">{t.price}</th>
                <th className="p-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">{exp.id}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{exp.date}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-[11px] border border-slate-200 dark:border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{exp.paymentMethod === 'Cash' ? t.cash : t.bank}</td>
                  <td className="p-3.5 font-mono font-black text-rose-600 dark:text-rose-400">{fmt(exp.amount)} {currency}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Print Expense Voucher Button */}
                      <button
                        onClick={() => onSelectExpense(exp)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition"
                        title={t.print}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Edit Expense Button */}
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition"
                        title={t.edit}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Expense Button */}
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 transition"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal with Reusable Smooth Animations */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExpense ? `تعديل سند المصروف - ${editingExpense.id}` : t.newExpense}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">وصف المصروف</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              placeholder="مثال: فاتورة الكهرباء، إيجار المكتب"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">{t.category}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="إيجارات">إيجارات</option>
                <option value="مرافق وخدمات">مرافق وخدمات</option>
                <option value="تسوق ودعاية">تسويق ودعاية</option>
                <option value="مرتبات وأجور">مرتبات وأجور</option>
                <option value="صيانة وتشغيل">صيانة وتشغيل</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">المبلغ المسدد ({currency})</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">{t.paymentMethod}</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Cash">{t.cash}</option>
              <option value="Bank Transfer">{t.bank}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">{t.notes}</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              placeholder="أي تفاصيل أو ملاحظات إضافية"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">{t.cancel}</button>
            <button type="submit" className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
