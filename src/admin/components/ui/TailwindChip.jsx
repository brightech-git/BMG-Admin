// components/TailwindChip.jsx
import React from 'react';

export const Chip = ({
    label,
    size = 'small',
    themeMode = 'light',
    className = '',
    ...props
}) => {
    const sizeClasses = {
        small: 'px-1 py-0.5 text-[var(--font-size-xxs) ]',
        medium: 'px-2 py-1 text-[var(--font-size-xs)]',
        large: 'px-3 py-1.5 text-[var(--font-size-sm)]'
    };

    return (
        <span
            className={`
        ${sizeClasses[size]}
        rounded-[var(--border-radius-sm)]
        font-[var(--font-secondary)] font-semibold
        bg-[var(--active-bg)]
        text-[var(--primary-color)]
        ${className}
      `}
            {...props}
        >
            {label}
        </span>
    );
};