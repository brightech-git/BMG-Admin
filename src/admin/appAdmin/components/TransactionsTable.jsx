import React from "react";

const statusColors = {
    Paid: "bg-green-500 text-white",
    Pending: "bg-yellow-400 text-black",
    Processing: "bg-blue-500 text-white",
    Cancelled: "bg-red-500 text-white",
};

const TransactionsTable = ({ dashData }) => {

    const transactions = dashData?.recentTransactions || [];

    // Format date to DD-MM-YYYY
    const formatDate = (date) => {
        if (!date) return "-";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const formatAmount = (amount) => {
        if (!amount) return "₹0";
        return `₹${Number(amount).toLocaleString("en-IN")}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">

            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Recent Transactions
            </h2>

            <div className="border border-gray-200 rounded-md overflow-hidden">

                {/* Header */}
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr className="text-sm text-gray-600 text-left">
                            <th className="px-4 py-2 border-b">Date</th>
                            <th className="px-4 py-2 border-b">Member</th>
                            <th className="px-4 py-2 border-b">Scheme</th>
                            <th className="px-4 py-2 border-b text-right">Amount</th>
                        </tr>
                    </thead>
                </table>

                {/* Scrollable body (5 rows visible) */}
                <div className="max-h-[250px] overflow-y-auto">

                    <table className="min-w-full">

                        <tbody>

                            {transactions.length > 0 ? (
                                transactions.map((tx, index) => (

                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50 transition-colors"
                                    >

                                        <td className="px-4 py-2 border-b text-sm">
                                            {formatDate(tx.rdate)}
                                        </td>

                                        <td className="px-4 py-2 border-b text-sm font-medium">
                                            {tx.pname}
                                        </td>

                                        <td className="px-4 py-2 border-b text-sm">
                                            {tx.schemeName}
                                        </td>

                                        <td className="px-4 py-2 border-b text-sm text-right font-semibold">
                                            {formatAmount(tx.amount)}
                                        </td>

                                    </tr>

                                ))
                            ) : (

                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-6 text-sm text-gray-500"
                                    >
                                        No recent transactions found
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default TransactionsTable;