import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, Edit2 } from 'lucide-react';
import { DataMigration } from './DataMigration';
import { MultiSelect } from './MultiSelect';
import { ChangePasswordModal } from './ChangePasswordModal';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ onEdit }) => {
    const { expenses, deleteExpense } = useData();
    const { selectedCurrency, convert, format } = useCurrency();
    const [filterType, setFilterType] = useState('debit'); // all, debit, credit
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [filterDateRange, setFilterDateRange] = useState('Month'); // Today, Week, Month, All

    // Get unique categories from expenses
    const categories = ['all', ...new Set(expenses.map(e => e.category))].filter(Boolean);

    const filterByDate = (date) => {
        if (filterDateRange === 'All') return true;
        const d = new Date(date);
        const now = new Date();

        if (filterDateRange === 'Today') {
            return d.toDateString() === now.toDateString();
        }
        if (filterDateRange === 'Week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return d >= weekAgo;
        }
        if (filterDateRange === 'Month') {
            const currentDay = now.getDate();
            let start, end;
            if (currentDay >= 23) {
                // Current cycle started this month on the 23rd
                start = new Date(now.getFullYear(), now.getMonth(), 23);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 23);
            } else {
                // Current cycle started last month on the 23rd
                start = new Date(now.getFullYear(), now.getMonth() - 1, 23);
                end = new Date(now.getFullYear(), now.getMonth(), 23);
            }
            // Normalize d to start of day for comparison if string is just YYYY-MM-DD
            // But usually e.date is YYYY-MM-DD string. New Date(YYYY-MM-DD) is UTC midnight.
            // Let's rely on time comparison.
            const dTime = d.getTime();
            const startTime = start.setHours(0, 0, 0, 0);
            const endTime = end.setHours(0, 0, 0, 0);
            return dTime >= startTime && dTime < endTime;
        }
        return true;
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesType = filterType === 'all' || (expense.type || 'debit') === filterType;
        const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(expense.category);
        const matchesDate = filterByDate(expense.date);
        return matchesType && matchesCategory && matchesDate;
    });

    const total = filteredExpenses.reduce((sum, expense) => {
        const amount = convert(expense.amount, expense.currency, selectedCurrency);
        // We only sum up the filtered expenses now, which already respect the Type filter (if active)
        // If filterType is 'all', we need to handle credits as positive and debits as negative for Net Balance
        // If filterType is 'debit' or 'credit', we just sum the magnitudes because the list is already filtered by type.

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

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const { passwordRecoveryMode } = useAuth();

    // Auto-open modal if recovering password
    React.useEffect(() => {
        if (passwordRecoveryMode) {
            setIsPasswordModalOpen(true);
        }
    }, [passwordRecoveryMode]);

    return (
        <div className="space-y-6">
            <DataMigration />
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />

            <div className="flex flex-col sm:flex-row gap-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg relative">
                {/* Optional: Add a small settings button somewhere, or keep it hidden until forced, 
                    but adding a small 'Change Password' button at bottom of page is good practice. 
                    For now, it auto-triggers on recovery. 
                    Let's add a Trigger button in a new 'options' area or similar if desired.
                    For simplicity/Request, I will add a small text button below the filters or in a corner.*/}

                <div className="flex flex-col gap-2 flex-1">
                    {/* Date Filters */}
                    <div className="flex bg-white dark:bg-gray-700 rounded-md p-1 shadow-sm">
                        {['All', 'Today', 'Week', 'Month'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setFilterDateRange(range)}
                                className={`flex-1 py-1 px-3 rounded-md text-xs font-medium transition-all ${filterDateRange === range
                                    ? 'bg-blue-50 dark:bg-gray-600 text-blue-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Type Filters */}
                    <div className="flex bg-white dark:bg-gray-700 rounded-md p-1 shadow-sm">
                        {['debit', 'credit'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium capitalize transition-all ${filterType === type
                                    ? 'bg-gray-100 dark:bg-gray-600 text-blue-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <MultiSelect
                        options={categories.filter(c => c !== 'all')}
                        selected={categoryFilter}
                        onChange={setCategoryFilter}
                        placeholder="All Categories"
                    />
                </div>
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
