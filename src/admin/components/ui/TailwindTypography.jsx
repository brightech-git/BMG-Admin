// components/TailwindTypography.jsx
import React from 'react';

export const Typography = ({
    variant = 'body1',
    children,
    className = '',
    ...props
}) => {
    const variantClasses = {
        h6: 'text-[var(--font-size-lg)] font-bold text-[var(--primary-text-color)] font-[var(--font-primary)]',
        body1: 'text-[var(--font-size-md)] text-[var(--primary-text-color)] font-[var(--font-secondary)]',
        body2: 'text-[var(--font-size-sm)] text-[var(--secondary-text-color)] font-[var(--font-secondary)]',
        caption: 'text-[var(--font-size-xs)] text-[var(--secondary-text-color)] font-[var(--font-secondary)]'
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};