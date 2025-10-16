// components/TailwindCard.jsx
import React from 'react';

export const Card = ({
    children,
    className = '',
    themeMode = 'light',
    ...props
}) => {
    return (
        <div
            className={`
        rounded-[var(--border-radius-md)] 
        bg-[var(--card-background-color)]
        shadow-sm border border-[var(--border-color)]
        transition-all duration-300
        hover:shadow-md
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardContent = ({
    children,
    className = '',
    padding = 'default'
}) => {
    const paddingClass = padding === 'default'
        ? 'p-3 md:p-[var(--spacing-lg)]'
        : 'p-2 md:p-3';

    return (
        <div className={`${paddingClass} ${className}`}>
            {children}
        </div>
    );
};