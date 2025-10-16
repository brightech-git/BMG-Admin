"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X, Clock } from "lucide-react";

const Snackbar = ({
    open,
    message,
    type = "info",
    duration = 5000,
    onClose,
    title,
    action,
    persistent = false
}) => {
    useEffect(() => {
        if (open && !persistent) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [open, duration, onClose, persistent]);

    const iconMap = {
        success: <CheckCircle className="w-5 h-5 text-green-600" />,
        error: <AlertCircle className="w-5 h-5 text-red-600" />,
        info: <Info className="w-5 h-5 text-blue-600" />,
    };

    const bgMap = {
        success: "bg-gradient-to-r from-green-50 to-green-25 border-l-4 border-l-green-500 shadow-lg",
        error: "bg-gradient-to-r from-red-50 to-red-25 border-l-4 border-l-red-500 shadow-lg",
        info: "bg-gradient-to-r from-blue-50 to-blue-25 border-l-4 border-l-blue-500 shadow-lg",
    };

    const progressBarColor = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="fixed top-6 right-6 max-w-md w-full z-[99999] font-[Domine]"
                >
                    <div className={`relative rounded-xl ${bgMap[type]} border border-gray-200/50 backdrop-blur-sm overflow-hidden p-2`}>
                        {/* Header */}
                        <div className="flex items-start justify-between ">
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 mt-0.5">
                                    {iconMap[type]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {title && (
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            {title}
                                        </h4>
                                    )}
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-black/5 transition-colors duration-200 group"
                            >
                                <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                            </button>
                        </div>

                        {/* Action Area */}
                        {(action || persistent) && (
                            <div className="px-4 pb-4 flex items-center justify-between">
                                {action && (
                                    <button
                                        onClick={action.onClick}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                    >
                                        {action.label}
                                    </button>
                                )}

                                {persistent && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-auto">
                                        <Clock className="w-3 h-3" />
                                        <span>Click to dismiss</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Progress Bar */}
                        {!persistent && (
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{
                                    duration: duration / 1000,
                                    ease: "linear"
                                }}
                                className={`h-1 ${progressBarColor[type]} opacity-80`}
                            />
                        )}
                    </div>

                    {/* Backdrop Glow Effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/30 blur-xl -z-10 rounded-xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Snackbar;