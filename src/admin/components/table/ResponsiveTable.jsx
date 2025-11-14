import React from 'react';
import SkeletonTable from './SkeletonTable';




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

    // ---- Tailwind with JIT variable syntax ----
    headerBg = 'bg-[var(--card-background-color)]',
    headerText = 'text-[var(--primary-text-color)]',
    rowBg = 'bg-[var(--card-background-color)]',
    rowText = 'text-[var(--primary-text-color)]',
    rowHoverBg = 'hover:bg-[var(--active-bg)]',
    fontFamilyHeader = 'font-secondary',
    fontFamilyRow = 'font-primary',
    fontSizeHeader = 'text-[var(--font-size-sm)]',
    fontSizeRow = 'text-[var(--font-size-xs)]',
    tableWidth = 'w-full',
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
            acc[key] = "center"; // or "left" if you prefer
        } else if (typeof sample === "number") {
            acc[key] = "right";
        } else {
            acc[key] = "left";
        }

        return acc;
    }, {});

    // const tableAlignments = { ...finalAlignments, ...alignments };

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

    if (isLoading) return <SkeletonTable rows={6} columns={filteredHeaders.length} themeMode={themeMode} withHeader />;

    if (isError) {
        return (
            <div className="p-6 text-center">
                <div className="bg-[var(--error-color)] text-white rounded-md p-4 mb-4 max-w-md mx-auto">
                    <p className="font-medium text-xs">
                        Error: {error?.message ?? 'Failed to load data'}
                    </p>
                </div>
                <button
                    onClick={onRetry}
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md hover:bg-[var(--active-border)] transition-colors font-medium text-xs"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={`${tableWidth} overflow-x-auto`}>
            <table className="w-full min-w-full border-collapse border border-[var(--border-color)]">
                <thead>
                    <tr className={headerBg}>
                        {filteredHeaders.map((h) => (
                            <th
                                key={h.key}
                                className={`px-md py-sm font-bold ${fontFamilyHeader} ${headerText} 
    ${fontSizeHeader} ${alignClass(finalAlignments[h.key])} 
    whitespace-nowrap border border-[var(--border-color)]`}

                            >
                                {h.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, i) => (
                            <tr key={row.id ?? i} className={`${rowBg}  transition-colors`}>
                                {filteredHeaders.map((h) => (
                                    <td
                                        key={`${row.id ?? i}-${h.key}`}
                                        className={`px-md py-sm ${fontFamilyRow} ${rowText} 
    ${fontSizeRow} ${alignClass(finalAlignments[h.key])} 
    border border-[var(--border-color)]`}

                                    >
                                        {renderCell ? renderCell(h.key, row, themeMode, showNextArrow) : row[h.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={filteredHeaders.length} className="px-md py-xl text-center border border-[var(--border-color)]">
                                <div className="flex flex-col items-center gap-3">
                                    <p className="font-medium text-sm text-[var(--secondary-text-color)]">No data found</p>
                                    <p className="text-xs text-[var(--secondary-text-color)] opacity-80">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdvancedTable;