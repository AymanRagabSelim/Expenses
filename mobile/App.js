import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';

function AppContent() {
  const auth = useAuth();

  // Use explicit boolean checks for the new React Native 0.81 renderer
  const isCurrentlyLoading = auth && auth.loading === true;
  const currentUser = auth && auth.user ? auth.user : null;

  if (isCurrentlyLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.bootText}>Loading Account...</Text>
      </View>
    );
  }

  return (
    <DataProvider>
      <SafeAreaView style={styles.container}>
        {currentUser ? <DashboardScreen /> : <LoginScreen />}
      </SafeAreaView>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  bootText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
