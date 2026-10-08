import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PrintModal } from './PrintModal';
import { Printer, Building2, CheckCircle, Clock } from 'lucide-react';

export const InvoicePrintModal = ({ invoice, onClose }) => {
  const { data, lang, t } = useAccounting();
  if (!invoice) return null;

  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const title = lang === 'ar' 
    ? `معاينة وطباعة الفاتورة - ${invoice.id}` 
    : `Invoice Preview & Print - ${invoice.id}`;

  return (
    <PrintModal
      isOpen={!!invoice}
      onClose={onClose}
      title={title}
      maxWidth="max-w-3xl"
      icon={Printer}
      buttonColor="bg-emerald-600 hover:bg-emerald-500"
    >
      <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
        
        {/* Invoice Company Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-black text-2xl">
              <Building2 className="w-7 h-7" />
              <span>{lang === 'ar' ? data.companyInfo.name : data.companyInfo.nameEn}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{data.companyInfo.address}</p>
            <p className="text-xs text-slate-600">هاتف: {data.companyInfo.phone} | بريد: {data.companyInfo.email}</p>
            <p className="text-xs text-slate-500 mt-1">السجل الضريبي: <span className="font-mono">{data.companyInfo.taxNumber}</span></p>
          </div>

          <div className="text-left rtl:text-right border-l rtl:border-l-0 rtl:border-r border-slate-200 pl-4 rtl:pl-0 rtl:pr-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
              {lang === 'ar' ? 'فاتورة مبيعات ضريبية' : 'Tax Sales Invoice'}
            </h2>
            <div className="font-mono text-sm font-bold text-emerald-700 mt-1">#{invoice.id}</div>
            <div className="text-xs text-slate-500 mt-1">التاريخ: <span className="font-semibold text-slate-800">{invoice.date}</span></div>
            <div className="mt-2 inline-block px-3 py-1 rounded text-xs font-bold border border-slate-300 bg-slate-50">
              طريقة الدفع: {invoice.paymentMethod === 'Cash' ? 'نقداً (كاش)' : 'تحويل بنكي'}
            </div>
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            {lang === 'ar' ? 'بيانات العميل / العميل المستلم' : 'Customer Info'}
          </div>
          <div className="text-base font-bold text-slate-900">{invoice.customerName}</div>
          {invoice.notes && (
            <p className="text-xs text-slate-600 mt-1 italic">
              ملاحظات: {invoice.notes}
            </p>
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
                <th className="p-3 border-r">{t.price}</th>
                <th className="p-3">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {invoice.items && invoice.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3 border-r font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3 border-r font-semibold">{item.productName || item.name}</td>
                  <td className="p-3 border-r text-center font-bold">{item.quantity}</td>
                  <td className="p-3 border-r font-mono">{fmt(item.unitPrice || item.price)} {currency}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{fmt(item.total)} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-slate-200 pt-4">
          
          {/* Payment Stamp */}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-xl text-sm font-black border uppercase flex items-center gap-2 ${
              invoice.status === 'Paid' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : invoice.status === 'Partial'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}>
              {invoice.status === 'Paid' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <span>{invoice.status === 'Paid' ? 'خالصة ومسددة بالكامل' : (invoice.status === 'Partial' ? 'مسددة جزئياً' : 'غير مسددة')}</span>
            </div>
          </div>

          {/* Calculations Box */}
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t.subtotal}:</span>
              <span className="font-mono font-bold text-slate-800">{fmt(invoice.subtotal)} {currency}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t.tax}:</span>
              <span className="font-mono text-slate-800">+{fmt(invoice.tax)} {currency}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>{t.discount}:</span>
                <span className="font-mono">-{fmt(invoice.discount)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-300 pt-2">
              <span>{t.total}:</span>
              <span className="font-mono text-emerald-700">{fmt(invoice.total)} {currency}</span>
            </div>
          </div>

        </div>

        {/* Invoice Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          شكراً لتعاملكم معنا! • تم إصدار هذه الفاتورة إلكترونياً عبر {data.companyInfo.name}
        </div>

      </div>
    </PrintModal>
  );
};
