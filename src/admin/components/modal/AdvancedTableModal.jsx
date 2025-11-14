import React, { useState } from "react";
import AdvancedTable from "../table/ResponsiveTable";

const AdvancedTableModal = ({
    open,
    onClose,
    title = "Details",
    mode = "view",
    userData = [],
    userColumns = [],
    orderData = [],
    orderColumns = [],
    themeMode = "light",
    showNextArrow = false,
    actionColumn = "tracking",
    showTotal = false,
    totalLabel = "Grand Total",
    totalValue,
}) => {
    const [activeTable, setActiveTable] = useState("user"); // 'user' or 'order'

    if (!open) return null;

    const getModeBanner = () => {
        switch (mode) {
            case "track":
                return (
                    <div className="w-full text-center py-2 rounded-lg bg-[var(--active-bg)] text-[var(--primary-text-color)] font-semibold">
                        Tracking Mode – Package Progress
                    </div>
                );
            case "edit":
                return (
                    <div className="w-full text-center py-2 rounded-lg bg-[var(--warning-color)] text-[var(--primary-text-color)] font-semibold">
                        Edit Mode – You can update details
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 overflow-auto">
            <div
                className="rounded-[var(--border-radius-md)] shadow-lg w-[90%] max-w-5xl"
                style={{ backgroundColor: "var(--card-background-color)" }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-2">
                    <p className="text-responsive-xs  items-center font-[var(--font-primary)] font-bold text-[var(--primary-text-color)]">
                        {title}
                    </p>
                    <button
                        onClick={onClose}
                        className="text-[var(--secondary-text-color)] hover:text-[var(--error-color)] text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Table Switcher */}
                <div className="flex space-x-1 p-1">
                    <button
                        onClick={() => setActiveTable("user")}
                        className={`px-2 py-1 rounded font-[var(--font-primary)] ${activeTable === "user"
                                ? "bg-[var(--primary-color)] text-[var(--card-background-color)] text-xs"
                                : "bg-[var(--card-background-color)] text-[var(--primary-text-color)] border border-[var(--border-color)] text-xs"
                            }`}
                    >
                        User Details
                    </button>
                    <button
                        onClick={() => setActiveTable("order")}
                        className={`px-2 py-1 rounded font-[var(--font-primary)] ${activeTable === "order"
                                ? "bg-[var(--primary-color)] text-[var(--card-background-color)] text-xs"
                                : "bg-[var(--card-background-color)] text-[var(--primary-text-color)] border border-[var(--border-color)] text-xs"
                            }`}
                    >
                        Order Items
                    </button>
                </div>

                {/* Body */}
                <div className="p-2 space-y-2">
                    {getModeBanner()}

                    {activeTable === "user" ? (
                        <AdvancedTable
                            headers={userColumns}
                            data={userData}
                            themeMode={themeMode}
                            showNextArrow={showNextArrow}
                            actionColumn={actionColumn}
                            headerBg="bg-[var(--card-background-color)]"
                            rowBg="bg-[var(--card-background-color)]"
                            rowHoverBg="hover:bg-[var(--active-bg)]"
                            headerText="text-[var(--primary-text-color)]"
                            rowText="text-[var(--primary-text-color)]"
                            fontFamilyHeader="font-[var(--font-secondary)]"
                            fontFamilyRow="font-[var(--font-primary)]"
                            fontSizeHeader='text-sm'
                            fontSizeRow = "text-xs"
                        />
                    ) : (
                        <AdvancedTable
                            headers={orderColumns}
                            data={orderData}
                            themeMode={themeMode}
                            showNextArrow={showNextArrow}
                            actionColumn={actionColumn}
                            headerBg="bg-[var(--card-background-color)]"
                            rowBg="bg-[var(--card-background-color)]"
                            rowHoverBg="hover:bg-[var(--active-bg)]"
                            headerText="text-[var(--primary-text-color)]"
                            rowText="text-[var(--primary-text-color)]"
                            fontFamilyHeader="font-[var(--font-secondary)]"
                            fontFamilyRow="font-[var(--font-primary)]"
                            fontSizeHeader='text-sm'
                            fontSizeRow="text-xs"
                        />
                    )}

                    {/* Optional Footer Total */}
                    {activeTable === "order" && showTotal && (
                        <div className="flex justify-end ">
                            <span className="font-semibold mr-2 text-sm">{totalLabel}:</span>
                            <span className="text-[var(--error-color)] font-bold text-xs">
                                {totalValue}
                            </span>
                        </div>
                    )} 
                </div>
            </div>
        </div>
    );
};

export default AdvancedTableModal;
