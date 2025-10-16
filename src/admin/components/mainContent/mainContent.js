import React, { useContext } from 'react';
import DashboardCards from '../cards/DashboardCards';
import LatestOrders from '../cards/LatestOrders';
import { MyContext } from '../../context/themeContext/themeContext'; // adjust path if needed
import './MainContent.css';
import GlobalSnackbar from '../snackBar/GlobalSnackbar';
import { usePollNewOrders } from '../snackBar/usePollNewOrders';
import { orderService } from '../../service/orderService';
import { useNewOrderNotifier } from '../../context/snackbar/NewOrderContext';
import { useNavigate } from 'react-router-dom';

const MainContent = () => {
    const { themeMode } = useContext(MyContext);
    const { showNewOrder } = useNewOrderNotifier();
    const navigate = useNavigate();
    usePollNewOrders( orderService.getAllOrders);
    return (
        <main className={`main-content ${themeMode === 'dark' ? 'dark' : ''}`}>
            {/* Dashboard Cards Row */}
            <div>
               
            </div>
            <div className="dashboard-cards-section">
                <DashboardCards />
            </div>
            <button
                onClick={() => {
                    console.log("🚀 showNewOrder triggered");
                    showNewOrder({
                        message: "Test order received!",
                        type: "info",
                        action: {
                            label: "View Order",
                            navigateTo: "/order/status/placed",
                            state: {
                                key: "PLACED",
                                values: ["IN-PROCESSING", "CANCELLED"],
                            },
                        },
                        duration: 5000,
                    });
                }}
            >
                Trigger Test Snackbar
            </button>





            {/* Latest Orders Section */}
            <div className="latest-orders-section">
                <LatestOrders />
            </div>
        </main>
    );
};

export default MainContent;
