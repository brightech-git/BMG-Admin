import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../../service/AuthService";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user")) || null
    );

    // Sync with localStorage on refresh
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser && !user) {
            setUser(JSON.parse(storedUser));
        }
    }, [user]);
    

    const login = async (loginData) => {
    
        const response = await loginUser(loginData);

        // Store user info and token
        localStorage.setItem("user", JSON.stringify(response));
        localStorage.setItem("user_token", response.token);
        localStorage.setItem("userMobileNumber", response.contact);
        setUser(response);

        return response;
    };

    const signup = async (userData) => {
        const response = await registerUser(userData);

        // If user already exists, don't proceed
        if (
            typeof response.message === "string" &&
            response.message.toLowerCase().includes("already exists")
        ) {
            return response; // Send back to caller to show warning
        }

        // Only save if it's a successful signup
        localStorage.setItem("user", JSON.stringify(response));
        
        localStorage.setItem("user_token", response.token);
        localStorage.setItem("userMobileNumber", response.contact);
        setUser(response);

        return response;
    };
    

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("user_token");
        localStorage.removeItem("userMobileNumber");
    };

    return (
        <UserAuthContext.Provider value={{ user, login, signup, logout, currentUser: user,  }}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useAuth = () => useContext(UserAuthContext);
