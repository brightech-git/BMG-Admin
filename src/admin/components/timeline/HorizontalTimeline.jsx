"use client";

import React from "react";
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
    if (loading) {
        return (
            <div className="w-full px-4 py-6">
                <div className="flex items-center">
                    {Array.from({ length: 4 }).map((_, index) => {
                        const isLast = index === 3;

                        return (
                            <div
                                key={index}
                                className="relative flex flex-1 flex-col items-center 
                         animate__animated animate__fadeIn"
                                style={{ animationDelay: `${index * 0.12}s` }}
                            >
                                {/* Connector */}
                                {!isLast && (
                                    <div className="absolute top-4 left-1/2 w-full h-[4px] bg-gray-200 z-0 overflow-hidden">
                                        <div className="h-full w-full bg-gradient-to-r 
from-gray-200 via-gray-300 to-gray-200 shimmer" />
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
            <div className="text-center py-6">
                <p className="text-sm text-red-600">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-xs text-blue-600 underline"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (!statuses?.length) {
        return (
            <p className="text-xs text-gray-500 text-center py-6">
                {emptyMessage}
            </p>
        );
    }

    const sortedStatuses = [...statuses].sort(
        (a, b) => a.sequence - b.sequence
    );

    const currentIndex = sortedStatuses.findIndex(
        (s) => s.key === currentStatus
    );

    return (
        <div className="w-full px-4 py-6">
            <div className="flex items-center">
                {sortedStatuses.map((status, index) => {
                    const Icon = getIcon?.(status.icon) || CheckCircle;

                    const isPast = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLast = index === sortedStatuses.length - 1;

                    return (
                        <div
                            key={status.key}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {/* Connector line */}
                            {!isLast && (
                                <div className="absolute top-4 left-1/2 w-full h-[4px] bg-gray-300 z-0 overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full transition-transform duration-500 origin-left",
                                            isPast ? "bg-green-500 scale-x-100" : "scale-x-0"
                                        )}
                                    />
                                </div>
                            )}

                            {/* Icon */}
                            <div
                                className={clsx(
                                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                    isPast
                                        ? "bg-green-500 border-green-500 text-white"
                                        : isCurrent
                                            ? "bg-white border-green-500 text-green-600 ring-4 ring-green-200"
                                            : "bg-white border-gray-300 text-gray-400"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* Label */}
                            <span
                                className={clsx(
                                    "mt-2 text-xs font-medium text-center",
                                    isPast || isCurrent ? "text-green-600" : "text-gray-400"
                                )}
                            >
                                {status.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default HorizontalTimeline;
