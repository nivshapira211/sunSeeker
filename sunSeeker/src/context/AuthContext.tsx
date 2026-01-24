import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage or validate token here
        const storedUser = localStorage.getItem('sunseeker_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, _password: string) => {
        // Mock login
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        const mockUser: User = {
            id: '1',
            name: email.split('@')[0],
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=FF7E5F&color=fff`
        };

        setUser(mockUser);
        localStorage.setItem('sunseeker_user', JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sunseeker_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
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
