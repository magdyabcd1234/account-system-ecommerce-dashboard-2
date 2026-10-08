import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PrintModal } from './PrintModal';
import { Package, Building2, AlertTriangle } from 'lucide-react';

export const InventoryPrintModal = ({ product, onClose, isOpen = true }) => {
  const { data, lang, t } = useAccounting();

  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const isSingleProduct = Boolean(product);
  const productsToPrint = isSingleProduct ? [product] : data.products;

  const totalStockValueBuy = data.products.reduce((sum, p) => sum + (p.stockQuantity * p.buyPrice), 0);
  const totalStockValueSell = data.products.reduce((sum, p) => sum + (p.stockQuantity * p.sellPrice), 0);

  const title = isSingleProduct 
    ? (lang === 'ar' ? `بطاقة جرد منتج: ${product.name}` : `Product Inventory Card: ${product.nameEn || product.name}`)
    : (lang === 'ar' ? 'معاينة وطباعة تقرير كشف المخزون الشامل' : 'Inventory Stock Report & Print');

  return (
    <PrintModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-4xl"
      icon={Package}
      buttonColor="bg-emerald-600 hover:bg-emerald-500"
    >
      <div id="printable-inventory" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-black text-2xl">
              <Building2 className="w-7 h-7" />
              <span>{lang === 'ar' ? data.companyInfo.name : data.companyInfo.nameEn}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{data.companyInfo.address}</p>
            <p className="text-xs text-slate-600">هاتف: {data.companyInfo.phone} | بريد: {data.companyInfo.email}</p>
          </div>

          <div className="text-left rtl:text-right border-l rtl:border-l-0 rtl:border-r border-slate-200 pl-4 rtl:pl-0 rtl:pr-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>{isSingleProduct ? (lang === 'ar' ? 'بطاقة صنف مخزني' : 'Product Inventory Tag') : (lang === 'ar' ? 'تقرير جرد كشف المخزون' : 'Full Stock Inventory')}</span>
            </h2>
            <div className="text-xs text-slate-500 mt-1">تاريخ الجرد: <span className="font-semibold text-slate-800">{new Date().toISOString().split('T')[0]}</span></div>
            <div className="text-xs text-slate-500 mt-0.5">عدد الأصناف: <span className="font-mono font-bold text-slate-900">{productsToPrint.length} صنف</span></div>
          </div>
        </div>

        {!isSingleProduct && (
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">إجمالي قيمة التكلفة الشرائية للمخزون:</span>
              <span className="text-base font-black font-mono text-slate-900">{fmt(totalStockValueBuy)} {currency}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">إجمالي القيمة البيعية المتوقعة للمخزون:</span>
              <span className="text-base font-black font-mono text-emerald-700">{fmt(totalStockValueSell)} {currency}</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border-r">كود المنتج</th>
                <th className="p-3 border-r">اسم الصنف / المنتج</th>
                <th className="p-3 border-r">التصنيف</th>
                <th className="p-3 border-r">سعر الشراء</th>
                <th className="p-3 border-r">سعر البيع</th>
                <th className="p-3 text-center border-r">الكمية بالمخزن</th>
                <th className="p-3">إجمالي القيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {productsToPrint.map((p, idx) => {
                const isLow = p.stockQuantity <= p.minStockAlert;
                return (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 border-r font-mono font-bold text-slate-600">{p.code}</td>
                    <td className="p-3 border-r font-bold text-slate-900">{lang === 'ar' ? p.name : p.nameEn}</td>
                    <td className="p-3 border-r text-slate-600">{p.category}</td>
                    <td className="p-3 border-r font-mono">{fmt(p.buyPrice)} {currency}</td>
                    <td className="p-3 border-r font-mono font-bold text-emerald-700">{fmt(p.sellPrice)} {currency}</td>
                    <td className="p-3 border-r text-center font-mono font-bold">
                      <span className={isLow ? 'text-amber-600 font-black' : ''}>
                        {p.stockQuantity} {p.unit}
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-amber-500" />}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{fmt(p.stockQuantity * p.sellPrice)} {currency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          تم استخراج تقرير المخزون إلكترونياً • {data.companyInfo.name}
        </div>

      </div>
    </PrintModal>
  );
};
