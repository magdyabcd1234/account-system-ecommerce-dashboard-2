import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Invoices } from './components/Invoices';
import { Inventory } from './components/Inventory';
import { Purchases } from './components/Purchases';
import { Expenses } from './components/Expenses';
import { CustomersSuppliers } from './components/CustomersSuppliers';
import { FinancialReports } from './components/FinancialReports';
import { SettingsBackup } from './components/SettingsBackup';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { PurchasePrintModal } from './components/PurchasePrintModal';
import { ExpensePrintModal } from './components/ExpensePrintModal';

function MainLayout() {
  const { lang, theme } = useAccounting();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Print Modal States
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedPurchaseForPrint, setSelectedPurchaseForPrint] = useState(null);
  const [selectedExpenseForPrint, setSelectedExpenseForPrint] = useState(null);

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [editingInvoiceToLoad, setEditingInvoiceToLoad] = useState(null);

  const handleOpenNewInvoice = () => {
    setEditingInvoiceToLoad(null);
    setActiveTab('sales');
    setIsCreateInvoiceOpen(true);
  };

  const handleEditInvoiceFromDashboard = (inv) => {
    setEditingInvoiceToLoad(inv);
    setActiveTab('sales');
    setIsCreateInvoiceOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-200">
      
      {/* Top Navigation Bar */}
      <Header onOpenNewInvoice={handleOpenNewInvoice} />

      {/* Body Container: Full Width so Sidebar sits flush at screen right edge in RTL without empty right space */}
      <div className="flex-1 w-full flex flex-col md:flex-row py-4 sm:py-6 gap-4 sm:gap-6">
        
        {/* Sticky Sidebar docked 100% flush at the screen side edge */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              onSelectInvoice={setSelectedInvoiceForPrint} 
              onOpenNewInvoice={handleOpenNewInvoice}
              onEditInvoice={handleEditInvoiceFromDashboard}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'sales' && (
            <Invoices 
              onSelectInvoice={setSelectedInvoiceForPrint} 
              isCreateOpen={isCreateInvoiceOpen}
              setIsCreateOpen={setIsCreateInvoiceOpen}
              editingInvoiceToLoad={editingInvoiceToLoad}
              setEditingInvoiceToLoad={setEditingInvoiceToLoad}
            />
          )}

          {activeTab === 'inventory' && <Inventory />}

          {activeTab === 'purchases' && (
            <Purchases onSelectPurchase={setSelectedPurchaseForPrint} />
          )}

          {activeTab === 'expenses' && (
            <Expenses onSelectExpense={setSelectedExpenseForPrint} />
          )}

          {activeTab === 'contacts' && <CustomersSuppliers />}

          {activeTab === 'reports' && <FinancialReports />}

          {activeTab === 'settings' && <SettingsBackup />}
        </main>

      </div>

      {/* Printable Modals */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal 
          invoice={selectedInvoiceForPrint} 
          onClose={() => setSelectedInvoiceForPrint(null)} 
        />
      )}

      {selectedPurchaseForPrint && (
        <PurchasePrintModal 
          purchase={selectedPurchaseForPrint} 
          onClose={() => setSelectedPurchaseForPrint(null)} 
        />
      )}

      {selectedExpenseForPrint && (
        <ExpensePrintModal 
          expense={selectedExpenseForPrint} 
          onClose={() => setSelectedExpenseForPrint(null)} 
        />
      )}

      {/* React Toastify Notifications Container */}
      <ToastContainer
        position="bottom-left"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={lang === 'ar'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />

    </div>
  );
}

export default function App() {
  return (
    <AccountingProvider>
      <MainLayout />
    </AccountingProvider>
  );
}
