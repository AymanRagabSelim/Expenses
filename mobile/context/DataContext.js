import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

const DataContext = createContext();

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Other'];

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(false);

    // Fetch data when user logs in
    useEffect(() => {
        if (user) {
            fetchExpenses();
            fetchCategories();
        } else {
            setExpenses([]);
            setCategories(DEFAULT_CATEGORIES);
        }
    }, [user]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('name')
                .eq('user_id', user.id);

            if (error) throw error;

            const customCategories = data.map(c => c.name);
            // Merge default and custom categories, removing duplicates
            setCategories([...new Set([...DEFAULT_CATEGORIES, ...customCategories])]);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        }
    };

    const addExpense = async (expense) => {
        try {
            // Optimistic update
            const tempId = Date.now().toString();
            const newExpense = { ...expense, id: tempId, user_id: user.id };
            setExpenses(prev => [newExpense, ...prev]);

            const { data, error } = await supabase
                .from('expenses')
                .insert([{
                    amount: expense.amount,
                    currency: expense.currency || 'USD',
                    category: expense.category,
                    note: expense.note,
                    date: expense.date,
                    type: expense.type,
                    user_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            // Replace temp ID with real ID
            setExpenses(prev => prev.map(e => e.id === tempId ? data : e));
        } catch (error) {
            console.error('Error adding expense:', error.message);
            Alert.alert('Error', 'Failed to save expense');
            // Revert optimistic update on error
            fetchExpenses();
        }
    };

    const updateExpense = async (id, updatedExpense) => {
        try {
            // Optimistic update
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpense } : e));

            const { error } = await supabase
                .from('expenses')
                .update({
                    amount: updatedExpense.amount,
                    currency: updatedExpense.currency,
                    category: updatedExpense.category,
                    note: updatedExpense.note,
                    date: updatedExpense.date,
                    type: updatedExpense.type
                })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating expense:', error.message);
            Alert.alert('Error', 'Failed to update expense');
            fetchExpenses();
        }
    };

    const deleteExpense = async (id) => {
        try {
            // Optimistic update
            setExpenses(prev => prev.filter(e => e.id !== id));

            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting expense:', error.message);
            Alert.alert('Error', 'Failed to delete expense');
            fetchExpenses();
        }
    };

    const addCategory = async (category) => {
        if (!categories.includes(category)) {
            try {
                setCategories(prev => [...prev, category]);

                const { error } = await supabase
                    .from('categories')
                    .insert([{ name: category, user_id: user.id }]);

                if (error) throw error;
            } catch (error) {
                console.error('Error adding category:', error.message);
            }
        }
    };

    return (
        <DataContext.Provider value={{ expenses, categories, addExpense, updateExpense, deleteExpense, addCategory, loading }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
