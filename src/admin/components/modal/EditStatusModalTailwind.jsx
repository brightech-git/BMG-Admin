import React, { useState, useEffect } from "react";
import StatusChip from "../statusChip/StatusChip";
import AdvancedTable from "../table/ResponsiveTable";
import { X } from "lucide-react";

const EditStatusModalTailwind = ({
    open,
    onClose,
    orderData,
    onSubmit,
    isLoading = false,
    statusOptions = [],
    errorMessage,
    itemTableColumns = [],
    itemTableData = [],
    userTableColumns = [],
    userTableData = [],
    downloadLabel = false,
    onDownload = () => { },
}) => {
    const [editForm, setEditForm] = useState({
        status: "",
        remarks: "",
    });

    useEffect(() => {
        if (orderData?.status) {
            setEditForm({ status: orderData.status, remarks: "" });
        }
    }, [orderData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!editForm.status || isLoading) return;
        onSubmit?.(editForm);
    };

    const orderItemData = itemTableData.map((item) => ({
        sno: item.sno,
        product: (
            <div className="flex items-center gap-2">
                {item.image_path && (
                    <img
                        src={item.image_path}
                        alt={item.product_name}
                        className="w-10 h-10 rounded border border-[var(--border-color)] object-cover"
                    />
                )}
                <span className="text-xs text-[var(--primary-text-color)]">
                    {item.product_name}
                </span>
            </div>
        ),
        quantity: item.quantity,
        price: `₹${item.price.toFixed(2)}`,
        tagno: item.tagno,
    }));

    if (!open) return null;

    const isCancelled = editForm.status?.toUpperCase() === "CANCELLED";
    const hasStatusChanged = editForm.status !== orderData?.status;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start p-4 overflow-y-auto">
            <div
                className="w-full max-w-4xl mt-16 rounded-lg shadow-xl bg-[var(--background-color)]"
            >
                {/* HEADER */}
                <div className="flex items-center bg-[var(--primary-text-color)]  justify-between border-b border-[var(--border-color)] p-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm m-0 font-semibold text-[var(--primary-color)]">
                            Edit Order Status
                        </p>
                        <p className="text-xs m-0  text-[var(--secondary-color)]">
                            Order ID: {orderData?.order_id || "-"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {downloadLabel && (
                            <button
                                onClick={onDownload}
                                className="px-2 py-1 text-xs border text-[var(--primary-color)] rounded hover:bg-[var(--active-bg)]"
                            >
                                Download Label
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-[var(--active-bg)]"
                        >
                            <X className="w-4 h-4 text-[var(--primary-color)]" />
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-2 space-y-6 text-xs">
                    {/* ORDER ITEMS */}
                    <section className="space-y-3">
                        <AdvancedTable
                            headers={itemTableColumns}
                            data={orderItemData}
                            headerBg="bg-[var(--card-background-color)]"
                            rowBg="bg-[var(--card-background-color)]"
                            rowHoverBg="hover:bg-[var(--active-bg)]"
                            headerText="text-[var(--primary-text-color)]"
                            rowText="text-[var(--primary-text-color)]"
                        />

                        {userTableColumns.length > 0 && userTableData.length > 0 && (
                            <AdvancedTable
                                headers={userTableColumns}
                                data={userTableData}
                                headerBg="bg-[var(--card-background-color)]"
                                rowBg="bg-[var(--card-background-color)]"
                                rowHoverBg="hover:bg-[var(--active-bg)]"
                                headerText="text-[var(--primary-text-color)]"
                                rowText="text-[var(--primary-text-color)]"
                            />
                        )}
                    </section>

                    {/* STATUS SECTION */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[var(--secondary-text-color)] mb-1">
                                Current Status
                            </label>
                            <StatusChip status={orderData?.status} size="medium" />
                        </div>

                        {statusOptions.length > 0 && (
                            <div>
                                <label className="block text-[var(--secondary-text-color)] mb-1">
                                    Update Status
                                </label>
                                <div className="space-y-2">
                                    {statusOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={option.value}
                                                checked={editForm.status === option.value}
                                                onChange={handleChange}
                                                className="accent-[var(--primary-color)]"
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* REMARKS */}
                    <section>
                        <label className="block text-[var(--secondary-text-color)] mb-1">
                            Remarks / Notes
                        </label>
                        <textarea
                            name="remarks"
                            value={editForm.remarks}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Add internal notes or remarks for this status update..."
                            className="w-full p-2 border rounded focus:ring-1 focus:ring-[var(--primary-color)]"
                        />
                    </section>

                    {/* STATUS PREVIEW */}
                    <section className="flex items-center gap-2 flex-wrap">
                        <span className="text-[var(--secondary-text-color)]">Preview:</span>
                        <StatusChip status={orderData?.status} size="small" />
                        <span className="text-[var(--secondary-text-color)]">→</span>
                        {editForm.status ? (
                            <StatusChip status={editForm.status} size="small" />
                        ) : (
                            <span className="px-2 py-1 border rounded text-[var(--secondary-text-color)]">
                                No change
                            </span>
                        )}
                        {hasStatusChanged && (
                            <span className="px-2 py-1 rounded-full bg-[var(--warning-color)] text-xs">
                                Pending Update
                            </span>
                        )}
                    </section>

                    {/* ERROR */}
                    {errorMessage && (
                        <div className="text-[var(--error-color)]">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-end gap-2 border-t border-[var(--border-color)] p-3 m-0">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-xs border rounded hover:bg-[var(--active-bg)]"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!editForm.status || isLoading}
                        className={`px-4 py-1 text-xs rounded text-white transition
                            ${isCancelled
                                ? "bg-[var(--error-color)]"
                                : "bg-[var(--primary-color)]"
                            }
                            ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
                        `}
                    >
                        {isLoading
                            ? "Updating..."
                            : isCancelled
                                ? "Cancel Order"
                                : "Update Status"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStatusModalTailwind;
