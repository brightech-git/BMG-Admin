import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const barData = [
    { name: "Gold Saver", collections: 50000 },
    { name: "Silver Growth", collections: 30000 },
    { name: "Platinum Plan", collections: 45000 },
    { name: "Diamond Saver", collections: 70000 },
];

const pieData = [
    { name: "Active", value: 12 },
    { name: "Completed", value: 8 },
];

const COLORS = ["#024908", "#cd865c"];

const ChartsPanel = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-card p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-secondary text-primary-text-color mb-4">Collections by Scheme</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="collections" fill="#cd865c" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-secondary text-primary-text-color mb-4">Scheme Status</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#024908" label>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartsPanel;
