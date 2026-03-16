import React,{useEffect} from "react";
import { motion,  } from "framer-motion";
import { Pencil, Trash2, Send, Plus, X, CheckCircle, AlertCircle } from "lucide-react";

// Toast notification component

export const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
                }`}
        >
            {type === 'success' ? (
                <CheckCircle size={20} className="text-green-500" />
            ) : (
                <AlertCircle size={20} className="text-red-500" />
            )}
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onClose}
                className={`ml-4 p-1 rounded-full hover:bg-opacity-20 ${type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'
                    }`}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};