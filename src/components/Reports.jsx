import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MultiSelect } from './MultiSelect';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#d0ed57'];

export const Reports = () => {
    const { expenses } = useData();
    const { selectedCurrency, convert, format } = useCurrency();
    const [filterType, setFilterType] = useState('debit'); // Default to debit for expenses
    const [categoryFilter, setCategoryFilter] = useState([]);

    // Get unique categories
    const categories = ['all', ...new Set(expenses.map(e => e.category))].filter(Boolean);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            const dateMatch = e.date >= startDate && e.date <= endDate;
            const type = e.type || 'debit';
            const typeMatch = filterType === 'all' ? true : type === filterType;
            const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(e.category);
            return dateMatch && typeMatch && categoryMatch;
        });
    }, [expenses, startDate, endDate, filterType, categoryFilter]);

    const categoryData = useMemo(() => {
        const data = {};
        filteredExpenses.forEach(e => {
            const amount = convert(e.amount, e.currency, selectedCurrency);
            // If viewing 'all', we might want to separate or net them, but for a pie chart by category, 
            // usually we just sum up the absolute values or just sum them. 
            // If type is credit, amount is income. If debit, expense.
            // For a mixed report, simple sum might be misleading if we mix income and expense categories in one pie.
            // However, based on user request "separate reports", the user will likely use the filter.
            // We will just sum the values for the pie chart.
            data[e.category] = (data[e.category] || 0) + amount;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses, selectedCurrency, convert]);

    const totalFiltered = categoryData.reduce((sum, item) => sum + item.value, 0);

    const getReportTitle = () => {
        if (filterType === 'debit') return 'Expenses by Category';
        if (filterType === 'credit') return 'Income by Category';
        return 'All Transactions by Category';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Reports</h2>

                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex flex-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        {['debit', 'credit'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-all ${filterType === type
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {type === 'debit' ? 'Expenses' : type === 'credit' ? 'Income' : 'All'}
                            </button>
                        ))}
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

                <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                        <h3 className="text-center font-medium mb-2 text-gray-700 dark:text-gray-300">{getReportTitle()}</h3>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => format(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data for selected period</div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total for Period</div>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{format(totalFiltered)}</div>
                        <div className="text-sm text-gray-500 mt-1">{startDate} to {endDate}</div>

                        <div className="mt-6 w-full">
                            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Breakdown</h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {categoryData.map((item, index) => (
                                    <div key={item.name} className="flex justify-between text-sm items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded-md transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-800 dark:text-white">{format(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
