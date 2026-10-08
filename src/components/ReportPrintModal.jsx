import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PrintModal } from './PrintModal';
import { Building2, BarChart3, DollarSign } from 'lucide-react';

export const ReportPrintModal = ({ reportType = 'pnl', onClose }) => {
  const { data, metrics, lang, t } = useAccounting();

  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const isPnL = reportType === 'pnl';
  const cogs = metrics.exactCOGS || 0;
  const grossProfit = metrics.totalSales - cogs;
  const netProfit = metrics.netProfit;
  const profitMarginPercent = metrics.totalSales > 0 ? ((netProfit / metrics.totalSales) * 100).toFixed(1) : '0.0';

  const title = isPnL 
    ? (lang === 'ar' ? 'طباعة تقرير قائمة الدخل والأرباح والخسائر' : 'Print Profit & Loss Statement')
    : (lang === 'ar' ? 'طباعة دفتر اليومية العامة والقيود المحاسبية' : 'Print General Journal Ledger');

  return (
    <PrintModal
      isOpen={Boolean(reportType)}
      onClose={onClose}
      title={title}
      maxWidth="max-w-4xl"
      icon={BarChart3}
      buttonColor="bg-emerald-600 hover:bg-emerald-500"
    >
      <div id="printable-report" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
        
        {/* Header */}
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
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>{isPnL ? (lang === 'ar' ? 'قائمة الأرباح والخسائر (Income Statement)' : 'P&L Income Statement') : (lang === 'ar' ? 'دفتر اليومية العامة والقيود المزدوجة' : 'General Journal Ledger')}</span>
            </h2>
            <div className="text-xs text-slate-500 mt-1">تاريخ الإصدار: <span className="font-semibold text-slate-800">{new Date().toISOString().split('T')[0]}</span></div>
            {isPnL && (
              <div className="mt-2 inline-block px-3 py-1 rounded text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-700">
                هامش الربح: {profitMarginPercent}%
              </div>
            )}
          </div>
        </div>

        {/* Report Body */}
        {isPnL ? (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center font-bold">
              <span className="text-slate-700">1. إجمالي إيرادات المبيعات (Revenue):</span>
              <span className="text-emerald-700 font-mono text-base">{fmt(metrics.totalSales)} {currency}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-slate-600">
              <span>2. تكلفة البضاعة المباعة الفعلية (Cost of Goods Sold - COGS):</span>
              <span className="font-mono text-rose-600 font-bold">-{fmt(cogs)} {currency}</span>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 flex justify-between items-center font-bold text-slate-900 text-sm">
              <span>= مجمل الربح الإجمالي (Gross Profit):</span>
              <span className="font-mono text-emerald-700 text-base">{fmt(grossProfit)} {currency}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-slate-600">
              <span>3. المصروفات التشغيلية الإدارية (Operating Expenses):</span>
              <span className="font-mono text-rose-600 font-bold">-{fmt(metrics.totalExpenses)} {currency}</span>
            </div>

            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-300 flex justify-between items-center font-black text-slate-900 text-base">
              <span className="text-emerald-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>= صافي الأرباح النهائية الحقيقية (Net Profit):</span>
              </span>
              <span className="font-mono text-emerald-700 text-2xl">{fmt(netProfit)} {currency}</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3 border-r">رقم القيد</th>
                  <th className="p-3 border-r">{t.date}</th>
                  <th className="p-3 border-r">الشرح التفصيلي</th>
                  <th className="p-3 border-r">حساب مدين (Debit)</th>
                  <th className="p-3 border-r">حساب دائن (Credit)</th>
                  <th className="p-3">{t.price}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {data.journalEntries.map((j, idx) => (
                  <tr key={j.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 border-r font-mono font-bold text-emerald-700">{j.id}</td>
                    <td className="p-3 border-r text-slate-600">{j.date}</td>
                    <td className="p-3 border-r font-bold">{j.description}</td>
                    <td className="p-3 border-r font-bold text-emerald-700">{j.accountDebit}</td>
                    <td className="p-3 border-r font-bold text-rose-600">{j.accountCredit}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{fmt(j.amount)} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          تم استخراج التقرير المحاسبي المعتمد إلكترونياً • {data.companyInfo.name}
        </div>

      </div>
    </PrintModal>
  );
};
