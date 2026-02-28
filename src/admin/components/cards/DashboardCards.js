import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import { Link } from 'react-router-dom';
import { MyContext } from '../../context/themeContext/themeContext';
import { useNavigate } from 'react-router-dom';
import {
    FaClock, FaShoppingBag, FaBox, FaBoxOpen, FaTruck, FaMapMarkerAlt, FaHome,
    FaSpinner, FaRedo, FaTimesCircle, FaUndo, FaMoneyBillWave, FaExclamationCircle,
    FaShoppingCart, FaCheckCircle, FaUsers, FaSearch, FaShippingFast, FaSync,
    FaArrowUp, FaArrowDown, FaEquals, FaExternalLinkAlt, FaChartLine
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
    "navigation": <FaMapMarkerAlt />,
};

const DashboardCards = () => {

    const { themeMode } = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(60);
    const [showToast, setShowToast] = useState(false);
    const [activeView, setActiveView] = useState('overview');

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


    // Map of order status → color
    const statusColorMap = {
        // ======================
        // ORDER FLOW
        // ======================
        DELIVERED: "#10b981",          // emerald
        IN_TRANSIT: "#f59e0b",         // amber
        SHIPPED: "#3b82f6",            // blue
        PACKING: "#8b5cf6",            // violet
        IN_PROCESSING: "#6366f1",      // indigo
        PENDING: "#9ca3af",            // gray
        PLACED: "#f97316",             // orange
        CANCELLED: "#ef4444",          // red
        RETURNED: "#7c3aed",           // deeper violet (changed)
        REFUNDED: "#059669",           // strong green (changed)
        NOT_DELIVERED: "#dc2626",      // dark red
        OUT_FOR_DELIVERY: "#14b8a6",   // teal
        READY_TO_SHIP: "#a855f7",      // purple
        PARTIALLY_RETURNED: "#d97706", // darker amber
        PACKED: "#2563eb",             // deeper blue

        // ======================
        // REFUND FLOW
        // ======================
        REQUESTED: "#0ea5e9",   // sky blue (new request initiated)
        APPROVED: "#22c55e",    // green (positive approval)
        REJECTED: "#ef4444",    // red (clear rejection)
        RECEIVED: "#6366f1",    // indigo (item received back)
    };

    // Function to get color safely
    // Helper function to normalize and get color
    const getStatusColor = (key) => {
        if (!key) return "#9ca3af"; // default gray
        const normalizedKey = key.replace(/\s+/g, "_").toUpperCase();
        return statusColorMap[normalizedKey] || "#9ca3af";
    };
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

                // Calculate trend (random for demo - replace with actual trend data)
                const trend = Math.floor(Math.random() * 20) - 10;

                return {
                    id: item.key,
                    title: item.label,
                    value: item.count,
                    icon: iconMap[item.key] || <FaBox />,
                    detail: `${item.count} ${item.label.toLowerCase()}`,
                    link,
                    type: item.key === "todayOrders" ? "primary"
                        : item.key === "totalOrders" ? "secondary"
                            : item.key === "deliveredOrders" ? "success"
                                : "info",
                    key: item.key,
                    trend
                };
            });
    }, [summary]);

    // Build order status cards with colors
    const orderStatusCards = useMemo(() => {
        if (!summary?.cards) return [];

        return [...summary.cards]
            .sort((a, b) => a.sequence - b.sequence)
            .map((status) => ({
                id: status.key,
                title: status.label.toUpperCase(), // normalize to uppercase
                value: status.count,
                icon: iconMap[status.icon] || <FaBox />,
                detail: `${status.percentage.toFixed(2)}% of total orders`,
                status: status.key,
                path: `/admin/order/status/${status.key}`,
                progress: status.percentage || 0,
                percentage: status.percentage,
                color: getStatusColor(status.key), // <-- dynamic background color
            }));
    }, [summary]);

    // Build order status cards with colors
    const returnOrderCards = useMemo(() => {
        if (!summary?.refundSummary) return [];

        return [...summary.refundSummary]
            .sort((a, b) => a.sequence - b.sequence)
            .map((status) => ({
                id: status.key,
                title: status.label.toUpperCase(), // normalize to uppercase
                value: status.count,
                icon: iconMap[status.icon] || <FaBox />,
                detail: `${status.percentage.toFixed(2)}% of total orders`,
                status: status.key,
                path: `/admin/order/refund/status/${status.key}`,
                progress: status.percentage || 0,
                percentage: status.percentage,
                color: getStatusColor(status.key), // <-- dynamic background color
            }));
    }, [summary]);


    const analyticsData = useMemo(() => {
        if (!summary?.cards) return [];

        return summary.cards.map((card) => {
            const normalizedKey = card.key.replace(/\s+/g, "_").toUpperCase();
            const color = statusColorMap[normalizedKey] || "#9ca3af";
            console.log(color,'color')

            return {
                status: card.label.toUpperCase(),
                value: card.count,
                color,
                percentage: card.percentage,
            };
        });
    }, [summary]);

    // Calculate total orders
    const totalOrders = useMemo(() => {
        return summary?.cards?.reduce((acc, card) => acc + card.count, 0) || 0;
    }, [summary]);

    if (summaryError) {
        return (
            <motion.div
                className="w-full max-w-full mx-auto p-4 bg-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col items-center justify-center py-12 text-red-600">
                    <FaTimesCircle className="text-5xl mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Data Loading Error</h3>
                    <p className="text-sm text-gray-500 mb-4">Failed to load dashboard data</p>
                    <motion.button
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-xs rounded-md hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => refetch()}
                    >
                        <FaRedo className="text-xs" />
                        Retry
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`w-full max-w-full mx-auto p-1 sm:p-2 lg:p-3  bg-transparent ${themeMode}`}>
            {/* Header */}
            <div className="mb-2">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap justify-between items-start gap-4"
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">Hi, Welcome back 👋</h1>
                        {lastUpdated && (
                            <p className="text-xs text-gray-500">
                                Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex bg-white rounded-md p-1 border border-gray-200 ">
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${activeView === 'overview'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500  hover:text-gray-700 '
                                    }`}
                                onClick={() => setActiveView('overview')}
                            >
                                Overview
                            </button>
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${activeView === 'analytics'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 hover:text-gray-700 '
                                    }`}
                                onClick={() => setActiveView('analytics')}
                            >
                                Analytics
                            </button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <select
                                value={refreshInterval}
                                onChange={handleRefreshIntervalChange}
                                className="text-xs border border-gray-200 rounded bg-white  text-gray-900  px-2 py-1"
                            >
                                <option value={30}>30s</option>
                                <option value={60}>60s</option>
                                <option value={120}>120s</option>
                            </select>
                            <motion.button
                                className="flex items-center gap-1 text-xs text-gray-700  hover:text-blue-600  transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchDashboardData}
                            >
                                <FaSync className="text-xs" />
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 text-sm rounded-md shadow-lg z-50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        Data refreshed successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading || summaryLoading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {activeView === 'overview' ? (
                        <OverviewView
                            cardsData={cardsData}
                            orderStatusCards={orderStatusCards}
                            returnOrderCards={returnOrderCards}
                            formatNumber={formatNumber}
                            themeMode={themeMode}
                            totalOrders={totalOrders}
                        />
                    ) : (
                        <AnalyticsView
                            analyticsData={analyticsData}
                            cardsData={cardsData}
                            formatNumber={formatNumber}
                            themeMode={themeMode}
                            totalOrders={totalOrders}
                        />
                    )}
                </>
            )}
        </div>
    );
};

// Overview View Component
const OverviewView = ({ cardsData, orderStatusCards, formatNumber, returnOrderCards ,themeMode, totalOrders }) => (
    <div className='flex flex-col gap-2'>
        <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4"
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

            <motion.div
                className="order-status-section bg-white  rounded-xl shadow-sm p-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="flex  flex-col items-center mb-2 gap-1">
                    <h5 className="text-lg m-0 font-semibold text-[var(--primary-text-color)]">Order Status Overview</h5>
                    <p className="text-sm m-0 text-[var(--primary-text-color)]">Track all order statuses in real-time</p>
                </div>

                <div className="order-status-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2">
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
        {returnOrderCards && <motion.div
            className="bg-white  rounded-xl shadow-sm p-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <div className="flex  flex-col items-center mb-2 gap-1">
                <h5 className="text-lg font-semibold text-[var(--primary-text-color)] m-0">Refund Order Status Overview</h5>
             
            </div>

            <div className="order-status-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {returnOrderCards.map((card, index) => (
                    <OrderStatusCard
                        key={card.id}
                        card={card}
                        index={index}
                        formatNumber={formatNumber}
                        themeMode={themeMode}
                    />
                ))}
            </div>
        </motion.div>}
        
     
    </div>
);

// Analytics View Component
const AnalyticsView = ({ analyticsData, cardsData, formatNumber, themeMode, totalOrders }) => (
    <div className="analytics-view mt-4">
        <motion.div
            className="analytics-grid grid grid-cols-1 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Main Chart - Full width on mobile, 2/3 on desktop */}
            <div className="analytics-card full-width lg:col-span-2 bg-white  rounded-xl shadow-sm p-6">
                <div className="card-header flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 ">Order Distribution</h3>
                    <span className="text-xs text-gray-500">Total: {formatNumber(totalOrders)}</span>
                </div>
                <OrderDistributionChart data={analyticsData} formatNumber={formatNumber} />
            </div>

            {/* Quick Stats Card */}
            <div className="analytics-card bg-white  rounded-xl shadow-sm p-6">
                <div className="card-header mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 ">Quick Stats</h3>
                </div>
                <div className="quick-stats space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 ">
                        <span className="text-sm text-gray-600 ">Total Orders</span>
                        <span className="text-base font-semibold text-gray-900">
                            {formatNumber(totalOrders)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 ">
                        <span className="text-sm text-gray-600 ">Pending Orders</span>
                        <span className="text-base font-semibold text-yellow-600">
                            {formatNumber(analyticsData.find(d => d.status === 'Order Created')?.value || 0)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 ">
                        <span className="text-sm text-gray-600 ">Delivered</span>
                        <span className="text-base font-semibold text-green-600">
                            {formatNumber(analyticsData.find(d => d.status === 'Delivered')?.value || 0)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 ">
                        <span className="text-sm text-gray-600 ">Cancelled</span>
                        <span className="text-base font-semibold text-red-600">
                            {formatNumber(analyticsData.find(d => d.status === 'Cancelled')?.value || 0)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 ">Avg Order Value</span>
                        <span className="text-base font-semibold text-blue-600">$245</span>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
);

// Stat Card Component
const StatCard = React.memo(({ card, index, formatNumber, themeMode }) => {
    const getTrendIcon = (trend) => {
        if (trend > 0) return <FaArrowUp className="text-green-500 text-xs" />;
        if (trend < 0) return <FaArrowDown className="text-red-500 text-xs" />;
        return <FaEquals className="text-gray-400 text-xs" />;
    };

    const getTypeStyles = (type) => {
        const styles = {
            primary: {
                bg: 'from-blue-500 to-blue-600',
                light: 'bg-blue-50 ',
                border: 'border-blue-200 ',
                icon: 'bg-blue-500'
            },
            secondary: {
                bg: 'from-purple-500 to-purple-600',
                light: 'bg-purple-50 ',
                border: 'border-purple-200 ',
                icon: 'bg-purple-500'
            },
            success: {
                bg: 'from-green-500 to-green-600',
                light: 'bg-green-50 ',
                border: 'border-green-200 ',
                icon: 'bg-green-500'
            },
            info: {
                bg: 'from-cyan-500 to-cyan-600',
                light: 'bg-cyan-50 ',
                border: 'border-cyan-200 ',
                icon: 'bg-cyan-500'
            }
        };
        return styles[type] || styles.info;
    };

    const typeStyles = getTypeStyles(card.type);

    return (
        <motion.div
            className={`stat-card relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300
               'bg-white'} border ${typeStyles.border}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -1 }}
        >
            {/* Gradient Top Border */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeStyles.bg}`}></div>

            <div className="card-content p-3">
                <div className="card-main flex items-start gap-3 mb-3">
                    <div className={`card-icon-wrapper w-12 h-12 rounded-lg ${typeStyles.icon} text-white flex items-center justify-center text-lg flex-shrink-0`}>
                        {card.icon}
                    </div>
                    <div className="card-values flex-1">
                        <h3 className="card-title text-xs font-medium text-gray-500  uppercase tracking-wide mb-1">
                            {card.title}
                        </h3>
                        <p className="card-value text-xl font-bold text-gray-900  leading-tight">
                            {formatNumber(card.value)}
                        </p>
                    </div>
                    <div>
                        <Link to={card.link} state={{ key: card.status }}
                            className="card-link text-gray-400 hover:text-blue-600  transition-colors">
                            <FaExternalLinkAlt className="text-xs" />
                        </Link>
                    </div>
                </div>

                <div className="card-footer flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                        {card.trend && (
                            <span className="flex items-center gap-1 text-xs">
                                {getTrendIcon(card.trend)}
                                <span className={card.trend > 0 ? 'text-green-500' : card.trend < 0 ? 'text-red-500' : 'text-gray-400'}>
                                    {Math.abs(card.trend)}%
                                </span>
                            </span>
                        )}
                        <span className="text-xs text-gray-500">{card.detail}</span>
                    </div>
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
    console.log(card,'card')
  

    return (
        <motion.div
            className={`relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300
              
                    'bg-white border-gray-200 hover:shadow-md'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -1 }}
            onClick={(e) => handleOnClick(e, card)}
        >
            {/* Status Color Bar */}
            <div className={`absolute top-0 left-0 w-1 h-full bg-[${card.color}]`}></div>

            <div className={`status-header p-3 `}>
                <div className="flex items-center gap-3">
                    <div className={`status-icon w-10 h-10 rounded-lg flex items-center justify-center
                        bg-[${card.color}] text-[#FFF]  text-base`}>
                        {card.icon}
                    </div>
                    <div className="status-info flex-1">
                        <div className={`status-title text-sm font-medium text-[${card.color}]`}>
                            {card.title}
                        </div>
                        <div className="status-value text-xl font-bold text-gray-900  mt-1">
                            {formatNumber(card.value)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="progress-bar px-4 pb-2">
                <div className="h-1.5 bg-gray-200  rounded-full overflow-hidden">
                    <motion.div
                        className={`progress-fill h-full bg-[${card.color}]`}
                        initial={{ width: 0 }}
                        animate={{ width: `${card.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                    />
                </div>
            </div>

            <div className="status-detail px-4 pb-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 ">{card.detail}</span>
                    <span className={`text-[${card.color}]  font-medium`}>
                        {card.progress.toFixed(2)}%
                    </span>
                </div>
            </div>
        </motion.div>
    );
});

// Order Distribution Chart Component
const OrderDistributionChart = ({ data, formatNumber }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="distribution-chart">
            {data.map((item, index) => (
                <div key={item.status} className="chart-item">
                    <div className="flex items-center justify-between mb-1">
                        <div className="chart-label flex items-center gap-2">
                            <span className="chart-dot w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}></span>
                            <span className="text-sm text-gray-700 ">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="chart-value text-sm font-medium text-gray-900 ">
                                {formatNumber(item.value)}
                            </span>
                            <span className="text-xs text-gray-500  w-12 text-right">
                                {item.percentage?.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="chart-bar h-2 bg-gray-200  rounded-full overflow-hidden">
                        <motion.div
                            className="chart-fill h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / maxValue) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            style={{ backgroundColor: item.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Loading Skeleton Component
const DashboardSkeleton = () => {
    return (
        <div className="w-full animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white  rounded-xl p-5 border border-gray-200 ">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gray-200  rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200  rounded w-20 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200  rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Status Section Skeleton */}
            <div className="bg-white  rounded-xl shadow-sm p-6">
                <div className="mb-6">
                    <div className="h-5 bg-gray-200  rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200  rounded w-64"></div>
                </div>

                {/* Status Cards Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                        <div key={i} className="bg-gray-50  rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-200 d rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200  rounded w-20 mb-2"></div>
                                    <div className="h-5 bg-gray-200  rounded w-12"></div>
                                </div>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full mb-2"></div>
                            <div className="flex justify-between">
                                <div className="h-3 bg-gray-200  rounded w-24"></div>
                                <div className="h-3 bg-gray-200  rounded w-8"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Analytics Skeleton
const AnalyticsSkeleton = () => {
    return (
        <div className="w-full animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chart Skeleton */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-1">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCards;