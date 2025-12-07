import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, X, Save } from 'lucide-react';

export const ExpenseForm = ({ editingExpense, onCancelEdit }) => {
    const { addExpense, updateExpense, categories, addCategory } = useData();
    const { selectedCurrency } = useCurrency();
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(selectedCurrency);
    const [category, setCategory] = useState(categories[0] || 'Other');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (editingExpense) {
            setAmount(editingExpense.amount.toString());
            setCurrency(editingExpense.currency);
            setCategory(editingExpense.category);
            setNote(editingExpense.note || '');
            setDate(editingExpense.date);
        } else {
            setCurrency(selectedCurrency);
        }
    }, [editingExpense, selectedCurrency]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        let finalCategory = category;
        if (isNewCategory && newCategoryName) {
            addCategory(newCategoryName);
            finalCategory = newCategoryName;
        }

        const expenseData = {
            amount: parseFloat(amount),
            currency: currency,
            category: finalCategory,
            note,
            date,
        };

        if (editingExpense) {
            updateExpense(editingExpense.id, expenseData);
            onCancelEdit && onCancelEdit();
        } else {
            addExpense(expenseData);
        }

        setAmount('');
        setNote('');
        setIsNewCategory(false);
        setNewCategoryName('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
                {editingExpense && onCancelEdit && (
                    <button type="button" onClick={onCancelEdit} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    >
                        <option value="OMR">OMR (﷼)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EGP">EGP (£)</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                {!isNewCategory ? (
                    <div className="flex gap-2">
                        <select
                            value={category}
                            onChange={(e) => {
                                if (e.target.value === 'NEW') setIsNewCategory(true);
                                else setCategory(e.target.value);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="NEW" className="font-bold text-blue-600">+ Add New Category</option>
                        </select>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                            placeholder="Category Name"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setIsNewCategory(false)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    rows="2"
                    placeholder="Optional comment..."
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
                {editingExpense ? (
                    <><Save size={20} /> Update Expense</>
                ) : (
                    <><Plus size={20} /> Add Expense</>
                )}
            </button>
        </form>
    );
};
