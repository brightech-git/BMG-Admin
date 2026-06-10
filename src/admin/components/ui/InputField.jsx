

import React from 'react';

// ── Default icon (used when icon prop is `true`) ─────────────────────────────
const DefaultIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    </svg>
);


const InputField = ({
    label,
    field,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    icon,
    error,
    minWidth,
    maxWidth,
    isDark = false,
    disabled = false,
    readOnly = false,
    capitalized = false,
    maxLength,
    className = '',
}) => {
    // Resolve icon node
    const iconNode =
        icon === true ? <DefaultIcon /> :
            icon ? icon :
                null;

    const hasIcon = Boolean(iconNode);

    const handleChange = (e) => {
        if (!onChange) return;

        let val = e.target.value;

        // Strip non-digits for number type
        if (type === 'number') {
            val = val.replace(/\D/g, '');
        }

        // Uppercase if capitalized
        if (capitalized) {
            val = val.toUpperCase();
        }

        onChange(field, val);
    };

    // For number type, use text internally so we fully control the value
    const inputType = type === 'number' ? 'text' : type;

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

            {/* Input wrapper */}
            <div className="relative">
                {/* Left icon */}
                {hasIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {iconNode}
                    </span>
                )}

                <input
                    type={inputType}
                    value={value ?? ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    inputMode={type === 'number' ? 'numeric' : undefined}
                    className={`
                        w-full py-2 pr-3 text-sm rounded-lg border outline-none
                        transition-all
                        ${hasIcon ? 'pl-9' : 'pl-3'}
                        ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}
                        ${disabled || readOnly ? 'opacity-50 cursor-not-allowed' : ''}
                        ${error
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        }
                    `}
                />
            </div>

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
            )}
        </div>
    );
};

export default InputField;