// components/TailwindForm.jsx
import React from 'react';

export const TextField = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    themeMode = 'light',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className={`
          block text-[var(--font-size-xs)] font-small 
          text-[var(--secondary-text-color)] 
          font-[var(--font-secondary)]
        `}>
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`
          w-full px-4 py-2 border border-[var(--border-color)]
          rounded-[var(--border-radius-md)] 
          bg-[var(--card-background-color)]
          text-[var(--primary-text-color)]
          text-[var(--font-size-md)]
          font-[var(--font-secondary)]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]
          focus:border-transparent
          placeholder-[var(--secondary-text-color)]
          ${type === 'date' && themeMode === 'dark' ? 'filter invert hue-rotate-180' : ''}
        `}
                {...props}
            />
        </div>
    );
};

export const Button = ({
    children,
    variant = 'outlined',
    size = 'medium',
    onClick,
    className = '',
    themeMode = 'light',
    ...props
}) => {
    const baseClasses = `
    rounded-[var(--border-radius-sm)] 
    font-[var(--font-secondary)] 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]
  `;

    const variantClasses = {
        outlined: `
      border border-[var(--border-color)]
      text-[var(--primary-text-color)]
      hover:border-[var(--primary-color)]
      bg-transparent
    `,
        contained: `
      bg-[var(--primary-color)] 
      text-white 
      hover:bg-[var(--active-border)]
      border border-transparent
    `
    };

    const sizeClasses = {
        small: 'px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)]',
        medium: 'px-4 py-2 text-[var(--font-size-sm)]',
        large: 'px-6 py-3 text-[var(--font-size-md)]'
    };

    return (
        <button
            className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};