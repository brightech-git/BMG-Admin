
import React, { createContext, useContext, useState, useCallback } from "react";

const NewOrderContext = createContext();

export const NewOrderProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        type: "info",
        action: null,
        duration: 5000,
    });

    const showNewOrder = useCallback(({ message, type = "info", action = null, duration = 5000 }) => {
        setNotification({
            open: true,
            message,
            type,
            action,
            duration,
        });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, open: false }));
    }, []);

    return (
        <NewOrderContext.Provider value={{ notification, showNewOrder, closeNotification }}>
            {children}
        </NewOrderContext.Provider>
    );
};

// Hook for easier usage
export const useNewOrderNotifier = () => useContext(NewOrderContext);
