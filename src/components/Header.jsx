import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { 
  Building2, 
  Globe, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Bell, 
  PlusCircle, 
  AlertTriangle,
  Receipt,
  ShoppingCart,
  CheckCircle2,
  X
} from 'lucide-react';

export const Header = ({ onOpenNewInvoice }) => {
  const { lang, theme, toggleLanguage, toggleTheme, t, data, exportDataJSON, importDataJSON } = useAccounting();
  const [showNotification, setShowNotification] = useState(false);
  const [renderNotification, setRenderNotification] = useState(false);
  const [isClosingNotification, setIsClosingNotification] = useState(false);

  // Smooth entrance & exit lifecycle for notifications dropdown
  useEffect(() => {
    if (showNotification) {
      setRenderNotification(true);
      setIsClosingNotification(false);
    } else if (renderNotification) {
      setIsClosingNotification(true);
      const timer = setTimeout(() => {
        setRenderNotification(false);
        setIsClosingNotification(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const success = importDataJSON(parsed);
          if (success) e.target.value = '';
        } catch (err) {
          console.error("JSON parsing error", err);
        }
      };
    }
  };

  // Build 100% Dynamic Notifications List
  const notifications = React.useMemo(() => {
    const list = [];

    // 1. Low Stock Products
    data.products.forEach(p => {
      if (p.stockQuantity <= p.minStockAlert) {
        list.push({
          id: `stock-${p.id}`,
          type: 'warning',
          title: lang === 'ar' ? 'نقص في المخزون' : 'Low Stock Warning',
          message: `${lang === 'ar' ? p.name : p.nameEn} (المتبقي: ${p.stockQuantity} ${p.unit})`,
          badge: `${p.stockQuantity} ${p.unit}`
        });
      }
    });

    // 2. Unpaid/Partial Invoices to Collect
    data.invoices.forEach(inv => {
      if (inv.status !== 'Paid') {
        list.push({
          id: `inv-${inv.id}`,
          type: 'invoice',
          title: lang === 'ar' ? 'فاتورة غير مسددة بالكامل' : 'Unpaid Sales Invoice',
          message: `${inv.id} - ${inv.customerName} (${inv.total} ${lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn})`,
          badge: inv.status === 'Partial' ? (lang === 'ar' ? 'جزئي' : 'Partial') : (lang === 'ar' ? 'غير مدفوع' : 'Unpaid')
        });
      }
    });

    // 3. Pending Purchase Orders to Pay
    data.purchaseOrders.forEach(po => {
      if (po.status !== 'Paid') {
        list.push({
          id: `po-${po.id}`,
          type: 'purchase',
          title: lang === 'ar' ? 'مستحقات أذن شراء مورد' : 'Pending Supplier Bill',
          message: `${po.id} - ${po.supplierName} (${po.total} ${lang === 'ar' ? data.companyInfo.currency : data.companyInfo.currencyEn})`,
          badge: lang === 'ar' ? 'مستحق للمورد' : 'Payable'
        });
      }
    });

    return list;
  }, [data, lang]);

  return (
    <header className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand & Logo - Fully Responsive */}
        <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0">
          <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-xl text-white dark:text-slate-950 font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span className="truncate max-w-[130px] sm:max-w-[200px] md:max-w-none">
                {lang === 'ar' ? data.companyInfo.name : data.companyInfo.nameEn}
              </span>
              <span className="hidden sm:inline-block text-[10px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                JSON Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls - Fully Responsive */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 rtl:space-x-reverse flex-shrink-0">
          
          {/* Create Sales Invoice Button */}
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-2.5 sm:px-3.5 py-2 rounded-xl transition shadow-md hover:shadow-emerald-600/30 active:scale-95"
            title={t.newInvoice}
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.newInvoice}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'فاتورة' : 'Invoice'}</span>
          </button>

          {/* Theme Switcher (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />}
          </button>

          {/* 100% Dynamic Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition relative"
              title="مركز الإشعارات التفاعلي"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dynamic Dropdown Panel - Smooth Opening & Closing Animation */}
            {renderNotification && (
              <div 
                className={`fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:left-auto rtl:sm:left-auto rtl:sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-xs z-50 text-slate-700 dark:text-slate-200 ${
                  isClosingNotification ? 'animate-dropdown-out' : 'animate-dropdown-in'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Bell className="w-4 h-4" />
                    <span>مركز الإشعارات والتنبيهات</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                      {notifications.length} إشعار
                    </span>
                    <button onClick={() => setShowNotification(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                    <p className="font-bold">{lang === 'ar' ? 'لا توجد تنبيهات مستحقة الان!' : 'No pending alerts!'}</p>
                    <p className="text-[11px]">{lang === 'ar' ? 'المخزون والتحصيلات في وضع ممتاز' : 'All accounts & inventory healthy'}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 hover:border-amber-500/40 transition">
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                        {n.type === 'invoice' && <Receipt className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                        {n.type === 'purchase' && <ShoppingCart className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate">{n.title}</span>
                            <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded ml-1">
                              {n.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Backup Export / Import (Desktop / Tablet) */}
          <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={exportDataJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition shadow-sm"
              title={t.exportData}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>JSON Export</span>
            </button>

            <label className="flex items-center gap-1 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              <span>JSON Import</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition"
          >
            <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'عربي'}</span>
            <span className="sm:hidden font-bold uppercase">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
