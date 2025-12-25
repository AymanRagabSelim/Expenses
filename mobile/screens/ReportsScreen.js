import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
    const { expenses, categories } = useData();
    const [filterMode, setFilterMode] = useState('month'); // 'month' or 'custom'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Custom range states
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const safeExpenses = expenses || [];

    // Filter expenses logic
    const filteredExpenses = safeExpenses.filter(e => {
        const d = new Date(e.date);
        if (filterMode === 'month') {
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        } else {
            // Custom range: normalize dates to midnight for comparison
            const checkDate = new Date(e.date).setHours(0, 0, 0, 0);
            const start = new Date(startDate).setHours(0, 0, 0, 0);
            const end = new Date(endDate).setHours(23, 59, 59, 999);
            return checkDate >= start && checkDate <= end;
        }
    });

    // Category data for Pie Chart
    const categoryData = (categories || []).map((cat, index) => {
        const total = filteredExpenses
            .filter(e => e.category === cat && (e.type || 'debit') === 'debit')
            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        return {
            name: cat,
            population: total,
            color: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e40af'][index % 6],
            legendFontColor: '#374151',
            legendFontSize: 12,
        };
    }).filter(c => c.population > 0);

    // Trend Labels based on filter mode
    const getTrendData = () => {
        if (filterMode === 'month') {
            return {
                labels: months,
                datasets: [{
                    data: months.map((m, i) => {
                        return safeExpenses
                            .filter(e => new Date(e.date).getMonth() === i && new Date(e.date).getFullYear() === selectedYear && (e.type || 'debit') === 'debit')
                            .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
                    })
                }]
            };
        }
        // For custom range, just show the filtered data total vs others? 
        // Or just keep monthly trend for the current year
        return {
            labels: months,
            datasets: [{
                data: months.map((m, i) => {
                    return safeExpenses
                        .filter(e => new Date(e.date).getMonth() === i && new Date(e.date).getFullYear() === new Date().getFullYear() && (e.type || 'debit') === 'debit')
                        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
                })
            }]
        };
    };

    const totalSpending = filteredExpenses
        .filter(e => (e.type || 'debit') === 'debit')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const totalIncome = filteredExpenses
        .filter(e => e.type === 'credit')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const formatDate = (date) => date.toISOString().split('T')[0];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <View style={styles.modeToggle}>
                        <TouchableOpacity
                            onPress={() => setFilterMode('month')}
                            style={[styles.modeBtn, filterMode === 'month' && styles.modeBtnActive]}
                        >
                            <Text style={[styles.modeText, filterMode === 'month' && styles.modeTextActive]}>Month</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilterMode('custom')}
                            style={[styles.modeBtn, filterMode === 'custom' && styles.modeBtnActive]}
                        >
                            <Text style={[styles.modeText, filterMode === 'custom' && styles.modeTextActive]}>Custom</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {filterMode === 'month' ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        {months.map((m, i) => (
                            <TouchableOpacity
                                key={m}
                                onPress={() => setSelectedMonth(i)}
                                style={[styles.pill, selectedMonth === i && styles.pillActive]}
                            >
                                <Text style={[styles.pillText, selectedMonth === i && styles.pillTextActive]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.customRangeRow}>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
                            <Text style={styles.dateLabel}>From</Text>
                            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        <View style={styles.dateDivider} />
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
                            <Text style={styles.dateLabel}>To</Text>
                            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
                />
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.row}>
                    <View style={[styles.miniCard, { backgroundColor: '#2563eb' }]}>
                        <Text style={styles.miniLabel}>Spending</Text>
                        <Text style={styles.miniValue}>${totalSpending.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.miniCard, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.miniLabel}>Income</Text>
                        <Text style={styles.miniValue}>${totalIncome.toFixed(2)}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>
                    {filterMode === 'month' ? `Category Breakdown (${months[selectedMonth]})` : 'Category Breakdown (Custom)'}
                </Text>
                <View style={styles.chartContainer}>
                    {categoryData.length > 0 ? (
                        <PieChart
                            data={categoryData}
                            width={width - 40}
                            height={200}
                            chartConfig={chartConfig}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            absolute
                        />
                    ) : (
                        <View style={styles.emptyChart}>
                            <Text style={styles.emptyText}>No data for this range</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Yearly Trend ({new Date().getFullYear()})</Text>
                <View style={styles.chartContainer}>
                    <BarChart
                        data={getTrendData()}
                        width={width}
                        height={220}
                        yAxisLabel="$"
                        chartConfig={chartConfig}
                        verticalLabelRotation={30}
                        fromZero={true}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        padding: 2,
    },
    modeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    modeBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    modeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    modeTextActive: {
        color: '#2563eb',
    },
    filterScroll: {
        paddingHorizontal: 15,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    pillActive: {
        backgroundColor: '#2563eb',
    },
    pillText: {
        fontWeight: '600',
        color: '#6b7280',
    },
    pillTextActive: {
        color: 'white',
    },
    customRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    dateBtn: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dateLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    dateDivider: {
        width: 15,
        height: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 10,
    },
    scrollContent: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    miniCard: {
        flex: 0.48,
        padding: 20,
        borderRadius: 16,
    },
    miniLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    miniValue: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    chartContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    emptyChart: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
    }
});
