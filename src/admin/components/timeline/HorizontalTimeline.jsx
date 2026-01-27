"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { CheckCircle } from "lucide-react";

const HorizontalTimeline = ({
    statuses,
    currentStatus,
    loading = false,
    error = null,
    emptyMessage = "No data available",
    onRetry,
    getIcon,
}) => {
    const timelineRefs = useRef([]);

    useEffect(() => {
        // Add shimmer animation to current step
        const currentStep = document.querySelector(".current-step-animate");
        if (currentStep) {
            currentStep.classList.add("animate-pulse-ring");
        }
    }, [currentStatus]);

    if (loading) {
        return (
            <div className="w-full px-4 py-6">
                <div className="flex items-center">
                    {Array.from({ length: 4 }).map((_, index) => {
                        const isLast = index === 3;

                        return (
                            <div
                                key={index}
                                className="relative flex flex-1 flex-col items-center animate-fadeIn"
                                style={{ animationDelay: `${index * 0.12}s` }}
                            >
                                {/* Connector with shimmer */}
                                {!isLast && (
                                    <div className="absolute top-4 left-1/2 w-full h-[4px] bg-gray-200 z-0 overflow-hidden">
                                        <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
                                    </div>
                                )}

                                {/* Icon Skeleton */}
                                <div className="relative z-10 w-8 h-8 rounded-full bg-gray-300 animate-pulse" />

                                {/* Label Skeleton */}
                                <div className="mt-2 h-3 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 animate-shake">
                <p className="text-sm text-red-600">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-xs text-blue-600 underline hover:text-blue-700 transition-colors duration-200"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (!statuses?.length) {
        return (
            <p className="text-xs text-gray-500 text-center py-6 animate-fadeIn">
                {emptyMessage}
            </p>
        );
    }

    const sortedStatuses = [...statuses].sort(
        (a, b) => a.sequence - b.sequence
    );

    const currentIndex = sortedStatuses.findIndex(
        (s) => s.key === currentStatus?.toUpperCase()
    );

    return (
        <div className="w-full px-4 py-6">
            {/* ----------------- Desktop / md+ Horizontal Layout ----------------- */}
            <div className="hidden md:flex flex-row items-center">
                {sortedStatuses.map((status, index) => {
                    const Icon = getIcon?.status?.icon||CheckCircle;
                    const isPast = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLast = index === sortedStatuses.length - 1;
                    const willBeActive = index > currentIndex;

                    return (
                        <div
                            key={status.key}
                            ref={el => timelineRefs.current[index] = el}
                            className="relative flex flex-1 flex-col items-center opacity-1 translate-y-2 animate-slideUp"
                            style={{
                                animationDelay: `${index * 0.15}s`,
                                animationFillMode: 'forwards'
                            }}
                        >
                            {/* Connector line with animation */}
                            {!isLast && (
                                <div className="absolute top-4 left-1/2 w-full h-[4px] bg-gray-300 z-0 overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full transition-all duration-1000 origin-left",
                                            isPast
                                                ? "bg-gradient-to-r from-[var(--green-color)] to-green-400 scale-x-100 animate-lineFill"
                                                : willBeActive
                                                    ? "bg-gradient-to-r from-gray-300 to-gray-300 scale-x-100"
                                                    : "bg-gradient-to-r from-gray-300 to-gray-300 scale-x-0"
                                        )}
                                        style={{
                                            animationDelay: `${index * 0.2}s`
                                        }}
                                    />
                                    {/* Glowing effect for past connectors */}
                                    {isPast && !isCurrent && (
                                        <div className="absolute inset-0 bg-green-400 blur-sm opacity-30 animate-pulse" />
                                    )}
                                </div>
                            )}

                            {/* Icon with animations */}
                            <div
                                className={clsx(
                                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 transform",
                                    isPast
                                        ? "bg-[var(--green-color)] border-[var(--green-color)] text-white shadow-lg scale-105"
                                        : isCurrent
                                            ? "bg-white border-[var(--green-color)] text-[var(--green-color)] ring-2 ring-[var(--green-color)] ring-opacity-50 current-step-animate"
                                            : "bg-white border-gray-300 text-gray-400 hover:scale-105 hover:border-gray-400 transition-transform duration-200"
                                )}
                                style={{
                                    animationDelay: `${index * 0.25}s`
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {/* Success checkmark animation for past steps */}
                                {isPast && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-full rounded-full bg-green-500 animate-ping opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Label with hover effect */}
                            <span
                                className={clsx(
                                    "mt-2 text-xs font-semibold text-center transition-all duration-300 transform",
                                    isPast
                                        ? "text-[var(--green-color)] scale-105"
                                        : isCurrent
                                            ? "text-[var(--green-color)] font-bold scale-110"
                                            : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {status.label}
                                {/* Current status indicator */}
                                {isCurrent && (
                                    <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full text-xs text-[var(--green-color)] font-bold animate-bounce">
                                        ●
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* ----------------- Mobile / below md Vertical Layout ----------------- */}
            <div className="md:hidden">
                <div className="flex flex-col items-center">
                    {sortedStatuses.map((status, index) => {
                        const Icon = getIcon?.status?.icon || CheckCircle;
                        const isPast = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isLast = index === sortedStatuses.length - 1;

                        return (
                            <div
                                key={status.key}
                                ref={el => timelineRefs.current[index] = el}
                                className="relative flex items-center mb-[40px] w-full opacity-1 translate-x-4 animate-slideRight"
                                style={{
                                    animationDelay: `${index * 0.15}s`,
                                    animationFillMode: 'forwards'
                                }}
                            >
                                {/* Icon + vertical line wrapper */}
                                <div className="relative flex flex-col items-center">
                                    {/* Icon */}
                                    <div
                                        className={clsx(
                                            "z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 transform",
                                            isPast
                                                ? "bg-[var(--green-color)] border-[var(--green-color)] text-white shadow-lg scale-105"
                                                : isCurrent
                                                    ? "bg-white border-[var(--green-color)] text-[var(--green-color)] ring-2 ring-[var(--green-color)] ring-opacity-50 current-step-animate"
                                                    : "bg-white border-gray-300 text-gray-400"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {/* Vertical line with animation */}
                                    {!isLast && (
                                        <div className="absolute top-6 w-[3px] h-14 bg-gray-300 z-0 overflow-hidden">
                                            <div
                                                className={clsx(
                                                    "w-full h-full transition-all duration-1000 origin-top",
                                                    isPast
                                                        ? "bg-gradient-to-b from-[var(--green-color)] to-green-400 scale-y-100 animate-lineFillVertical"
                                                        : "scale-y-0"
                                                )}
                                                style={{
                                                    animationDelay: `${index * 0.2}s`
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Label with animation */}
                                <span
                                    className={clsx(
                                        "ml-4 text-sm font-medium transition-all duration-300",
                                        isPast || isCurrent
                                            ? "text-[var(--green-color)] font-bold transform translate-x-1"
                                            : "text-gray-400"
                                    )}
                                >
                                    {status.label}
                                    {isCurrent && (
                                        <span className="ml-2 text-xs text-[var(--green-color)] animate-pulse">
                                            ← Current
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add CSS animations to global styles */}
            <style jsx global>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideRight {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes lineFill {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
                
                @keyframes lineFillVertical {
                    from {
                        transform: scaleY(0);
                    }
                    to {
                        transform: scaleY(1);
                    }
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                
                @keyframes pulse-ring {
                    0% {
                        box-shadow: 0 0 0 0 rgba(var(--green-color-rgb), 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(var(--green-color-rgb), 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(var(--green-color-rgb), 0);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }
                
                .animate-slideUp {
                    animation: slideUp 0.5s ease-out;
                }
                
                .animate-slideRight {
                    animation: slideRight 0.5s ease-out;
                }
                
                .animate-lineFill {
                    animation: lineFill 0.8s ease-out;
                }
                
                .animate-lineFillVertical {
                    animation: lineFillVertical 0.8s ease-out;
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
                
                .animate-pulse-ring {
                    animation: pulse-ring 2s infinite;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default HorizontalTimeline;