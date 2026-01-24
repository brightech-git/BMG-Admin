import React from "react";
import { X } from "lucide-react";
import { formatDate } from "../../../../utils/date&time/dateTime";

export default function RedemptionViewModal({ data, onClose }) {
    if (!data) return null;

    // Convert data into key-value pairs for display
    const rows = Object.entries(data);

    const formatValue = (key, value) => {
        if (key === "address") {
            return `${data.doorNo || ""} ${data.address1 || ""} ${data.address2 || ""}, ${data.area || ""}, ${data.city || ""}, ${data.country || ""} - ${data.pinCode || ""}`;
        }
        if (key === "mobile") {
            return `${data.mobile || ""}${data.mobile2 ? `, ${data.mobile2}` : ""}`;
        }
        if (["joinDate", "maturityDate", "lastPaidDate", "updateTime"].includes(key)) {
            return value ? formatDate(value) : "";
        }
        return value ?? "-";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg relative overflow-auto max-h-[80vh]">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center">Redemption Details</h2>

                <table className="w-full border border-gray-200 text-sm">
                    <tbody>
                        {rows.map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-200">
                                <td className="px-4 py-2 font-medium text-gray-700 capitalize w-1/3">
                                    {key.replace(/([A-Z])/g, " $1")}
                                </td>
                                <td className="px-4 py-2">{formatValue(key, value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 flex justify-center">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
