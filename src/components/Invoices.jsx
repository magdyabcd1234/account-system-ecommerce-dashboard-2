import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Modal } from './Modal';
import { 
  Plus, 
  Search, 
  Printer, 
  Edit3,
  Trash2, 
  FileText, 
  UserCheck,
  Calendar,
  CreditCard,
  CheckCircle
} from 'lucide-react';

export const Invoices = ({ onSelectInvoice, isCreateOpen, setIsCreateOpen, editingInvoiceToLoad, setEditingInvoiceToLoad }) => {
  const { data, addInvoice, updateInvoice, deleteInvoice, t, lang } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit / Create State
  const [editingInvoice, setEditingInvoice] = useState(null);

  // New / Edit Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(data.customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [status, setStatus] = useState('Paid');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Items in invoice
  const [invoiceItems, setInvoiceItems] = useState([
    { productId: data.products[0]?.id || '', quantity: 1, unitPrice: data.products[0]?.sellPrice || 0 }
  ]);

  // Load editing invoice if passed externally from Dashboard
  useEffect(() => {
    if (editingInvoiceToLoad) {
      handleOpenEdit(editingInvoiceToLoad);
      if (setEditingInvoiceToLoad) setEditingInvoiceToLoad(null);
    }
  }, [editingInvoiceToLoad]);

  const resetForm = () => {
    setEditingInvoice(null);
    setSelectedCustomerId(data.customers[0]?.id || '');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setStatus('Paid');
    setDiscount(0);
    setNotes('');
    setInvoiceItems([
      { productId: data.products[0]?.id || '', quantity: 1, unitPrice: data.products[0]?.sellPrice || 0 }
    ]);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInvoice(inv);
    setSelectedCustomerId(inv.customerId || (data.customers.find(c => c.name === inv.customerName)?.id || data.customers[0]?.id || ''));
    setInvoiceDate(inv.date || new Date().toISOString().split('T')[0]);
    setPaymentMethod(inv.paymentMethod || 'Cash');
    setStatus(inv.status || 'Paid');
    setDiscount(inv.discount || 0);
    setNotes(inv.notes || '');
    
    if (inv.items && inv.items.length > 0) {
      setInvoiceItems(inv.items.map(item => ({
        productId: item.productId || data.products[0]?.id || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0
      })));
    } else {
      setInvoiceItems([
        { productId: data.products[0]?.id || '', quantity: 1, unitPrice: data.products[0]?.sellPrice || 0 }
      ]);
    }

    setIsCreateOpen(true);
  };

  const selectedCustomer = data.customers.find(c => c.id === selectedCustomerId);

  const handleAddItemRow = () => {
    const firstProd = data.products[0];
    if (firstProd) {
      setInvoiceItems([
        ...invoiceItems,
        { productId: firstProd.id, quantity: 1, unitPrice: firstProd.sellPrice }
      ]);
    }
  };

  const handleRemoveItemRow = (index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const handleItemProductChange = (index, prodId) => {
    const prod = data.products.find(p => p.id === prodId);
    const updated = [...invoiceItems];
    updated[index].productId = prodId;
    if (prod) {
      updated[index].unitPrice = prod.sellPrice;
    }
    setInvoiceItems(updated);
  };

  const handleItemQtyChange = (index, qty) => {
    const updated = [...invoiceItems];
    updated[index].quantity = Math.max(1, Number(qty));
    setInvoiceItems(updated);
  };

  const handleItemPriceChange = (index, price) => {
    const updated = [...invoiceItems];
    updated[index].unitPrice = Math.max(0, Number(price));
    setInvoiceItems(updated);
  };

  // Live Calculations
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = Math.round(subtotal * 0.14);
  const total = Math.max(0, subtotal + tax - Number(discount));

  const handleSubmitInvoice = (e) => {
    e.preventDefault();
    
    const preparedItems = invoiceItems.map(item => {
      const prod = data.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: lang === 'ar' ? prod?.name : prod?.nameEn,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      };
    });

    const payload = {
      date: invoiceDate,
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? (lang === 'ar' ? selectedCustomer.name : selectedCustomer.nameEn) : 'عميل عام',
      items: preparedItems,
      subtotal,
      tax,
      discount: Number(discount),
      total,
      status,
      paymentMethod,
      notes
    };

    if (editingInvoice) {
      updateInvoice({
        ...payload,
        id: editingInvoice.id
      });
    } else {
      addInvoice(payload);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDeleteInvoice = (invId) => {
    deleteInvoice(invId);
  };

  // Filtered list
  const filteredInvoices = data.invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const modalTitle = editingInvoice 
    ? (lang === 'ar' ? `تعديل فاتورة مبيعات (${editingInvoice.id})` : `Edit Invoice (${editingInvoice.id})`)
    : t.newInvoice;

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.sales}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'إدارة فواتير البيع والتعديل والطباعة والحذف ومتابعة التحصيلات' : 'Manage sales invoices, editing, printing, deletion, & receivables'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newInvoice}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['ALL', 'Paid', 'Partial', 'Unpaid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-lg transition ${
                statusFilter === st ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? (lang === 'ar' ? 'الكل' : 'All') : (st === 'Paid' ? t.paid : (st === 'Partial' ? t.partial : t.unpaid))}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-3.5">{t.id}</th>
                <th className="p-3.5">{t.date}</th>
                <th className="p-3.5">{t.customer}</th>
                <th className="p-3.5">{t.paymentMethod}</th>
                <th className="p-3.5">{t.total}</th>
                <th className="p-3.5">{t.status}</th>
                <th className="p-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    {lang === 'ar' ? 'لا توجد فواتير مطابقة للبحث' : 'No invoices found.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{inv.id}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{inv.date}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{inv.customerName}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {inv.paymentMethod === 'Cash' ? t.cash : t.bank}
                    </td>
                    <td className="p-3.5 font-mono font-black text-slate-900 dark:text-white">
                      {fmt(inv.total)} <span className="text-[10px] text-slate-400">{currency}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                          : inv.status === 'Partial'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}>
                        {inv.status === 'Paid' ? t.paid : (inv.status === 'Partial' ? t.partial : t.unpaid)}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Invoice Button */}
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition"
                          title={lang === 'ar' ? 'تعديل فاتورة البيع' : 'Edit Invoice'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Print Invoice Button */}
                        <button
                          onClick={() => onSelectInvoice(inv)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold transition"
                          title={t.print}
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Delete Invoice Button */}
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold transition"
                          title={lang === 'ar' ? 'حذف الفاتورة وتعديل البيانات' : 'Delete Invoice'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 100% Smooth Reusable Animated Modal for Create & Edit Sales Invoice */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title={modalTitle}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-6">
          
          {/* Top Details Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            
            {/* Customer Select */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.customer}</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-medium"
              >
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'ar' ? c.name : c.nameEn} (الرصيد: {fmt(c.balance)} {currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.date}</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                <span>{t.paymentMethod}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-medium"
              >
                <option value="Cash">{t.cash}</option>
                <option value="Bank Transfer">{t.bank}</option>
              </select>
            </div>

          </div>

          {/* Dynamic Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'بنود المنتجات والكميات بالفاتورة' : 'Dynamic Invoice Items'}</span>
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition"
              >
                + {lang === 'ar' ? 'إضافة بند جديد' : 'Add Product Row'}
              </button>
            </div>

            <div className="space-y-2">
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 items-center text-xs">
                  
                  {/* Product Selector */}
                  <div className="col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none font-medium"
                    >
                      {data.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {lang === 'ar' ? p.name : p.nameEn} (المخزون: {p.stockQuantity} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-center text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                      placeholder={t.quantity}
                    />
                  </div>

                  {/* Selling Price */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-center text-slate-900 dark:text-white focus:outline-none font-mono"
                      placeholder={t.price}
                    />
                  </div>

                  {/* Item Total */}
                  <div className="col-span-2 text-center font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {fmt(item.quantity * item.unitPrice)} <span className="text-[10px] text-slate-400">{currency}</span>
                  </div>

                  {/* Delete Row Button */}
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Discount, Status & Live Totals Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            <div className="w-full md:w-1/2 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.status}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Paid">{t.paid}</option>
                    <option value="Partial">{t.partial}</option>
                    <option value="Unpaid">{t.unpaid}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.discount}</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  placeholder={t.notes}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-2 text-xs text-right rtl:text-right ltr:text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.subtotal}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(subtotal)} {currency}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.tax}:</span>
                <span className="font-mono text-slate-900 dark:text-white">+{fmt(tax)} {currency}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>{t.discount}:</span>
                  <span className="font-mono">-{fmt(discount)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>{t.total}:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">{fmt(total)} {currency}</span>
              </div>
            </div>

          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
            >
              {editingInvoice ? (lang === 'ar' ? 'حفظ التعديلات' : 'Update Invoice') : t.save}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
