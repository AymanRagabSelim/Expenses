import React from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, Edit2 } from 'lucide-react';
import { DataMigration } from './DataMigration';

export const Dashboard = ({ onEdit }) => {
    const { expenses, deleteExpense } = useData();
    const { selectedCurrency, convert, format } = useCurrency();

    const total = expenses.reduce((sum, expense) => {
        return sum + convert(expense.amount, expense.currency, selectedCurrency);
    }, 0);

    return (
        <div className="space-y-6">
            <DataMigration />
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <h2 className="text-lg font-medium opacity-90">Total Expenses</h2>
                <div className="text-4xl font-bold mt-2">{format(total)}</div>
                <p className="text-sm opacity-75 mt-1">in {selectedCurrency}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                    {expenses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No expenses yet.</div>
                    ) : (
                        expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => (
                            <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div>
                                    <div className="font-medium text-gray-800 dark:text-white">{expense.category}</div>
                                    <div className="text-sm text-gray-500">{expense.date} {expense.note && `• ${expense.note}`}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-bold text-gray-800 dark:text-white">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency }).format(expense.amount)}
                                        </div>
                                        {expense.currency !== selectedCurrency && (
                                            <div className="text-xs text-gray-500">
                                                ≈ {format(convert(expense.amount, expense.currency, selectedCurrency))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onEdit && onEdit(expense)}
                                        className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteExpense(expense.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
