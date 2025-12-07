import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#d0ed57'];

export const Reports = () => {
    const { expenses } = useData();
    const { selectedCurrency, convert, format } = useCurrency();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => e.date >= startDate && e.date <= endDate);
    }, [expenses, startDate, endDate]);

    const categoryData = useMemo(() => {
        const data = {};
        filteredExpenses.forEach(e => {
            const amount = convert(e.amount, e.currency, selectedCurrency);
            data[e.category] = (data[e.category] || 0) + amount;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses, selectedCurrency, convert]);

    const totalFiltered = categoryData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Reports</h2>

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
                        <h3 className="text-center font-medium mb-2 text-gray-700 dark:text-gray-300">Expenses by Category</h3>
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
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                {categoryData.map((item, index) => (
                                    <div key={item.name} className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
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
