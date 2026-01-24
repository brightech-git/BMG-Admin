import React, { useState, useEffect } from 'react';
import StatusChip from '../statusChip/StatusChip';
import AdvancedTable from '../table/ResponsiveTable';
import { X } from 'lucide-react';

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
    const [editForm, setEditForm] = useState({ status: '', remarks: '' });
    console.log(editForm ,'editform');
    console.log(statusOptions, 'statusOptions')

    useEffect(() => {
        if (orderData)
            setEditForm({ status: orderData.status || '', remarks: '' });
    }, [orderData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        console.log("SUBMITTED FROM MODAL:", editForm); // should show updated status + remarks
        if (onSubmit )onSubmit(editForm); // send to parent
    };

   
    const orderItemData = itemTableData.map((item) => ({
        sno: item.sno,
        product: (
            <div className="flex items-center gap-2">
                {item.image_path && (
                    <img
                        src={item.image_path}
                        alt={item.product_name}
                        className="w-10 h-10 rounded-sm object-cover border border-[var(--border-color)]"
                    />
                )}
                <span className="text-xs font-[var(--font-primary)] text-[var(--primary-text-color)]">
                    {item.product_name}
                </span>
            </div>
        ),
        quantity: item.quantity,
        price: `₹${item.price.toFixed(2)}`,
        tagno: item.tagno,
    }));

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-auto">
            <div
                className="rounded-lg w-full max-w-4xl shadow-lg relative mt-[70px] p-2 lg:mt-[70px] sm:mt-60"
                style={{ background: 'var(--background-color)' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-lg ">
                    <div>
                        <h2 className="text-sm font-[var(--font-primary)] text-[var(--primary-text-color)] font-semibold">
                            Edit Order
                        </h2>
                        <p className="text-xs font-[var(--font-primary)] text-[var(--secondary-text-color)]">
                            Order ID: {orderData?.order_id || '-'}
                        </p>
                    </div>
                    {downloadLabel && <button
                        onClick={onDownload}
                        className={`px-2 py-1 rounded text-xs border  font-[var(--font-primary)]
                            }`}
                    >
                        Download Shipping Label
                    </button>}
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-[var(--active-bg)]"
                    >
                        <X className="w-5 h-5 text-[var(--secondary-text-color)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-lg space-y-4 text-xs font-[var(--font-primary)]">
                    {/* User & Item Details Table */}
                    <div className="p-md space-y-4">
                        <AdvancedTable
                            headers={itemTableColumns}
                            data={orderItemData}
                            headerBg="bg-[var(--card-background-color)]"
                            rowBg="bg-[var(--card-background-color)]"
                            rowHoverBg="hover:bg-[var(--active-bg)]"
                            headerText="text-[var(--primary-text-color)]"
                            rowText="text-[var(--primary-text-color)]"
                            fontFamilyHeader="font-[var(--font-secondary)]"
                            fontFamilyRow="font-[var(--font-primary)]"
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
                                fontFamilyHeader="font-[var(--font-secondary)]"
                                fontFamilyRow="font-[var(--font-primary)]"
                            />
                        )}
                    </div>

                    {/* Current Status & New Status */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div>
                            <label className="text-xs text-[var(--secondary-text-color)]">
                                Current Status
                            </label>
                            <div className="mt-1">
                                <StatusChip status={orderData?.status} size="medium" />
                            </div>
                        </div>
                        {statusOptions.length > 0 && <div className="flex-1">
                            <label className="text-xs text-[var(--secondary-text-color)]">
                                Select New Status
                            </label>
                            <div className="mt-1 flex flex-col gap-2">
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
                                        <span className="text-[var(--primary-text-color)]">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>}
                       
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="text-xs text-[var(--secondary-text-color)]">
                            Remarks & Notes
                        </label>
                        <textarea
                            name="remarks"
                            value={editForm.remarks}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Enter detailed remarks about this status change..."
                            className="w-full p-sm border border-[var(--border-color)] rounded-sm text-[var(--primary-text-color)] mt-1 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                        />
                    </div>

                    {/* Error */}
                    {errorMessage && (
                        <div className="text-[var(--error-color)]">{errorMessage}</div>
                    )}

                    {/* Status Preview */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                            <span className="text-[var(--secondary-text-color)]">Current:</span>
                            <StatusChip status={orderData?.status} size="small" />
                        </div>
                        <span className="text-[var(--secondary-text-color)]">→</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[var(--secondary-text-color)]">New:</span>
                            {editForm.status ? (
                                <StatusChip status={editForm.status} size="small" />
                            ) : (
                                <span className="px-sm py-xs border border-[var(--border-color)] rounded-full text-[var(--secondary-text-color)]">
                                    Select Status
                                </span>
                            )}
                        </div>
                        {editForm.status &&
                            editForm.status !== orderData?.status && (
                                <span className="px-sm py-xs rounded-full bg-[var(--warning-color)] text-[var(--primary-text-color)] animate-pulse">
                                    WILL UPDATE
                                </span>
                            )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex mt-2 justify-end gap-2 p-lg ">
                    <button
                        onClick={onClose}
                        className="px-1 py-1 border p-1 text-xs border-[var(--border-color)] rounded-md hover:bg-[var(--active-bg)]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!editForm.status || isLoading}
                        className={`p-1 rounded-md transition text-xs
                            ${editForm.status &&
                                editForm.status.toUpperCase() === 'CANCELLED'
                                ? 'bg-[var(--error-color)] text-white hover:bg-[var(--error-color)]'
                                : 'bg-[var(--active-border)] text-white hover:bg-[var(--primary-color)]'
                            }
                            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {isLoading
                            ? 'Processing...'
                            : editForm.status &&
                                editForm.status.toUpperCase() === 'CANCELLED'
                                ? 'Cancel Order'
                                : 'Update Status'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStatusModalTailwind;
