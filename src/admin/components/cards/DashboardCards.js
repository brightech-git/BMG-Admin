import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import './DashboardCards.css';
import { getDashboardData } from '../../service/dashBoardService';
import { useOrdersByStatus } from '../../hooks/order/useAllOrder';
import {
    FaUsers, FaShoppingCart, FaCheckCircle, FaShoppingBag, FaCogs,
    FaBoxes, FaRocket, FaPlane, FaBan, FaExchangeAlt, FaCreditCard,
    FaTimesCircle, FaRedo, FaChevronUp, FaChevronDown, FaExternalLinkAlt,
    FaSync, FaChartLine, FaDollarSign, FaClock, FaTruck, FaBoxOpen,
    FaEllipsisH, FaArrowUp, FaArrowDown, FaEquals,
    FaSearch, FaBox, FaShippingFast, FaUndo, FaMoneyBillWave,
    FaClipboardCheck, FaEye, FaArchive, FaPaperPlane, FaCar,
    FaMotorcycle, FaHome, FaMapMarkerAlt, FaReceipt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import { Link } from 'react-router-dom';
import { MyContext } from '../../context/themeContext/themeContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isWithinInterval } from "date-fns";
import { useOrdersByDateRange } from '../../hooks/order/useAllOrder';

const DashboardCards = () => {
    const { themeMode } = useContext(MyContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [todayOrders, setTodayOrders] = useState([]);
    const [refreshInterval, setRefreshInterval] = useState(60);
    const [showToast, setShowToast] = useState(false);
    const [activeView, setActiveView] = useState('overview'); // 'overview' | 'analytics'

    const today = new Date();
    const formattedStartDate = format(today, 'yyyy-MM-dd');
    const formattedEndDate = format(today, 'yyyy-MM-dd');

    const { data: orders = [], isError, refetch } = useOrdersByDateRange(
        formattedStartDate,
        formattedEndDate
    );

    useEffect(() => {
        if (!Array.isArray(orders)) return;

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const filtered = orders.filter((order) =>
            isWithinInterval(parseISO(order.orderTime), { start, end })
        );

        setTodayOrders(filtered);
    }, [orders]);

    const page = 0;
    const size = 100000;
    const { data: pendingOrders, isLoading: loadingPending } = useOrdersByStatus("PENDING", page, size);
    const { data: placedOrders, isLoading: loadingPlaced } = useOrdersByStatus("PLACED", page, size);
    const { data: inProcessingOrders, isLoading: loadingProcessing } = useOrdersByStatus("IN_PROCESSING", page, size);
    const { data: PackingOrders, isLoading: loadingPacking } = useOrdersByStatus("PACKING", page, size);
    const { data: packedOrders, isLoading: loadingPacked } = useOrdersByStatus("PACKED", page, size);
    const { data: shippedOrders, isLoading: loadingShipped } = useOrdersByStatus("SHIPPED", page, size);
    const { data: inTransitOrders, isLoading: loadingTransit } = useOrdersByStatus("IN_TRANSIT", page, size);
    const { data: deliveredOrders, isLoading: loadingDelivered } = useOrdersByStatus("DELIVERED", page, size);
    const { data: cancelledOrders, isLoading: loadingCancelled } = useOrdersByStatus("CANCELLED", page, size);
    const { data: returnedOrders, isLoading: loadingReturned } = useOrdersByStatus("RETURNED", page, size);
    const { data: refundedOrders, isLoading: loadingRefunded } = useOrdersByStatus("REFUNDED", page, size);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getDashboardData();
            setTotalUsers(data?.totalUsers || 0);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        const intervalId = setInterval(fetchDashboardData, refreshInterval * 1000);
        return () => clearInterval(intervalId);
    }, [fetchDashboardData, refreshInterval]);

    const handleRefreshIntervalChange = useCallback((event) => {
        setRefreshInterval(Number(event.target.value));
    }, []);

    const formatNumber = useCallback((num, options = {}) => {
        const { isCurrency = false, currency = 'USD' } = options;
        if (isNaN(num) || num === null) return '-';
        if (isCurrency) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(num);
        }
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toLocaleString();
    }, []);

    const calculateChange = useCallback((cardId, dashboardData) => {
        const percentageMap = {
            totalOrders: dashboardData?.totalPercentage,
            deliveredOrders: dashboardData?.deliveredPercentage,
            shippedOrders: dashboardData?.shippedPercentage,
            cancelledOrders: dashboardData?.cancelledPercentage
        };

        if (percentageMap[cardId]) {
            const percentageValue = parseFloat(percentageMap[cardId]);
            return {
                value: Math.abs(percentageValue),
                direction: percentageValue > 5 ? 'up' : percentageValue < -5 ? 'down' : 'neutral'
            };
        }
        return { value: 0, direction: 'neutral' };
    }, []);

    // Enhanced cards data with different types
    const cardsData = useMemo(() => {
        if (!dashboardData) return [];
        return [
            {
                id: 'todayOrders',
                title: 'Today Orders',
                value: todayOrders.length,
                icon: <FaShoppingCart />,
                detail: 'All orders placed today',
                link: 'order/today',
                type: 'primary',
                trend: 12.5
            },
            {
                id: 'totalOrders',
                title: 'Total Orders',
                value: dashboardData.totalOrders,
                icon: <FaBoxOpen />,
                detail: 'All time orders',
                link: 'AllOrderPage',
                type: 'secondary',
                trend: 8.2
            },
            {
                id: 'deliveredOrders',
                title: 'Delivered',
                value: dashboardData.deliveredOrders,
                icon: <FaCheckCircle />,
                detail: 'Successfully delivered',
                link: 'order/status/delivered',
                type: 'success',
                trend: 15.3
            },
            {
                id: 'totalUsers',
                title: 'Total Users',
                value: dashboardData.totalUsers,
                icon: <FaUsers />,
                detail: 'Active registered users',
                link: 'userDetails',
                type: 'info',
                trend: 5.7
            },
        ].filter(card => !isNaN(card.value));
    }, [dashboardData, todayOrders]);

    // Order status with progress indicators
    const orderStatusCards = useMemo(() => {
        if (!dashboardData) return [];
        const total = dashboardData.totalOrders || 1;

        return [
            {
                id: 'pending',
                title: 'Payment Pending',
                value: dashboardData.pendingOrders || 0,
                icon: <FaClock />,
                detail: 'Awaiting payment',
                status: 'PENDING',
                path: '/admin/order/status/pending',
                key: 'PENDING',
                values: ['IN_PROCESSING', 'CANCELLED'],
                progress: ((dashboardData.pendingOrders || 0) / total) * 100
            },
            {
                id: 'placed',
                title: 'Order Placed',
                value: dashboardData.placedOrders || 0,
                icon: <FaShoppingBag />,
                detail: 'Recently placed',
                status: 'PLACED',
                path: '/admin/order/status/placed',
                key: 'PLACED',
                values: ['IN_PROCESSING', 'CANCELLED'],
                progress: ((dashboardData.placedOrders || 0) / total) * 100
            },
            {
                id: 'inProcessing',
                title: 'QC Check',
                value: dashboardData.inProcessingOrders || 0,
                icon: <FaSearch />, // Quality check icon
                detail: 'Quality control',
                status: 'IN_PROCESSING',
                path: '/admin/order/status/qc',
                key: 'IN_PROCESSING',
                values: ['PACKING', 'CANCELLED'],
                progress: ((dashboardData.inProcessingOrders || 0) / total) * 100
            },
            {
                id: 'packing',
                title: 'Packing',
                value: dashboardData.PackingOrders || 0,
                icon: <FaBoxOpen />, // Better packing icon
                detail: 'Being packed',
                status: 'PACKING',
                path: '/admin/order/status/packing',
                key: 'PACKING',
                values: ['PACKED', 'CANCELLED'],
                progress: ((dashboardData.PackingOrders || 0) / total) * 100
            },
            {
                id: 'packed',
                title: 'Packed',
                value: dashboardData.packedOrders || 0,
                icon: <FaBox />, // Packed box icon
                detail: 'Ready for shipment',
                status: 'PACKED',
                path: '/admin/order/status/packed',
                key: 'PACKED',
                values: ['SHIPPED', 'CANCELLED'],
                progress: ((dashboardData.packedOrders || 0) / total) * 100
            },
            {
                id: 'shipped',
                title: 'Shipped',
                value: dashboardData.shippedOrders || 0,
                icon: <FaShippingFast />, // Shipping icon
                detail: 'Order shipped',
                status: 'SHIPPED',
                path: '/admin/order/status/shipped',
                key: 'SHIPPED',
                values: ['IN_TRANSIT', 'CANCELLED'],
                progress: ((dashboardData.shippedOrders || 0) / total) * 100
            },
            {
                id: 'intransit',
                title: 'In Transit',
                value: dashboardData.inTransitOrders || 0,
                icon: <FaTruck />, // Truck icon for transit
                detail: 'On the way',
                status: 'IN_TRANSIT',
                path: '/admin/order/status/in-transit',
                key: 'IN_TRANSIT',
                values: ['DELIVERED', 'CANCELLED'],
                progress: ((dashboardData.inTransitOrders || 0) / total) * 100
            },
            {
                id: 'delivery',
                title: 'Delivered',
                value: dashboardData.deliveredOrders || 0,
                icon: <FaCheckCircle />, // Check mark for delivered
                detail: 'Successfully delivered',
                status: 'DELIVERED',
                path: '/admin/order/status/delivered',
                key: 'DELIVERED',
                values: ['COMPLETED'],
                progress: ((dashboardData.deliveredOrders || 0) / total) * 100
            },
            {
                id: 'cancel',
                title: 'Cancelled',
                value: dashboardData.cancelledOrders || 0,
                icon: <FaTimesCircle />, // X mark for cancelled
                detail: 'Cancelled orders',
                status: 'CANCELLED',
                path: '/admin/order/status/cancelled',
                key: 'CANCELLED',
                values: ['CLOSED'],
                progress: ((dashboardData.cancelledOrders || 0) / total) * 100
            },
            {
                id: 'returned',
                title: 'Returned',
                value: dashboardData.returnedOrders || 0,
                icon: <FaUndo />, // Return/undo icon
                detail: 'Order returned',
                status: 'RETURNED',
                path: '/admin/order/status/returned',
                key: 'RETURNED',
                values: ['REFUNDED', 'CLOSED'],
                progress: ((dashboardData.returnedOrders || 0) / total) * 100
            },
            {
                id: 'refund',
                title: 'Refunded',
                value: dashboardData.refundedOrders || 0,
                icon: <FaMoneyBillWave />, // Money icon for refund
                detail: 'Payment refunded',
                status: 'REFUNDED',
                path: '/admin/order/status/refunded',
                key: 'REFUNDED',
                values: ['CLOSED'],
                progress: ((dashboardData.refundedOrders || 0) / total) * 100
            },
        ];
    }, [dashboardData]);

    // Analytics data for charts
    const analyticsData = useMemo(() => {
        if (!dashboardData) return [];
        return [
            { status: 'Delivered', value: dashboardData.deliveredOrders || 0, color: '#10b981' },
            { status: 'InTransit', value: dashboardData.inTransitOrders || 0, color: '#ff960dff' },
            { status: 'Shipped', value: dashboardData.shippedOrders || 0, color: '#3b82f6' },
            { status: 'Packed', value: dashboardData.packedOrders || 0, color: '#970bf5ff' },
            { status: 'Packing', value: dashboardData.PackingOrders || 0, color: '#09796aff' },
            { status: 'Processing', value: dashboardData.inProcessingOrders || 0, color: '#1b0bf5ff' },
            { status: 'Placed', value: dashboardData.placedOrders || 0, color: '#9c7125ff' },
            { status: 'Pending', value: dashboardData.pendingOrders || 0, color: '#6b7280' },
            { status: 'Cancelled', value: dashboardData.cancelledOrders || 0, color: '#ef4444' },
        ];
    }, [dashboardData]);

    useEffect(() => {
        if (
            !pendingOrders &&
            !placedOrders &&
            !inProcessingOrders &&
            !PackingOrders &&
            !packedOrders &&
            !shippedOrders &&
            !inTransitOrders &&
            !deliveredOrders &&
            !cancelledOrders &&
            !returnedOrders &&
            !refundedOrders
        ) return;

        const transformedData = {
            totalUsers: totalUsers || 0,
            totalOrders:
                (pendingOrders?.totalByStatus || 0) +
                (placedOrders?.totalByStatus || 0) +
                (inProcessingOrders?.totalByStatus || 0) +
                (PackingOrders?.totalByStatus || 0) +
                (packedOrders?.totalByStatus || 0) +
                (shippedOrders?.totalByStatus || 0) +
                (inTransitOrders?.totalByStatus || 0) +
                (deliveredOrders?.totalByStatus || 0) +
                (cancelledOrders?.totalByStatus || 0) +
                (returnedOrders?.totalByStatus || 0) +
                (refundedOrders?.totalByStatus || 0),

            pendingOrders: pendingOrders?.totalByStatus || 0,
            placedOrders: placedOrders?.totalByStatus || 0,
            inProcessingOrders: inProcessingOrders?.totalByStatus || 0,
            PackingOrders: PackingOrders?.totalByStatus || 0,
            packedOrders: packedOrders?.totalByStatus || 0,
            shippedOrders: shippedOrders?.totalByStatus || 0,
            inTransitOrders: inTransitOrders?.totalByStatus || 0,
            deliveredOrders: deliveredOrders?.totalByStatus || 0,
            cancelledOrders: cancelledOrders?.totalByStatus || 0,
            returnedOrders: returnedOrders?.totalByStatus || 0,
            refundedOrders: refundedOrders?.totalByStatus || 0,
            totalPercentage: placedOrders?.percentage || "0%",
            deliveredPercentage: deliveredOrders?.percentage || "0%",
            shippedPercentage: shippedOrders?.percentage || "0%",
            cancelledPercentage: cancelledOrders?.percentage || "0%",
        };

        setDashboardData(transformedData);
        setLastUpdated(new Date());
        setIsLoading(false);
    }, [
        pendingOrders, placedOrders, inProcessingOrders, PackingOrders,
        packedOrders, shippedOrders, inTransitOrders, deliveredOrders,
        cancelledOrders, returnedOrders, refundedOrders, totalUsers
    ]);

    if (error) {
        return (
            <motion.div
                className="dashboard-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="error-message">
                    <FaTimesCircle className="error-icon" />
                    <h3>Data Loading Error</h3>
                    <p>{error}</p>
                    <motion.button
                        className="retry-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchDashboardData()}
                    >
                        <FaRedo className="mr-2" />
                        Retry
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`dashboard-container ${themeMode}`}>
            <div className="dashboard-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="header-content"
                >
                    <div className="header-text">
                        <h1>Hi, Welcome back 👋</h1>
                        {lastUpdated && (
                            <p className="last-updated">
                                Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="header-controls">
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${activeView === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveView('overview')}
                            >
                                Overview
                            </button>
                            <button
                                className={`toggle-btn ${activeView === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveView('analytics')}
                            >
                                Analytics
                            </button>
                        </div>
                        <div className="refresh-controls">
                            <select
                                value={refreshInterval}
                                onChange={handleRefreshIntervalChange}
                                className="refresh-interval-select"
                            >
                                <option value={30}>30s</option>
                                <option value={60}>60s</option>
                                <option value={120}>120s</option>
                            </select>
                            <motion.button
                                className="refresh-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchDashboardData}
                            >
                                <FaSync className="m-1" />
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="toast-notification"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        Data refreshed successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <motion.div
                    className="loading-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Loader />
                    <p>Loading dashboard data...</p>
                </motion.div>
            ) : (
                <>
                    {activeView === 'overview' ? (
                        <OverviewView
                            cardsData={cardsData}
                            orderStatusCards={orderStatusCards}
                            formatNumber={formatNumber}
                            themeMode={themeMode}
                            dashboardData={dashboardData}
                        />
                    ) : (
                        <AnalyticsView
                            analyticsData={analyticsData}
                            cardsData={cardsData}
                            formatNumber={formatNumber}
                            themeMode={themeMode}
                        />
                    )}
                </>
            )}
        </div>
    );
};

// Overview View Component
const OverviewView = ({ cardsData, orderStatusCards, formatNumber, themeMode, dashboardData }) => (
    <>
        <motion.div
            className="stats-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
            {cardsData.map((card, index) => (
                <StatCard
                    key={card.id}
                    card={card}
                    index={index}
                    formatNumber={formatNumber}
                    themeMode={themeMode}
                />
            ))}
        </motion.div>

        <div className="dashboard-content">
            <motion.div
                className="order-status-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="section-header">
                    <h5>Order Status Overview</h5>
                    <p>Track all order statuses in real-time</p>
                </div>

                <div className="order-status-grid">
                    {orderStatusCards.map((card, index) => (
                        <OrderStatusCard
                            key={card.id}
                            card={card}
                            index={index}
                            formatNumber={formatNumber}
                            themeMode={themeMode}
                        />
                    ))}
                </div>
            </motion.div>

            {/* <motion.div
                className="quick-stats-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="section-header">
                    <h2>Quick Stats</h2>
                    <p>Key performance indicators</p>
                </div>
                {/* <QuickStats dashboardData={dashboardData} formatNumber={formatNumber} themeMode={themeMode} />
        </motion.div>  */}

        </div>
    </>
);

// Analytics View Component
const AnalyticsView = ({ analyticsData, cardsData, formatNumber, themeMode }) => (
    <div className="analytics-view">
        <motion.div
            className="analytics-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="analytics-card full-width">
                <div className="card-header">
                    <h3>Order Distribution</h3>
                    {/* <button className="icon-btn">
                        <FaEllipsisH />
                    </button> */}
                </div>
                <OrderDistributionChart data={analyticsData} />
            </div>

            {/* <div className="analytics-card">
                <div className="card-header">
                    <h3>Performance Metrics</h3>
                </div>
                <PerformanceMetrics cardsData={cardsData} />
            </div> */}

            {/* <div className="analytics-card">
                <div className="card-header">
                    <h3>Recent Activity</h3>
                </div>
                {/* <RecentActivity /> 
            </div> */}

        </motion.div>
    </div>
);

// New Card Components
const StatCard = React.memo(({ card, index, formatNumber, themeMode }) => {
    const getTrendIcon = (trend) => {
        if (trend > 0) return <FaArrowUp className="trend-up" />;
        if (trend < 0) return <FaArrowDown className="trend-down" />;
        return <FaEquals className="trend-neutral" />;
    };

    return (
        <motion.div
            className={`stat-card ${card.type} ${themeMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
        >
            <div className="card-content">
                <div className="card-main">
                    <div className="card-icon-wrapper">
                        {card.icon}
                    </div>
                    <div className="card-values">
                        <h3 className="card-title">{card.title}</h3>
                        <p className="card-value">{formatNumber(card.value)}</p>
                    </div>
                    <div>
                        <Link to={card.link} className="card-link">
                            View <FaExternalLinkAlt />
                        </Link>
                    </div>
                </div>
                {/* <div className="card-footer">
                    <div className="trend-indicator">
                        {getTrendIcon(card.trend)}
                        <span className={`trend-value ${card.trend > 0 ? 'positive' : card.trend < 0 ? 'negative' : 'neutral'}`}>
                            {Math.abs(card.trend)}%
                        </span>
                    </div>
                   
                </div> */}
            </div>
        </motion.div>
    );
});

const OrderStatusCard = React.memo(({ card, index, formatNumber, themeMode }) => {
    const navigate = useNavigate();

    const handleOnClick = (e, card) => {
        e.preventDefault();
        navigate(card.path, {
            state: {
                key: card.key,
                values: card.values,
                qc: card.status
            }
        });
    };

    return (
        <motion.div
            className={`order-status-card ${themeMode}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => handleOnClick(e, card)}
        >
            <div className="status-header">
                <div className="status-icon" style={{ background: 'var(--primary-color)' }}>
                    {card.icon}
                </div>
                <div className="status-info">
                    <div className="status-title">{card.title}</div>
                    <div className="status-value">{formatNumber(card.value)}</div>
                </div>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${card.progress}%` }}
                ></div>
            </div>
            <div className="status-detail">{card.detail}</div>
        </motion.div>
    );
});

// const QuickStats = ({ dashboardData, formatNumber, themeMode }) => (
//     <div className="quick-stats">
//         <div className="quick-stat-item">
//             <div className="stat-label">Success Rate</div>
//             <div className="stat-value success">94.2%</div>
//         </div>
//         <div className="quick-stat-item">
//             <div className="stat-label">Avg. Process Time</div>
//             <div className="stat-value">2.3h</div>
//         </div>
//         <div className="quick-stat-item">
//             <div className="stat-label">Cancellation Rate</div>
//             <div className="stat-value error">3.1%</div>
//         </div>
//     </div>
// );

const OrderDistributionChart = ({ data }) => (
    <div className="distribution-chart">
        {data.map((item, index) => (
            <div key={item.status} className="chart-item">
                <div className="chart-bar">
                    <motion.div
                        className="chart-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        style={{ backgroundColor: item.color }}
                    />
                </div>
                <div className="chart-label">
                    <span className="chart-dot" style={{ backgroundColor: item.color }}></span>
                    {item.status}
                    <span className="chart-value">{item.value}</span>
                </div>
            </div>
        ))}
    </div>
);

// const PerformanceMetrics = ({ cardsData }) => (
//     <div className="performance-metrics">
//         {cardsData.map((card, index) => (
//             <div key={card.id} className="metric-item">
//                 <div className="metric-icon">{card.icon}</div>
//                 <div className="metric-info">
//                     <div className="metric-title">{card.title}</div>
//                     <div className="metric-value">{card.value}</div>
//                 </div>
//                 <div className={`metric-trend ${card.trend > 0 ? 'positive' : 'negative'}`}>
//                     {card.trend > 0 ? '+' : ''}{card.trend}%
//                 </div>
//             </div>
//         ))}
//     </div>
// );

// const RecentActivity = () => (
//     <div className="recent-activity">
//         {[
//             { action: 'New order placed', time: '2 min ago', type: 'order' },
//             { action: 'User registration', time: '5 min ago', type: 'user' },
//             { action: 'Order delivered', time: '10 min ago', type: 'delivery' },
//             { action: 'Payment received', time: '15 min ago', type: 'payment' },
//         ].map((activity, index) => (
//             <div key={index} className="activity-item">
//                 <div className="activity-dot"></div>
//                 <div className="activity-content">
//                     <div className="activity-action">{activity.action}</div>
//                     <div className="activity-time">{activity.time}</div>
//                 </div>
//             </div>
//         ))}
//     </div>
// );

export default DashboardCards;