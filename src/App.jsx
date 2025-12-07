import React, { useState } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencySelector } from './components/CurrencySelector';
import { ExpenseForm } from './components/ExpenseForm';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { LayoutDashboard, PlusCircle, PieChart, LogOut } from 'lucide-react';

function AppContent() {
  const { user, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingExpense, setEditingExpense] = useState(null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors">
      <header className="bg-gray-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            ExpenseTracker
          </h1>
          <div className="flex items-center gap-4">
            <CurrencySelector />
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24">
        {activeTab === 'dashboard' && <Dashboard onEdit={handleEdit} />}
        {activeTab === 'add' && <ExpenseForm editingExpense={editingExpense} onCancelEdit={handleCancelEdit} />}
        {activeTab === 'reports' && <Reports />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex justify-around p-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'add' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            <PlusCircle size={24} />
            <span className="text-xs mt-1 font-medium">Add</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'reports' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            <PieChart size={24} />
            <span className="text-xs mt-1 font-medium">Reports</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
