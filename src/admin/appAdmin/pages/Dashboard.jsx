import React from "react";
import KPIcards from "../components/KPIcards";
import TransactionsTable from "../components/TransactionsTable";
import ChartsPanel from "../components/ChartsPanel";
import QuickActions from "../components/QuickActions";
import Notifications from "../components/Notifications";

const DashboardPage = () => {
    return (
        <div className="bg-background-color p-4 max-w-8xl mt-6 font-primary">
            {/* Header */}
         

            {/* KPI Cards */}
            <KPIcards />

            {/* Charts Panel */}
            <ChartsPanel />

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Left Column: Transactions Table */}
                <div className="lg:col-span-2">
                    <TransactionsTable />
                </div>

                {/* Right Column: Quick Actions + Notifications */}
                <div className="flex flex-col gap-6">
                    <QuickActions />
                    <Notifications />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
