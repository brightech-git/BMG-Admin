import React from 'react';
import SkeletonTable from './SkeletonTable';
import 'animate.css';

const AdvancedTable = ({
    headers = [],
    data = [],
    isLoading = false,
    isError = false,
    error = null,
    onRetry = () => { },
    alignments = {},
    renderCell = null,
    themeMode = 'light',
    showNextArrow = false,
    actionColumn = 'tracking',

    // ---- New scroll handling props ----
    maxHeight = '600px', // Default max height for scroll
    onScrollEnd = () => { },
    scrollEndThreshold = 100,
    hasMore = false,
    isLoadingMore = false,

    // ---- Tailwind with JIT variable syntax ----
    headerBg = 'bg-[var(--primary-text-color)]',
    headerText = 'text-[var(--white-color)]',
    rowBg = 'bg-[var(--card-background-color)]',
    rowText = 'text-[var(--primary-text-color)]',
    rowHoverBg = 'hover:bg-[var(--active-bg)]',
    fontFamilyHeader = 'font-secondary',
    fontFamilyRow = 'font-primary',
    fontSizeHeader = 'text-[var(--font-size-xs)]',
    fontSizeRow = 'text-[var(--font-size-xs)]',
    tableWidth = 'w-full',
    emptyMessage = '',

}) => {
    // ---- Build final column alignment map ----
    const finalAlignments = headers.reduce((acc, h) => {
        const key = h.key;

        // 1️⃣ Header-level alignment has highest priority
        if (h.align) {
            acc[key] = h.align;
            return acc;
        }

        // 2️⃣ Prop alignments override auto-detection
        if (alignments[key]) {
            acc[key] = alignments[key];
            return acc;
        }

        // 3️⃣ Auto-detect alignment using first row
        const sample = data?.[0]?.[key];

        if (key === "sno") {
            acc[key] = "center";
        } else if (typeof sample === "number") {
            acc[key] = "right";
        } else {
            acc[key] = "left";
        }

        return acc;
    }, {});

    const alignClass = (a) =>
        a === "center"
            ? "text-center"
            : a === "right"
                ? "text-right"
                : "text-left";

    const filteredHeaders = headers.filter((h) => {
        if (actionColumn === 'tracking' && h.key === 'actions') return false;
        if (actionColumn === 'actions' && h.key === 'tracking') return false;
        return true;
    });

    // Animation classes based on theme mode
    const tableAnimationClass = themeMode === 'dark'
        ? 'animate__animated animate__fadeIn'
        : 'animate__animated animate__fadeIn';

    const rowAnimationClass = 'animate__animated animate__fadeInUp animate__faster';
    const headerAnimationClass = 'animate__animated animate__fadeInDown animate__faster';

    // Handle scroll event
    const handleScroll = (e) => {
        if (!hasMore || isLoadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const scrollPosition = scrollTop + clientHeight;

        if (scrollHeight - scrollPosition <= scrollEndThreshold) {
            onScrollEnd();
        }
    };

    if (isLoading) return <SkeletonTable rows={5} columns={filteredHeaders.length} themeMode={themeMode} withHeader />;

    if (isError) {
        return (
            <div className={`p-6 text-center ${tableAnimationClass}`}>
                <div className="bg-[var(--error-color)] text-white rounded-md p-4 mb-4 max-w-md mx-auto animate__animated animate__shakeX">
                    <p className="font-medium text-xs flex items-center justify-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        Error: {error?.message ?? 'Failed to load data'}
                    </p>
                </div>
                <button
                    onClick={onRetry}
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md hover:bg-[var(--active-border)] transition-all duration-300 font-medium text-xs hover:scale-105 hover:shadow-lg animate__animated animate__pulse animate__infinite animate__slow"
                >
                    <i className="fas fa-redo-alt mr-1"></i>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={`${tableWidth} ${tableAnimationClass}`}>
            {/* Table container with fixed height and scroll */}
            <div className={`${tableWidth} ${tableAnimationClass}`}>
                {/* Table container with fixed height and scroll */}
                <div
                    className="overflow-y-auto border border-[var(--border-color)] rounded-md"  // Add border back to container
                    style={{ maxHeight }}
                    onScroll={handleScroll}
                >
                    <table className="w-full min-w-full border-collapse">
                        <thead className="sticky top-0 ">
                            <tr className={`${headerBg} ${headerAnimationClass}`}>
                                {filteredHeaders.map((h, index) => (
                                    <th
                                        key={h.key}
                                        className={`px-0.5 sm:px-1 py-sm font-medium ${fontFamilyHeader} ${headerText} 
                                ${fontSizeHeader} ${alignClass(finalAlignments[h.key])} 
                                whitespace-nowrap border-b border-[var(--border-color)]  // Add bottom border to headers
                                animate__animated animate__fadeInDown animate__faster`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            {h.icon && <i className={`fas fa-${h.icon} text-xs`}></i>}
                                            {h.label}
                                            {h.sortable && (
                                                <i className="fas fa-sort text-[10px] opacity-50 hover:opacity-100 transition-opacity"></i>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((row, i) => (
                                    <tr
                                        key={row.id ?? i}
                                        className={`${rowBg} ${rowHoverBg} transition-all duration-300 ${rowAnimationClass}`}
                                        style={{ animationDelay: `${i * 0.03}s` }}
                                    >
                                        {filteredHeaders.map((h, j) => (
                                            <td
                                                key={`${row.id ?? i}-${h.key}`}
                                                className={`px-1 sm:px-2 py-1 sm:py-2 ${fontFamilyRow} ${rowText} 
                                        ${fontSizeRow} ${alignClass(finalAlignments[h.key])} 
                                        border-b border-[var(--border-color)]  // Add bottom border to cells
                                        transition-all duration-200 hover:bg-[var(--active-bg)]/10`}
                                                style={{ animationDelay: `${(i * filteredHeaders.length + j) * 0.01}s` }}
                                            >
                                                <div className="animate__animated animate__fadeIn animate__faster">
                                                    {renderCell ? renderCell(h.key, row, themeMode, showNextArrow) : row[h.key]}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={filteredHeaders.length} className="px-1 py-6 text-center border-b border-[var(--border-color)]">  {/* Add border */}
                                        <div className="flex flex-col items-center animate__animated animate__fadeIn">
                                            <div className="w-12 h-12 bg-[var(--active-bg)]/20 rounded-full flex items-center justify-center mb-2 animate__animated animate__pulse animate__infinite animate__slower">
                                                <i className="fas fa-inbox text-[var(--secondary-text-color)] text-lg"></i>
                                            </div>
                                            {emptyMessage ? (
                                                <p className='text-xs text-[var(--secondary-text-color)] opacity-90 animate__animated animate__fadeInUp'>
                                                    {emptyMessage}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-[var(--secondary-text-color)] opacity-90 animate__animated animate__fadeInUp">
                                                    No data found
                                                </p>
                                            )}
                                            <button
                                                onClick={onRetry}
                                                className="mt-3 text-[10px] text-[var(--primary-color)] hover:text-[var(--active-border)] transition-colors flex items-center gap-1"
                                            >
                                                <i className="fas fa-sync-alt text-[8px]"></i>
                                                Refresh
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Loading more indicator */}
                            {isLoadingMore && (
                                <tr>
                                    <td colSpan={filteredHeaders.length} className="px-1 py-3 text-center border-b border-[var(--border-color)]">  {/* Add border */}
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>  {/* Fixed spinner */}
                                            <span className="text-[10px] text-[var(--secondary-text-color)]">Loading more...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with animation */}
                {data.length > 0 && (
                    <div className="mt-2 flex justify-between items-center animate__animated animate__fadeInUp animate__delay-1s">
                        <span className="text-[10px] text-[var(--secondary-text-color)] opacity-60">
                            <i className="fas fa-database mr-1"></i>
                            Showing {data.length} {data.length === 1 ? 'record' : 'records'}
                            {hasMore && ' (scroll for more)'}
                        </span>
                        {isLoadingMore && (
                            <span className="text-[10px] text-[var(--primary-color)]">
                                Loading...
                            </span>
                        )}
                    </div>
                )}
            </div>

           
        </div>
    );
};

export default AdvancedTable;