import React, { createContext, useState, useEffect } from 'react';

export const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
    // Detect screen size to determine initial sidebar state
    const [themeColor, setThemeColor] = useState('#f4f4f4'); // Default header background color
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Always open on larger screens
    const [themeMode, setThemeMode] = useState('light'); // Light/dark mode


    const contextValues = {
        themeColor,
        setThemeColor,
        isSidebarOpen,
        setIsSidebarOpen,
        themeMode,
        setThemeMode,
    };

    return (
        <MyContext.Provider value={contextValues}>
            {children}
        </MyContext.Provider>
    );
};