import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import './DashboardCards.css';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import { Link } from 'react-router-dom';
import { MyContext } from '../../context/themeContext/themeContext';
import { useNavigate } from 'react-router-dom';
import {
    FaClock, FaShoppingBag, FaBox, FaBoxOpen, FaTruck, FaMapMarkerAlt, FaHome,
    FaSpinner, FaRedo, FaTimesCircle, FaUndo, FaMoneyBillWave, FaExclamationCircle,
    FaShoppingCart, FaCheckCircle, FaUsers, FaSearch, FaShippingFast, FaSync,
    FaArrowUp, FaArrowDown, FaEquals, FaExternalLinkAlt
} from 'react-icons/fa';
import { useAllOrderSummary } from '../../hooks/order/useAllOrder';

const iconMap = {
    "clock": <FaClock />,
    "shopping-bag": <FaShoppingBag />,
    "box": <FaBox />,
    "package": <FaBoxOpen />,
    "truck": <FaTruck />,
    "map-pin": <FaMapMarkerAlt />,
    "home": <FaHome />,
    "loader": <FaSpinner />,
    "alert-circle": <FaExclamationCircle />,
    "x-circle": <FaTimesCircle />,
    "rotate-ccw": <FaUndo />,
    "refresh-ccw": <FaMoneyBillWave />,
    "shopping-cart": <FaShoppingCart />,
    "check-circle": <FaCheckCircle />,
    "users": <FaUsers />,
    "search": <FaSearch />,
    "shipping-fast": <FaShippingFast />,
};

const DashboardCards = () => {
    const { themeMode } = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(60);
    const [showToast, setShowToast] = useState(false);
    const [activeView, setActiveView] = useState('overview');

    const navigate = useNavigate();

    const {
        data: summary,
        isLoading: summaryLoading,
        isError: summaryError,
        refetch
    } = useAllOrderSummary();

    console.log(summary, 'allOrderSummary');

    useEffect(() => {
        if (summary) {
            setLastUpdated(new Date());
            setIsLoading(false);
        }
    }, [summary]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            refetch();
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [refreshInterval, refetch]);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            await refetch();
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
            setLastUpdated(new Date());
        }
    }, [refetch]);

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

    // Enhanced cards data with different types
    const cardsData = useMemo(() => {
        if (!summary?.meta) return [];

        return [...summary.meta]
            .sort((a, b) => a.sequence - b.sequence)
            .map((item) => {
                let link = "/admin/AllOrderPage";
           

                switch (item.key) {
                    case "todayOrders":
                        link = "/admin/order/today";
                        break;

                    case "deliveredOrders":
                        link = "/admin/order/status/DELIVERED";
                        break;

                    case "totalUsers":
                        link = "/admin/userDetails";
                        break;

                    case "totalOrders":
                    default:
                        link = "/admin/AllOrderPage";
                        break;
                }

                return {
                    id: item.key,
                    title: item.label,
                    value: item.count,
                    icon: iconMap[item.key] || <FaBox />,
                    detail: item.description || "View details",
                    link,
                    type:
                        item.key === "todayOrders"
                            ? "primary"
                            : item.key === "totalOrders"
                                ? "secondary"
                                : item.key === "deliveredOrders"
                                    ? "success"
                                    : "info",
                    key: item.key
                };
            });
    }, [summary]);


    // Order status with progress indicators
    const orderStatusCards = useMemo(() => {
        if (!summary?.cards) return [];


        return [...summary.cards]
            .sort((a, b) => a.sequence - b.sequence)
            .map((status) => ({
                id: status.key,
                title: status.label,
                value: status.count,
                icon: iconMap[status.icon] || <FaBox />,
                detail: `${status.percentage}% of total orders`,
                status: status.key,
                path: `/admin/order/status/${status.key}`,
                progress: status.percentage || 0
            }));
    }, [summary]);

    // Analytics data for charts
    const analyticsData = useMemo(() => {
        if (!summary?.cards) return [];

        return summary.cards.map((card) => {
            let color = '#6b7280'; // default

            // Assign colors based on status
            if (card.key === 'DELIVERED') color = '#10b981';
            else if (card.key === 'IN_TRANSIT') color = '#ff960dff';
            else if (card.key === 'SHIPPED') color = '#3b82f6';
            else if (card.key === 'PACKED') color = '#970bf5ff';
            else if (card.key === 'PACKING') color = '#09796aff';
            else if (card.key === 'IN_PROCESSING') color = '#1b0bf5ff';
            else if (card.key === 'PLACED') color = '#9c7125ff';
            else if (card.key === 'PENDING') color = '#6b7280';
            else if (card.key === 'CANCELLED') color = '#ef4444';
            else if (card.key === 'RETURNED') color = '#8b5cf6';
            else if (card.key === 'REFUNDED') color = '#f59e0b';

            return {
                status: card.label,
                value: card.count,
                color
            };
        });
    }, [summary]);

    if (summaryError) {
        return (
            <motion.div
                className="dashboard-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col items-center text-red-600">
                    <FaTimesCircle className="error-icon" />
                    <h3>Data Loading Error</h3>
                    <p>Failed to load dashboard data</p>
                    <motion.button
                        className="flex bg-red-700 text-white p-2 text-xs items-center gap-1 rounded-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => refetch()}
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

            {isLoading || summaryLoading ? (
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
const OverviewView = ({ cardsData, orderStatusCards, formatNumber, themeMode }) => (
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
                    state={card.state}
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
                </div>
                <OrderDistributionChart data={analyticsData} />
            </div>
        </motion.div>
    </div>
);

// Stat Card Component
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
                        <Link to={card.link} state={{ key: card.status }} className="card-link">
                            View <FaExternalLinkAlt />
                        </Link>
                    </div>
                </div>
                <div className="card-footer">
                    <div className="card-detail">{card.detail}</div>
                </div>
            </div>
        </motion.div>
    );
});

// Order Status Card Component
const OrderStatusCard = React.memo(({ card, index, formatNumber, themeMode }) => {
    const navigate = useNavigate();

    const handleOnClick = (e, card) => {
        e.preventDefault();
        navigate(card.path);
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

// Order Distribution Chart Component
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

export default DashboardCards;