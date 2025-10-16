// components/SkeletonTable.jsx
import React from 'react';

const SkeletonTable = ({
    rows = 5,
    columns = 7,
    themeMode = 'light',
    withHeader = true
}) => {
    return (
        <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-full border-collapse">
                    {withHeader && (
                        <thead>
                            <tr className="bg-[var(--card-background-color)] border-b border-[var(--border-color)]">
                                {Array.from({ length: columns }).map((_, index) => (
                                    <th
                                        key={index}
                                        className="px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left"
                                    >
                                        <div className={`h-4 bg-[var(--border-color)] rounded animate-pulse ${themeMode === 'dark' ? 'opacity-30' : 'opacity-20'}`}></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-[var(--border-color)]">
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-[var(--spacing-md)] py-[var(--spacing-sm)]">
                                        <div className={`h-4 bg-[var(--border-color)] rounded animate-pulse ${themeMode === 'dark' ? 'opacity-20' : 'opacity-10'}`}></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SkeletonTable;