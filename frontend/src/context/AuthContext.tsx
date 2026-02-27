import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { type ApiUser } from '../services/authService';

// The User interface can be the same as ApiUser for consistency
type User = ApiUser;

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string, keepLoggedIn: boolean) => Promise<void>;
    register: (username: string, email: string, password: string, avatar?: File | null) => Promise<void>;
    logout: () => void;
    updateProfile: (name: string, avatar?: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

            if (storedToken && storedUser) {
                // TODO: Add token validation logic here. If the token is expired,
                // you might want to use the refresh token to get a new one.
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (username: string, password: string, keepLoggedIn: boolean) => {
        setIsLoading(true);
        try {
            const { user: apiUser, token, refreshToken } = await authService.login(username, password);
            
            const storage = keepLoggedIn ? localStorage : sessionStorage;
            storage.setItem('authToken', token);
            storage.setItem('refreshToken', refreshToken);
            storage.setItem('user', JSON.stringify(apiUser));
            
            setUser(apiUser);
        } catch (error) {
            console.error("Login failed:", error);
            // Re-throw the error so the UI component can handle it
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string, avatar?: File | null) => {
        setIsLoading(true);
        try {
            // The service returns the new user, but typically we don't auto-login.
            // The user will be redirected to the login page after successful registration.
            await authService.register(username, email, password, avatar);
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        // Optional: Redirect to login or home page after logout
        // window.location.href = '/login';
    };

    const updateProfile = async (name: string, avatar?: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const updated = await authService.updateProfile(user.id, {
                name,
                avatar: avatar || user.avatar,
            });
            const updatedUser = { ...user, ...updated, email: user.email };
            const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile, isLoading }}>
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
