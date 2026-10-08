import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PrintModal } from './PrintModal';
import { TrendingDown, Building2 } from 'lucide-react';

export const ExpensePrintModal = ({ expense, onClose }) => {
  const { data, lang, t } = useAccounting();
  if (!expense) return null;

  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const title = `سند صرف مصروف - ${expense.id}`;

  return (
    <PrintModal
      isOpen={!!expense}
      onClose={onClose}
      title={title}
      maxWidth="max-w-2xl"
      icon={TrendingDown}
      buttonColor="bg-rose-600 hover:bg-rose-500"
    >
      <div id="printable-expense" className="p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-black text-2xl">
              <Building2 className="w-7 h-7" />
              <span>{lang === 'ar' ? data.companyInfo.name : data.companyInfo.nameEn}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{data.companyInfo.address}</p>
          </div>

          <div className="text-left rtl:text-right border-l rtl:border-l-0 rtl:border-r border-slate-200 pl-4 rtl:pl-0 rtl:pr-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span>سند صرف نقدية / مصروف</span>
            </h2>
            <div className="font-mono text-sm font-bold text-rose-700 mt-1">#{expense.id}</div>
            <div className="text-xs text-slate-500 mt-1">التاريخ: <span className="font-semibold text-slate-800">{expense.date}</span></div>
          </div>
        </div>

        {/* Voucher Body Details */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4 text-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">بيان المصروف:</span>
            <span className="font-bold text-slate-900">{expense.title}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">التصنيف المحاسبي:</span>
            <span className="font-bold text-slate-800 bg-slate-200 px-3 py-0.5 rounded-full text-xs">{expense.category}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">طريقة الدفع وسداد النقدية:</span>
            <span className="font-bold text-slate-800">{expense.paymentMethod === 'Cash' ? 'نقداً من الخزينة' : 'تحويل بنكي / بطاقة'}</span>
          </div>

          {expense.notes && (
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">ملاحظات إضافية:</span>
              <span className="text-slate-700 italic">{expense.notes}</span>
            </div>
          )}

          {/* Big Amount Stamp */}
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex justify-between items-center mt-4">
            <span className="text-rose-800 font-bold text-sm">المبلغ المصروف صافي:</span>
            <span className="font-mono font-black text-rose-700 text-2xl">{fmt(expense.amount)} {currency}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-600">
          <div>توقيع المستلم / المستفيد: ....................</div>
          <div>اعتماد الصرف / الخزينة: ....................</div>
        </div>
      </div>
    </PrintModal>
  );
};
