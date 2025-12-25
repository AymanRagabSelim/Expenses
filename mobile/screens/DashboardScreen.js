import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const AddExpenseModal = ({ isOpen, onClose, categories, onSave }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState((categories || [])[0] || 'Other');
    const [note, setNote] = useState('');
    const [type, setType] = useState('debit');

    const handleSave = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        onSave({
            amount: numAmount,
            category: category || 'Other',
            note: note || '',
            type: type || 'debit',
            date: new Date().toISOString().split('T')[0],
            currency: 'USD'
        });
        setAmount('');
        setNote('');
        onClose();
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Transaction</Text>

                    <View style={styles.typeSelector}>
                        <TouchableOpacity onPress={() => setType('debit')} style={[styles.typeBtn, type === 'debit' && styles.typeBtnActiveDeb]}>
                            <Text style={[styles.typeText, type === 'debit' && styles.typeTextActive]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setType('credit')} style={[styles.typeBtn, type === 'credit' && styles.typeBtnActiveCred]}>
                            <Text style={[styles.typeText, type === 'credit' && styles.typeTextActive]}>Income</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Note (optional)"
                        value={note}
                        onChangeText={setNote}
                    />

                    <Text style={styles.label}>Category</Text>
                    <View style={{ height: 50 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                            {(categories || []).map(c => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setCategory(c)}
                                    style={[styles.catChip, category === c && styles.catChipActive]}
                                >
                                    <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function DashboardScreen() {
    const data = useData() || {};
    const { expenses = [], categories = [], addExpense = () => { }, deleteExpense = () => { } } = data;
    const { signOut } = useAuth() || {};

    const [filterType, setFilterType] = useState('debit'); // all, debit, credit
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Calc Total
    const total = (expenses || [])
        .filter(e => filterType === 'all' || (e.type || 'debit') === filterType)
        .reduce((sum, e) => {
            const amount = parseFloat(e.amount) || 0;
            const type = e.type || 'debit';
            if (filterType === 'all') {
                return type === 'credit' ? sum + amount : sum - amount;
            }
            return sum + amount;
        }, 0);

    const filteredExpenses = (expenses || []).filter(e => filterType === 'all' || (e.type || 'debit') === filterType);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ExpenseTracker</Text>
                <TouchableOpacity onPress={signOut}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>{filterType === 'all' ? 'Net Balance' : filterType === 'credit' ? 'Total Income' : 'Total Expenses'}</Text>
                <Text style={styles.balance}>${(total || 0).toFixed(2)}</Text>

                <View style={styles.filterRow}>
                    {['debit', 'credit', 'all'].map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setFilterType(t)}
                            style={[styles.filterBtn, filterType === t && styles.filterBtnActive]}
                        >
                            <Text style={[styles.filterText, filterType === t && styles.filterTextActive]}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredExpenses}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.indicator, { backgroundColor: (item.type || 'debit') === 'credit' ? '#10b981' : '#ef4444' }]} />
                            <View style={styles.itemTexts}>
                                <Text style={styles.itemCat}>{item.category || 'Other'}</Text>
                                <Text style={styles.itemDate}>{item.date || ''} {item.note ? `• ${item.note}` : ''}</Text>
                            </View>
                        </View>
                        <Text style={[styles.itemAmount, { color: (item.type || 'debit') === 'credit' ? '#059669' : '#dc2626' }]}>
                            {(item.type || 'debit') === 'credit' ? '+' : '-'} ${item.amount || '0.00'}
                        </Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: '#999' }}>No transactions found</Text>
                    </View>
                }
            />

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                categories={categories}
                onSave={addExpense}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#2563eb',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 24,
        borderRadius: 20,
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
    balance: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 20,
    },
    filterRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 4,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    filterBtnActive: {
        backgroundColor: 'white',
    },
    filterText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#2563eb',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    addBtn: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    item: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemTexts: {
        marginLeft: 12,
    },
    indicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
    },
    itemCat: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    itemDate: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    typeBtnActiveDeb: {
        backgroundColor: '#fee2e2',
        borderColor: '#ef4444',
    },
    typeBtnActiveCred: {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
    },
    typeText: {
        fontWeight: '600',
        color: '#6b7280',
    },
    typeTextActive: {
        color: '#111827',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#374151',
    },
    catScroll: {
        marginBottom: 20,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    catChipActive: {
        backgroundColor: '#2563eb',
    },
    catText: {
        color: '#374151',
        fontWeight: '500',
    },
    catTextActive: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        marginRight: 8,
    },
    saveBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        marginLeft: 8,
    },
    cancelText: {
        fontWeight: '600',
        color: '#374151',
    },
    saveText: {
        fontWeight: 'bold',
        color: 'white',
    },
});
