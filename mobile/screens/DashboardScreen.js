import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const AddExpenseModal = ({ isOpen, onClose, categories, onSave }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState((categories || [])[0] || 'Other');
    const [note, setNote] = useState('');
    const [type, setType] = useState('debit');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        onSave({
            amount: numAmount,
            category: category || 'Other',
            note: note || '',
            type: type || 'debit',
            date: date.toISOString().split('T')[0],
            currency: 'USD'
        });
        setAmount('');
        setNote('');
        setDate(new Date());
        Alert.alert('Success', 'Transaction added successfully', [
            { text: 'OK', onPress: onClose }
        ]);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    return (
        <Modal
            visible={Boolean(isOpen === true)}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Add Transaction</Text>
                    </View>

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

                    <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.label}>Date: {date.toISOString().split('T')[0]}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default function DashboardScreen() {
    const data = useData() || {};
    const { expenses = [], categories = [], addExpense = () => { } } = data;
    const { signOut } = useAuth() || {};

    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDateRange, setFilterDateRange] = useState('Month'); // Today, Week, Month, All
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
            const now = new Date();
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
            // Reset hours for accurate comparison if d includes time
            const dTime = d.getTime();
            const startTime = start.setHours(0, 0, 0, 0);
            const endTime = end.setHours(0, 0, 0, 0);

            return dTime >= startTime && dTime < endTime;
        }
        return true;
    };

    const filteredExpenses = (expenses || []).filter(e => {
        const matchType = filterType === 'all' || (e.type || 'debit') === filterType;
        const matchCat = filterCategory === 'All' || e.category === filterCategory;
        const matchDate = filterByDate(e.date);
        return matchType && matchCat && matchDate;
    });

    const total = filteredExpenses.reduce((sum, e) => {
        const amount = parseFloat(e.amount) || 0;
        const type = e.type || 'debit';
        if (filterType === 'all') {
            return type === 'credit' ? sum + amount : sum - amount;
        }
        return sum + amount;
    }, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ExpenseTracker</Text>
                <TouchableOpacity onPress={signOut}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topFilterScroll}>
                {['All', 'Today', 'Week', 'Month'].map(d => (
                    <TouchableOpacity
                        key={d}
                        onPress={() => setFilterDateRange(d)}
                        style={[styles.smallChip, filterDateRange === d && styles.smallChipActive]}
                    >
                        <Text style={[styles.smallChipText, filterDateRange === d && styles.smallChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

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
                                {t === 'debit' ? 'Expense' : t === 'credit' ? 'Income' : 'All'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.catFilterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['All', ...categories].map(c => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setFilterCategory(c)}
                            style={[styles.catChip, filterCategory === c && styles.catChipActive, { height: 36 }]}
                        >
                            <Text style={[styles.catText, filterCategory === c && styles.catTextActive]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
                isOpen={Boolean(isAddModalOpen === true)}
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
        backgroundColor: '#f9fafb',
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
    topFilterScroll: {
        paddingHorizontal: 20,
        marginBottom: 10,
        maxHeight: 40,
    },
    smallChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    smallChipActive: {
        backgroundColor: '#2563eb',
    },
    smallChipText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
    },
    smallChipTextActive: {
        color: 'white',
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
    catFilterContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
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
        maxHeight: '85%',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    input: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
        color: '#111827',
    },
    datePickerBtn: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 12,
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
        marginBottom: 12,
        color: '#374151',
    },
    categoryContainer: {
        height: 50,
        marginBottom: 24,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 10,
        justifyContent: 'center',
    },
    catChipActive: {
        backgroundColor: '#2563eb',
    },
    catText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    catTextActive: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 10,
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
