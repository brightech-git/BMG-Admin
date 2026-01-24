import React, { useState } from "react";
import { Eye, Edit } from "lucide-react";
import { useAllRedemptions, useUpdateRedemption } from "../../hooks/redemption/useRedemption";
import AdvancedTable from "../../../components/table/ResponsiveTable";
import RedemptionFormModal from "./RedemptionFormModal";
import RedemptionViewModal from "./RedemptionViewModal";
import { formatDate } from "../../../../utils/date&time/dateTime";

export default function Redemption() {
    const { data, isLoading, isError, refetch } = useAllRedemptions();
    const updateRedemption = useUpdateRedemption();
    const redemptionData = Array.isArray(data?.data) ? data.data : [];

    const [viewRow, setViewRow] = useState(null);
    const [editRow, setEditRow] = useState(null);
    const [loading, setLoading] = useState(false);

    // central renderCell
    const renderCell = (key, row) => {
        // Actions column
        if (key === "actions") {
            return (
                <div className="flex gap-1 justify-center">
                    <button
                        className="text-blue-500 hover:text-blue-700 p-1"
                        onClick={() => setViewRow(row)}
                        title="View"
                    >
                        <Eye size={16} />
                    </button>
                    {!row.status && (
                        <button
                            className="text-green-500 hover:text-green-700 p-1"
                            title="Edit"
                            onClick={() => setEditRow(row)}
                        >
                            <Edit size={16} />
                        </button>
                    )}
                </div>
            );
        }

        // Mobile column
        if (key === "mobile") {
            return `${row.mobile || ""}${row.mobile2 ? `, ${row.mobile2}` : ""}`;
        }

        // Address column
        if (key === "address") {
            return `${row.doorNo || ""} ${row.address1 || ""} ${row.address2 || ""}, ${row.area || ""}, ${row.city || ""}, ${row.country || ""} - ${row.pinCode || ""}`;
        }

        // Dates formatting
        if (key === "joinDate" || key === "maturityDate" || key === "lastPaidDate") {
            return row[key] ? formatDate(row[key]) : "-";
        }

        // Status highlight in table row
        if (key === "status") {
            return row.status ? (
                <span className="px-2 py-1 text-xs rounded bg-green-400 text-white font-semibold">Closed</span>
            ) : (
                <span className="px-2 py-1 text-xs rounded bg-yellow-200 text-gray-800 font-semibold">Open</span>
            );
        }

        return row[key] ?? "-";
    };

    // Table headers
    const headers = [
        { key: "sno", label: "S.No", align: "center" },
        { key: "pName", label: "User Name" },
        { key: "mobile", label: "Mobile" },
        { key: "joinDate", label: "Join Date" },
        { key: "maturityDate", label: "Maturity Date" },
        { key: "address", label: "Address" },
        { key: "state", label: "State" },
        { key: "status", label: "Status", align: "center" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    // handle update: only send sno
    const handleUpdate = async (sno) => {
        const confirmed = window.confirm(
            "Have you called the customer and want to close this redemption?"
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            await updateRedemption.mutateAsync({ sno });
            refetch();
        } catch (err) {
            console.error(err);
            alert("Failed to update redemption");
        } finally {
            setLoading(false);
        }
    };

    // add a row style for closed
    const rowClass = (row) => (row.status ? "bg-green-100" : "");

    return (
        <div className="p-3 mt-3">
            <h2 className="text-2xl font-semibold mb-4">Redemptions Centre</h2>

            <AdvancedTable
                data={redemptionData}
                headers={headers}
                isLoading={isLoading}
                isError={isError}
                emptyMessage={data?.message || "No data found"}
                onRetry={refetch}
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
                actionColumn="actions"
                renderCell={renderCell}
                rowClass={rowClass} // highlight closed rows
            />

            {/* View Modal */}
            {viewRow && (
                <RedemptionViewModal data={viewRow} onClose={() => setViewRow(null)} />
            )}

            {/* Edit Modal */}
            {editRow && (
                <RedemptionFormModal
                    editData={editRow}
                    onClose={() => setEditRow(null)}
                    onSuccess={() => {
                        setEditRow(null);
                        refetch();
                    }}
                    onUpdate={handleUpdate} // pass sno update callback
                    loading={loading}
                />
            )}
        </div>
    );
}
