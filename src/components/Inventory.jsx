import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Modal } from './Modal';
import { InventoryPrintModal } from './InventoryPrintModal';
import { Package, Plus, Search, AlertTriangle, Edit3, Trash2, Printer } from 'lucide-react';

export const Inventory = () => {
  const { data, addProduct, updateProduct, deleteProduct, t, lang } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Print States
  const [selectedProductForPrint, setSelectedProductForPrint] = useState(null);
  const [showFullInventoryPrint, setShowFullInventoryPrint] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    category: 'إلكترونيات',
    buyPrice: 0,
    sellPrice: 0,
    stockQuantity: 10,
    minStockAlert: 5,
    unit: 'قطعة'
  });

  const categories = Array.from(new Set(data.products.map(p => p.category)));

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      code: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      nameEn: '',
      category: categories[0] || 'إلكترونيات',
      buyPrice: 100,
      sellPrice: 150,
      stockQuantity: 10,
      minStockAlert: 5,
      unit: 'قطعة'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...formData, id: editingProduct.id });
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
  };

  const filteredProducts = data.products.filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (p.nameEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (p.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = categoryFilter === 'ALL' || p.category === categoryFilter;
    return nameMatch && catMatch;
  });

  const modalTitle = editingProduct 
    ? (lang === 'ar' ? 'تعديل بيانات المنتج' : 'Edit Product') 
    : t.newProduct;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.inventory}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'متابعة حركة المنتجات، الطباعة، أسعار الشراء والبيع، وتنبيهات النواقص' : 'Track stock levels, printing, buying & selling prices, & low stock warnings'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Full Inventory Button */}
          <button
            onClick={() => setShowFullInventoryPrint(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
            title="طباعة كشف الجرد للمخزون بالكامل"
          >
            <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'ar' ? 'طباعة كشف المخزون' : 'Print Stock Report'}</span>
          </button>

          {/* Add New Product Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newProduct}</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
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

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
              categoryFilter === 'ALL' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'جميع التصنيفات' : 'All Categories'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
                categoryFilter === cat ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-3.5">{t.code}</th>
                <th className="p-3.5">{t.name}</th>
                <th className="p-3.5">{t.category}</th>
                <th className="p-3.5">{t.buyPrice}</th>
                <th className="p-3.5">{t.sellPrice}</th>
                <th className="p-3.5">{t.stock}</th>
                <th className="p-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredProducts.map((p) => {
                const isLowStock = p.stockQuantity <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 font-bold">{p.code}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{lang === 'ar' ? p.name : p.nameEn}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{p.id}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-[11px] border border-slate-200 dark:border-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{fmt(p.buyPrice)} {currency}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmt(p.sellPrice)} {currency}</td>
                    <td className="p-3.5 font-mono">
                      <span className={`px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 ${
                        isLowStock 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{p.stockQuantity} {p.unit}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Print Single Product Card */}
                        <button
                          onClick={() => setSelectedProductForPrint(p)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 font-bold transition"
                          title={lang === 'ar' ? 'طباعة بطاقة المنتج' : 'Print Product Tag'}
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition"
                          title={t.edit}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 transition"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Smooth Animated Modal for Product Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.code}</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المنتج (بالعربية)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name (English)</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.buyPrice}</label>
              <input
                type="number"
                required
                value={formData.buyPrice}
                onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.sellPrice}</label>
              <input
                type="number"
                required
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.stock}</label>
              <input
                type="number"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">حد تنبيه النواقص</label>
              <input
                type="number"
                required
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition active:scale-95"
            >
              {t.save}
            </button>
          </div>

        </form>
      </Modal>

      {/* Printable Inventory Report Modals */}
      {showFullInventoryPrint && (
        <InventoryPrintModal 
          product={null} 
          onClose={() => setShowFullInventoryPrint(false)} 
        />
      )}

      {selectedProductForPrint && (
        <InventoryPrintModal 
          product={selectedProductForPrint} 
          onClose={() => setSelectedProductForPrint(null)} 
        />
      )}

    </div>
  );
};
