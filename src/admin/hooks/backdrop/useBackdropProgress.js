import { useState, useCallback } from "react";

export const useBackdropProgress = () => {
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const showBackdrop = useCallback(({ title = "Processing", body = "" }) => {
        setTitle(title);
        setBody(body);
        setProgress(0);
        setOpen(true);
    }, []);

    const hideBackdrop = useCallback(() => {
        let current = progress;
        const interval = setInterval(() => {
            current += 2;
            if (current >= 100) {
                current = 100;
                clearInterval(interval);
                setTimeout(() => setOpen(false), 600); // smooth fade-out
            }
            setProgress(current);
        }, 50);
    }, [progress]);

    const updateProgress = useCallback((value) => {
        setProgress(value);
    }, []);

    return {
        open,
        progress,
        title,
        body,
        showBackdrop,
        hideBackdrop,
        updateProgress,
        setOpen,
        setProgress,
        setTitle,
        setBody,
    };
};
