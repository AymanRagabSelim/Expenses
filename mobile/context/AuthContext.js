import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safe check for current session
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (e) {
                console.log('Auth Init Error', e);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
    const signUp = (email, password, options) => supabase.auth.signUp({
        email,
        password,
        options: {
            data: options,
            emailRedirectTo: 'expenses://'
        }
    });
    const signOut = () => supabase.auth.signOut();
    const resetPassword = (email) => supabase.auth.resetPasswordForEmail(email);

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
