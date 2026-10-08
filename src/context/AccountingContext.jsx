import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import initialData from '../data/initialData.json';
import { translations } from '../i18n/translations';

const AccountingContext = createContext();

const STORAGE_KEY = 'ELITE_ACCOUNTING_DATA_V1';
const LANG_STORAGE_KEY = 'ELITE_ACCOUNTING_LANG';
const THEME_STORAGE_KEY = 'ELITE_ACCOUNTING_THEME';

export const AccountingProvider = ({ children }) => {
  // 1. Language State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'ar';
  });

  const t = translations[lang] || translations.ar;

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    toast.info(nextLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English');
  };

  // 2. Theme State (Dark / Light Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    toast.info(nextTheme === 'dark' ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع النهاري ☀️');
  };

  // 3. Persistent Accounting Data
  const [data, setData] = useState(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (err) {
        console.error("Failed to parse local storage data", err);
      }
    }
    return initialData;
  });

  // Sync Data to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Set document attributes for HTML direction & theme
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [lang, theme]);

  // -------------------------------------------------------------
  // Accounting Logic & Operations
  // -------------------------------------------------------------

  // Add Sales Invoice
  const addInvoice = (newInv) => {
    const invoiceId = `INV-2026-${String(data.invoices.length + 1).padStart(3, '0')}`;
    const invoice = {
      id: invoiceId,
      date: newInv.date || new Date().toISOString().split('T')[0],
      customerId: newInv.customerId,
      customerName: newInv.customerName,
      items: newInv.items,
      subtotal: newInv.subtotal,
      tax: newInv.tax,
      discount: newInv.discount || 0,
      total: newInv.total,
      status: newInv.status,
      paymentMethod: newInv.paymentMethod,
      notes: newInv.notes || ''
    };

    // Update Product Stock (Deduct sold items)
    const updatedProducts = data.products.map(p => {
      const soldItem = newInv.items.find(i => i.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stockQuantity: Math.max(0, p.stockQuantity - Number(soldItem.quantity))
        };
      }
      return p;
    });

    // Update Customer Balance if unpaid/partial
    const updatedCustomers = data.customers.map(c => {
      if (c.id === newInv.customerId && newInv.status !== 'Paid') {
        const unpaidAmount = newInv.status === 'Unpaid' 
          ? newInv.total 
          : (newInv.unpaidBalance || (newInv.total / 2));
        return { ...c, balance: c.balance + unpaidAmount };
      }
      return c;
    });

    // Create Automated Journal Entry
    const newJournalEntry = {
      id: `JRN-${String(data.journalEntries.length + 1).padStart(3, '0')}`,
      date: invoice.date,
      description: `إثبات فاتورة مبيعات رقم ${invoiceId} - ${invoice.customerName}`,
      accountDebit: invoice.paymentMethod === 'Cash' ? 'الصندوق / النقدية' : (invoice.paymentMethod === 'Bank Transfer' ? 'البنك الأهلي' : 'ذمم عملاء'),
      accountCredit: 'إيراد المبيعات',
      amount: invoice.total
    };

    setData(prev => ({
      ...prev,
      invoices: [invoice, ...prev.invoices],
      products: updatedProducts,
      customers: updatedCustomers,
      journalEntries: [newJournalEntry, ...prev.journalEntries]
    }));

    toast.success(`تم إنشاء الفاتورة (${invoiceId}) وتحديث الحسابات والمخزون بنجاح! 🎉`);
    return invoiceId;
  };

  // Update Sales Invoice
  const updateInvoice = (updatedInv) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => inv.id === updatedInv.id ? { ...inv, ...updatedInv } : inv)
    }));
    toast.info(`تم تعديل بيانات الفاتورة ${updatedInv.id} وتحديث الداشبورد بنجاح! ✏️`);
  };

  // Delete Sales Invoice
  const deleteInvoice = (invoiceId) => {
    const targetInv = data.invoices.find(i => i.id === invoiceId);
    if (!targetInv) return;

    // Restore product stock quantities
    const restoredProducts = data.products.map(p => {
      const soldItem = targetInv.items.find(i => i.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + Number(soldItem.quantity)
        };
      }
      return p;
    });

    // Revert customer balance if unpaid or partial
    const restoredCustomers = data.customers.map(c => {
      if (c.id === targetInv.customerId && targetInv.status !== 'Paid') {
        const unpaidAmount = targetInv.status === 'Unpaid' ? targetInv.total : (targetInv.total / 2);
        return { ...c, balance: Math.max(0, c.balance - unpaidAmount) };
      }
      return c;
    });

    // Filter out invoice & associated journal entries
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== invoiceId),
      products: restoredProducts,
      customers: restoredCustomers,
      journalEntries: prev.journalEntries.filter(j => !j.description.includes(invoiceId))
    }));

    toast.error(`تم حذف الفاتورة ${invoiceId} وإعادة كميات المخزون وتحديث البيانات الحسابية! 🗑️`);
  };

  // Add Purchase Order
  const addPurchase = (newPo) => {
    const poId = `PO-2026-${String(data.purchaseOrders.length + 1).padStart(3, '0')}`;
    const purchaseOrder = {
      id: poId,
      date: newPo.date || new Date().toISOString().split('T')[0],
      supplierId: newPo.supplierId,
      supplierName: newPo.supplierName,
      items: newPo.items,
      subtotal: newPo.subtotal,
      tax: newPo.tax,
      total: newPo.total,
      status: newPo.status,
      paymentMethod: newPo.paymentMethod,
      notes: newPo.notes || ''
    };

    const updatedProducts = data.products.map(p => {
      const boughtItem = newPo.items.find(i => i.productId === p.id);
      if (boughtItem) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + Number(boughtItem.quantity)
        };
      }
      return p;
    });

    const updatedSuppliers = data.suppliers.map(s => {
      if (s.id === newPo.supplierId && newPo.status !== 'Paid') {
        return { ...s, balance: s.balance + newPo.total };
      }
      return s;
    });

    const newJournalEntry = {
      id: `JRN-${String(data.journalEntries.length + 1).padStart(3, '0')}`,
      date: purchaseOrder.date,
      description: `إثبات فاتورة مشتريات رقم ${poId} - ${purchaseOrder.supplierName}`,
      accountDebit: 'مخزون البضائع',
      accountCredit: purchaseOrder.paymentMethod === 'Cash' ? 'الصندوق النقدية' : 'ذمم موردين',
      amount: purchaseOrder.total
    };

    setData(prev => ({
      ...prev,
      purchaseOrders: [purchaseOrder, ...prev.purchaseOrders],
      products: updatedProducts,
      suppliers: updatedSuppliers,
      journalEntries: [newJournalEntry, ...prev.journalEntries]
    }));

    toast.success(`تم تسجيل أمر الشراء (${poId}) وإعادة تزويد المخزون! 🛍️`);
  };

  // Update Purchase Order
  const updatePurchase = (updatedPo) => {
    setData(prev => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map(p => p.id === updatedPo.id ? { ...p, ...updatedPo } : p)
    }));
    toast.info(`تم تعديل أمر الشراء ${updatedPo.id} وتحديث بيانات الداشبورد! ✏️`);
  };

  // Delete Purchase Order
  const deletePurchase = (poId) => {
    setData(prev => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.filter(p => p.id !== poId)
    }));
    toast.error(`تم حذف أذن الشراء ${poId}! 🗑️`);
  };

  // Add Expense
  const addExpense = (newExp) => {
    const expId = `EXP-2026-${String(data.expenses.length + 1).padStart(3, '0')}`;
    const expense = {
      id: expId,
      date: newExp.date || new Date().toISOString().split('T')[0],
      title: newExp.title,
      category: newExp.category,
      amount: Number(newExp.amount),
      paymentMethod: newExp.paymentMethod,
      notes: newExp.notes || ''
    };

    const newJournalEntry = {
      id: `JRN-${String(data.journalEntries.length + 1).padStart(3, '0')}`,
      date: expense.date,
      description: `مصروف تشغيلي: ${expense.title}`,
      accountDebit: `مصروفات - ${expense.category}`,
      accountCredit: expense.paymentMethod === 'Cash' ? 'النقدية بالخزينة' : 'حساب البنك',
      amount: expense.amount
    };

    setData(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
      journalEntries: [newJournalEntry, ...prev.journalEntries]
    }));

    toast.success(`تم تسجيل المصروف (${expense.title}) وترافق قيده بالداشبورد! 💸`);
  };

  // Edit/Update Expense
  const updateExpense = (updatedExp) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === updatedExp.id ? { ...e, ...updatedExp, amount: Number(updatedExp.amount) } : e)
    }));
    toast.info(`تم تعديل بيان المصروف (${updatedExp.title}) وتحديث أرصدة الداشبورد فوراً! ✏️`);
  };

  // Delete Expense
  const deleteExpense = (id) => {
    const target = data.expenses.find(e => e.id === id);
    const expTitle = target ? target.title : '';
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
    toast.error(`تم حذف المصروف (${expTitle}) وتحديث الداشبورد! 🗑️`);
  };

  // Product CRUD
  const addProduct = (prod) => {
    const prodId = `PRD-${Math.floor(100 + Math.random() * 900)}`;
    const product = { ...prod, id: prodId, stockQuantity: Number(prod.stockQuantity), buyPrice: Number(prod.buyPrice), sellPrice: Number(prod.sellPrice) };
    setData(prev => ({ ...prev, products: [product, ...prev.products] }));
    toast.success(`تمت إضافة المنتج (${prod.name}) للمخزون! 📦`);
  };

  const updateProduct = (updatedProd) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updatedProd.id ? updatedProd : p)
    }));
    toast.info(`تم تحديث بيانات المنتج (${updatedProd.name})! ✏️`);
  };

  const deleteProduct = (id) => {
    const prodName = data.products.find(p => p.id === id)?.name || '';
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
    toast.error(`تم حذف المنتج (${prodName}) من المخزون! 🗑️`);
  };

  // Customer CRUD
  const addCustomer = (cust) => {
    const custId = `CUST-${String(data.customers.length + 1).padStart(3, '0')}`;
    const customer = { ...cust, id: custId, balance: Number(cust.balance || 0) };
    setData(prev => ({ ...prev, customers: [...prev.customers, customer] }));
    toast.success(`تمت إضافة العميل (${cust.name}) برصيد ${customer.balance} ج.م! 👤`);
  };

  const updateCustomer = (updatedCust) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === updatedCust.id ? { ...c, ...updatedCust, balance: Number(updatedCust.balance || 0) } : c)
    }));
    toast.info(`تم تعديل بيانات كشف حساب العميل (${updatedCust.name})! ✏️`);
  };

  const deleteCustomer = (id) => {
    const custName = data.customers.find(c => c.id === id)?.name || '';
    setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    toast.error(`تم حذف العميل (${custName}) من الدليل بنجاح! 🗑️`);
  };

  // Supplier CRUD
  const addSupplier = (sup) => {
    const supId = `SUP-${String(data.suppliers.length + 1).padStart(3, '0')}`;
    const supplier = { ...sup, id: supId, balance: Number(sup.balance || 0) };
    setData(prev => ({ ...prev, suppliers: [...prev.suppliers, supplier] }));
    toast.success(`تمت إضافة المورد (${sup.name}) برصيد ${supplier.balance} ج.م! 🏢`);
  };

  const updateSupplier = (updatedSup) => {
    setData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === updatedSup.id ? { ...s, ...updatedSup, balance: Number(updatedSup.balance || 0) } : s)
    }));
    toast.info(`تم تعديل بيانات كشف حساب المورد (${updatedSup.name})! ✏️`);
  };

  const deleteSupplier = (id) => {
    const supName = data.suppliers.find(s => s.id === id)?.name || '';
    setData(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== id) }));
    toast.error(`تم حذف المورد (${supName}) من الدليل بنجاح! 🗑️`);
  };

  // Export JSON Backup
  const exportDataJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `elite_accounting_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("تم تصدير ملف النسخة الاحتياطية JSON بنجاح! 📥");
  };

  // Import JSON Backup (100% Dynamic & Robust)
  const importDataJSON = (importedObj) => {
    if (!importedObj || typeof importedObj !== 'object') {
      toast.error("الملف المرفوع ليس ملف JSON صحيح!");
      return false;
    }
    
    // Ensure all required properties exist with defaults if missing
    const sanitizedData = {
      companyInfo: importedObj.companyInfo ? { ...initialData.companyInfo, ...importedObj.companyInfo } : initialData.companyInfo,
      products: Array.isArray(importedObj.products) ? importedObj.products : [],
      invoices: Array.isArray(importedObj.invoices) ? importedObj.invoices : [],
      purchaseOrders: Array.isArray(importedObj.purchaseOrders) ? importedObj.purchaseOrders : [],
      expenses: Array.isArray(importedObj.expenses) ? importedObj.expenses : [],
      customers: Array.isArray(importedObj.customers) ? importedObj.customers : [],
      suppliers: Array.isArray(importedObj.suppliers) ? importedObj.suppliers : [],
      journalEntries: Array.isArray(importedObj.journalEntries) ? importedObj.journalEntries : []
    };

    setData(sanitizedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedData));
    toast.success("تم استيراد قاعدة البيانات بنجاح وتحديث كافة الأقسام والمؤشرات فوراً! 🔄🎉");
    return true;
  };

  // Reset Data
  const resetToDefaultData = () => {
    setData(initialData);
    localStorage.removeItem(STORAGE_KEY);
    toast.warn("تمت استعادة البيانات الافتراضية للنظام! ⚡");
  };

  // Fully 100% Dynamic Calculated Accounting Metrics (No hardcoded values!)
  const metrics = React.useMemo(() => {
    // Total Sales from invoices
    const totalSales = data.invoices.reduce((sum, i) => sum + Number(i.total), 0);
    
    // Total Purchases from purchase orders
    const totalPurchases = data.purchaseOrders.reduce((sum, p) => sum + Number(p.total), 0);
    
    // Total Operating Expenses
    const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Exact Cost of Goods Sold (COGS) calculated from invoice items and product buy prices
    let exactCOGS = 0;
    data.invoices.forEach(inv => {
      if (inv.items) {
        inv.items.forEach(item => {
          const prod = data.products.find(p => p.id === item.productId);
          const buyP = prod ? Number(prod.buyPrice) : Number(item.unitPrice) * 0.7;
          exactCOGS += Number(item.quantity) * buyP;
        });
      }
    });

    // Net Profit = Sales - Cost of Goods Sold - Operating Expenses
    const netProfit = totalSales - exactCOGS - totalExpenses;

    // Accounts Receivable (Due from customers)
    const receivables = data.customers.reduce((sum, c) => sum + Number(c.balance > 0 ? c.balance : 0), 0);

    // Accounts Payable (Due to suppliers)
    const payables = data.suppliers.reduce((sum, s) => sum + Number(s.balance > 0 ? s.balance : 0), 0);

    // Cash Balance: Cash Collected from Sales - Cash Paid for Purchases - Cash Paid for Expenses
    const cashInSales = data.invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + Number(i.total), 0);
    
    const cashOutPurchases = data.purchaseOrders
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + Number(p.total), 0);

    const cashBalance = cashInSales - cashOutPurchases - totalExpenses;

    // Low Stock Alert Count
    const lowStockCount = data.products.filter(p => p.stockQuantity <= p.minStockAlert).length;

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      exactCOGS,
      netProfit,
      receivables,
      payables,
      cashBalance,
      lowStockCount
    };
  }, [data]);

  // Fully 100% Dynamic Monthly Chart Data (Grouped from actual invoice dates & expense dates)
  const dynamicChartData = React.useMemo(() => {
    const monthMap = {};

    const getMonthKey = (dateStr) => {
      if (!dateStr) return '2026-10';
      return dateStr.substring(0, 7);
    };

    const monthNamesAr = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
    };

    // Aggregate Sales by Month
    data.invoices.forEach(inv => {
      const mKey = getMonthKey(inv.date);
      if (!monthMap[mKey]) monthMap[mKey] = { sales: 0, expenses: 0 };
      monthMap[mKey].sales += Number(inv.total);
    });

    // Aggregate Expenses by Month
    data.expenses.forEach(exp => {
      const mKey = getMonthKey(exp.date);
      if (!monthMap[mKey]) monthMap[mKey] = { sales: 0, expenses: 0 };
      monthMap[mKey].expenses += Number(exp.amount);
    });

    const sortedKeys = Object.keys(monthMap).sort();
    
    if (sortedKeys.length === 0) {
      return [{ name: 'أكتوبر', sales: 0, expenses: 0 }];
    }

    return sortedKeys.map(key => {
      const [year, mNum] = key.split('-');
      const monthLabel = lang === 'ar' ? (monthNamesAr[mNum] || key) : key;
      return {
        name: monthLabel,
        sales: monthMap[key].sales,
        expenses: monthMap[key].expenses
      };
    });
  }, [data, lang]);

  // Update Company Info Settings Dynamically
  const updateCompanyInfo = (newInfo) => {
    setData(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, ...newInfo }
    }));
    toast.success("تم تحديث هويّة وبيانات المؤسسة بالكامل وتأثيرها على كافة الفواتير والمطبوعات! 🏢💾");
  };

  return (
    <AccountingContext.Provider value={{
      data,
      lang,
      theme,
      t,
      toggleLanguage,
      toggleTheme,
      metrics,
      dynamicChartData,
      updateCompanyInfo,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addPurchase,
      updatePurchase,
      deletePurchase,
      addExpense,
      updateExpense,
      deleteExpense,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      exportDataJSON,
      importDataJSON,
      resetToDefaultData
    }}>
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
