import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReportsScreen from './screens/ReportsScreen';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' ? <DashboardScreen /> : <ReportsScreen />}
      </View>

      {/* Custom Bottom Tab Bar - Avoiding React Navigation string/bool bug */}
      <SafeAreaView edges={['bottom']} style={styles.tabBarContainer}>
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

  // Strict boolean casting for RN 0.81/Fabric stability
  const isSyncing = Boolean(loading === true);
  const isLoggedIn = Boolean(user !== null);

  if (isSyncing === true) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Syncing Account...</Text>
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
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
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
    justifyContent: 'center',
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
