import React from "react";

const notifications = [
    { text: "Payment pending from Ravi Kumar", type: "warning" },
    { text: "Scheme Gold Saver completed", type: "completed" },
    { text: "New member Priya Singh enrolled", type: "success" },
];

const typeColors = {
    warning: "bg-warning text-black",
    completed: "bg-success text-white",
    success: "bg-info text-white",
};

const Notifications = () => (
    <div className="bg-card p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-secondary text-primary-text-color mb-4">Notifications</h2>
        <ul className="space-y-2">
            {notifications.map((n, idx) => (
                <li key={idx} className={`px-3 py-2 rounded-md text-sm ${typeColors[n.type]}`}>
                    {n.text}
                </li>
            ))}
        </ul>
    </div>
);

export default Notifications;
