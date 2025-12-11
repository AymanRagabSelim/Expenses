import React from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, Edit2 } from 'lucide-react';
import { DataMigration } from './DataMigration';

export const Dashboard = ({ onEdit }) => {
    const { expenses, deleteExpense } = useData();
    const { selectedCurrency, convert, format } = useCurrency();
    const [filterType, setFilterType] = useState('all'); // all, debit, credit

    const filteredExpenses = expenses.filter(expense => {
        if (filterType === 'all') return true;
        return (expense.type || 'debit') === filterType; // Default to debit for backward compatibility
    });

    const total = filteredExpenses.reduce((sum, expense) => {
        const amount = convert(expense.amount, expense.currency, selectedCurrency);
        const type = expense.type || 'debit';

        if (filterType === 'all') {
            return type === 'credit' ? sum + amount : sum - amount;
        }
        return sum + amount;
    }, 0);

    const getTitle = () => {
        if (filterType === 'debit') return 'Total Expenses';
        if (filterType === 'credit') return 'Total Income';
        return 'Net Balance';
    };

    return (
        <div className="space-y-6">
            <DataMigration />

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                {['all', 'debit', 'credit'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-all ${filterType === type
                            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className={`rounded-xl p-6 text-white shadow-lg ${filterType === 'credit' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                filterType === 'debit' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                    'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                <h2 className="text-lg font-medium opacity-90">{getTitle()}</h2>
                <div className="text-4xl font-bold mt-2">{format(total)}</div>
                <p className="text-sm opacity-75 mt-1">in {selectedCurrency}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                    {filteredExpenses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions found.</div>
                    ) : (
                        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => {
                            const isCredit = (expense.type || 'debit') === 'credit';
                            return (
                                <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${isCredit ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-white">{expense.category}</div>
                                            <div className="text-sm text-gray-500">{expense.date} {expense.note && `• ${expense.note}`}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                                {isCredit ? '+' : '-'} {new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency }).format(expense.amount)}
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
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
