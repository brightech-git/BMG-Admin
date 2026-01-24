"use client";

import { FaCheckCircle } from "react-icons/fa";
import './TimeLine.css'

export default function Timeline({
    steps = [],
    loading = false,
    error = null,
    onRetry,
    animate = true,
}) {
    if (loading) return <TimelineSkeleton />;

    if (error) {
        return (
            <div className="text-center py-6">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-xs text-blue-600 underline"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (!steps.length) {
        return (
            <p className="text-xs text-gray-500 text-center py-6">
                No tracking history available
            </p>
        );
    }

    return (
        <ul className="relative pl-8 space-y-6">
            {steps.map((step, index) => {
                const Icon = step.icon || FaCheckCircle;
                const isLast = index === steps.length - 1;

                return (
                    <li
                        key={step.key || index}
                        className={`relative flex gap-4 ${animate ? "animate__animated animate__fadeInLeft" : ""
                            }`}
                        style={{ animationDelay: `${index * 0.15}s` }}
                    >
                        {/* LEFT COLUMN (ICON + LINE) */}
                        <div className="relative flex flex-col items-center">
                            {/* Icon */}
                            <span
                                className={`z-10 flex items-center justify-center
                                w-5 h-5 rounded-full bg-white shadow
                                ${step.completed ? "text-green-600" : "text-gray-400"}`}
                            >
                                <Icon className="w-4 h-4" />
                            </span>

                            {/* Vertical Line */}
                            {!isLast && (
                                <span
                                    className={`
                                        mt-1 w-[3px] flex-1 rounded-full
                                        ${step.completed ? "bg-green-500" : "bg-gray-300"}
                                        ${step.completed && animate
                                            ? "animate-track-fill"
                                            : ""}
                                    `}
                                />
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="pb-1">
                            <p className="text-xs font-semibold text-gray-800">
                                {step.title}
                            </p>

                            {step.date && (
                                <p className="text-xs text-gray-500">
                                    {step.date}
                                </p>
                            )}

                            {step.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {step.description}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
function TimelineSkeleton({ count = 4 }) {
    return (
        <ul className="relative pl-8 space-y-6">
            {Array.from({ length: count }).map((_, i) => (
                <li key={i} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-gray-300 animate-pulse" />
                        {i !== count - 1 && (
                            <span className="mt-1 w-[3px] flex-1 bg-gray-200 rounded animate-pulse" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-gray-300 rounded animate-pulse" />
                        <div className="h-2 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-2 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                </li>
            ))}
        </ul>
    );
}
