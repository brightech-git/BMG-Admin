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
import { Link } from 'react-router-dom';

// Styled Components
const StyledCard = styled(Card)(({ themeMode }) => ({
    borderRadius: 'var(--border-radius-sm)',
    background: themeMode === 'dark'
        ? 'linear-gradient(135deg, var(--background-color) )'
        : 'linear-gradient(135deg, var(--background-color) )',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    transition: 'all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1)',
    margin:'0',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(30, 30, 44, 0.12)',
    },
    '@media (max-width: 600px)': {
        margin: 'var(--spacing-sm)',
    },
}));

const StatusChip = styled(Chip)(({ status, themeMode }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return {
                    background: 'linear-gradient(135deg, var(--success-color) 0%, #2a9891 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(52, 177, 170, 0.3)',
                };
            case 'pending':
                return {
                    background: 'linear-gradient(135deg, var(--warning-color) 0%, #c9a00d 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(224, 181, 15, 0.3)',
                };
            case 'cancelled':
                return {
                    background: 'linear-gradient(135deg, var(--error-color) 0%, #e04545 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(243, 104, 104, 0.3)',
                };
            case 'delivered':
                return {
                    background: 'linear-gradient(135deg, var(--success-color) 0%, #45a049 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                };
            case 'shipped':
                return {
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #1976d2 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                };
            default:
                return {
                    background: 'linear-gradient(135deg, var(--info-color) 0%, #2a7bd9 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(59, 143, 243, 0.3)',
                };
        }
    };

    return {
        fontFamily: 'var(--font-primary)',
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 'var(--font-size-xs)',
        minWidth: '80px',
        height: '24px',
        borderRadius: 'var(--border-radius-sm)',
        transition: 'all var(--transition-speed) ease',
        ...getStatusStyles(status),
        '&:hover': {
            transform: 'scale(1.05)',
        },
        '@media (max-width: 600px)': {
            fontSize: '0.65rem',
            minWidth: '60px',
            height: '20px',
        },
    };
});

const CompactTable = styled(TableContainer)(({ themeMode }) => ({
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'auto',
    background: themeMode === 'dark' ? 'var(--background-color)' : '#ffffff',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    '& .MuiTableHead-root': {
        background: themeMode === 'dark'
            ? 'linear-gradient(135deg, var(--background-color) 0%, #2a2a2a 100%)'
            : 'linear-gradient(135deg, var(--primary-color) 0%, #fef6f1 100%)',
        '& .MuiTableCell-head': {
            color: themeMode === 'dark' ? 'var(--primary-text-color)' : '#ffffff',
            fontFamily: 'var(--font-primary)',
            fontWeight: 700,
            fontSize: 'var(--font-size-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            whiteSpace: 'nowrap',
            '@media (max-width: 600px)': {
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                fontSize: '0.65rem',
            },
        },
    },
    '& .MuiTableRow-root': {
        transition: 'all var(--transition-speed) ease',
        '&:hover': {
            backgroundColor: 'var(--active-bg)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid var(--border-color)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-primary)',
        color: themeMode === 'dark' ? 'var(--primary-text-color)' : 'var(--primary-color)',
        whiteSpace: 'nowrap',
        '@media (max-width: 600px)': {
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            fontSize: '0.75rem',
        },
    },
}));

const StyledModal = styled(Dialog)(({ themeMode }) => ({
    '& .MuiDialog-paper': {
        background: themeMode === 'dark' ? 'var(--card-background-color)' : '#ffffff',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        maxWidth: '600px',
        width: '90%',
        margin: 'var(--spacing-md)',
        '@media (max-width: 600px)': {
            margin: 'var(--spacing-sm)',
        },
    },
    '& .MuiDialogTitle-root': {
        background: themeMode === 'dark' ? '#2a2a2a' : '#fef6f1',
        color: themeMode === 'dark' ? 'var(--primary-text-color)' : 'var(--primary-color)',
        fontFamily: 'var(--font-primary)',
        fontWeight: 600,
        fontSize: 'var(--font-size-md)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        '@media (max-width: 600px)': {
            fontSize: 'var(--font-size-sm)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
        },
    },
    '& .MuiDialogContent-root': {
        padding: 'var(--spacing-md) var(--spacing-lg)',
        '@media (max-width: 600px)': {
            padding: 'var(--spacing-sm) var(--spacing-md)',
        },
    },
}));

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

    const handleOpenTrackingModal = useCallback((orderId) => {
        setSelectedOrderId(orderId);
    }, []);

    const handleCloseTrackingModal = useCallback(() => {
        setSelectedOrderId(null);
    }, []);

    const getOrderDisplayName = (order) => order?.customerName || 'Unknown Customer';
    const getOrderAmount = (order) => order?.totalAmount || 0;
    const getOrderStatus = (order) => order?.status || 'Unknown';

    if (isError) {
        return (
            <StyledCard themeMode={themeMode}>
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
            </StyledCard>
        );
    }

    return (
        <StyledCard themeMode={themeMode}>
            <CardContent sx={{ p: isMobile ? 'var(--spacing-sm)' : 'var(--spacing-md)' }}>
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
                                    fontSize: isMobile ? 'var(--font-size-md)' : 'var(--font-size-lg)',
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
                                fontSize: isMobile ? '0.65rem' : 'var(--font-size-xs)',
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
                            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                <CompactTable themeMode={themeMode}>
                                    <Table size="small" sx={{ minWidth: isMobile ? '650px' : '100%' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Order ID</TableCell>
                                                <TableCell>Customer</TableCell>
                                                {!isMobile && !isTablet && <TableCell>Date</TableCell>}
                                                {!isMobile && <TableCell align="right">Amount</TableCell>}
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Tracking</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {latestOrders.map((order) => (
                                                <TableRow key={order.orderId}>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'var(--primary-color)',
                                                                fontFamily: 'var(--font-primary)',
                                                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                                            }}
                                                        >
                                                            #{order.orderId}
                                                        </Typography>
                                                        {isMobile && (
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--secondary-text-color)',
                                                                    fontFamily: 'var(--font-primary)',
                                                                    fontSize: '0.65rem',
                                                                }}
                                                            >
                                                                {format(parseISO(order.orderTime), 'dd/MM/yyyy hh:mm a')}
                                                            </Typography>
                                                        )}
                                                        {isMobile && (
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    color: 'var(--warning-color)',
                                                                    fontFamily: 'var(--font-primary)',
                                                                    fontSize: '0.65rem',
                                                                }}
                                                            >
                                                                ₹{getOrderAmount(order).toFixed(2)}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: 'var(--primary-text-color)',
                                                                    fontFamily: 'var(--font-primary)',
                                                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                                                    whiteSpace: isMobile ? 'normal' : 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    maxWidth: isMobile ? '150px' : '200px',
                                                                }}
                                                            >
                                                                {getOrderDisplayName(order)}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--secondary-text-color)',
                                                                    fontFamily: 'var(--font-primary)',
                                                                    fontSize: isMobile ? '0.65rem' : 'var(--font-size-xs)',
                                                                    whiteSpace: isMobile ? 'normal' : 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    maxWidth: isMobile ? '150px' : '200px',
                                                                }}
                                                            >
                                                                {order.email || 'No email'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    {!isMobile && !isTablet && (
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontFamily: 'var(--font-primary)',
                                                                    color: 'var(--primary-text-color)',
                                                                    fontSize: 'var(--font-size-sm)',
                                                                }}
                                                            >
                                                                {format(parseISO(order.orderTime), 'dd/MM/yyyy')}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--secondary-text-color)',
                                                                    fontFamily: 'var(--font-primary)',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                }}
                                                            >
                                                                {format(parseISO(order.orderTime), 'hh:mm a')}
                                                            </Typography>
                                                        </TableCell>
                                                    )}
                                                    {!isMobile && (
                                                        <TableCell align="right">
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    color: 'var(--warning-color)',
                                                                    fontFamily: 'var(--font-primary)',
                                                                    fontSize: 'var(--font-size-sm)',
                                                                }}
                                                            >
                                                                ₹{getOrderAmount(order).toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="center">
                                                        <StatusChip
                                                            label={getOrderStatus(order).toUpperCase()}
                                                            status={getOrderStatus(order)}
                                                            size="small"
                                                            themeMode={themeMode}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            onClick={() => handleOpenTrackingModal(order.orderId)}
                                                            sx={{ color: 'var(--primary-color)' }}
                                                        >
                                                            <Visibility fontSize={isMobile ? 'small' : 'medium'} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CompactTable>
                            </Box>
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

                <StyledModal
                    open={!!selectedOrderId}
                    onClose={handleCloseTrackingModal}
                    themeMode={themeMode}
                >
                    <DialogTitle>Tracking Details for Order #{selectedOrderId}</DialogTitle>
                    <DialogContent>
                        {isTrackingLoading ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p="var(--spacing-md)">
                                <CircularProgress
                                    size={isMobile ? 24 : 32}
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
                                    Loading tracking details...
                                </Typography>
                            </Box>
                        ) : trackingData?.history?.length > 0 ? (
                            trackingData.history.map((track, index) => {
                                const trackStatus = track.status;
                                const cancelledStatuses = ['CANCELLED', 'RTO_IN_PROGRESS', 'RTO_DELIVERED', 'REFUND'];
                                const failedStatuses = ['DELIVERY_FAILED'];
                                const isCancelledTrack = cancelledStatuses.includes(trackStatus);
                                const isFailedTrack = failedStatuses.includes(trackStatus);

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            py: 'var(--spacing-sm)',
                                            borderBottom: index === trackingData.history.length - 1 ? 'none' : '1px dashed var(--border-color)',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            gap: isMobile ? 'var(--spacing-xs)' : 0,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'var(--secondary-text-color)',
                                                fontWeight: 500,
                                                minWidth: '140px',
                                                fontFamily: 'var(--font-primary)',
                                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                            }}
                                        >
                                            {format(parseISO(track.updated_at), 'MMM d, yyyy h:mm a')}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'var(--primary-text-color)',
                                                fontWeight: 500,
                                                textAlign: isMobile ? 'center' : 'center',
                                                flex: 1,
                                                mx: 2,
                                                fontFamily: 'var(--font-primary)',
                                                fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                            }}
                                        >
                                            {track.remarks || 'Status updated'}
                                        </Typography>
                                        <Box
                                            sx={{
                                                backgroundColor: isCancelledTrack ? 'var(--error-color)' : isFailedTrack ? 'var(--warning-color)' : 'var(--success-color)',
                                                color: '#ffffff',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 'var(--border-radius-sm)',
                                                fontSize: isMobile ? '0.65rem' : 'var(--font-size-xs)',
                                                fontWeight: 600,
                                                textTransform: 'capitalize',
                                                minWidth: '100px',
                                                textAlign: 'center',
                                                fontFamily: 'var(--font-primary)',
                                            }}
                                        >
                                            {track.status.replace(/_/g, ' ').toLowerCase()}
                                        </Box>
                                    </Box>
                                );
                            })
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    textAlign: 'center',
                                    py: 'var(--spacing-sm)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                                }}
                            >
                                No tracking details available
                            </Typography>
                        )}
                    </DialogContent>
                </StyledModal>
            </CardContent>
        </StyledCard>
    );
};

export default LatestOrders;