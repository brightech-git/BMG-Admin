import React from "react";
import { FiUsers, FiCreditCard, FiClipboard, FiDollarSign } from "react-icons/fi";
import '../css/Dashboard.css';

const kpiData = [
    { title: "Active Schemes", value: 12, icon: <FiClipboard className="text-2xl" />, bgColor: "bg-primary", textColor: "text-white" },
    { title: "Members Enrolled", value: 320, icon: <FiUsers className="text-2xl" />, bgColor: "bg-secondary", textColor: "text-white" },
    { title: "Collections Received", value: "₹1,25,000", icon: <FiDollarSign className="text-2xl" />, bgColor: "bg-success", textColor: "text-white" },
    { title: "Collections Pending", value: "₹25,000", icon: <FiCreditCard className="text-2xl" />, bgColor: "bg-warning", textColor: "text-white" },
];

const KPIcards = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiData.map((item, idx) => (
                <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg shadow-md ${item.bgColor} ${item.textColor}`}
                >
                    <div>
                        <p className="text-sm font-primary">{item.title}</p>
                        <p className="text-xl font-bold font-secondary mt-1">{item.value}</p>
                    </div>
                    <div>{item.icon}</div>
                </div>
            ))}
        </div>
    );
};

export default KPIcards;
