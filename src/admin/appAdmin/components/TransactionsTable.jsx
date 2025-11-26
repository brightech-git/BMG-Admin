import React from "react";

const transactions = [
    { date: "25 Nov 2025", member: "Ravi Kumar", scheme: "Gold Saver", amount: "₹5,000", status: "Paid" },
    { date: "26 Nov 2025", member: "Priya Singh", scheme: "Silver Growth", amount: "₹3,000", status: "Pending" },
    { date: "27 Nov 2025", member: "Anil Sharma", scheme: "Platinum Plan", amount: "₹7,500", status: "Processing" },
    { date: "28 Nov 2025", member: "Sathya Priya", scheme: "Diamond Saver", amount: "₹10,000", status: "Cancelled" },
];

const statusColors = {
    Paid: "bg-success text-white",
    Pending: "bg-status-pending text-black",
    Processing: "bg-status-processing text-white",
    Cancelled: "bg-status-cancelled text-white",
};

const TransactionsTable = () => {
    return (
        <div className="bg-card p-4 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-lg font-secondary text-primary-text-color mb-4">Recent Transactions</h2>
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="bg-background-color text-left">
                        <th className="px-4 py-2 font-primary text-sm border-b">Date</th>
                        <th className="px-4 py-2 font-primary text-sm border-b">Member</th>
                        <th className="px-4 py-2 font-primary text-sm border-b">Scheme</th>
                        <th className="px-4 py-2 font-primary text-sm border-b">Amount</th>
                        <th className="px-4 py-2 font-primary text-sm border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-gray-100 transition">
                            <td className="px-4 py-2">{tx.date}</td>
                            <td className="px-4 py-2">{tx.member}</td>
                            <td className="px-4 py-2">{tx.scheme}</td>
                            <td className="px-4 py-2">{tx.amount}</td>
                            <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[tx.status]}`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;
