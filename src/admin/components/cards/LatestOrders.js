import React, { useState, useCallback, useContext } from 'react';
import { useOrdersByDateRange } from '../../hooks/order/useAllOrder';
import { useTrackOrderById } from '../../hooks/order/useTrackOrder';
import { format, subDays, parseISO } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import { MyContext } from '../../context/themeContext/themeContext';
import {
    Box, Typography, Card, CardContent, Chip, Avatar,
    IconButton, Tooltip, Table, TableContainer, TableHead,
    TableBody, TableRow, TableCell, CircularProgress, Alert,
    Button, Select, MenuItem, FormControl, InputLabel,
    Dialog, DialogTitle, DialogContent
} from '@mui/material';
import {
    Receipt, ArrowForward, ShoppingCart, TrendingUp, Person,
    Visibility
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/system';
import { Link , useNavigate } from 'react-router-dom';
import AdvancedTable from '../table/ResponsiveTable';
import StatusChip from '../statusChip/StatusChip';
import { Truck } from 'lucide-react';






const LatestOrders = () => {



    const { themeMode } = useContext(MyContext);
    const [startDate, setStartDate] = useState(subDays(new Date(), 7));
    const [endDate, setEndDate] = useState(new Date());
    const [dateRange, setDateRange] = useState('7days');
    const [showToast, setShowToast] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
    const isTablet = useMediaQuery({ query: '(max-width: 960px)' });
    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    const { data: orders = [], isLoading, isError, refetch } = useOrdersByDateRange(
        formattedStartDate,
        formattedEndDate
    );
    const { data: trackingData, isLoading: isTrackingLoading } = useTrackOrderById(selectedOrderId);

    const latestOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
    const totalOrders = Array.isArray(orders) ? orders.length : 0;
    const totalRevenue = latestOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const uniqueCustomers = new Set(latestOrders.map(order => order.customerName)).size;

    const navigate = useNavigate();

    const handleDateRangeChange = useCallback((event) => {
        const value = event.target.value;
        setDateRange(value);
        let newStartDate;
        const newEndDate = new Date();
        switch (value) {
            case '7days':
                newStartDate = subDays(newEndDate, 7);
                break;
            case '30days':
                newStartDate = subDays(newEndDate, 30);
                break;
            case '90days':
                newStartDate = subDays(newEndDate, 90);
                break;
            default:
                newStartDate = subDays(newEndDate, 7);
        }
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

   

    const handleTrackOrder = useCallback((order)=>{
        navigate(`/admin/track/order/${order.orderId}`)
    })

    const orderHeaders = [
        { key: "order_id", label: "Order ID", align: "left" },
        { key: "customer", label: "Customer", align: "left" },
        { key: "amount", label: "Amount", align: "right" },
        { key: "status", label: "Status", align: "center" },
        { key: "order_date", label: "Order Date", align: "left" },
        { key: "payment_mode", label: "Payment Mode", align: "center" },
        { key: "actions", label: "Actions", align: "center" },
    ];
    console.log(latestOrders,'latestOrders')

    const formattedOrders = latestOrders.map(order => ({
            order_id: (
                <span className="text-xs font-semibold text-primaryText">
                {order.orderId}
                </span>
            ),
            customer: (
                <div className="min-w-[120px]">
                    <div className="text-xs font-semibold text-primaryText">{order.customerName}</div>
                    <div className="text-xs text-secondaryText">{order.contact}</div>
                </div>
            ),
            amount: (
                <span className="text-xs font-semibold text-primaryText">
                    ₹{order.totalAmount.toFixed(2)}
                </span>
            ),
            status: (
                <StatusChip
                    status={order?.status}
                    size="small"
                />
            ),
            order_date: (
                <div className="min-w-[100px]">
                    <div className="text-xs font-medium text-primaryText">
                        {new Date(order.orderTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-secondaryText">
                        {new Date(order.orderTime).toLocaleTimeString()}
                    </div>
                </div>
            ),
            payment_mode: (
                <span className="text-xs px-2 py-1 rounded align_center text-black font-semibold">
    
                    <StatusChip status={order.paymentMode} size='small' />
                </span>
            ),
            actions: (
                <div className="flex items-center justify-center gap-1">
                  
    
                  
                    {/* TRACK ORDER */}
                    <div className="relative group inline-flex">
                        <button
                            onClick={() => handleTrackOrder(order)}
                            className="btn-icon-warning p-1 rounded-md transition-colors"
                        >
                            <Truck className="w-4 h-4" />
                        </button>
                        <span className="tooltip">Track Order</span>
                    </div>
    
                    
                </div>
            )
    
        }));


    if (isError) {
        return (
    
                <CardContent>
                    <Alert
                        severity="error"
                        sx={{
                            backgroundColor: themeMode === 'dark' ? '#3a1e1e' : '#fff5f5',
                            color: 'var(--error-color)',
                            borderRadius: 'var(--border-radius-lg)',
                            '& .MuiAlert-icon': { color: 'var(--error-color)' },
                            fontFamily: 'var(--font-primary)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        Failed to load latest orders. Please try again.
                    </Alert>
                    <Button
                        onClick={() => refetch()}
                        variant="contained"
                        sx={{
                            mt: 2,
                            backgroundColor: 'var(--primary-color)',
                            color: '#ffffff',
                            fontFamily: 'var(--font-primary)',
                            borderRadius: 'var(--border-radius-sm)',
                            fontSize: 'var(--font-size-sm)',
                            '&:hover': {
                                backgroundColor: themeMode === 'dark' ? 'var(--active-border)' : '#cd865c',
                            },
                            '@media (max-width: 600px)': {
                                fontSize: '0.75rem',
                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                            },
                        }}
                    >
                        Retry
                    </Button>
                </CardContent>
          
        );
    }

    return (
    
            <CardContent sx={{ p: isMobile ? '2px' : 'var(--spacing-md)' }}>
                <Box
                    display="flex"
                    flexDirection={isMobile ? 'column' : 'row'}
                    alignItems={isMobile ? 'flex-start' : 'center'}
                    justifyContent="space-between"
                    mb={isMobile ? 'var(--spacing-sm)' : 'var(--spacing-md)'}
                    gap={isMobile ? 'var(--spacing-sm)' : 0}
                >
                    <Box display="flex" alignItems="center" gap="var(--spacing-sm)">
                        <Avatar
                            sx={{
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%)',
                                width: isMobile ? 32 : 40,
                                height: isMobile ? 32 : 40,
                            }}
                        >
                            <Receipt fontSize={isMobile ? 'small' : 'medium'} />
                        </Avatar>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'var(--primary-text-color)',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: isMobile ? 'var(--font-size-md)' : 'var(--font-size-md)',
                                }}
                            >
                                Latest Orders
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                }}
                            >
                                Recent orders from selected period
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" gap="var(--spacing-sm)">
                        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : '120px' }}>
                            <InputLabel
                                sx={{
                                    fontFamily: 'var(--font-primary)',
                                    color: 'var(--secondary-text-color)',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                }}
                            >
                                Date Range
                            </InputLabel>
                            <Select
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                label="Date Range"
                                sx={{
                                    fontFamily: 'var(--font-primary)',
                                    color: 'var(--primary-text-color)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    backgroundColor: themeMode === 'dark' ? 'var(--card-background-color)' : '#fff5e6',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                    '& .MuiSelect-select': {
                                        padding: isMobile ? 'var(--spacing-xs) var(--spacing-sm)' : 'var(--spacing-sm) var(--spacing-md)',
                                    },
                                    '@media (max-width: 600px)': {
                                        width: '100%',
                                    },
                                }}
                            >
                                <MenuItem value="7days">Last 7 Days</MenuItem>
                                <MenuItem value="30days">Last 30 Days</MenuItem>
                                <MenuItem value="90days">Last 90 Days</MenuItem>
                            </Select>
                        </FormControl>
                        <Chip
                            label={`${totalOrders} orders`}
                            size="small"
                            sx={{
                                backgroundColor: 'var(--active-bg)',
                                color: 'var(--primary-color)',
                                fontFamily: 'var(--font-primary)',
                                fontWeight: 600,
                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-xs)',
                            }}
                        />
                        <Tooltip title="View all orders">
                            <Link to="/admin/order/today" style={{ textDecoration: 'none' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        borderRadius: 'var(--border-radius-sm)',
                                        textTransform: 'none',
                                        fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                        fontFamily: 'var(--font-primary)',
                                        borderColor: 'var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            borderColor: themeMode === 'dark' ? 'var(--active-border)' : '#cd865c',
                                            backgroundColor: 'var(--active-bg)',
                                        },
                                        '@media (max-width: 600px)': {
                                            width: isMobile ? '100%' : 'auto',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        },
                                    }}
                                >
                                    View All
                                </Button>
                            </Link>
                        </Tooltip>
                    </Box>
                </Box>

                <AnimatePresence>
                    {showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'fixed',
                                bottom: 'var(--spacing-md)',
                                right: 'var(--spacing-md)',
                                background: 'var(--success-color)',
                                color: '#ffffff',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                borderRadius: 'var(--border-radius-sm)',
                                fontFamily: 'var(--font-primary)',
                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                boxShadow: '0 4px 12px rgba(30, 30, 44, 0.2)',
                                zIndex: 1000,
                            }}
                        >
                            Data refreshed successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading && (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={isMobile ? 'var(--spacing-sm)' : 'var(--spacing-lg)'}>
                        <CircularProgress
                            size={isMobile ? 32 : 40}
                            sx={{ color: 'var(--primary-color)', mb: 'var(--spacing-sm)' }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'var(--secondary-text-color)',
                                fontFamily: 'var(--font-primary)',
                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                            }}
                        >
                            Loading latest orders...
                        </Typography>
                    </Box>
                )}

                {!isLoading && latestOrders.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: isMobile ? 'var(--spacing-xs)' : 'var(--spacing-sm)',
                            mb: 'var(--spacing-md)',
                            p: isMobile ? 'var(--spacing-xs)' : 'var(--spacing-sm)',
                            backgroundColor: 'var(--active-bg)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--border-color)',
                            flexDirection: isMobile ? 'column' : 'row',
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                        }}
                    >
                        <Box display="flex" alignItems="center" gap="var(--spacing-xs)">
                            <ShoppingCart sx={{ color: 'var(--primary-color)', fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)' }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                }}
                            >
                                Total: <strong style={{ color: 'var(--primary-color)' }}>{totalOrders}</strong>
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="var(--spacing-xs)">
                            <TrendingUp sx={{ color: 'var(--success-color)', fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)' }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                }}
                            >
                                Revenue: <strong style={{ color: 'var(--success-color)' }}>
                                    ₹{totalRevenue.toFixed(2)}
                                </strong>
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="var(--spacing-xs)">
                            <Person sx={{ color: 'var(--warning-color)', fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)' }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                }}
                            >
                                Customers: <strong style={{ color: 'var(--warning-color)' }}>
                                    {uniqueCustomers}
                                </strong>
                            </Typography>
                        </Box>
                    </Box>
                )}

                {!isLoading && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AdvancedTable
                                headers={orderHeaders}
                                fontSizeHeader='text-sm'
                                fontSizeRow="text-xs"
                                data={formattedOrders}
                                alignments={{
                                    amount: "right",
                                    status: "center",
                                    actions: "center",
                                    payment_mode: "left",
                                }}
                                actionColumn="actions" // This will show actions column
                                headerBg='bg-[var(--primary-text-color)]'
                                headerText='text-[var(--white-color)]'

                            />
                        </motion.div>
                    </AnimatePresence>
                )}

                {latestOrders.length === 0 && !isLoading && (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={isMobile ? 'var(--spacing-sm)' : 'var(--spacing-lg)'}>
                        <Receipt sx={{ fontSize: isMobile ? 32 : 48, color: 'var(--secondary-text-color)', mb: 'var(--spacing-sm)' }} />
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'var(--secondary-text-color)',
                                fontWeight: 500,
                                fontFamily: 'var(--font-primary)',
                                fontSize: isMobile ? 'var(--font-size-md)' : 'var(--font-size-lg)',
                                mb: 'var(--spacing-xs)',
                            }}
                        >
                            No recent orders
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'var(--secondary-text-color)',
                                fontFamily: 'var(--font-primary)',
                                textAlign: 'center',
                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                            }}
                        >
                            No orders found in the selected period
                        </Typography>
                    </Box>
                )}

            </CardContent>
     
    );
};

export default LatestOrders;