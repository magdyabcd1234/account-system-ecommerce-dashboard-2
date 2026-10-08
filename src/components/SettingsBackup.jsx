import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { toast } from 'react-toastify';
import { Settings, Download, Upload, RotateCcw, Building2, Save, Coins, Mail } from 'lucide-react';

export const SettingsBackup = () => {
  const { data, updateCompanyInfo, exportDataJSON, importDataJSON, resetToDefaultData, t, lang } = useAccounting();
  
  const [companyInfo, setCompanyInfo] = useState({ ...data.companyInfo });

  useEffect(() => {
    setCompanyInfo({ ...data.companyInfo });
  }, [data.companyInfo]);

  const handleSaveCompany = (e) => {
    e.preventDefault();
    updateCompanyInfo(companyInfo);
  };

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
          toast.error("خطأ في قراءة ملف JSON المراد استيراده!");
        }
      };
    }
  };

  const handleReset = () => {
    resetToDefaultData();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            <span>{t.settings}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'إعدادات هوية المؤسسة والتحكم الديناميكي في ملفات JSON المحلية' : 'Company profile & local JSON backup management'}
          </p>
        </div>
      </div>

      {/* JSON Backup & Restore Actions Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{lang === 'ar' ? 'النسخ الاحتياطي وإدارة ملفات JSON' : 'JSON Backup & Restore'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Export JSON Button */}
          <button
            onClick={exportDataJSON}
            className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl transition space-y-2 group active:scale-95"
          >
            <Download className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">{t.exportData}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center">تنزيل نسخة احتياطية كاملة بصيغة .json</span>
          </button>

          {/* Import JSON File Input */}
          <label className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl transition space-y-2 cursor-pointer group active:scale-95">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">{t.importData}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center">رفع واسترجاع بيانات من ملف JSON سابق</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Reset Default Data */}
          <button
            onClick={handleReset}
            className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 rounded-xl transition space-y-2 group active:scale-95"
          >
            <RotateCcw className="w-6 h-6 text-rose-600 dark:text-rose-400 group-hover:rotate-180 transition duration-500" />
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{t.resetData}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center">استعادة العينات الافتراضية الأولية</span>
          </button>

        </div>
      </div>

      {/* Dynamic Company Information Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>{lang === 'ar' ? 'بيانات وهويّة المؤسسة الديناميكية (تنعكس فوراً بالفواتير والمطبوعات)' : 'Dynamic Company Profile Details'}</span>
        </h3>

        <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المؤسسة (بالعربية)</label>
              <input
                type="text"
                required
                value={companyInfo.name || ''}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name (English)</label>
              <input
                type="text"
                required
                value={companyInfo.nameEn || ''}
                onChange={(e) => setCompanyInfo({ ...companyInfo, nameEn: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>البريد الإلكتروني الرسمي</span>
              </label>
              <input
                type="email"
                value={companyInfo.email || ''}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={companyInfo.phone || ''}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">السجل الضريبي</label>
              <input
                type="text"
                value={companyInfo.taxNumber || ''}
                onChange={(e) => setCompanyInfo({ ...companyInfo, taxNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-500" />
                <span>رمز العملة (بالعربية)</span>
              </label>
              <input
                type="text"
                value={companyInfo.currency || 'ج.م'}
                onChange={(e) => setCompanyInfo({ ...companyInfo, currency: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Symbol (English)</label>
              <input
                type="text"
                value={companyInfo.currencyEn || 'EGP'}
                onChange={(e) => setCompanyInfo({ ...companyInfo, currencyEn: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان الرئيسي للمؤسسة</label>
            <input
              type="text"
              value={companyInfo.address || ''}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition active:scale-95 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
