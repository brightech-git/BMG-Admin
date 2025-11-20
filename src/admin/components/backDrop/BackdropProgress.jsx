
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const BackdropProgress = ({ open, title, body, progress = 0 }) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <motion.div
                        className="bg-white/95 rounded-3xl p-5 text-center shadow-2xl max-w-2xl w-full mx-auto border border-white/20"
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.25, 0.1, 0.25, 1],
                            type: "spring",
                            stiffness: 120
                        }}
                    >
                        {/* Progress Indicator */}
                        <div className="flex justify-center mb-5">
                            {progress < 100 ? (
                                <div className="relative">
                                    <div className="w-20 h-20 border-[5px] border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-blue-600">
                                            {progress}%
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                >
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="space-y-2 mb-4">
                            <motion.h3
                                className="text-2xl font-bold text-gray-900 font-[Domine] leading-tight"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {title}
                            </motion.h3>
                            <motion.p
                                className="text-lg text-gray-600 leading-relaxed font-[Domine]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {body}
                            </motion.p>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                            <div className="w-full bg-gray-100 rounded-2xl h-4 overflow-hidden shadow-inner">
                                <motion.div
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-4 rounded-2xl shadow-lg"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut",
                                        delay: 0.3
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Progress</span>
                                <span className="text-sm font-bold text-blue-600">{progress}% Complete</span>
                            </div>
                        </div>

                        {/* Additional Status Info */}
                        {progress > 0 && progress < 100 && (
                            <motion.p
                                className="text-sm text-gray-500 mt-6 italic"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Please wait while we process your request...
                            </motion.p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BackdropProgress;