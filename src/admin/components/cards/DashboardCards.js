import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './DashboardCards.css';
import { getDashboardData } from '../../service/dashBoardService';
import {
    FaUsers, FaShoppingCart,
    FaCheckCircle, FaTruck, FaTimesCircle,
    FaChartLine, FaRedo, FaDollarSign, FaGem,
    FaSearch, FaCalendar, FaEye
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DashboardCards = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedChart, setSelectedChart] = useState('orders');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const formatNumber = useCallback((num, options = {}) => {
        const { isCurrency = false, currency = 'INR' } = options;
        if (isNaN(num) || num === null) return '-';
        if (isCurrency) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(num).replace('INR', '₹');
        }
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    }, []);

    const calculateChange = useCallback((cardId, dashboardData) => {
        const percentageMap = {
            totalOrders: dashboardData?.totalPercentage,
            pendingOrders: dashboardData?.pendingPercentage,
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

    // Summary cards data
    const summaryCards = useMemo(() => {
        if (!dashboardData) return [];
        return [
            {
                id: 'totalItems',
                title: 'Items',
                value: 0,
                icon: <FaShoppingCart />,
                detail: 'Total Items Sold',
                color: '#10B981',
                isCurrency: false
            },
            {
                id: 'totalOrders',
                title: 'Orders',
                value: dashboardData.totalOrders || 0,
                icon: <FaShoppingCart />,
                detail: 'Total Orders',
                color: '#4361ee',
                isCurrency: false
            },
            {
                id: 'totalStores',
                title: 'Grocery Stores',
                value: 1,
                icon: <FaGem />,
                detail: 'Total Stores',
                color: '#f8961e',
                isCurrency: false
            },
            {
                id: 'totalCustomers',
                title: 'Customers',
                value: dashboardData.totalUsers || 0,
                icon: <FaUsers />,
                detail: 'Total Customers',
                color: '#7209b7',
                isCurrency: false
            },
            {
                id: 'totalEarnings',
                title: 'Total Earnings',
                value: dashboardData.totalRevenue || 103.20,
                icon: <FaDollarSign />,
                detail: '0 Newly added',
                color: '#f72585',
                isCurrency: true
            }
        ];
    }, [dashboardData]);

    // Order status cards data
    const orderStatusCards = useMemo(() => {
        if (!dashboardData) return [];
        return [
            {
                id: 'unassigned',
                title: 'Unassigned Orders',
                value: 0,
                icon: <FaCalendar />,
                color: '#6b7280'
            },
            {
                id: 'accepted',
                title: 'Accepted By Delivery',
                value: 0,
                icon: <FaTruck />,
                color: '#3b82f6'
            },
            {
                id: 'packaging',
                title: 'Packaging',
                value: 0,
                icon: <FaShoppingCart />,
                color: '#f59e0b'
            },
            {
                id: 'outForDelivery',
                title: 'Out For Delivery',
                value: 0,
                icon: <FaTruck />,
                color: '#8b5cf6'
            },
            {
                id: 'delivered',
                title: 'Delivered',
                value: dashboardData.deliveredOrders || 0,
                icon: <FaCheckCircle />,
                color: '#10b981'
            },
            {
                id: 'cancelled',
                title: 'Cancelled',
                value: dashboardData.cancelledOrders || 0,
                icon: <FaTimesCircle />,
                color: '#ef4444'
            },
            {
                id: 'refunded',
                title: 'Refunded',
                value: 0,
                icon: <FaDollarSign />,
                color: '#ec4899'
            },
            {
                id: 'paymentFailed',
                title: 'Payment Failed',
                value: 0,
                icon: <FaTimesCircle />,
                color: '#3b82f6'
            }
        ];
    }, [dashboardData]);

    // Mock latest orders data
    const latestOrders = useMemo(() => [
        {
            id: '#79963c',
            customerName: 'Jenish1',
            status: 'Delivered',
            total: 74.00,
            date: '5 Jul 2025'
        },
        {
            id: '#8a95a8',
            customerName: 'Jenish1',
            status: 'Cancelled',
            total: 36.00,
            date: '21 Jun 2025'
        },
        {
            id: '#8ad074',
            customerName: 'Jenish1',
            status: 'Cancelled',
            total: 36.00,
            date: '21 Jun 2025'
        },
        {
            id: '#8b27bf',
            customerName: 'Jenish1',
            status: 'Transferred to delivery partner',
            total: 36.00,
            date: '21 Jun 2025'
        },
        {
            id: '#8b869d',
            customerName: 'Jenish1',
            status: 'Processing',
            total: 18.00,
            date: '21 Jun 2025'
        }
    ], []);

    // Pie chart data based on selected chart
    const pieChartData = useMemo(() => {
        const data = {
            orders: [
                { name: 'Pending', value: dashboardData?.pendingOrders || 0, color: '#f8961e' },
                { name: 'Delivered', value: dashboardData?.deliveredOrders || 0, color: '#7209b7' },
                { name: 'Shipped', value: dashboardData?.shippedOrders || 0, color: '#4895ef' },
                { name: 'Cancelled', value: dashboardData?.cancelledOrders || 0, color: '#f72585' }
            ],
            revenue: [
                { name: 'Gold Sales', value: 6500000, color: '#FFD700' },
                { name: 'Silver Sales', value: 3200000, color: '#C0C0C0' },
                { name: 'Diamond Sales', value: 1800000, color: '#B9F2FF' },
                { name: 'Platinum Sales', value: 1000000, color: '#E5E4E2' }
            ],
            products: [
                { name: 'Gold Jewelry', value: 35, color: '#FFD700' },
                { name: 'Silver Jewelry', value: 25, color: '#C0C0C0' },
                { name: 'Diamond Sets', value: 20, color: '#B9F2FF' },
                { name: 'Platinum Items', value: 15, color: '#E5E4E2' },
                { name: 'Other', value: 5, color: '#FF6B6B' }
            ],
            users: [
                { name: 'New Users', value: 45, color: '#10B981' },
                { name: 'Active Users', value: 35, color: '#4361ee' },
                { name: 'Premium Users', value: 15, color: '#FFD700' },
                { name: 'Inactive', value: 5, color: '#6B7280' }
            ]
        };
        return data[selectedChart] || data.orders;
    }, [selectedChart, dashboardData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getDashboardData();
            const transformedData = {
                totalUsers: data.totalUsers?.totalUsers || 0,
                totalOrders: data.totalOrders?.totalOrders || 0,
                pendingOrders: data.pendingOrders?.totalPending || 0,
                deliveredOrders: data.deliveredOrders?.deliveredOrders?.length || 0,
                shippedOrders: data.shippedOrders?.shippedOrders?.length || 0,
                cancelledOrders: data.cancelledOrders?.total || 0,
                totalPercentage: data.totalOrders?.totalPercentage || '10%',
                pendingPercentage: data.pendingOrders?.pendingPercentage || '0%',
                deliveredPercentage: data.deliveredOrders?.deliveredPercentage || '0%',
                shippedPercentage: data.shippedOrders?.ShippedPercentage || '0%',
                cancelledPercentage: data.cancelledOrders?.cancelledPercentage || '0%',
                totalRevenue: 103.20,
                premiumProducts: 45,
                monthlyGrowth: 12.5,
                customerSatisfaction: 4.8
            };
            setDashboardData(transformedData);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleCardClick = useCallback((cardId) => {
        const card = summaryCards.find(c => c.id === cardId);
        if (card) {
            if (cardId.includes('Orders') || cardId === 'totalOrders') {
                setSelectedChart('orders');
            } else if (cardId.includes('Revenue') || cardId === 'totalEarnings') {
                setSelectedChart('revenue');
            } else if (cardId.includes('Products') || cardId === 'totalStores') {
                setSelectedChart('products');
            } else if (cardId.includes('Users') || cardId === 'totalCustomers') {
                setSelectedChart('users');
            }
            navigate(`/${cardId}`);
        }
    }, [summaryCards, navigate]);

    const getStatusColor = (status) => {
        const statusColors = {
            'Delivered': '#10b981',
            'Cancelled': '#f59e0b',
            'Processing': '#3b82f6',
            'Transferred to delivery partner': '#fbbf24'
        };
        return statusColors[status] || '#6b7280';
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="pie-tooltip">
                    <p className="tooltip-label">{payload[0].name}</p>
                    <p className="tooltip-value">
                        {selectedChart === 'revenue' ? formatNumber(payload[0].value, { isCurrency: true }) : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

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
                        onClick={fetchData}
                        className="retry-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaRedo className="mr-2" />
                        Retry
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="dashboard-container">
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
                    {/* Charts Section - Moved to Top */}
                    <motion.div
                        className="charts-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="charts-grid">
                            {/* Pie Chart */}
                            <motion.div
                                className="chart-card pie-chart-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div className="chart-header">
                                    <div className="chart-title-section">
                                        <h3 className="chart-main-title">Data Distribution</h3>
                                        <p className="chart-subtitle">Click cards below to see different views</p>
                                    </div>
                                    <div className="chart-controls">
                                        <button 
                                            className={`chart-btn ${selectedChart === 'orders' ? 'active' : ''}`}
                                            onClick={() => setSelectedChart('orders')}
                                        >
                                            Orders
                                        </button>
                                        <button 
                                            className={`chart-btn ${selectedChart === 'revenue' ? 'active' : ''}`}
                                            onClick={() => setSelectedChart('revenue')}
                                        >
                                            Revenue
                                        </button>
                                        <button 
                                            className={`chart-btn ${selectedChart === 'products' ? 'active' : ''}`}
                                            onClick={() => setSelectedChart('products')}
                                        >
                                            Products
                                        </button>
                                        <button 
                                            className={`chart-btn ${selectedChart === 'users' ? 'active' : ''}`}
                                            onClick={() => setSelectedChart('users')}
                                        >
                                            Users
                                        </button>
                                    </div>
                                </div>
                                <div className="pie-chart-container">
                                    <ResponsiveContainer width="100%" height={450}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={160}
                                                innerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend 
                                                layout="horizontal" 
                                                verticalAlign="bottom" 
                                                align="center"
                                                wrapperStyle={{ 
                                                    fontSize: '14px', 
                                                    paddingTop: '20px',
                                                    fontWeight: '500'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Quick Stats Card */}
                            <motion.div
                                className="chart-card stats-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="chart-header">
                                    <h3>Quick Stats</h3>
                                    <p className="chart-subtitle">Key performance indicators</p>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                            <FaChartLine style={{ color: '#10B981' }} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>Growth Rate</h4>
                                            <p className="stat-value">+12.5%</p>
                                            <p className="stat-change positive">+2.1% from last month</p>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon" style={{ backgroundColor: 'rgba(67, 97, 238, 0.1)' }}>
                                            <FaUsers style={{ color: '#4361ee' }} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>Customer Satisfaction</h4>
                                            <p className="stat-value">4.8/5</p>
                                            <p className="stat-change positive">+0.2 from last month</p>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon" style={{ backgroundColor: 'rgba(242, 159, 103, 0.1)' }}>
                                            <FaShoppingCart style={{ color: '#F29F67' }} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>Conversion Rate</h4>
                                            <p className="stat-value">15.3%</p>
                                            <p className="stat-change positive">+1.2% from last month</p>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 177, 170, 0.1)' }}>
                                            <FaDollarSign style={{ color: '#34B1AA' }} />
                                        </div>
                                        <div className="stat-content">
                                            <h4>Avg Order Value</h4>
                                            <p className="stat-value">₹8,500</p>
                                            <p className="stat-change positive">+₹500 from last month</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Summary Cards */}
                <motion.div
                        className="summary-cards-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <SummaryCard
                            card={{
                                id: 'totalItems',
                                title: 'Items',
                                value: 0,
                                icon: <FaShoppingCart />,
                                detail: 'Total Items Sold',
                                color: '#10B981',
                                isCurrency: false
                            }}
                            index={0}
                            isHovered={hoveredCard === 'totalItems'}
                            onHover={setHoveredCard}
                            formatNumber={formatNumber}
                            onClick={() => {}}
                        />
                        <SummaryCard
                            card={{
                                id: 'totalOrders',
                                title: 'Orders',
                                value: dashboardData?.totalOrders || 0,
                                icon: <FaShoppingCart />,
                                detail: 'Total Orders',
                                color: '#4361ee',
                                isCurrency: false
                            }}
                            index={1}
                            isHovered={hoveredCard === 'totalOrders'}
                            onHover={setHoveredCard}
                            formatNumber={formatNumber}
                            onClick={() => handleCardClick('totalOrders')}
                        />
                        <SummaryCard
                            card={{
                                id: 'totalStores',
                                title: 'Grocery Stores',
                                value: 1,
                                icon: <FaGem />,
                                detail: 'Total Stores',
                                color: '#f8961e',
                                isCurrency: false
                            }}
                            index={2}
                            isHovered={hoveredCard === 'totalStores'}
                            onHover={setHoveredCard}
                            formatNumber={formatNumber}
                            onClick={() => {}}
                        />
                        <SummaryCard
                            card={{
                                id: 'totalCustomers',
                                title: 'Customers',
                                value: dashboardData?.totalUsers || 0,
                                icon: <FaUsers />,
                                detail: 'Total Customers',
                                color: '#7209b7',
                                isCurrency: false
                            }}
                            index={3}
                            isHovered={hoveredCard === 'totalCustomers'}
                            onHover={setHoveredCard}
                            formatNumber={formatNumber}
                            onClick={() => handleCardClick('totalCustomers')}
                        />
                        <SummaryCard
                            card={{
                                id: 'totalEarnings',
                                title: 'Total Earnings',
                                value: dashboardData?.totalRevenue || 103.20,
                                icon: <FaDollarSign />,
                                detail: '0 Newly added',
                                color: '#f72585',
                                isCurrency: true
                            }}
                            index={4}
                            isHovered={hoveredCard === 'totalEarnings'}
                            onHover={setHoveredCard}
                            formatNumber={formatNumber}
                            onClick={() => handleCardClick('totalEarnings')}
                        />
                    </motion.div>

                    {/* Order Status Cards */}
                    <motion.div
                        className="order-status-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <OrderStatusCard
                            card={{
                                id: 'accepted',
                                title: 'Accepted By Delivery',
                                value: 0,
                                icon: <FaTruck />,
                                color: '#3b82f6'
                            }}
                            index={0}
                            formatNumber={formatNumber}
                        />
                        <OrderStatusCard
                            card={{
                                id: 'packaging',
                                title: 'Packaging',
                                value: 0,
                                icon: <FaShoppingCart />,
                                color: '#f59e0b'
                            }}
                            index={1}
                            formatNumber={formatNumber}
                        />
                        <OrderStatusCard
                            card={{
                                id: 'outForDelivery',
                                title: 'Out For Delivery',
                                value: 0,
                                icon: <FaTruck />,
                                color: '#8b5cf6'
                            }}
                            index={2}
                            formatNumber={formatNumber}
                        />
                        <OrderStatusCard
                            card={{
                                id: 'delivered',
                                title: 'Delivered',
                                value: dashboardData?.deliveredOrders || 0,
                                icon: <FaCheckCircle />,
                                color: '#10b981'
                            }}
                            index={3}
                            formatNumber={formatNumber}
                        />
                        <OrderStatusCard
                            card={{
                                id: 'cancelled',
                                title: 'Cancelled',
                                value: dashboardData?.cancelledOrders || 0,
                                icon: <FaTimesCircle />,
                                color: '#ef4444'
                            }}
                            index={4}
                            formatNumber={formatNumber}
                        />
                        <OrderStatusCard
                            card={{
                                id: 'refunded',
                                title: 'Refunded',
                                value: 0,
                                icon: <FaDollarSign />,
                                color: '#ec4899'
                            }}
                            index={5}
                            formatNumber={formatNumber}
                        />
                        <OrderStatusCard
                            card={{
                                id: 'paymentFailed',
                                title: 'Payment Failed',
                                value: 0,
                                icon: <FaTimesCircle />,
                                color: '#3b82f6'
                            }}
                            index={6}
                            formatNumber={formatNumber}
                        />
                    </motion.div>

                    {/* Latest Orders Section */}
                    <motion.div
                        className="latest-orders-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <div className="orders-header">
                            <div className="orders-title-section">
                                <h3>Latest Orders</h3>
                                <p>Track and manage customer orders</p>
                                <span className="total-orders">{latestOrders.length} total orders</span>
                            </div>
                            <div className="orders-controls">
                                <div className="search-container">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search by Order ID (e.g. #643d8)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <button className="date-picker-btn">
                                    <FaCalendar />
                                    <span>dd/mm/yyyy</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer Name</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestOrders.map((order, index) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="order-row"
                                        >
                                            <td>
                                                <div className="order-id">
                                                    <FaShoppingCart className="order-icon" />
                                                    {order.id}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="customer-name">
                                                    <FaUsers className="customer-icon" />
                                                    {order.customerName}
                                                </div>
                                            </td>
                                            <td>
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="order-total">₹{order.total.toFixed(2)}</td>
                                            <td>
                                                <div className="order-date">
                                                    <FaChartLine className="date-icon" />
                                                    {order.date}
                                                </div>
                                            </td>
                                            <td>
                                                <button className="action-btn">
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                </motion.div>
                </>
            )}
        </div>
    );
};

// Summary Card Component
const SummaryCard = React.memo(({
    card,
    index,
    isHovered,
    onHover,
    formatNumber,
    onClick
}) => {
    return (
        <motion.div
            className="summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1
            }}
            transition={{
                duration: 0.4,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
            onClick={onClick}
            onMouseEnter={() => onHover(card.id)}
            onMouseLeave={() => onHover(null)}
            style={{
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                border: `1px solid ${card.color}20`
            }}
        >
            <div className="card-header-modern">
                <div className="icon-container" style={{ backgroundColor: card.color }}>
                    {card.icon}
                </div>
            </div>

            <div className="card-content">
                <div className="metric-info">
                    <h3 className="metric-title">{card.title}</h3>
                    <p className="metric-value">
                        {card.isCurrency ? formatNumber(card.value, { isCurrency: true }) : formatNumber(card.value)}
                    </p>
                    <p className="metric-description">{card.detail}</p>
                </div>
                </div>
            </motion.div>
    );
});

// Order Status Card Component
const OrderStatusCard = React.memo(({ card, index, formatNumber }) => {
    return (
        <motion.div
            className="order-status-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1
            }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 100
            }}
                whileHover={{
                y: -4,
                scale: 1.02,
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
            }}
            style={{
                background: `linear-gradient(135deg, ${card.color}10 0%, ${card.color}05 100%)`,
                border: `1px solid ${card.color}20`
            }}
        >
            <div className="status-icon" style={{ backgroundColor: card.color }}>
                {card.icon}
            </div>
            <div className="status-content">
                <h4>{card.title}</h4>
                <p className="status-value">{formatNumber(card.value)}</p>
            </div>
        </motion.div>
    );
});

SummaryCard.displayName = 'SummaryCard';
OrderStatusCard.displayName = 'OrderStatusCard';

export default DashboardCards;