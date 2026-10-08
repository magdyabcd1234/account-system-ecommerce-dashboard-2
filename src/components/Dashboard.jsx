import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt,
  Printer,
  Edit3,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';

export const Dashboard = ({ onSelectInvoice, onOpenNewInvoice, setActiveTab, onEditInvoice }) => {
  const { data, metrics, dynamicChartData, deleteInvoice, t, lang, theme } = useAccounting();
  const currency = lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn;

  const fmt = (val) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(val || 0);

  const handleDeleteFromDashboard = (invId) => {
    deleteInvoice(invId);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'ar' ? 'لوحة المراقبة المحاسبية والمالية' : 'Financial Dashboard & KPI'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' 
              ? 'متابعة حية للمبيعات، الإيرادات، الأرباح، وأرصدة النقدية والمخزون' 
              : 'Real-time overview of sales, revenues, profits, and cash balances'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={onOpenNewInvoice}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
          >
            + {t.newInvoice}
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-md hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.totalSales}</span>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {fmt(metrics.totalSales)} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{currency}</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data.invoices.length} {lang === 'ar' ? 'فواتير بيع مسجلة' : 'sales invoices'}</span>
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-md hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.totalExpenses}</span>
            <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {fmt(metrics.totalExpenses)} <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">{currency}</span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{data.expenses.length} {lang === 'ar' ? 'مصروفات مسجلة' : 'expenses recorded'}</span>
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-md hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.netProfit}</span>
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {fmt(metrics.netProfit)} <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{currency}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {lang === 'ar' ? 'صافي الأرباح بعد تكلفة المبيعات والمصروفات' : 'Exact net profit'}
            </p>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-md hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.cashBalance}</span>
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {fmt(metrics.cashBalance)} <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{currency}</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
              {lang === 'ar' ? 'السيولة من الفواتير المدفوعة محصلة' : 'Liquid cash from paid invoices'}
            </p>
          </div>
        </div>

      </div>

      {/* Dynamic Chart & Quick Summaries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 100% Dynamic Revenue vs Expenses Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.revenueBreakdown}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? 'تحليل ديناميكي للمبيعات والمصروفات حسب الشهور المسجلة' : 'Dynamic Monthly Analysis of Sales vs Expenses'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>{t.totalSales}</span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>{t.totalExpenses}</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                    borderRadius: '12px', 
                    color: theme === 'dark' ? '#fff' : '#0f172a' 
                  }}
                  formatter={(val) => [`${fmt(val)} ${currency}`]}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} name={t.totalSales} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name={t.totalExpenses} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Balances Summary (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {lang === 'ar' ? 'ملخص الذمم والمستحقات' : 'Receivables & Payables'}
            </h3>
            
            <div className="space-y-4">
              {/* Receivables */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{t.receivables}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{lang === 'ar' ? 'مستحقة لك' : 'Owed to you'}</span>
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {fmt(metrics.receivables)} <span className="text-xs">{currency}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ar' ? 'إجمالي مستحقات الفواتير على العملاء' : 'Total due from customers'}
                </p>
              </div>

              {/* Payables */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{t.payables}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{lang === 'ar' ? 'مستحقة عليك' : 'Owed by you'}</span>
                </div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {fmt(metrics.payables)} <span className="text-xs">{currency}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ar' ? 'إجمالي الديون والمستحقات للموردين' : 'Total due to suppliers'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('contacts')}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition"
          >
            <span>{lang === 'ar' ? 'عرض كشوف الحساب التفصيلية' : 'View Account Statements'}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'ar' ? 'أحدث فواتير البيع الصادرة' : 'Recent Sales Invoices'}</span>
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'عرض كافة الفواتير' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950/50">
                <th className="p-3">{t.id}</th>
                <th className="p-3">{t.date}</th>
                <th className="p-3">{t.customer}</th>
                <th className="p-3">{t.total}</th>
                <th className="p-3">{t.status}</th>
                <th className="p-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {data.invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{inv.id}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{inv.date}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{inv.customerName}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {fmt(inv.total)} <span className="text-[10px] text-slate-400">{currency}</span>
                  </td>
                  <td className="p-3">
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
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEditInvoice(inv)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition"
                        title={lang === 'ar' ? 'تعديل الفاتورة' : 'Edit Invoice'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Print Button */}
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold transition"
                        title={t.print}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteFromDashboard(inv.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold transition"
                        title={lang === 'ar' ? 'حذف الفاتورة' : 'Delete Invoice'}
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

    </div>
  );
};
