// src/context/auth/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile } from '../../service/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {


    const [authToken, setAuthToken] = useState(sessionStorage.getItem('auth_token'));
    const [user, setUser] = useState(()=>{
        try {
            return JSON.parse(sessionStorage.getItem('user')) ?? [];
        } catch {
            return [];
        }
    });
    
    const [path, setPath] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('path')) ?? [];
        } catch {
            return [];
        }
    });

    const login = (userData ,path) => {

        sessionStorage.setItem('auth_token', userData.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem('path', JSON.stringify(path));

        setAuthToken(userData.token);
        setUser(userData);
        setPath(path);
    };

    const logout = () => {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('path');

        setAuthToken(null);
        setUser(null);
        setPath(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, user, path, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);