import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PrintModal } from './PrintModal';
import { ShoppingCart, Building2, CheckCircle } from 'lucide-react';

export const PurchasePrintModal = ({ purchase, onClose }) => {
  const { data, lang, t } = useAccounting();
  if (!purchase) return null;

  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const title = `أذن شراء للمورد - ${purchase.id}`;

  return (
    <PrintModal
      isOpen={!!purchase}
      onClose={onClose}
      title={title}
      maxWidth="max-w-3xl"
      icon={ShoppingCart}
      buttonColor="bg-blue-600 hover:bg-blue-500"
    >
      <div id="printable-po" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-black text-2xl">
              <Building2 className="w-7 h-7" />
              <span>{lang === 'ar' ? data.companyInfo.name : data.companyInfo.nameEn}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{data.companyInfo.address}</p>
            <p className="text-xs text-slate-600">هاتف: {data.companyInfo.phone} | بريد: {data.companyInfo.email}</p>
          </div>

          <div className="text-left rtl:text-right border-l rtl:border-l-0 rtl:border-r border-slate-200 pl-4 rtl:pl-0 rtl:pr-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span>أذن شراء توريد بضائع</span>
            </h2>
            <div className="font-mono text-sm font-bold text-blue-700 mt-1">#{purchase.id}</div>
            <div className="text-xs text-slate-500 mt-1">التاريخ: <span className="font-semibold text-slate-800">{purchase.date}</span></div>
          </div>
        </div>

        {/* Supplier Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            بيانات المورد / الجهة الموردة
          </div>
          <div className="text-base font-bold text-slate-900">{purchase.supplierName}</div>
          {purchase.notes && (
            <p className="text-xs text-slate-600 mt-1 italic">ملاحظات التوريد: {purchase.notes}</p>
          )}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border-r">#</th>
                <th className="p-3 border-r">{t.name}</th>
                <th className="p-3 text-center border-r">{t.quantity}</th>
                <th className="p-3 border-r">{t.buyPrice}</th>
                <th className="p-3">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {purchase.items && purchase.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3 border-r font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3 border-r font-semibold">{item.productName || item.name}</td>
                  <td className="p-3 border-r text-center font-bold">{item.quantity}</td>
                  <td className="p-3 border-r font-mono">{fmt(item.unitPrice)} {currency}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{fmt(item.total)} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl text-sm font-black border bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>الحالة: {purchase.status === 'Paid' ? 'تم التوريد والسداد بالكامل' : 'سداد جزئي / مؤجل'}</span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t.subtotal}:</span>
              <span className="font-mono font-bold text-slate-800">{fmt(purchase.subtotal)} {currency}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t.tax}:</span>
              <span className="font-mono text-slate-800">+{fmt(purchase.tax)} {currency}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-300 pt-2">
              <span>{t.total}:</span>
              <span className="font-mono text-blue-700">{fmt(purchase.total)} {currency}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-600">
          <div>توقيع مسؤول المخزن / الاستلام: ....................</div>
          <div>توقيع المدير المحاسبي: ....................</div>
        </div>
      </div>
    </PrintModal>
  );
};
