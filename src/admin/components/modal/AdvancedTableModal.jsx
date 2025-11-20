import React, { useState } from "react";
import AdvancedTable from "../table/ResponsiveTable";

const AdvancedTableModal = ({
    open,
    onClose,
    title = "Details",
    mode = "view",
    userView = true,
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
    trackDetails=[],
    currentStatus = '',
}) => {
    const [activeTable, setActiveTable] = useState("order"); // 'user' or 'order'

    if (!open) return null;
    const getModeBanner = () => {
        switch (mode) {
            case "track":
                return (
                    <div className="w-full text-center py-2 text-sm rounded-lg bg-[var(--active-bg)] text-[var(--primary-text-color)] font-semibold">
                        <p> Tracking Mode – Current Status: {currentStatus} </p>

                        <div className="mt-1 bg-[var(--card-bg)] p-1 text-[var(--secondary-text-color)] align-center text-start font-normal text-xs">
                            <h3 className="font-semibold mb-2 text-sm justify-start text-[var(--primary-text-color)]">Tracking History</h3>

                            {trackDetails?.length > 0 ? (
                                <ul className="space-y-1">
                                    {trackDetails.map((item, index) => (
                                        <li
                                            key={index}
                                            className="border-b  last:border-none"
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-semibold">{item.status}</span>
                                                <span className="text-xs">
                                                    {item.updated_at
                                                        ? new Date(item.updated_at).toLocaleString()
                                                        : "--"}
                                                </span>
                                            </div>
                                            {item.remarks && (
                                                <p className="text-xs ">
                                                    {item.remarks}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-sm text-gray-500">No tracking history available.</p>
                            )}
                        </div>
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
                        className="text-[var(--error-color)] text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Table Switcher */}
                <div className="flex space-x-1 p-1">

                    {userView && <button
                        onClick={() => setActiveTable("user")}
                        className={`px-2 py-1 rounded font-[var(--font-primary)] ${activeTable === "user"
                            ? "bg-[var(--primary-color)] text-[var(--card-background-color)] text-xs"
                            : "bg-[var(--card-background-color)] text-[var(--primary-text-color)] border border-[var(--border-color)] text-xs"
                            }`}
                    >
                        User Details
                    </button>}
                   
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
                        <div className="flex justify-end align-center">
                            <span className="font-semibold mr-2 text-xs">{totalLabel}:</span>
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
