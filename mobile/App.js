import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReportsScreen from './screens/ReportsScreen';

// Custom Tab Switcher to bypass React Navigation bug in RN 0.81 Fabric renderer
function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' ? <DashboardScreen /> : <ReportsScreen />}
      </View>

      {/* Custom Bottom Tab Bar */}
      <SafeAreaView style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('reports')}
            style={[styles.tabItem, activeTab === 'reports' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>Reports</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function AppContent() {
  const auth = useAuth() || {};
  const { user = null, loading = true } = auth;

  // Strict boolean casting for RN 0.81 stability
  const isSyncing = Boolean(loading === true);
  const isLoggedIn = Boolean(user !== null);

  if (isSyncing === true) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isLoggedIn === true ? <MainApp /> : <LoginScreen />}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  tabBarContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    marginTop: -2,
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2563eb',
  }
});
