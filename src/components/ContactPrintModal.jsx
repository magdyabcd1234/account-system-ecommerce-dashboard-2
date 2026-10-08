import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PrintModal } from './PrintModal';
import { Building2, User, Phone, MapPin, Receipt, ShoppingCart, Users } from 'lucide-react';

export const ContactPrintModal = ({ contact, type = 'customer', onClose }) => {
  const { data, lang, t } = useAccounting();
  if (!contact) return null;

  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const isCustomer = type === 'customer';
  const name = lang === 'ar' ? contact.name : contact.nameEn;

  // Associated Invoices or Purchase Orders
  const invoices = isCustomer 
    ? data.invoices.filter(i => i.customerId === contact.id || i.customerName === contact.name)
    : data.purchaseOrders.filter(p => p.supplierId === contact.id || p.supplierName === contact.name);

  const title = lang === 'ar' ? `طباعة كشف حساب: ${name}` : `Account Statement: ${name}`;

  return (
    <PrintModal
      isOpen={!!contact}
      onClose={onClose}
      title={title}
      maxWidth="max-w-4xl"
      icon={Users}
      buttonColor="bg-purple-600 hover:bg-purple-500"
    >
      <div id="printable-contact" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
        
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
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
              {isCustomer ? (lang === 'ar' ? 'كشف حساب عميل' : 'Customer Account Statement') : (lang === 'ar' ? 'كشف حساب مورد' : 'Supplier Account Statement')}
            </h2>
            <div className="font-mono text-sm font-bold text-emerald-700 mt-1">#{contact.id}</div>
            <div className="text-xs text-slate-500 mt-1">تاريخ التقرير: <span className="font-semibold text-slate-800">{new Date().toISOString().split('T')[0]}</span></div>
          </div>
        </div>

        {/* Contact Details Box */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block font-semibold">اسم الحساب:</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{name}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">الهاتف:</span>
            <span className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span>{contact.phone || 'غير مدخل'}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">العنوان:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{contact.address || 'غير مدخل'}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">الرصيد المستحق:</span>
            <span className={`text-sm font-black font-mono mt-0.5 inline-block ${contact.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {fmt(contact.balance)} {currency}
            </span>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="overflow-x-auto mb-6">
          <h4 className="font-bold text-xs text-slate-700 uppercase mb-2 flex items-center gap-1">
            {isCustomer ? <Receipt className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4 text-blue-600" />}
            <span>سجل المعاملات والفواتير المسجلة</span>
          </h4>
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border-r">رقم المعاملة</th>
                <th className="p-3 border-r">{t.date}</th>
                <th className="p-3 border-r">طريقة الدفع</th>
                <th className="p-3 border-r">{t.status}</th>
                <th className="p-3">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    لا توجد معاملات سابقة مسجلة لهذا الحساب
                  </td>
                </tr>
              ) : (
                invoices.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 border-r font-mono font-bold text-emerald-700">{inv.id}</td>
                    <td className="p-3 border-r text-slate-600">{inv.date}</td>
                    <td className="p-3 border-r">{inv.paymentMethod === 'Cash' ? 'نقداً' : 'تحويل بنكي'}</td>
                    <td className="p-3 border-r font-bold">
                      {inv.status === 'Paid' ? 'مدفوع بالكامل' : (inv.status === 'Partial' ? 'مدفوع جزئياً' : 'مستحق الدفع')}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{fmt(inv.total)} {currency}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          تم استخراج كشف الحساب إلكترونياً • {data.companyInfo.name}
        </div>

      </div>
    </PrintModal>
  );
};
