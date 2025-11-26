import React from "react";
import { FiPlusCircle, FiUserPlus, FiFileText, FiDownload } from "react-icons/fi";

const actions = [
    { title: "Create Scheme", icon: <FiPlusCircle className="text-2xl" /> },
    { title: "Add Member", icon: <FiUserPlus className="text-2xl" /> },
    { title: "Record Payment", icon: <FiFileText className="text-2xl" /> },
    { title: "Export Data", icon: <FiDownload className="text-2xl" /> },
];

const QuickActions = () => (
    <div className="bg-card p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-secondary text-primary-text-color mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
            {actions.map((action, idx) => (
                <button key={idx} className="flex items-center gap-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                    {action.icon}
                    {action.title}
                </button>
            ))}
        </div>
    </div>
);

export default QuickActions;
