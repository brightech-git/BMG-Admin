
import { useState, useCallback } from "react";

export const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "success",
    });

    const showSnackbar = useCallback((message, type = "success", duration = 3000) => {
        setSnackbar({ open: true, message, type });
        setTimeout(() => setSnackbar({ open: false, message: "", type: "success" }), duration);
    }, []);

    const closeSnackbar = useCallback(() => {
        setSnackbar({ open: false, message: "", type: "success" });
    }, []);

    return {
        snackbar,
        showSnackbar,
        closeSnackbar,
    };
};
