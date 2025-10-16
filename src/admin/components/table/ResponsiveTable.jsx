// ResponsiveTable.jsx
import React from 'react';

const ResponsiveTable = ({
    headers = [],
    data = [],
    isLoading = false,
    isError = false,
    error = null,
    onRetry = () => { },
    alignments = {},
    renderCell = null,
    themeMode = 'light',
    showNextArrow = false, // New prop to control next arrow icon
    actionColumn = 'tracking' // New prop to specify which action column to show
}) => {
    // Default alignments if not provided
    const defaultAlignments = headers.reduce((acc, header) => {
        acc[header.key] = header.align || 'left';
        return acc;
    }, {});

    const tableAlignments = { ...defaultAlignments, ...alignments };

    const getAlignmentClass = (alignment) => {
        switch (alignment) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    // Filter headers based on actionColumn prop
    const filteredHeaders = headers.filter(header => {
        if (actionColumn === 'tracking' && header.key === 'actions') return false;
        if (actionColumn === 'actions' && header.key === 'tracking') return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[var(--secondary-text-color)] text-responsive-md font-primary">
                    Loading orders...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4">
                <div className="bg-[var(--error-color)] text-[var(--text-dark)] rounded-lg p-4 mb-3">
                    <p className="font-primary text-responsive-sm">
                        Error loading orders: {error?.message}
                    </p>
                </div>
                <button
                    onClick={onRetry}
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--active-border)] transition-colors font-primary text-responsive-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden">
            {/* Table for all screen sizes - same structure */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-full border-collapse">
                    <thead>
                        <tr className="bg-[var(--card-background-color)] border-b border-[var(--border-color)]">
                            {filteredHeaders.map((header, index) => (
                                <th
                                    key={header.key || index}
                                    className={`
                                        px-[var(--spacing-md)] py-[var(--spacing-sm)]
                                        font-bold font-secondary
                                        text-[var(--primary-text-color)]
                                        ${getAlignmentClass(tableAlignments[header.key])}
                                        whitespace-nowrap
                                        text-responsive-sm
                                    `}
                                    style={{
                                        fontFamily: 'var(--font-secondary)'
                                    }}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.orderId || rowIndex}
                                    className="border-b border-[var(--border-color)] hover:bg-[var(--active-bg)] transition-colors"
                                >
                                    {filteredHeaders.map((header, cellIndex) => (
                                        <td
                                            key={`${row.orderId}-${header.key}`}
                                            className={`
                                                px-[var(--spacing-md)] py-[var(--spacing-sm)]
                                                font-primary
                                                ${getAlignmentClass(tableAlignments[header.key])}
                                                text-responsive-xs
                                            `}
                                            style={{
                                                fontFamily: 'var(--font-primary)'
                                            }}
                                        >
                                            {renderCell ? renderCell(header.key, row, themeMode, showNextArrow) : row[header.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={filteredHeaders.length} className="px-[var(--spacing-md)] py-[var(--spacing-xl)] text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-[var(--border-color)] text-4xl">📄</div>
                                        <p
                                            className="text-[var(--secondary-text-color)] font-primary text-responsive-lg font-medium"
                                            style={{ fontFamily: 'var(--font-primary)' }}
                                        >
                                            No orders found
                                        </p>
                                        <p
                                            className="text-[var(--secondary-text-color)] font-primary text-responsive-sm"
                                            style={{ fontFamily: 'var(--font-primary)' }}
                                        >
                                            Try adjusting your search or filters
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResponsiveTable;