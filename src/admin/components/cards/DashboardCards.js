import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import './DashboardCards.css';
import { getDashboardData } from '../../service/dashBoardService';
import { useOrdersByStatus } from '../../hooks/order/useAllOrder';
import { FaUsers, FaShoppingCart, FaCheckCircle, FaShoppingBag, FaCogs, FaBoxes, FaRocket, FaPlane, FaBan, FaExchangeAlt, FaCreditCard, FaTimesCircle, FaRedo, FaChevronUp, FaChevronDown, FaExternalLinkAlt, FaSync } from 'react-icons/fa';
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
    const [todayOrders ,setTodayOrders] =useState([]);
    const [refreshInterval, setRefreshInterval] = useState(60); // Default refresh interval: 60 seconds
    const [showToast, setShowToast] = useState(false);

    const today = new Date();
    const formattedStartDate = format(today, 'yyyy-MM-dd');
    const formattedEndDate = format(today, 'yyyy-MM-dd');

    // ✅ Fetch only today’s orders
    const { data: orders = [], isError, refetch } = useOrdersByDateRange(
        formattedStartDate,
        formattedEndDate
    );

    // ✅ Filter to make sure only today’s orders are stored
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
    const { data: pendingOrders, isLoading: loadingPending } = useOrdersByStatus("PAYMENT_PENDING", page, size);
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
            setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
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
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
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

    const cardsData = useMemo(() => {
        if (!dashboardData) return [];
        return [
            {
                id: 'todayOrders',
                title: 'Today Orders',
                value: todayOrders.length,
                icon: <FaShoppingCart />,
                detail: 'All orders placed',
                link: 'order/today',
            },
            {
                id: 'totalOrders',
                title: 'Total Orders',
                value: dashboardData.totalOrders,
                icon: <FaShoppingCart />,
                detail: 'All orders placed',
                link: 'AllOrderPage',
            },
            {
                id: 'deliveredOrders',
                title: 'Delivered Orders',
                value: dashboardData.deliveredOrders,
                icon: <FaCheckCircle />,
                detail: 'Orders successfully delivered',
                link: 'order/status/delivered',
            },
            {
                id: 'totalUsers',
                title: 'Total Users',
                value: dashboardData.totalUsers,
                icon: <FaUsers />,
                detail: 'Active registered users',
                link: 'userDetails',
            },
            
            
        ].filter(card => !isNaN(card.value));
    }, [dashboardData]);

    const orderStatusCards = useMemo(() => {
        if (!dashboardData) return [];
        return [
            { id: 'pending', title: 'Order Pending', value: dashboardData.pendingOrders || 0, icon: <FaShoppingBag />, detail: 'Orders not placed', status: 'PAYMENT_PENDING', path: '/admin/order/status/pending', key: 'PAYMENT_PENDING', values: ['IN_PROCESSING', 'CANCELLED'] },
            { id: 'placed', title: 'Order Placed', value: dashboardData.placedOrders || 0, icon: <FaShoppingBag />, detail: 'Orders recently placed', status: 'PLACED' , path: '/admin/order/status/placed', key: 'PLACED', values: ['IN_PROCESSING', 'CANCELLED'] },
            { id: 'inProcessing', title: 'QC Check', value: dashboardData.inProcessingOrders || 0, icon: <FaCogs />, detail: 'Orders being processed', status: 'IN_PROCESSING', path: '/admin/order/status/qc', key: 'IN_PROCESSING', values: ['PACKING', 'CANCELLED'] },
            { id: 'Packing', title: 'Order Packing', value: dashboardData.PackingOrders || 0, icon: <FaShoppingBag />, detail: 'Orders move to pack', status: 'PACKING', path: '/admin/order/status/packing', key: 'PACKING', values: ['PACKED', 'CANCELLED'] },
            { id: 'packed', title: 'Packed', value: dashboardData.packedOrders || 0, icon: <FaBoxes />, detail: 'Orders packed and ready', status: 'PACKED', path: '/admin/order/status/packed', key: 'PACKED', values: ['SHIPPED', 'CANCELLED'] },
            { id: 'shipped', title: 'Shipped', value: dashboardData.shippedOrders || 0, icon: <FaRocket />, detail: 'Orders in transit', status: 'SHIPPED', path: '/admin/order/status/shipped', key: 'SHIPPED', values: ['SHIPPED', 'CANCELLED'] },
            { id: 'inTransit', title: 'In Transit', value: dashboardData.inTransitOrders || 0, icon: <FaPlane />, detail: 'Orders on the way', status: 'IN_TRANSIT', path: '/admin/order/status/shipped', key: 'IN_TRANSIT', values: ['SHIPPED', 'CANCELLED'] },
            { id: 'delivered', title: 'Delivered', value: dashboardData.inTransitOrders || 0, icon: <FaPlane />, detail: 'Orders on the way', status: 'DELIVERED', path: '/admin/order/status/shipped', key: 'DELIVERED', values: ['SHIPPED', 'CANCELLED'] },
            { id: 'cancelled', title: 'Cancelled', value: dashboardData.cancelledOrders || 0, icon: <FaBan />, detail: 'Cancelled orders', status: 'CANCELLED', path: '/admin/order/status/shipped', key: 'CANCELLED', values: ['SHIPPED', 'CANCELLED'] },
            { id: 'returned', title: 'Returned', value: dashboardData.returnedOrders || 0, icon: <FaExchangeAlt />, detail: 'Returned orders', status: 'RETURNED', path: '/admin/order/status/shipped', key: 'RETURNED', values: ['SHIPPED', 'CANCELLED'] },
            { id: 'refunded', title: 'Refunded', value: dashboardData.refundedOrders || 0, icon: <FaCreditCard />, detail: 'Refunded orders', status: 'REFUNDED', path: '/admin/order/status/shipped', key: 'REFUNDED', values: ['SHIPPED', 'CANCELLED'] },
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

                (pendingOrders?.totalByStatus || 0)+ 
                (placedOrders?.totalByStatus || 0) +
                (inProcessingOrders?.totalByStatus || 0) +
                (PackingOrders?.totalByStatus) +
                (packedOrders?.totalByStatus || 0) +
                (shippedOrders?.totalByStatus || 0) +
                (inTransitOrders?.totalByStatus || 0) +
                (deliveredOrders?.totalByStatus || 0) +
                (cancelledOrders?.totalByStatus || 0) +
                (returnedOrders?.totalByStatus || 0) +
                (refundedOrders?.totalByStatus || 0),

            pendingOrders:pendingOrders?.totalByStatus ||0,
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
        pendingOrders,
        placedOrders,
        inProcessingOrders,
        PackingOrders,
        packedOrders,
        shippedOrders,
        inTransitOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        refundedOrders,
        totalUsers
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
                    style={{display:'flex' ,justifyContent:'space-between'}}
                >
                    <div>
                    <h1>Hi, Welcome back 👋</h1>
                    {lastUpdated && (
                        <p className="last-updated">
                            Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
                        </p>
                    )}
                    </div>
                    <div className="refresh-controls">
                        <select
                            value={refreshInterval}
                            onChange={handleRefreshIntervalChange}
                            className="refresh-interval-select"
                        >
                            <option value={30}>Refresh every 30s</option>
                            <option value={60}>Refresh every 60s</option>
                            <option value={120}>Refresh every 120s</option>
                        </select>
                        <motion.button
                            className="refresh-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchDashboardData}
                        >
                            <FaSync className="mr-2" />
                            Refresh Now
                        </motion.button>
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
                    <motion.div
                        className="cards-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                    >
                        {cardsData.map((card, index) => (
                            <DashboardCard
                                key={card.id}
                                card={card}
                                index={index}
                                calculateChange={calculateChange}
                                formatNumber={formatNumber}
                                dashboardData={dashboardData}
                                themeMode={themeMode}
                            />
                        ))}
                    </motion.div>

                    <motion.div
                        className="order-status-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <motion.div
                            className="section-header"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h2>Order Status Overview</h2>
                            <p>Track all order statuses in real-time</p>
                        </motion.div>

                        <motion.div
                            className="order-status-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, staggerChildren: 0.1, delay: 0.5 }}
                        >
                            {orderStatusCards.map((card, index) => (
                                <OrderStatusCard
                                    key={card.id}
                                    card={card}
                                    index={index}
                                    formatNumber={formatNumber}
                                    themeMode={themeMode}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

const DashboardCard = React.memo(({ card, index, calculateChange, formatNumber, dashboardData, themeMode }) => {
    const change = calculateChange(card.id, dashboardData);


    return (
        <motion.div
            className={`card ${themeMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
        
        >   
         
                   <div className="card-header">
                <div className="card-icon" style={{ background: 'var(--primary-color)', color: '#ffffff' }}>
                    {card.icon}
                </div>
            
            </div>
            <div style={{ padding: 10 }}> 
            <h3>{card.title}</h3>
            <p className="card-value">{formatNumber(card.value)}</p>
            <Link to={card.link} className="card-link">
                View Details <FaExternalLinkAlt />
            </Link>
            </div>

        </motion.div>
    );
});

const OrderStatusCard = React.memo(({ card, index, formatNumber, themeMode }) => {
    const navigate = useNavigate();

    const handleOnClick = (e, card) => {
        e.preventDefault();

        const link = card.path;
        const status = card.status;

        console.log("Navigating to:", link, "status:", status);

        navigate(link, {
            state: {
                key: card.key,
                values: card.values,
                qc: card.status // or whatever qc means in your flow
            }
        });
    };

    return (
        <motion.div
            className={`order-status-card ${themeMode}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-md)' }}
            onClick={(e) => handleOnClick(e, card)}

        >
            <div className="status-icon-circle" style={{ background: 'var(--primary-color)' }}>
                {card.icon}
            </div>
            <div>
                <div className="status-title">{card.title}</div>
                <div className="status-value">{formatNumber(card.value)}</div>
            </div>
        </motion.div>
    );
});

export default DashboardCards;