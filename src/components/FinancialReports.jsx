import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { ReportPrintModal } from './ReportPrintModal';
import { BarChart3, BookOpen, DollarSign, TrendingUp, TrendingDown, Layers, Printer } from 'lucide-react';

export const FinancialReports = () => {
  const { data, metrics, t, lang } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;
  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const [activeReportTab, setActiveReportTab] = useState('pnl');
  const [printReportType, setPrintReportType] = useState(null);

  const cogs = metrics.exactCOGS || 0;
  const grossProfit = metrics.totalSales - cogs;
  const netProfit = metrics.netProfit;
  const profitMarginPercent = metrics.totalSales > 0 ? ((netProfit / metrics.totalSales) * 100).toFixed(1) : '0.0';

  // Calculate total Debit and Credit for Journal Entries
  const totalJournalAmount = data.journalEntries.reduce((sum, j) => sum + Number(j.amount), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.reports}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'قوائم الدخل الحسابية، القيود المحاسبية اليومية، ودفتر الأستاذ الديناميكي القابل للطباعة' : 'Printable income statements, double-entry general journal, & financial ledgers'}
          </p>
        </div>

        <button
          onClick={() => setPrintReportType(activeReportTab)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>{activeReportTab === 'pnl' ? (lang === 'ar' ? 'طباعة قائمة الدخل' : 'Print Income Statement') : (lang === 'ar' ? 'طباعة القيود اليومية' : 'Print Journal Ledger')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl max-w-md text-xs font-bold shadow-sm">
        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeReportTab === 'pnl' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.profitAndLoss}
        </button>
        <button
          onClick={() => setActiveReportTab('journal')}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeReportTab === 'journal' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.generalJournal} ({data.journalEntries.length})
        </button>
      </div>

      {/* Report Content 1: 100% Dynamic Profit & Loss Statement */}
      {activeReportTab === 'pnl' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm dark:shadow-xl space-y-6 transition-colors">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.profitAndLoss}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">عن الفترة المحاسبية الحية المكتملة</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                هامش الربح: {profitMarginPercent}%
              </span>
              <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                حساب آلي ديناميكي
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            
            {/* Revenue */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>1. إجمالي إيرادات المبيعات (Gross Revenue):</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{fmt(metrics.totalSales)} {currency}</span>
            </div>

            {/* Cost of Goods Sold */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span>2. تكلفة البضاعة المباعة الفعلية (Cost of Goods Sold - COGS):</span>
              </span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">-{fmt(cogs)} {currency}</span>
            </div>

            {/* Gross Profit */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-slate-900 dark:text-white">
              <span>= مجمل الربح الإجمالي (Gross Profit):</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">{fmt(grossProfit)} {currency}</span>
            </div>

            {/* Operating Expenses */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>3. المصروفات التشغيلية الإدارية (Operating Expenses):</span>
              </span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">-{fmt(metrics.totalExpenses)} {currency}</span>
            </div>

            {/* Net Profit Final */}
            <div className="bg-emerald-500/10 dark:bg-emerald-950/40 p-5 rounded-xl border border-emerald-500/30 flex justify-between items-center font-black text-slate-900 dark:text-white text-base">
              <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>= صافي الأرباح النهائية الحقيقية (Net Profit):</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl">{fmt(netProfit)} {currency}</span>
            </div>

          </div>

        </div>
      )}

      {/* Report Content 2: Double Entry General Journal & Ledger */}
      {activeReportTab === 'journal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors space-y-4">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>دفتر اليومية العامة والقيود المزدوجة الديناميكية (Double Entry Ledger)</span>
            </h3>
            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              إجمالي ميزانية القيود: <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalJournalAmount)} {currency}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3.5">رقم القيد</th>
                  <th className="p-3.5">{t.date}</th>
                  <th className="p-3.5">البيان / الشرح التفصيلي</th>
                  <th className="p-3.5">حساب مدين (Debit)</th>
                  <th className="p-3.5">حساب دائن (Credit)</th>
                  <th className="p-3.5">{t.price}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {data.journalEntries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      لا توجد قيود محاسبية مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  data.journalEntries.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition font-mono">
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{j.id}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{j.date}</td>
                      <td className="p-3.5 font-sans font-semibold text-slate-900 dark:text-white">{j.description}</td>
                      <td className="p-3.5 font-sans">
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[11px] font-bold">
                          {j.accountDebit}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[11px] font-bold">
                          {j.accountCredit}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{fmt(j.amount)} {currency}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Report Modal */}
      {printReportType && (
        <ReportPrintModal
          reportType={printReportType}
          onClose={() => setPrintReportType(null)}
        />
      )}

    </div>
  );
};
