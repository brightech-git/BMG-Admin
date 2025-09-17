import React, { useContext } from 'react';
import DashboardCards from '../cards/DashboardCards';
import LatestOrders from '../cards/LatestOrders';
import { MyContext } from '../../context/themeContext/themeContext'; // adjust path if needed
import './MainContent.css';

const MainContent = () => {
    const { themeMode } = useContext(MyContext);

    return (
        <main className={`main-content ${themeMode === 'dark' ? 'dark' : ''}`}>
            {/* Dashboard Cards Row */}
            <div className="dashboard-cards-section">
                <DashboardCards />
            </div>

            {/* Latest Orders Section */}
            <div className="latest-orders-section">
                <LatestOrders />
            </div>
        </main>
    );
};

export default MainContent;
