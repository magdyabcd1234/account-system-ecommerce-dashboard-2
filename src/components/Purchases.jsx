import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Modal } from './Modal';
import { ShoppingCart, Plus, Search, Edit3, Trash2, Printer, Building2, Calendar, CreditCard, CheckCircle } from 'lucide-react';

export const Purchases = ({ onSelectPurchase }) => {
  const { data, addPurchase, updatePurchase, deletePurchase, t, lang } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPo, setEditingPo] = useState(null);

  // New/Edit Purchase Form State
  const [supplierId, setSupplierId] = useState(data.suppliers[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [status, setStatus] = useState('Paid');
  const [notes, setNotes] = useState('');
  const [poItems, setPoItems] = useState([
    { productId: data.products[0]?.id || '', quantity: 5, unitPrice: data.products[0]?.buyPrice || 0 }
  ]);

  const nextPoNum = editingPo ? editingPo.id : `PO-2026-${String(data.purchaseOrders.length + 1).padStart(3, '0')}`;

  const handleOpenAdd = () => {
    setEditingPo(null);
    setSupplierId(data.suppliers[0]?.id || '');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Bank Transfer');
    setStatus('Paid');
    setNotes('');
    setPoItems([
      { productId: data.products[0]?.id || '', quantity: 5, unitPrice: data.products[0]?.buyPrice || 0 }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (po) => {
    setEditingPo(po);
    setSupplierId(po.supplierId || data.suppliers[0]?.id || '');
    setPurchaseDate(po.date || new Date().toISOString().split('T')[0]);
    setPaymentMethod(po.paymentMethod || 'Bank Transfer');
    setStatus(po.status || 'Paid');
    setNotes(po.notes || '');
    setPoItems(po.items || [
      { productId: data.products[0]?.id || '', quantity: 5, unitPrice: data.products[0]?.buyPrice || 0 }
    ]);
    setIsModalOpen(true);
  };

  const selectedSupplier = data.suppliers.find(s => s.id === supplierId);

  const handleAddItem = () => {
    const firstProd = data.products[0];
    if (firstProd) {
      setPoItems([
        ...poItems,
        { productId: firstProd.id, quantity: 5, unitPrice: firstProd.buyPrice }
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    if (poItems.length > 1) {
      setPoItems(poItems.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (index, pId) => {
    const prod = data.products.find(p => p.id === pId);
    const updated = [...poItems];
    updated[index].productId = pId;
    if (prod) updated[index].unitPrice = prod.buyPrice;
    setPoItems(updated);
  };

  const subtotal = poItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = Math.round(subtotal * 0.14);
  const total = subtotal + tax;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const preparedItems = poItems.map(item => {
      const prod = data.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: lang === 'ar' ? prod?.name : prod?.nameEn,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      };
    });

    if (editingPo) {
      updatePurchase({
        id: editingPo.id,
        date: purchaseDate,
        supplierId,
        supplierName: selectedSupplier ? (lang === 'ar' ? selectedSupplier.name : selectedSupplier.nameEn) : 'مورد عام',
        items: preparedItems,
        subtotal,
        tax,
        total,
        status,
        paymentMethod,
        notes
      });
    } else {
      addPurchase({
        date: purchaseDate,
        supplierId,
        supplierName: selectedSupplier ? (lang === 'ar' ? selectedSupplier.name : selectedSupplier.nameEn) : 'مورد عام',
        items: preparedItems,
        subtotal,
        tax,
        total,
        status,
        paymentMethod,
        notes
      });
    }

    setIsModalOpen(false);
  };

  const filteredOrders = data.purchaseOrders.filter(po => {
    return po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.purchases}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'إدارة مشتريات البضائع، تعديل وطباعة أوامر الشراء' : 'Manage, edit, & print purchase orders for inventory restocking'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newPurchase}</span>
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
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-3.5">{t.id}</th>
                <th className="p-3.5">{t.date}</th>
                <th className="p-3.5">{t.supplier}</th>
                <th className="p-3.5">{t.paymentMethod}</th>
                <th className="p-3.5">{t.total}</th>
                <th className="p-3.5">{t.status}</th>
                <th className="p-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{po.id}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{po.date}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{po.supplierName}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{po.paymentMethod === 'Cash' ? t.cash : t.bank}</td>
                  <td className="p-3.5 font-mono font-black text-slate-900 dark:text-white">{fmt(po.total)} {currency}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      {po.status === 'Paid' ? t.paid : t.partial}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Print PO */}
                      <button
                        onClick={() => onSelectPurchase(po)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition"
                        title={t.print}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Edit PO */}
                      <button
                        onClick={() => handleOpenEdit(po)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition"
                        title={t.edit}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete PO */}
                      <button
                        onClick={() => deletePurchase(po.id)}
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

      {/* Complete & Dynamic New/Edit Purchase Modal with Smooth Entrance & Exit Animations */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPo ? `تعديل أمر الشراء - ${editingPo.id}` : `${t.newPurchase} (${nextPoNum})`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Top Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.supplier}</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none font-medium"
              >
                {data.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ar' ? s.name : s.nameEn} (الرصيد: {fmt(s.balance)} {currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.date}</span>
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                <span>{t.paymentMethod}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Bank Transfer">{t.bank}</option>
                <option value="Cash">{t.cash}</option>
              </select>
            </div>

          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 font-bold">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>بنود المشتريات المراد إضافتها للمخزون</span>
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:underline transition"
              >
                + بند جديد
              </button>
            </div>

            {poItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 items-center">
                
                <div className="col-span-5">
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none font-medium"
                  >
                    {data.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {lang === 'ar' ? p.name : p.nameEn} (المخزون: {p.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].quantity = Math.max(1, Number(e.target.value));
                      setPoItems(updated);
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-center text-slate-900 dark:text-white font-mono font-bold"
                    placeholder={t.quantity}
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].unitPrice = Math.max(0, Number(e.target.value));
                      setPoItems(updated);
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-center text-slate-900 dark:text-white font-mono"
                    placeholder={t.buyPrice}
                  />
                </div>

                <div className="col-span-2 font-mono text-center font-black text-blue-600 dark:text-blue-400 text-sm">
                  {fmt(item.quantity * item.unitPrice)} <span className="text-[10px] text-slate-400">{currency}</span>
                </div>

                <div className="col-span-1 text-center">
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-rose-500 transition p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Status & Totals Summary */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">{t.status}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Paid">{t.paid}</option>
                <option value="Partial">{t.partial}</option>
              </select>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none mt-2"
                placeholder={t.notes}
              />
            </div>

            <div className="w-full md:w-1/2 space-y-1.5 text-right rtl:text-right text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.subtotal}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(subtotal)} {currency}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.tax}:</span>
                <span className="font-mono text-slate-900 dark:text-white">+{fmt(tax)} {currency}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>{t.total}:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-lg">{fmt(total)} {currency}</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">{t.cancel}</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition active:scale-95">{t.save}</button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
