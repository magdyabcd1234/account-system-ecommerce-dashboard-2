import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  ShoppingCart, 
  TrendingDown, 
  Users, 
  BarChart3, 
  Settings,
  Database
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { t } = useAccounting();

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'sales', label: t.sales, icon: Receipt },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'purchases', label: t.purchases, icon: ShoppingCart },
    { id: 'expenses', label: t.expenses, icon: TrendingDown },
    { id: 'contacts', label: t.customers + ' & ' + t.suppliers, icon: Users },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-slate-200 dark:border-slate-800 flex-shrink-0 transition-colors duration-200 sticky md:static top-16 z-30">
      
      {/* Navigation Links: Horizontal scroll on mobile, Vertical stack on md+ */}
      <div className="p-2 sm:p-4 flex md:flex-col overflow-x-auto no-scrollbar gap-1.5 md:space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 md:py-3 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20 md:translate-x-1 rtl:md:-translate-x-1'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Bottom Footer Info inside Sidebar (Desktop only) */}
      <div className="hidden md:block p-4 mx-4 my-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
          <Database className="w-3.5 h-3.5" />
          <span>Local JSON Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Offline Mode • LocalStorage Persisted
        </p>
      </div>
    </aside>
  );
};
