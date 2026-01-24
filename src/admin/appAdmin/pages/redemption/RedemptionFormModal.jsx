import React, { useState } from "react";
import { X } from "lucide-react";
import { useUpdateRedemption } from "../../hooks/redemption/useRedemption";
import { formatDate } from "../../../../utils/date&time/dateTime";

export default function RedemptionFormModal({ editData, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const updateRedemption = useUpdateRedemption();

    if (!editData) return null;

    console.log(editData.sno ,'sno')

    const handleSave = async () => {
        const confirmed = window.confirm(
            "Have you called the customer and want to close this redemption?"
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            await updateRedemption.mutateAsync(editData.sno); // only sno needed
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to update redemption");
        } finally {
            setLoading(false);
        }
    };

    const allFields = Object.keys(editData);

    const renderValue = (key) => {
        if (key === "address") {
            return `${editData.doorNo || ""} ${editData.address1 || ""} ${editData.address2 || ""}, ${editData.area || ""}, ${editData.city || ""}, ${editData.country || ""} - ${editData.pinCode || ""}`;
        }
        if (key === "mobile") {
            return `${editData.mobile || ""}${editData.mobile2 ? `, ${editData.mobile2}` : ""}`;
        }
        if (["joinDate", "maturityDate", "lastPaidDate", "updateTime"].includes(key)) {
            return editData[key] ? formatDate(editData[key]) : "-";
        }
        return editData[key] ?? "-";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center">Redemption Details</h2>

                <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                    {allFields.map((key) => (
                        <div key={key} className="flex flex-col">
                            <label className="text-xs font-medium text-gray-600 mb-1">{key}</label>
                            <span className="text-sm text-gray-700">{renderValue(key)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-center gap-3">
                    {!editData.status && (
                        <button
                            className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Close Redemption"}
                        </button>
                    )}

                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
