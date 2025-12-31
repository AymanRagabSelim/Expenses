import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Database, Check, AlertCircle, Loader } from 'lucide-react';

export const DataMigration = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState('idle'); // idle, migrating, success, error, no-data
    const [message, setMessage] = useState('');

    const migrateData = async () => {
        if (!user) return;
        setStatus('migrating');
        setMessage('Reading local data...');

        try {
            // 1. Read from Local Storage
            const localExpensesStr = localStorage.getItem('expenses_data');
            const localCategoriesStr = localStorage.getItem('categories_data');

            if (!localExpensesStr && !localCategoriesStr) {
                setStatus('no-data');
                setMessage('No local data found to migrate.');
                return;
            }

            const localExpenses = localExpensesStr ? JSON.parse(localExpensesStr) : [];
            const localCategories = localCategoriesStr ? JSON.parse(localCategoriesStr) : [];

            if (localExpenses.length === 0 && localCategories.length === 0) {
                setStatus('no-data');
                setMessage('Local data is empty.');
                return;
            }

            // 2. Insert Categories
            if (localCategories.length > 0) {
                setMessage(`Migrating ${localCategories.length} categories...`);
                const categoriesToInsert = localCategories.map(name => ({
                    user_id: user.id,
                    name: name
                }));

                // We insert one by one to avoid duplicates error if unique constraint exists, 
                // or we can use upsert if we had IDs, but here we just have names.
                // For simplicity, let's just try to insert all, ignoring errors for duplicates if possible,
                // or just insert.
                const { error: catError } = await supabase
                    .from('categories')
                    .insert(categoriesToInsert);

                if (catError) console.warn('Category migration warning:', catError.message);
            }

            // 3. Insert Expenses
            if (localExpenses.length > 0) {
                setMessage(`Migrating ${localExpenses.length} expenses...`);
                const expensesToInsert = localExpenses.map(e => ({
                    user_id: user.id,
                    amount: e.amount,
                    currency: e.currency,
                    category: e.category,
                    note: e.note,
                    date: e.date,
                    // We don't preserve the old ID as Supabase generates new UUIDs
                }));

                const { error: expError } = await supabase
                    .from('expenses')
                    .insert(expensesToInsert);

                if (expError) throw expError;
            }

            // 4. Success
            setStatus('success');
            setMessage(`Successfully migrated ${localExpenses.length} expenses!`);

            // Optional: Clear local storage after success? 
            // Better to keep it for safety until user confirms.

            // Force reload to see new data
            window.location.reload();

        } catch (error) {
            console.error('Migration error:', error);
            setStatus('error');
            setMessage('Error: ' + error.message);
        }
    };

    if (status === 'success') return null; // Hide after success

    // Only show if there's actually local data
    const localExpensesStr = localStorage.getItem('expenses_data');
    const localCategoriesStr = localStorage.getItem('categories_data');

    if (!localExpensesStr && !localCategoriesStr) return null;

    const localExpenses = localExpensesStr ? JSON.parse(localExpensesStr) : [];
    const localCategories = localCategoriesStr ? JSON.parse(localCategoriesStr) : [];

    if (localExpenses.length === 0 && localCategories.length === 0) return null;

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                    <Database size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Migrate Local Data</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Found data in your browser from before the update. Click below to move it to your new cloud database.
                    </p>

                    {message && (
                        <div className={`mt-2 text-xs font-medium flex items-center gap-1 
              ${status === 'error' ? 'text-red-600' :
                                status === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                            {status === 'migrating' && <Loader size={12} className="animate-spin" />}
                            {status === 'success' && <Check size={12} />}
                            {status === 'error' && <AlertCircle size={12} />}
                            {message}
                        </div>
                    )}

                    {status !== 'migrating' && status !== 'success' && (
                        <button
                            onClick={migrateData}
                            className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
                        >
                            Start Migration
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
