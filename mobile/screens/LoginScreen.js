import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const auth = useAuth() || {};
    const { signIn, signUp, resetPassword } = auth;

    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email');
            return;
        }

        if (!isForgot && (!password || password.length < 6)) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (typeof signIn !== 'function') {
            Alert.alert('System Error', 'Authentication service is warming up. Please wait 2 seconds.');
            return;
        }

        setLoading(true);
        try {
            if (isForgot) {
                const { error } = await resetPassword(email.trim());
                if (error) throw error;
                Alert.alert('Success', 'Password reset email sent!');
                setIsForgot(false);
                setIsLogin(true);
            } else if (isLogin) {
                const { error } = await signIn(email.trim(), password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email.trim(), password, { display_name: displayName.trim() });
                if (error) throw error;
                Alert.alert('Success', 'Check your email for the confirmation link.');
                setIsLogin(true);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View style={styles.content}>
                        <Text style={styles.title}>ExpenseTracker</Text>
                        <Text style={styles.subtitle}>
                            {isForgot ? 'Reset your password' : isLogin ? 'Welcome back!' : 'Create an account'}
                        </Text>

                        <View style={styles.form}>
                            {!isLogin && !isForgot && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Display Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="e.g. John Doe"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="email@example.com"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {!isForgot && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={true}
                                        placeholder="********"
                                        placeholderTextColor="#999"
                                    />
                                    {isLogin && (
                                        <TouchableOpacity onPress={() => setIsForgot(true)} style={styles.forgotLink}>
                                            <Text style={styles.forgotText}>Forgot Password?</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.button, loading === true && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading === true}
                            >
                                {loading === true ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                {isForgot ? (
                                    <TouchableOpacity onPress={() => { setIsForgot(false); setIsLogin(true); }}>
                                        <Text style={styles.footerLink}>Back to Sign In</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.footerRow}>
                                        <Text style={styles.footerText}>
                                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                                        </Text>
                                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                            <Text style={styles.footerLink}>
                                                {isLogin ? 'Sign Up' : 'Sign In'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2563eb',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#fff',
    },
    forgotLink: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    forgotText: {
        color: '#2563eb',
        fontSize: 12,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    footerLink: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 14,
    },
});
