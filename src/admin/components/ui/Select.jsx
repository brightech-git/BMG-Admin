

import React from 'react';

// ── Default badge/check icon (used when icon prop is `true`) ─────────────────
const BadgeCheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0
               3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946
               3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138
               3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806
               3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438
               3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);


const SelectField = ({
    label,
    field,
    value,
    onChange,
    options = [],
    defaultValue,
    required = false,
    icon,
    error,
    minWidth,
    maxWidth,
    isDark = false,
    disabled = false,
    placeholder,
    className = '',
}) => {
    // Resolve which icon node to render (if any)
    const iconNode =
        icon === true ? <BadgeCheckIcon /> :
            icon ? icon :
                null;

    const hasIcon = Boolean(iconNode);

    const handleChange = (e) => {
        if (onChange) onChange(field, e.target.value);
    };

    return (
        <div
            className={`flex flex-col gap-1 ${className}`}
            style={{
                ...(minWidth ? { minWidth } : {}),
                ...(maxWidth ? { maxWidth } : {}),
            }}
        >
            {/* Label */}
            {label && (
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                    {required && <span className="text-orange-500 ml-0.5">*</span>}
                </label>
            )}

            {/* Select wrapper */}
            <div className="relative">
                {/* Left icon */}
                {hasIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {iconNode}
                    </span>
                )}

                <select
                    value={value ?? defaultValue ?? ''}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`
                        w-full py-2 pr-8 text-sm rounded-lg border outline-none
                        appearance-none cursor-pointer transition-all
                        ${hasIcon ? 'pl-9' : 'pl-3'}
                        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                        ${!value ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${error
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        }
                    `}
                >
                    {/* Optional placeholder option */}
                    {placeholder && (
                        <option value="" disabled hidden>
                            {placeholder}
                        </option>
                    )}

                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Right chevron */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDownIcon />
                </span>
            </div>

            {/* Error message */}
            {error && (
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
            )}
        </div>
    );
};

export default SelectField;