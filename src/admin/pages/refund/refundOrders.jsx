// components/RefundOrdersTable.jsx
import React from 'react';
import AdvancedTable from '../../components/table/ResponsiveTable';
import { useRefundOrders ,useDeleteRefundOrder ,useUpdateRefundOrder ,  } from '../../hooks/refund/useRefundQuery';

const RefundOrdersTable = () => {
    const { data: refunds = [], isLoading, isError, error, refetch } = useRefundOrders();
    const updateMutation = useUpdateRefundOrder();
    const deleteMutation = useDeleteRefundOrder();

    const headers = [
        { key: 'orderId', label: 'Order ID' },
        { key: 'customerName', label: 'Customer' },
        { key: 'reason', label: 'Reason' },
        { key: 'action', label: 'Action' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'operations', label: 'Operations' },
    ];

    const renderCell = (key, row) => {
        switch (key) {
            case 'createdAt':
                return new Date(row.createdAt).toLocaleDateString();
            case 'operations':
                return (
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded"
                            onClick={() => updateMutation.mutate({ id: row.id, updateData: { status: 'APPROVED' } })}
                        >
                            Approve
                        </button>
                        <button
                            className="px-2 py-1 bg-yellow-500 text-white rounded"
                            onClick={() => updateMutation.mutate({ id: row.id, updateData: { status: 'REJECTED' } })}
                        >
                            Reject
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this refund?')) {
                                    deleteMutation.mutate(row.id);
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                );
            default:
                return row[key] ?? 'N/A';
        }
    };

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
        <AdvancedTable
            headers={headers}
            data={refunds}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            renderCell={renderCell}
            themeMode="light"
            emptyMessage="No refund orders available"
        />
        </div>
    );
};

export default RefundOrdersTable;
