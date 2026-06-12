
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Default icon ─────────────────────────────────────────────────────────────
const DefaultIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const ClearIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const EmptyIcon = () => (
    <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const SelectComboBox = ({
    label,
    field,
    value,
    displayValue,
    onChange,
    options = [],
    openOn = 'focus',
    filterMode = 'includes',
    required = false,
    icon,
    error,
    minWidth,
    maxWidth,
    isDark = false,
    disabled = false,
    placeholder = 'Search…',
    clearable = true,
    capitalized = false,
    loading = false,
    emptyText = 'No results found',
    maxVisible = 4,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlighted, setHighlighted] = useState(-1);

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // ── Resolve icon node ────────────────────────────────────────────────────
    const iconNode =
        icon === true ? <DefaultIcon /> :
            icon ? icon :
                null;
    const hasIcon = Boolean(iconNode);

    // ── Filtered options ─────────────────────────────────────────────────────
    const filtered = query.trim() === ''
        ? options
        : options.filter((opt) => {
            const hay = opt.label.toLowerCase();
            const needle = query.toLowerCase();
            return filterMode === 'startsWith'
                ? hay.startsWith(needle)
                : hay.includes(needle);
        });

    // ── Open dropdown ────────────────────────────────────────────────────────
    const openDropdown = useCallback(() => {
        if (!disabled) {
            setIsOpen(true);
            setHighlighted(-1);
        }
    }, [disabled]);

    // ── Close + reset query ──────────────────────────────────────────────────
    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        setHighlighted(-1);
    }, []);

    // ── Click outside ────────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                closeDropdown();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [closeDropdown]);

    // ── Scroll highlighted item into view ────────────────────────────────────
    useEffect(() => {
        if (!listRef.current || highlighted < 0) return;
        const item = listRef.current.children[highlighted];
        item?.scrollIntoView({ block: 'nearest' });
    }, [highlighted]);

    // ── Input change ─────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        let val = e.target.value;
        if (capitalized) val = val.toUpperCase();
        setQuery(val);

        // openOn='type' → open only once user starts typing
        if (openOn === 'type' && val.trim() !== '') openDropdown();
    };

    // ── Select an option ─────────────────────────────────────────────────────
    const handleSelect = (opt) => {
        if (onChange) onChange(field, opt.value, opt);
        closeDropdown();
    };

    // ── Clear selection ──────────────────────────────────────────────────────
    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) onChange(field, '', null);
        setQuery('');
        inputRef.current?.focus();
    };

    // ── Keyboard navigation ──────────────────────────────────────────────────
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                openDropdown();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlighted((p) => Math.min(p + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlighted((p) => Math.max(p - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlighted >= 0 && filtered[highlighted]) {
                    handleSelect(filtered[highlighted]);
                }
                break;
            case 'Escape':
                closeDropdown();
                break;
            case 'Tab':
                closeDropdown();
                break;
            default:
                break;
        }
    };

    // ── What the input shows ─────────────────────────────────────────────────
    // While open: show the live query (what user is typing)
    // While closed: derive the label from options using the current value
    const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label ?? (displayValue ?? '');
    const inputValue = isOpen ? query : selectedLabel;

    // max-height for the dropdown list
    const listMaxHeight = `${maxVisible * 40}px`;

    return (
        <div
            ref={wrapperRef}
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

            {/* Input area */}
            <div className="relative">
                {/* Left icon */}
                {hasIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-1">
                        {iconNode}
                    </span>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={handleInputChange}
                    onFocus={() => { if (openOn === 'focus') openDropdown(); }}
                    onClick={() => { if (openOn === 'click') openDropdown(); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    className={`
                        w-full py-2 text-sm rounded-lg border outline-none transition-all
                        ${hasIcon ? 'pl-9' : 'pl-3'}
                        ${clearable && value ? 'pr-14' : 'pr-8'}
                        ${isDark
                            ? 'bg-gray-800 text-white placeholder-gray-500'
                            : 'bg-white text-gray-900 placeholder-gray-400'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${error
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        }
                    `}
                />

                {/* Right side: clear + chevron */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {clearable && value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`p-0.5 rounded transition-colors
                                ${isDark
                                    ? 'text-gray-500 hover:text-gray-300'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            aria-label="Clear selection"
                        >
                            <ClearIcon />
                        </button>
                    )}
                    <span
                        className={`text-gray-400 transition-transform duration-200 pointer-events-none
                            ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        <ChevronDownIcon />
                    </span>
                </span>

                {/* Dropdown */}
                {isOpen && (
                    <div
                        className={`
                            absolute z-10 w-full mt-1 rounded-lg border shadow-lg overflow-hidden
                            ${isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                            }
                        `}
                    >
                        {/* Loading state */}
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-4">
                                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading…
                                </span>
                            </div>
                        ) : filtered.length === 0 ? (
                            /* Empty state */
                            <div className={`py-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <EmptyIcon />
                                {emptyText}
                            </div>
                        ) : (
                            /* Options list */
                            <ul
                                ref={listRef}
                                role="listbox"
                                style={{ maxHeight: listMaxHeight }}
                                className="overflow-y-auto py-1 "
                            >
                                {filtered.map((opt, idx) => {
                                    const isSelected = opt.value === value;
                                    const isHighlighted = idx === highlighted;

                                    return (
                                        <li
                                            key={opt.value}
                                            role="option"
                                            aria-selected={isSelected}
                                            onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                                            onMouseEnter={() => setHighlighted(idx)}
                                            className={`
                                                flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm transition-colors
                                                ${isSelected
                                                    ? 'bg-orange-500 text-white'
                                                    : isHighlighted
                                                        ? (isDark ? 'bg-gray-700 text-white' : 'bg-orange-50 text-orange-600')
                                                        : (isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                                }
                                            `}
                                        >
                                            {/* Per-option icon */}
                                            {opt.icon && (
                                                <span className="shrink-0 text-base">{opt.icon}</span>
                                            )}

                                            <span className="flex-1 min-w-0">
                                                <span className="block truncate font-medium">{opt.label}</span>
                                                {opt.description && (
                                                    <span className={`block truncate text-xs mt-0.5 
                                                        ${isSelected ? 'text-orange-100' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                                                        {opt.description}
                                                    </span>
                                                )}
                                            </span>

                                            {/* Tick for selected */}
                                            {isSelected && (
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
            )}
        </div>
    );
};

export default SelectComboBox;