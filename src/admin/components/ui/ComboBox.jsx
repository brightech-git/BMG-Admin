// components/ui/ComboBox.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import 'animate.css';

// -------------------------------------------------------------------------
// Icons (you can replace with your preferred icon library)
// -------------------------------------------------------------------------
const Icons = {
    ChevronDown: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    ChevronUp: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    ),
    Close: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Check: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    Search: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Loading: (props) => (
        <svg {...props} className="animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
};

// -------------------------------------------------------------------------
// Utility Functions
// -------------------------------------------------------------------------
const defaultFilterOptions = (options, searchText, getOptionLabel) => {
    if (!searchText) return options;
    const lowerSearch = searchText.toLowerCase();
    return options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(lowerSearch)
    );
};

const defaultGetOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    if (typeof option === 'object' && option !== null) {
        return option.label || option.name || option.title || JSON.stringify(option);
    }
    return String(option);
};

const defaultGetOptionValue = (option) => {
    if (typeof option === 'string') return option;
    if (typeof option === 'object' && option !== null) {
        return option.value || option.id || option.key || JSON.stringify(option);
    }
    return String(option);
};

const defaultIsOptionDisabled = () => false;

// -------------------------------------------------------------------------
// ComboBox Component
// -------------------------------------------------------------------------
const ComboBox = React.memo(({
    // Data props
    options = [],
    value,
    onChange,
    defaultValue,

    // Display props
    getOptionLabel = defaultGetOptionLabel,
    getOptionValue = defaultGetOptionValue,
    getOptionDisabled = defaultIsOptionDisabled,
    filterOptions = defaultFilterOptions,
    placeholder = 'Select or type...',
    noOptionsText = 'No options',
    loadingText = 'Loading...',
    clearText = 'Clear',
    openText = 'Open',

    // Behavior props
    multiple = false,
    searchable = true,
    clearable = true,
    disabled = false,
    loading = false,
    autoHighlight = true,
    autoSelect = false,
    disableClearable = false,
    disableCloseOnSelect = false,
    groupBy,
    virtual = false,

    // Sizes and variants
    size = 'md',
    variant = 'outlined',
    color = 'primary',

    // Event props
    onOpen,
    onClose,
    onInputChange,
    onFocus,
    onBlur,
    onKeyDown,

    // Form props
    name,
    required = false,
    error = false,
    helperText,
    label,
    id,

    // Styling props
    className = '',
    inputClassName = '',
    menuClassName = '',
    optionClassName = '',
    labelClassName = '',
    helperTextClassName = '',
    errorClassName = '',

    // Positioning
    placement = 'bottom-start',
    menuHeight = 'max-h-60',
    menuWidth = 'w-full',

    // Rendering
    renderOption,
    renderInput,
    renderTags,
    renderValue,

    // Accessibility
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,

    // Ref
    inputRef: externalInputRef,
    menuRef: externalMenuRef,
}) => {
    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [internalValue, setInternalValue] = useState(defaultValue || (multiple ? [] : null));

    // Refs
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const menuRef = useRef(null);
    const optionRefs = useRef([]);

    // Combined refs
    const combinedInputRef = externalInputRef || inputRef;
    const combinedMenuRef = externalMenuRef || menuRef;

    // ---------------------------------------------------------------------
    // Computed Values
    // ---------------------------------------------------------------------
    const currentValue = value !== undefined ? value : internalValue;
    const isControlled = value !== undefined;

    const selectedOptions = useMemo(() => {
        if (multiple) {
            return Array.isArray(currentValue) ? currentValue : [];
        }
        return currentValue ? [currentValue] : [];
    }, [currentValue, multiple]);

    const filteredOptions = useMemo(() => {
        return filterOptions(options, searchText, getOptionLabel);
    }, [options, searchText, filterOptions, getOptionLabel]);

    // Display value for the input
    const displayValue = useMemo(() => {
        if (multiple) {
            if (selectedOptions.length === 0) return '';
            // Show count for multiple select when not searching
            if (!isOpen) {
                return `${selectedOptions.length} item${selectedOptions.length > 1 ? 's' : ''} selected`;
            }
            return '';
        }

        // Single select
        if (!currentValue) return '';

        // If currentValue is an object, use getOptionLabel
        if (typeof currentValue === 'object') {
            return getOptionLabel(currentValue);
        }

        // If currentValue is a string, find matching option
        const matchingOption = options.find(opt =>
            getOptionValue(opt) === currentValue ||
            getOptionLabel(opt) === currentValue
        );

        return matchingOption ? getOptionLabel(matchingOption) : currentValue;
    }, [currentValue, selectedOptions, multiple, getOptionLabel, options, getOptionValue, isOpen]);

    // Get the actual value to show in the input (handles single vs multiple)
    const getInputValue = useMemo(() => {
        if (multiple) {
            // In multiple mode, show searchText when open, show nothing when closed
            return isOpen ? searchText : '';
        } else {
            // In single mode, show searchText when open, show displayValue when closed
            return isOpen ? searchText : displayValue;
        }
    }, [multiple, isOpen, searchText, displayValue]);

    // Get placeholder for input
    const getInputPlaceholder = useMemo(() => {
        if (multiple) {
            if (selectedOptions.length > 0 && !isOpen) return '';
            return placeholder;
        }
        return (!multiple && currentValue && !isOpen) ? '' : placeholder;
    }, [multiple, selectedOptions.length, isOpen, currentValue, placeholder]);

    // ---------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------
    const handleOpen = useCallback(() => {
        if (disabled || loading) return;
        setIsOpen(true);
        onOpen?.();
    }, [disabled, loading, onOpen]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setSearchText('');
        setHighlightedIndex(-1);
        onClose?.();
    }, [onClose]);

    const handleToggle = useCallback(() => {
        if (isOpen) {
            handleClose();
        } else {
            handleOpen();
        }
    }, [isOpen, handleOpen, handleClose]);

    const handleSelect = useCallback((option) => {
        const optionValue = getOptionValue(option);
        const isSelected = selectedOptions.some(
            selected => getOptionValue(selected) === optionValue
        );

        let newValue;

        if (multiple) {
            if (isSelected) {
                newValue = selectedOptions.filter(
                    selected => getOptionValue(selected) !== optionValue
                );
            } else {
                newValue = [...selectedOptions, option];
            }

            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue, option);

            // Don't close for multiple select by default
            if (disableCloseOnSelect) {
                // Keep open
            } else {
                // Keep open for multiple select to allow quick selection
                // Focus input and clear search
                setSearchText('');
                if (combinedInputRef.current) {
                    combinedInputRef.current.focus();
                }
            }
        } else {
            // Single select
            newValue = option;
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue, option);
            setSearchText('');
            handleClose();
        }
    }, [multiple, selectedOptions, getOptionValue, isControlled, onChange, handleClose, disableCloseOnSelect, combinedInputRef]);

    const handleClear = useCallback((e) => {
        e?.stopPropagation();
        const newValue = multiple ? [] : null;

        if (!isControlled) {
            setInternalValue(newValue);
        }

        onChange?.(newValue, null);
        setSearchText('');

        if (combinedInputRef.current) {
            combinedInputRef.current.focus();
        }
    }, [multiple, isControlled, onChange, combinedInputRef]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setSearchText(value);
        onInputChange?.(value);

        if (!isOpen) {
            handleOpen();
        }

        setHighlightedIndex(autoHighlight ? 0 : -1);
    }, [onInputChange, handleOpen, autoHighlight]);

    const handleKeyDown = useCallback((e) => {
        onKeyDown?.(e);

        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    handleOpen();
                } else {
                    setHighlightedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    );
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (isOpen) {
                    setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0) {
                    handleSelect(filteredOptions[highlightedIndex]);
                } else if (autoSelect && filteredOptions.length > 0 && !multiple) {
                    handleSelect(filteredOptions[0]);
                }
                break;

            case 'Escape':
                e.preventDefault();
                if (isOpen) {
                    handleClose();
                }
                break;

            case 'Tab':
                if (isOpen) {
                    handleClose();
                }
                break;

            case 'Delete':
            case 'Backspace':
                if (clearable && !searchText && !disableClearable) {
                    if (multiple) {
                        // Remove last selected item
                        const newValue = selectedOptions.slice(0, -1);
                        if (!isControlled) {
                            setInternalValue(newValue);
                        }
                        onChange?.(newValue, null);
                    } else if (currentValue) {
                        handleClear();
                    }
                }
                break;
        }
    }, [
        disabled, isOpen, filteredOptions, highlightedIndex, autoSelect,
        handleOpen, handleClose, handleSelect, handleClear, clearable,
        disableClearable, multiple, selectedOptions, currentValue, isControlled,
        onChange, onKeyDown, searchText
    ]);

    const handleFocus = useCallback((e) => {
        onFocus?.(e);
    }, [onFocus]);

    const handleBlur = useCallback((e) => {
        // Check if the related target is within the combobox
        if (!containerRef.current?.contains(e.relatedTarget)) {
            handleClose();
        }
        onBlur?.(e);
    }, [handleClose, onBlur]);

    const handleOptionClick = useCallback((option) => {
        handleSelect(option);
    }, [handleSelect]);

    const handleOptionMouseEnter = useCallback((index) => {
        setHighlightedIndex(index);
    }, []);

    // ---------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------
    // Scroll highlighted option into view
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
            optionRefs.current[highlightedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [isOpen, highlightedIndex]);

    // Reset option refs when filtered options change
    useEffect(() => {
        optionRefs.current = optionRefs.current.slice(0, filteredOptions.length);
    }, [filteredOptions]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClose]);

    // ---------------------------------------------------------------------
    // Styles
    // ---------------------------------------------------------------------
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const variantStyles = {
        outlined: `border-2 ${error ? 'border-red-500' : 'border-gray-200'} bg-white 
                   focus-within:border-${color}-500 focus-within:ring-2 focus-within:ring-${color}-200`,
        filled: `bg-gray-100 border-2 border-transparent ${error ? 'bg-red-50' : ''}
                 focus-within:bg-white focus-within:border-${color}-500`,
        underlined: `border-b-2 ${error ? 'border-red-500' : 'border-gray-200'} bg-transparent rounded-none
                     focus-within:border-${color}-500`,
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------
    const renderOptionContent = (option, index) => {
        if (renderOption) {
            return renderOption(option, {
                selected: selectedOptions.some(
                    selected => getOptionValue(selected) === getOptionValue(option)
                ),
                highlighted: highlightedIndex === index,
                disabled: getOptionDisabled(option),
            });
        }

        const isSelected = selectedOptions.some(
            selected => getOptionValue(selected) === getOptionValue(option)
        );

        return (
            <div className="flex items-center justify-between w-full">
                <span className="flex-1 truncate">{getOptionLabel(option)}</span>
                {multiple && isSelected && (
                    <Icons.Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                )}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className={`
                relative flex flex-col
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {/* Label */}
            {label && (
                <label
                    htmlFor={id}
                    className={`
                        block text-xs font-medium mb-1
                        ${error ? 'text-red-600' : 'text-gray-700'}
                        ${disabled ? 'text-gray-400' : ''}
                        ${labelClassName}
                    `}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div
                className={`
                    relative flex items-center rounded-lg
                    transition-all duration-200
                    ${variantStyles[variant]}
                    ${disabled ? 'bg-gray-100 pointer-events-none' : ''}
                    ${sizeStyles[size]}
                `}
            >
                {/* Selected Tags (for multiple) */}
                {multiple && selectedOptions.length > 0 && renderTags && isOpen && (
                    renderTags(selectedOptions, { handleRemove: handleSelect })
                )}

                {/* Input */}
                <div className="flex-1 flex items-center">
                    <input
                        ref={combinedInputRef}
                        id={id}
                        type="text"
                        name={name}
                        value={getInputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={getInputPlaceholder}
                        disabled={disabled}
                        className={`
                            w-full bg-transparent outline-none
                            ${disabled ? 'cursor-not-allowed' : ''}
                            ${inputClassName}
                        `}
                        aria-label={ariaLabel || label || 'combobox'}
                        aria-describedby={ariaDescribedBy}
                        aria-expanded={isOpen}
                        aria-autocomplete="list"
                        aria-controls={isOpen ? `${id}-listbox` : undefined}
                        aria-activedescendant={
                            isOpen && highlightedIndex >= 0
                                ? `${id}-option-${highlightedIndex}`
                                : undefined
                        }
                        readOnly={!searchable}
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center gap-1 ml-2">
                    {/* Clear button */}
                    {clearable && !disableClearable && (
                        ((multiple && selectedOptions.length > 0) || (!multiple && currentValue))
                    ) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={disabled}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                aria-label={clearText}
                            >
                                <Icons.Close className="w-4 h-4 text-gray-500" />
                            </button>
                        )}

                    {/* Loading spinner */}
                    {loading && (
                        <Icons.Loading className="w-4 h-4 text-gray-500 animate-spin" />
                    )}

                    {/* Dropdown arrow */}
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={disabled || loading}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label={isOpen ? 'Close' : openText}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? (
                            <Icons.ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                            <Icons.ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Helper Text / Error Text */}
            {(helperText || error) && (
                <p
                    className={`
                        text-xs mt-1
                        ${error ? 'text-red-600' : 'text-gray-500'}
                        ${error ? errorClassName : helperTextClassName}
                    `}
                >
                    {error && typeof error === 'string' ? error : helperText}
                </p>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={combinedMenuRef}
                    id={`${id}-listbox`}
                    style={{ zIndex: 50 }}
                    className={`
                        absolute ${menuWidth} ${menuHeight} overflow-auto
                        bg-white border-2 border-gray-200 rounded-lg shadow-lg
                        animate__animated animate__fadeIn animate__faster
                        ${placement === 'bottom-start' ? 'top-full left-0 mt-1' : ''}
                        ${placement === 'bottom-end' ? 'top-full right-0 mt-1' : ''}
                        ${placement === 'top-start' ? 'bottom-full left-0 mb-1' : ''}
                        ${placement === 'top-end' ? 'bottom-full right-0 mb-1' : ''}
                        ${menuClassName}
                    `}
                    role="listbox"
                    aria-multiselectable={multiple}
                >
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {loadingText}
                        </div>
                    ) : filteredOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {noOptionsText}
                        </div>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const isDisabled = getOptionDisabled(option);
                            const isSelected = selectedOptions.some(
                                selected => getOptionValue(selected) === getOptionValue(option)
                            );
                            const isHighlighted = highlightedIndex === index;

                            return (
                                <div
                                    key={getOptionValue(option)}
                                    id={`${id}-option-${index}`}
                                    ref={el => (optionRefs.current[index] = el)}
                                    className={`
                                        px-4 py-2 text-sm cursor-pointer
                                        transition-all duration-150
                                        ${isHighlighted ? 'bg-indigo-50' : ''}
                                        ${isSelected ? 'bg-indigo-50 font-medium' : ''}
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'}
                                        ${optionClassName}
                                    `}
                                    style={{ zIndex: 50 }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        if (!isDisabled) {
                                            handleOptionClick(option);
                                        }
                                    }}
                                    onMouseEnter={() => handleOptionMouseEnter(index)}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={isDisabled}
                                >
                                    {renderOptionContent(option, index)}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
});

ComboBox.displayName = 'ComboBox';

ComboBox.propTypes = {
    // Data props
    options: PropTypes.array.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
    defaultValue: PropTypes.any,

    // Display props
    getOptionLabel: PropTypes.func,
    getOptionValue: PropTypes.func,
    getOptionDisabled: PropTypes.func,
    filterOptions: PropTypes.func,
    placeholder: PropTypes.string,
    noOptionsText: PropTypes.string,
    loadingText: PropTypes.string,
    clearText: PropTypes.string,
    openText: PropTypes.string,

    // Behavior props
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    autoHighlight: PropTypes.bool,
    autoSelect: PropTypes.bool,
    disableClearable: PropTypes.bool,
    disableCloseOnSelect: PropTypes.bool,
    groupBy: PropTypes.func,
    virtual: PropTypes.bool,

    // Sizes and variants
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    variant: PropTypes.oneOf(['outlined', 'filled', 'underlined']),
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),

    // Event props
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onInputChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyDown: PropTypes.func,

    // Form props
    name: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    helperText: PropTypes.string,
    label: PropTypes.string,
    id: PropTypes.string,

    // Styling props
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    menuClassName: PropTypes.string,
    optionClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    helperTextClassName: PropTypes.string,
    errorClassName: PropTypes.string,

    // Positioning
    placement: PropTypes.oneOf(['bottom-start', 'bottom-end', 'top-start', 'top-end']),
    menuHeight: PropTypes.string,
    menuWidth: PropTypes.string,

    // Rendering
    renderOption: PropTypes.func,
    renderInput: PropTypes.func,
    renderTags: PropTypes.func,
    renderValue: PropTypes.func,

    // Accessibility
    'aria-label': PropTypes.string,
    'aria-describedby': PropTypes.string,

    // Ref
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]),
    menuRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]),
};

ComboBox.defaultProps = {
    options: [],
    placeholder: 'Select or type...',
    noOptionsText: 'No options',
    loadingText: 'Loading...',
    clearText: 'Clear',
    openText: 'Open',
    multiple: false,
    searchable: true,
    clearable: true,
    disabled: false,
    loading: false,
    autoHighlight: true,
    autoSelect: false,
    disableClearable: false,
    disableCloseOnSelect: false,
    size: 'md',
    variant: 'outlined',
    color: 'primary',
    placement: 'bottom-start',
    menuHeight: 'max-h-60',
    menuWidth: 'w-full',
    getOptionLabel: defaultGetOptionLabel,
    getOptionValue: defaultGetOptionValue,
    getOptionDisabled: defaultIsOptionDisabled,
    filterOptions: defaultFilterOptions,
};

export default ComboBox;