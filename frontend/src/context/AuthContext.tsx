import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as authService from '../services/authService';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'sunseeker_user';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, avatar?: File | null) => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => void;
    updateProfile: (name: string, avatar?: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function storeSession(token: string, refreshToken: string, user: User): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                clearSession();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await authService.login(emailOrUsername, password);
            const userData: User = { id: res.user.id, name: res.user.name, email: res.user.email, avatar: res.user.avatar };
            setUser(userData);
            storeSession(res.token, res.refreshToken, userData);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string, avatar?: File | null) => {
        setIsLoading(true);
        try {
            const res = await authService.register(username, email, password, avatar);
            const userData: User = { id: res.user.id, name: res.user.name, email: res.user.email, avatar: res.user.avatar };
            setUser(userData);
            storeSession(res.token, res.refreshToken, userData);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useCallback(() => {
        const url = import.meta.env.VITE_GOOGLE_OAUTH_URL;
        if (url) {
            window.location.href = url;
        } else {
            console.warn('VITE_GOOGLE_OAUTH_URL is not set');
        }
    }, []);

    const logout = () => {
        setUser(null);
        clearSession();
    };

    const updateProfile = async (name: string, avatar?: string) => {
        if (!user) return;

        const updatedUser = { ...user, name, avatar: avatar || user.avatar };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

        await authService.updateProfile(user.id, { name, avatar });
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, loginWithGoogle, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
