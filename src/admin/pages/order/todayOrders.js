import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../context/themeContext/themeContext';
import { useOrdersByDateRange } from '../../hooks/order/useAllOrder';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    Collapse,
    Tooltip,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    Check as CheckIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    ExpandMore,
    Receipt,
    RemoveRedEye,
    Search as SearchIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/system';
import { useMutation } from '@tanstack/react-query';
import { trackOrderById } from '../../service/orderService';
import { Link } from 'react-router-dom';
// ========== STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)(({ mode }) => ({
    borderRadius: 'var(--border-radius-md)',
    overflowX: "auto", 
    background: 'var(--card-background-color)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    maxHeight: 'none',
    '& .MuiTableHead-root': {
        background: mode === 'dark' ? 'var(--dark-bg)' : 'var(--light-bg)',
        '& .MuiTableCell-head': {
            color: 'var(--primary-text-color)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 600,
            fontSize: 'var(--font-size-xs)',
            textTransform: 'none',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: 'var(--spacing-sm) var(--spacing-md)',
        },
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: mode === 'dark' ? 'var(--active-bg)' : 'rgba(235, 167, 72, 0.04)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid var(--border-color)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-primary)',
        color: 'var(--primary-text-color)',
    },
    "@media (max-width: 768px)": {
        display: "block",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch", // smooth scroll on iOS
    },

    "& table": {
        minWidth: "800px", // 👈 force table to be wider than viewport
    },
}));

const ModernButton = styled(Button)(({ mode }) => ({
    borderRadius: 'var(--border-radius-md)',
    textTransform: 'none',
    fontWeight: 600,
    fontFamily: 'var(--font-primary)',
    fontSize: 'var(--font-size-md)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    background: mode === 'dark' ? 'var(--primary-color)' : 'var(--primary-color)',
    color: mode === 'dark' ? 'var(--text-dark)' : 'var(--text-light)',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        background: mode === 'dark' ? 'var(--active-border)' : 'var(--primary-color)',
    },
}));

const StatusChip = styled(Chip)(({ status, mode }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'placed':
            case 'in_processing':
            case 'packed':
            case 'shipped':
            case 'in_transit':
            case 'out_for_delivery':
            case 'delivered':
                return {
                    background: mode === 'dark' ? 'var(--success-color)' : 'linear-gradient(135deg, var(--success-color) 0%, #059669 100%)',
                    color: mode === 'dark' ? 'var(--text-dark)' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(16, 185, 129ទ: 129, 0.3)',
                };
            case 'cancelled':
            case 'rto_in_progress':
            case 'rto_delivered':
            case 'refund':
                return {
                    background: mode === 'dark' ? 'var(--error-color)' : 'linear-gradient(135deg, var(--error-color) 0%, #e04545 100%)',
                    color: mode === 'dark' ? 'var(--text-dark)' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(243, 104, 104, 0.3)',
                };
            case 'delivery_failed':
                return {
                    background: mode === 'dark' ? 'var(--warning-color)' : 'linear-gradient(135deg, var(--warning-color) 0%, #D97706 100%)',
                    color: mode === 'dark' ? 'var(--text-dark)' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                };
            default:
                return {
                    background: mode === 'dark' ? 'var(--secondary-color)' : 'linear-gradient(135deg, var(--secondary-color) 0%, #4B5563 100%)',
                    color: mode === 'dark' ? 'var(--text-dark)' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
                };
        }
    };

    return {
        fontWeight: 700,
        fontFamily: 'var(--font-primary)',
        textTransform: 'uppercase',
        fontSize: 'var(--font-size-xs)',
        minWidth: '90px',
        height: '28px',
        borderRadius: 'var(--border-radius-sm)',
        transition: 'all 0.2s ease',
        ...getStatusStyles(status),
        '&:hover': {
            transform: 'scale(1.05)',
        },
    };
});

const TableHeaderCard = styled(Card)(({ mode }) => ({
    borderRadius: 'var(--border-radius-md)',
    background: mode === 'dark' ? 'var(--card-background-color)' : 'var(--light-bg)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    marginBottom: 'var(--spacing-lg)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(30, 30, 44, 0.12)',
    },
}));

const SearchInput = styled(TextField)(({ mode }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 'var(--border-radius-md)',
        backgroundColor: mode === 'dark' ? 'var(--background-color)' : '#ffffff',
        fontSize: 'var(--font-size-md)',
        fontFamily: 'var(--font-primary)',
        color: 'var(--primary-text-color)',
        '& fieldset': {
            borderColor: 'var(--border-color)',
        },
        '&:hover fieldset': {
            borderColor: mode === 'dark' ? 'var(--active-border)' : 'var(--primary-color)',
        },
    },
}));

const STATUS_OPTIONS = {
    PLACED: 'Placed',
    IN_PROCESSING: 'Processing',
    READY: 'Move to ship',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    IN_TRANSIT: 'In Transit',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    DELIVERY_FAILED: 'Delivery Failed',
    CANCELLED: 'Cancelled',
    RTO_IN_PROGRESS: 'Return in Progress',
    RTO_DELIVERED: 'Returned',
    REFUND: 'Refunded',
};

const OrderHistoryPage = () => {
    const { themeMode } = useContext(MyContext);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingData, setTrackingData] = useState(null);

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
    const { data: orders = [], isLoading, isError, refetch } = useOrdersByDateRange(
        formattedStartDate,
        formattedEndDate
    );

    useEffect(() => {
        refetch();
    }, [formattedStartDate, formattedEndDate, refetch]);

    const trackOrderMutation = useMutation({
        mutationFn: (orderId) => trackOrderById(orderId),
        onSuccess: (data) => {
            setTrackingData(data);
            setTrackingModalOpen(true);
        },
        onError: (error) => {
            console.error('Tracking error:', error);
        },
    });

    const handleQuickDateSelect = (days) => {
        const newStartDate = subDays(new Date(), days);
        setStartDate(newStartDate);
        setEndDate(new Date());
    };

    const toggleRowExpansion = (orderId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    const handleTrackOrder = (orderId) => {
        trackOrderMutation.mutate(orderId);
    };

    const closeTrackingModal = () => {
        setTrackingModalOpen(false);
        setTrackingData(null);
    };
    const parseDate = (value) => (value ? new Date(value) : null);
    const filteredOrders = Array.isArray(orders)
        ? orders.filter((order) => {
            const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
            const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
            const matchesDate = start && end
                ? isWithinInterval(parseISO(order.orderTime), { start, end })
                : true;
            const searchTerm = searchQuery.trim().toLowerCase();
            const matchesSearch = searchTerm
                ? order.orderId.toString().toLowerCase().includes(searchTerm) ||
                order.contact.toLowerCase().includes(searchTerm)
                : true;
            return matchesDate && matchesSearch;
        })
        : [];

    if (isError) {
        return (
            <Box
                p={isMobile ? 2 : 4}
                sx={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}
            >
                <Alert
                    severity="error"
                    sx={{
                        backgroundColor: themeMode === 'dark' ? 'var(--error-color)' : '#fff5f5',
                        color: themeMode === 'dark' ? 'var(--text-dark)' : '#d32f2f',
                        borderRadius: 'var(--border-radius-md)',
                        '& .MuiAlert-icon': { color: themeMode === 'dark' ? 'var(--text-dark)' : '#d32f2f' },
                    }}
                >
                    Failed to load orders. Please try again.
                </Alert>
                <ModernButton
                    onClick={() => refetch()}
                    variant="contained"
                    mode={themeMode}
                    sx={{ mt: 2, fontSize: 'var(--font-size-md)' }}
                >
                    Retry
                </ModernButton>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
       
            <Box
                p={isMobile ? 2 : 4}
                sx={{
                    backgroundColor: 'var(--background-color)',
                    minHeight: '100vh',
                    overflow: 'visible',
                }}
            >
                <TableHeaderCard mode={themeMode}>
                    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to="/">Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Manage Today Orders
                                </li>
                            </ol>
                        </nav>
                        <Box
                            display="flex"
                            flexDirection={isMobile ? 'column' : 'row'}
                            alignItems={isMobile ? 'stretch' : 'center'}
                            justifyContent="space-between"
                            mb={3}
                            gap={isMobile ? 2 : 0}
                        >
                           
                            <Box display="flex" alignItems="center" gap={2}>
                               
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'var(--primary-text-color)',
                                        fontWeight: 700,
                                        fontSize: 'var(--font-size-lg)',
                                        fontFamily: 'var(--font-primary)',
                                    }}
                                >
                                    Order Details
                                </Typography>
                                <Chip
                                    label={`${filteredOrders.length || 0} orders`}
                                    size="small"
                                    sx={{
                                        backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(59, 143, 243, 0.1)',
                                        color: themeMode === 'dark' ? 'var(--text-dark)' : '#3B8FF3',
                                        fontWeight: 600,
                                        fontSize: 'var(--font-size-xs)',
                                        fontFamily: 'var(--font-secondary)',
                                    }}
                                />
                            </Box>
                            <Box
                                display="flex"
                                flexDirection={isMobile ? 'column' : 'row'}
                                gap={2}
                                alignItems={isMobile ? 'stretch' : 'center'}
                                width={isMobile ? '100%' : 'auto'}
                            >
                                <Box
                                    display="flex"
                                    gap={2}
                                    flexDirection={isMobile ? 'column' : 'row'}
                                    alignItems={isMobile ? 'stretch' : 'center'}
                                    width={isMobile ? '100%' : 'auto'}
                                >
                                    {/* From Date */}
                                    <TextField
                                        label="From"
                                        type="date"
                                        size="small"
                                        value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setStartDate(parseDate(e.target.value))}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ max: endDate ? format(endDate, 'yyyy-MM-dd') : undefined }}
                                        sx={{
                                            width: isMobile ? '100%' : 160,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 'var(--border-radius-md)',
                                                backgroundColor: themeMode === 'dark' ? 'var(--card-background-color)' : '#ffffff',
                                                '& fieldset': { borderColor: 'var(--border-color)' },
                                                '&:hover fieldset': { borderColor: 'var(--active-border)' },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--primary-color)',
                                                    boxShadow:
                                                        themeMode === 'dark'
                                                            ? '0 0 0 2px rgba(51, 153, 255, 0.2)'
                                                            : '0 0 0 2px rgba(37, 99, 235, 0.2)',
                                                },
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                color: themeMode === 'dark' ? 'var(--text-dark)' : 'var(--primary-text-color)',
                                                fontSize: 'var(--font-size-md)',
                                                fontFamily: 'var(--font-secondary)',
                                                // Make native calendar icon visible in dark mode
                                                '&::-webkit-calendar-picker-indicator': {
                                                    filter: themeMode === 'dark' ? 'invert(1)' : 'none',
                                                    cursor: 'pointer',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: themeMode === 'dark' ? 'var(--secondary-text-color)' : 'var(--secondary-text-color)',
                                                fontFamily: 'var(--font-secondary)',
                                            },
                                        }}
                                    />

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'var(--secondary-text-color)',
                                            fontSize: 'var(--font-size-md)',
                                            fontFamily: 'var(--font-secondary)',
                                        }}
                                    >
                                        to
                                    </Typography>

                                    {/* To Date */}
                                    <TextField
                                        label="To"
                                        type="date"
                                        size="small"
                                        value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setEndDate(parseDate(e.target.value))}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{
                                            min: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                                            max: format(new Date(), 'yyyy-MM-dd'),
                                        }}
                                        sx={{
                                            width: isMobile ? '100%' : 160,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 'var(--border-radius-md)',
                                                backgroundColor: themeMode === 'dark' ? 'var(--card-background-color)' : '#ffffff',
                                                '& fieldset': { borderColor: 'var(--border-color)' },
                                                '&:hover fieldset': { borderColor: 'var(--active-border)' },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--primary-color)',
                                                    boxShadow:
                                                        themeMode === 'dark'
                                                            ? '0 0 0 2px rgba(51, 153, 255, 0.2)'
                                                            : '0 0 0 2px rgba(37, 99, 235, 0.2)',
                                                },
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                color: themeMode === 'dark' ? 'var(--text-dark)' : 'var(--primary-text-color)',
                                                fontSize: 'var(--font-size-md)',
                                                fontFamily: 'var(--font-secondary)',
                                                '&::-webkit-calendar-picker-indicator': {
                                                    filter: themeMode === 'dark' ? 'invert(1)' : 'none',
                                                    cursor: 'pointer',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: themeMode === 'dark' ? 'var(--secondary-text-color)' : 'var(--secondary-text-color)',
                                                fontFamily: 'var(--font-secondary)',
                                            },
                                        }}
                                    />
                                </Box>



                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuickDateSelect(0)}
                                        sx={{
                                            borderRadius: 'var(--border-radius-sm)',
                                            textTransform: 'none',
                                            fontSize: 'var(--font-size-xs)',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            color: 'var(--primary-text-color)',
                                            borderColor: 'var(--border-color)',
                                            '&:hover': {
                                                borderColor: themeMode === 'dark' ? 'var(--active-border)' : 'var(--primary-color)',
                                            },
                                            fontFamily:'var(--font-secondary)'
                                        }}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuickDateSelect(7)}
                                        sx={{
                                            borderRadius: 'var(--border-radius-sm)',
                                            textTransform: 'none',
                                            fontSize: 'var(--font-size-xs)',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            color: 'var(--primary-text-color)',
                                            borderColor: 'var(--border-color)',
                                            '&:hover': {
                                                borderColor: themeMode === 'dark' ? 'var(--active-border)' : 'var(--primary-color)',
                                            },
                                            fontFamily: 'var(--font-secondary)'
                                        }}
                                    >
                                        7 Days
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuickDateSelect(30)}
                                        sx={{
                                            borderRadius: 'var(--border-radius-sm)',
                                            textTransform: 'none',
                                            fontSize: 'var(--font-size-xs)',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            color: 'var(--primary-text-color)',
                                            borderColor: 'var(--border-color)',
                                            '&:hover': {
                                                borderColor: themeMode === 'dark' ? 'var(--active-border)' : 'var(--primary-color)',
                                            },
                                            fontFamily: 'var(--font-secondary)'
                                        }}
                                    >
                                        30 Days
                                    </Button>
                                </Box>
                                <SearchInput
                                    placeholder="Search by Order ID or Mobile"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    size="small"
                                    mode={themeMode}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: 'var(--secondary-text-color)', fontFamily: 'var(--font-secondary)', mr: 1 }} />,
                                    }}
                                    sx={{ width: isMobile ? '100%' : 300, fontFamily: 'var(--font-secondary)' }}
                                />
                            </Box>
                        </Box>
                        {isLoading ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
                                <CircularProgress
                                    size={50}
                                    sx={{ color: themeMode === 'dark' ? 'var(--primary-color)' : '#F29F67', mb: 2 }}
                                />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'var(--secondary-text-color)',
                                        fontFamily: 'var(--font-secondary)',
                                        fontSize: 'var(--font-size-md)',
                                    }}
                                >
                                    Loading orders...
                                </Typography>
                            </Box>
                        ) : (
                            <StyledTableContainer mode={themeMode}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>Order ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>Customer</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>Date & Time</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>Products</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>
                                                Amount
                                            </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>
                                                Status
                                            </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)', }}>
                                                Tracking
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => (
                                                <React.Fragment key={order.orderId}>
                                                    <TableRow sx={{ '&:hover': { backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(242, 159, 103, 0.02)' } }}>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: themeMode === 'dark' ? 'var(--active-border)' : '#3B8FF3',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                    fontFamily:'var(--font-secondary)'
                                                                }}
                                                            >
                                                                #{order.orderId}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        color: 'var(--primary-text-color)',
                                                                        fontSize: 'var(--font-size-xs)',
                                                                        fontFamily: 'var(--font-secondary)'
                                                                    }}
                                                                >
                                                                    {order.customerName}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'var(--secondary-text-color)',
                                                                        fontSize: 'var(--font-size-xs)',
                                                                        fontFamily: 'var(--font-secondary)'
                                                                    }}
                                                                >
                                                                    {order.email}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize: 'var(--font-size-xs)',
                                                                    color: 'var(--primary-text-color)',
                                                                    fontFamily: 'var(--font-secondary)'
                                                                }}
                                                            >
                                                                {format(parseISO(order.orderTime), 'dd/MM/yyyy')}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--secondary-text-color)',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                    fontFamily: 'var(--font-secondary)'
                                                                }}
                                                            >
                                                                {format(parseISO(order.orderTime), 'hh:mm a')}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Chip
                                                                    label={`${order.orderItems.length} item${order.orderItems.length > 1 ? 's' : ''}`}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(52, 177, 170, 0.1)',
                                                                        color: themeMode === 'dark' ? 'var(--text-dark)' : '#34B1AA',
                                                                        fontWeight: 600,
                                                                        fontSize: 'var(--font-size-xs)',
                                                                        fontFamily: 'var(--font-secondary)'
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => toggleRowExpansion(order.orderId)}
                                                                    sx={{
                                                                        color: themeMode === 'dark' ? 'var(--active-border)' : '#3B8FF3',
                                                                        transition: 'transform 0.2s ease',
                                                                        transform: expandedRows[order.orderId] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    }}
                                                                >
                                                                    <ExpandMore fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    color: themeMode === 'dark' ? 'var(--primary-color)' : '#F29F67',
                                                                    fontSize: 'var(--font-size-md)',
                                                                    fontFamily: 'var(--font-secondary)'
                                                                }}
                                                            >
                                                                ₹{order.totalAmount.toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <StatusChip
                                                                label={order.status.toUpperCase()}
                                                                status={order.status}
                                                                mode={themeMode}
                                                                size="small"
                                                                sx={{ fontFamily: 'var(--font-secondary)' }}
                                
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="View Tracking" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleTrackOrder(order?.orderId)}
                                                                    sx={{
                                                                        color: themeMode === 'dark' ? 'var(--active-border)' : '#34B1AA',
                                                                        backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(52, 177, 170, 0.1)',
                                                                        borderRadius: 'var(--border-radius-sm)',
                                                                        '&:hover': {
                                                                            backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(52, 177, 170, 0.2)',
                                                                            transform: 'scale(1.05)',
                                                                        },
                                                                        fontFamily: 'var(--font-secondary)'
                                                                    }}
                                                                >
                                                                    <RemoveRedEye fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            sx={{
                                                                py: 0,
                                                                px: 0,
                                                                borderBottom: expandedRows[order.orderId] ? '1px solid var(--border-color)' : 0,
                                                                mb: expandedRows[order.orderId] ? 2 : 0,
                                                            }}
                                                        >
                                                            <Collapse in={expandedRows[order.orderId]} timeout="auto" unmountOnExit>
                                                                <Box
                                                                    sx={{
                                                                        backgroundColor: 'var(--card-background-color)',
                                                                        borderTop: '1px solid var(--border-color)',
                                                                        borderBottom: '1px solid var(--border-color)',
                                                                        py: 2,
                                                                        px: 2,
                                                                    }}
                                                                >
                                                                    <Table
                                                                        size="small"
                                                                        sx={{
                                                                            width: '100%',
                                                                            tableLayout: 'fixed',
                                                                            '& .MuiTableCell-root': {
                                                                                borderBottom: '1px solid var(--border-color)',
                                                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <TableHead>
                                                                            <TableRow
                                                                                sx={{
                                                                                    backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(59, 143, 243, 0.08)',
                                                                                }}
                                                                            >
                                                                                <TableCell
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: themeMode === 'dark' ? 'var(--active-border)' : '#3B8FF3',
                                                                                        fontSize: 'var(--font-size-xs)',
                                                                                        width: '40%',
                                                                                        fontFamily: 'var(--font-primary)'
                                                                                    }}
                                                                                >
                                                                                    Product
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: themeMode === 'dark' ? 'var(--active-border)' : '#3B8FF3',
                                                                                        fontSize: 'var(--font-size-xs)',
                                                                                        width: '20%',
                                                                                        fontFamily: 'var(--font-primary)'
                                                                                    }}
                                                                                >
                                                                                    SKU
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    align="right"
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: themeMode === 'dark' ? 'var(--active-border)' : '#3B8FF3',
                                                                                        fontSize: 'var(--font-size-xs)',
                                                                                        width: '20%',
                                                                                        fontFamily: 'var(--font-primary)'
                                                                                    }}
                                                                                >
                                                                                    Unit Price
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    align="right"
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: themeMode === 'dark' ? 'var(--active-border)' : '#3B8FF3',
                                                                                        fontSize: 'var(--font-size-xs)',
                                                                                        width: '20%',
                                                                                        fontFamily: 'var(--font-primary)'
                                                                                    }}
                                                                                >
                                                                                    Total
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {order.orderItems.map((item, index) => {
                                                                                const isLastRow = index === order.orderItems.length - 1;
                                                                                return (
                                                                                    <TableRow
                                                                                        key={index}
                                                                                        sx={{
                                                                                            '&:hover': {
                                                                                                backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(242, 159, 103, 0.04)',
                                                                                            },
                                                                                            borderBottom: isLastRow ? 'none' : '1px solid var(--border-color)',
                                                                                        }}
                                                                                    >
                                                                                        <TableCell>
                                                                                            <Box display="flex" alignItems="center" gap={2}>
                                                                                                {item.imagePath && (
                                                                                                    <Box
                                                                                                        sx={{
                                                                                                            width: 40,
                                                                                                            height: 40,
                                                                                                            borderRadius: 'var(--border-radius-sm)',
                                                                                                            overflow: 'hidden',
                                                                                                            backgroundColor: 'var(--card-background-color)',
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            justifyContent: 'center',
                                                                                                            flexShrink: 0,
                                                                                                            border: '1px solid var(--border-color)',
                                                                                                            fontFamily: 'var(--font-secondary)'
                                                                                                        }}
                                                                                                    >
                                                                                                        <img
                                                                                                            src={item.imagePath}
                                                                                                            alt={item.productName}
                                                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                                        />
                                                                                                    </Box>
                                                                                                )}
                                                                                                <Typography
                                                                                                    variant="body2"
                                                                                                    sx={{
                                                                                                        fontWeight: 600,
                                                                                                        color: 'var(--primary-text-color)',
                                                                                                        lineHeight: 1.4,
                                                                                                        fontSize: 'var(--font-size-xs)',
                                                                                                        fontFamily: 'var(--font-secondary)'
                                                                                                    }}
                                                                                                >
                                                                                                    {item.productName}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: themeMode === 'dark' ? 'var(--active-border)' : '#34B1AA',
                                                                                                    fontWeight: 500,
                                                                                                    fontFamily: 'var(--font-secondary)',
                                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                                    backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(52, 177, 170, 0.1)',
                                                                                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                                                                    borderRadius: 'var(--border-radius-sm)',
                                                                                                    display: 'inline-block',
                                                                                                }}
                                                                                            >
                                                                                                {item.itemid}-{item.tagno}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell align="right">
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--secondary-text-color)',
                                                                                                    fontWeight: 500,
                                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                                    fontFamily: 'var(--font-secondary)'
                                                                                                }}
                                                                                            >
                                                                                                ₹{item.price.toFixed(2)}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell align="right">
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: themeMode === 'dark' ? 'var(--primary-color)' : '#F29F67',
                                                                                                    fontWeight: 700,
                                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                                    fontFamily: 'var(--font-secondary)'
                                                                                                }}
                                                                                            >
                                                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                            <TableRow
                                                                                sx={{
                                                                                    backgroundColor: themeMode === 'dark' ? 'var(--active-bg)' : 'rgba(242, 159, 103, 0.05)',
                                                                                    borderTop: '2px solid rgba(242, 159, 103, 0.2)',
                                                                                }}
                                                                            >
                                                                                <TableCell colSpan={3} sx={{ py: 2 }}>
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            color: 'var(--primary-text-color)',
                                                                                            textAlign: 'right',
                                                                                            fontSize: 'var(--font-size-xs)',
                                                                                            fontFamily: 'var(--font-primary)'
                                                                                        }}
                                                                                    >
                                                                                        Order Total:
                                                                                    </Typography>
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ py: 2 }}>
                                                                                    <Typography
                                                                                        variant="h6"
                                                                                        sx={{
                                                                                            color: themeMode === 'dark' ? 'var(--primary-color)' : '#F29F67',
                                                                                            fontWeight: 700,
                                                                                            fontSize: 'var(--font-size-md)',
                                                                                            fontFamily: 'var(--font-secondary)'
                                                                                        }}
                                                                                    >
                                                                                        ₹{order.totalAmount.toFixed(2)}
                                                                                    </Typography>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </Box>
                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                                        <Receipt sx={{ fontSize: 60, color: 'var(--secondary-text-color)' }} />
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: 'var(--secondary-text-color)',
                                                                fontWeight: 500,
                                                                fontSize: 'var(--font-size-md)',
                                                            }}
                                                        >
                                                            No orders found
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'var(--secondary-text-color)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            Try adjusting your date range or search query
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </StyledTableContainer>
                        )}
                    </CardContent>
                </TableHeaderCard>

                <Dialog
                    open={trackingModalOpen}
                    onClose={closeTrackingModal}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 'var(--border-radius-md)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            maxHeight: '90vh',
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border-color)',
                            pb: 2,
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            color: 'var(--primary-text-color)',
                            fontFamily: 'var(--font-primary)',
                        }}
                    >
                        Order Tracking Details
                        <IconButton
                            onClick={closeTrackingModal}
                            sx={{
                                color: 'var(--secondary-text-color)',
                                '&:hover': {
                                    backgroundColor: 'var(--active-bg)',
                                    color: 'var(--primary-text-color)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        {trackingData && trackingData.history && trackingData.history.length > 0 ? (
                            <Box sx={{ width: '100%', padding: { xs: 1, sm: 2 } }}>
                                {(() => {
                                    const isMobile = { query: '(max-width: 768px)' };
                                    const latestHistoryStatus = trackingData.history?.[trackingData.history.length - 1]?.status;
                                    const cancelledStatuses = ['CANCELLED', 'RTO_IN_PROGRESS', 'RTO_DELIVERED', 'REFUND'];
                                    const failedStatuses = ['DELIVERY_FAILED'];
                                    const successStatuses = ['DELIVERED'];
                                    const statusOrder = [
                                        'PAYMENT_PENDING',
                                        'PENDING',
                                        'PLACED',
                                        'IN_PROCESSING',
                                        'MOVE TO PACK',
                                        'PACKED',
                                        'SHIPPED',
                                        'IN_TRANSIT',
                                        'OUT_FOR_DELIVERY',
                                        'DELIVERED',
                                    ];

                                    let currentStatus =
                                        trackingData.current_status && statusOrder.includes(trackingData.current_status)
                                            ? trackingData.current_status
                                            : latestHistoryStatus || 'PLACED';

                                    const isCancelled = cancelledStatuses.includes(currentStatus);
                                    const isFailed = failedStatuses.includes(currentStatus);
                                    const isSuccess = successStatuses.includes(currentStatus);

                                    // ✅ Add pending states
                                    const isPending = currentStatus === 'PENDING';
                                    console.log(isPending ,'isPending')
                                    const isPaymentPending = currentStatus === 'PAYMENT_PENDING';

                                    if (!statusOrder.includes(currentStatus) && !isCancelled ) {
                                        console.warn(`Invalid status: ${currentStatus}. Defaulting to PLACED.`);
                                        currentStatus = 'PLACED';
                                    }

                                    const currentStepIndex =
                                        isCancelled || isPending || isPaymentPending
                                            ? -1 // ✅ -1 means don't start the bar
                                            : statusOrder.indexOf(currentStatus);


                                    const getStatusLabel = (status) => {
                                        return STATUS_OPTIONS[status] || status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
                                    };

                                    const progressConfig = {
                                        color: isCancelled
                                            ? 'var(--error-color)'
                                            : isFailed
                                                ? 'var(--warning-color)'
                                                : isPending || isPaymentPending
                                                    ? 'var(--warning-color)' // 🟡 yellow for pending
                                                    : 'var(--success-color)',

                                        backgroundColor: isCancelled
                                            ? 'var(--error-color)'
                                            : isFailed
                                                ? 'var(--warning-color)'
                                                : isPending || isPaymentPending
                                                    ? 'var(--warning-color)' // 🟡 yellow bg
                                                    : 'var(--success-color)',

                                        borderColor: isCancelled
                                            ? themeMode === 'dark' ? '#DC2626' : '#e04545'
                                            : isFailed
                                                ? themeMode === 'dark' ? '#D97706' : '#F59E0B'
                                                : isPending || isPaymentPending
                                                    ? themeMode === 'dark' ? '#CA8A04' : '#EAB308' // 🟡 yellow border
                                                    : themeMode === 'dark' ? '#059669' : '#10B981',

                                        icon: isCancelled
                                            ? CancelIcon
                                            : isFailed
                                                ? WarningIcon
                                                : isPending || isPaymentPending
                                                    ? HourglassEmptyIcon // ⏳ pending indicator
                                                    : CheckIcon,

                                        shadowColor: isCancelled
                                            ? 'rgba(239, 68, 68, 0.3)'
                                            : isFailed
                                                ? 'rgba(245, 158, 11, 0.3)'
                                                : isPending || isPaymentPending
                                                    ? 'rgba(234, 179, 8, 0.3)' // 🟡 yellow glow
                                                    : 'rgba(16, 185, 129, 0.2)',
                                    };



                                    if (isMobile) {
                                        return (
                                            <>
                                                <Card
                                                    sx={{
                                                        mb: 3,
                                                        background: themeMode === 'dark' ? 'var(--card-background-color)' : isCancelled ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                                                        border: `1px solid ${isCancelled ? 'var(--error-color)' : 'var(--success-color)'}`,
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: progressConfig.backgroundColor,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    mr: 2,
                                                                }}
                                                            >
                                                                {React.createElement(progressConfig.icon, {
                                                                    sx: { color: 'white', fontSize: 20 },
                                                                })}
                                                            </Box>
                                                            <Box>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    sx={{
                                                                        color: 'var(--secondary-text-color)',
                                                                        fontSize: 'var(--font-size-xs)',
                                                                    }}
                                                                >
                                                                    Current Status
                                                                </Typography>
                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        color: isCancelled ? 'var(--error-color)' : 'var(--primary-text-color)',
                                                                        fontWeight: 600,
                                                                        fontSize: 'var(--font-size-md)',
                                                                    }}
                                                                >
                                                                    {getStatusLabel(currentStatus)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ mt: 2 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'var(--secondary-text-color)',
                                                                        fontSize: 'var(--font-size-xs)',
                                                                    }}
                                                                >
                                                                    {isCancelled ? 'Order Status' : 'Progress'}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: progressConfig.backgroundColor,
                                                                        fontWeight: 600,
                                                                        fontSize: 'var(--font-size-xs)',
                                                                    }}
                                                                >
                                                                    {isCancelled ? 'Cancelled' : `${Math.round((currentStepIndex / (statusOrder.length - 1)) * 100)}%`}
                                                                </Typography>
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    width: '100%',
                                                                    height: 6,
                                                                    backgroundColor: 'var(--border-color)',
                                                                    borderRadius: 3,
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: isCancelled ? '100%' : `${(currentStepIndex / (statusOrder.length - 1)) * 100}%`,
                                                                        height: '100%',
                                                                        background: progressConfig.color,
                                                                        transition: 'width 0.5s ease-in-out',
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            mb: 2,
                                                            fontWeight: 600,
                                                            fontSize: 'var(--font-size-md)',
                                                            color: 'var(--primary-text-color)',
                                                        }}
                                                    >
                                                        Tracking History
                                                    </Typography>
                                                    {trackingData.history?.slice().reverse().map((track, index) => {
                                                        const isLatest = index === 0;
                                                        const trackStatus = track.status;
                                                        const isFailedTrack = failedStatuses.includes(trackStatus);
                                                        const isCancelledTrack = cancelledStatuses.includes(trackStatus);

                                                        return (
                                                            <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 12,
                                                                            height: 12,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: isLatest
                                                                                ? isCancelledTrack
                                                                                    ? 'var(--error-color)'
                                                                                    : isFailedTrack
                                                                                        ? 'var(--warning-color)'
                                                                                        : 'var(--success-color)'
                                                                                : 'var(--success-color)',
                                                                            zIndex: 1,
                                                                        }}
                                                                    />
                                                                    {index < trackingData.history.length - 1 && (
                                                                        <Box
                                                                            sx={{
                                                                                width: 2,
                                                                                height: 40,
                                                                                backgroundColor: 'var(--border-color)',
                                                                                mt: 1,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontWeight: isLatest ? 600 : 500,
                                                                                color: isLatest ? 'var(--primary-text-color)' : 'var(--secondary-text-color)',
                                                                                mr: 1,
                                                                                fontSize: 'var(--font-size-xs)',
                                                                            }}
                                                                        >
                                                                            {getStatusLabel(trackStatus)}
                                                                        </Typography>
                                                                        {isCancelledTrack && (
                                                                            <Chip
                                                                                label="Cancelled"
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: themeMode === 'dark' ? 'var(--error-color)' : '#FEE2E2',
                                                                                    color: themeMode === 'dark' ? 'var(--text-dark)' : '#DC2626',
                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                    height: 20,
                                                                                }}
                                                                            />
                                                                        )}
                                                                        {isFailedTrack && (
                                                                            <Chip
                                                                                label="Failed"
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: themeMode === 'dark' ? 'var(--warning-color)' : '#FEF3C7',
                                                                                    color: themeMode === 'dark' ? 'var(--text-dark)' : '#D97706',
                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                    height: 20,
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: 'var(--secondary-text-color)',
                                                                            display: 'block',
                                                                            mb: 0.5,
                                                                            fontSize: 'var(--font-size-xs)',
                                                                        }}
                                                                    >
                                                                        {format(parseISO(track.updated_at), 'MMM d, yyyy h:mm a')}
                                                                    </Typography>
                                                                    {track.remarks && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: 'var(--secondary-text-color)',
                                                                                fontStyle: 'italic',
                                                                                fontSize: 'var(--font-size-xs)',
                                                                            }}
                                                                        >
                                                                            {track.remarks}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </>
                                        );
                                    }

                                    return (
                                        <Box sx={{ mb: 6 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'var(--primary-text-color)',
                                                    fontWeight: 600,
                                                    mb: 4,
                                                    textAlign: 'center',
                                                    fontSize: 'var(--font-size-md)',
                                                }}
                                            >
                                                Order Progress
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                    px: 1,
                                                }}
                                            >
                                                {statusOrder.map((status, index) => (
                                                    <Typography
                                                        key={index}
                                                        variant="caption"
                                                        sx={{
                                                            color: index <= currentStepIndex && !isCancelled ? 'var(--success-color)' : 'var(--secondary-text-color)',
                                                            fontWeight: index <= currentStepIndex && !isCancelled ? 600 : 500,
                                                            textAlign: 'center',
                                                            fontSize: 'var(--font-size-xs)',
                                                            maxWidth: '80px',
                                                        }}
                                                    >
                                                        {getStatusLabel(status)}
                                                    </Typography>
                                                ))}
                                                {isCancelled && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'var(--error-color)',
                                                            fontWeight: 600,
                                                            textAlign: 'center',
                                                            fontSize: 'var(--font-size-xs)',
                                                            maxWidth: '80px',
                                                        }}
                                                    >
                                                        Cancelled
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: '4px',
                                                        backgroundColor: 'var(--border-color)',
                                                        borderRadius: '2px',
                                                        position: 'absolute',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                    }}
                                                />
                                                {statusOrder.map((_, index) => {
                                                    if (index === 0 || index > currentStepIndex || isCancelled) return null;
                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                width: `${100 / (statusOrder.length - 1)}%`,
                                                                height: '4px',
                                                                background: progressConfig.color,
                                                                borderRadius: '2px',
                                                                position: 'absolute',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                left: `${((index - 1) / (statusOrder.length - 1)) * 100}%`,
                                                                transition: 'background 0.5s ease-in-out',
                                                            }}
                                                        />
                                                    );
                                                })}
                                                {statusOrder.map((status, index) => {
                                                    const isCompleted = !isCancelled && index <= currentStepIndex;
                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                left: `${(index / (statusOrder.length - 1)) * 100}%`,
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                backgroundColor: isCompleted ? progressConfig.backgroundColor : 'var(--border-color)',
                                                                border: isCompleted ? `2px solid ${progressConfig.borderColor}` : '2px solid var(--border-color)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                zIndex: 2,
                                                                boxShadow: isCompleted ? `0 2px 4px ${progressConfig.shadowColor}` : 'none',
                                                                transition: 'all 0.3s ease-in-out',
                                                            }}
                                                        >
                                                            {isCompleted && (
                                                                <CheckIcon
                                                                    sx={{
                                                                        fontSize: '14px',
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                                {isCancelled && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            right: '-16px',
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'var(--error-color)',
                                                            border: '3px solid var(--error-color)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            zIndex: 3,
                                                            boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
                                                            animation: 'pulse 2s infinite',
                                                        }}
                                                    >
                                                        <CancelIcon
                                                            sx={{
                                                                fontSize: '18px',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })()}

                                <Box sx={{ mb: 4 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: 'var(--primary-text-color)',
                                            fontWeight: 600,
                                            mb: 2,
                                            fontSize: 'var(--font-size-md)',
                                        }}
                                    >
                                        Order Items
                                    </Typography>
                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            borderRadius: 'var(--border-radius-md)',
                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                            overflowX: 'auto',
                                        }}
                                    >
                                        <Table sx={{ minWidth: { xs: 300, sm: 650 } }} aria-label="order items table">
                                            <TableHead sx={{ backgroundColor: 'var(--card-background-color)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                        S.No
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                        Product Name
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                        Quantity
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                        Price (₹)
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                        Image
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {trackingData?.items && trackingData.items.length > 0 ? (
                                                    trackingData.items.map((item, index) => (
                                                        <TableRow
                                                            key={item.id}
                                                            sx={{
                                                                '&:nth-of-type(odd)': { backgroundColor: 'var(--card-background-color)' },
                                                                '&:hover': { backgroundColor: 'var(--active-bg)' },
                                                            }}
                                                        >
                                                            <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                {item.sno}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    color: 'var(--primary-text-color)',
                                                                    fontWeight: 500,
                                                                    fontSize: 'var(--font-size-xs)',
                                                                    maxWidth: { xs: 150, sm: 'none' },
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                }}
                                                            >
                                                                {item.productName}
                                                            </TableCell>
                                                            <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    color: themeMode === 'dark' ? 'var(--success-color)' : '#059669',
                                                                    fontWeight: 600,
                                                                    fontSize: 'var(--font-size-xs)',
                                                                }}
                                                            >
                                                                ₹{item.price.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <img
                                                                    src={item.image_path}
                                                                    alt={item.productName}
                                                                    style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        borderRadius: 'var(--border-radius-sm)',
                                                                        objectFit: 'cover',
                                                                        border: '1px solid var(--border-color)',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={5}
                                                            align="center"
                                                            sx={{
                                                                py: 4,
                                                                color: 'var(--secondary-text-color)',
                                                                fontStyle: 'italic',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            No items available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: 'var(--primary-text-color)',
                                            fontWeight: 600,
                                            mb: 2,
                                            fontSize: 'var(--font-size-md)',
                                        }}
                                    >
                                        Tracking Details
                                    </Typography>
                                    <Box
                                        sx={{
                                            backgroundColor: 'var(--card-background-color)',
                                            borderRadius: 'var(--border-radius-md)',
                                            p: 3,
                                        }}
                                    >
                                        {trackingData?.history?.map((track, index) => {
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
                                                        py: 2,
                                                        borderBottom: index === trackingData.history.length - 1 ? 'none' : '1px dashed var(--border-color)',
                                                        flexDirection: { xs: 'column', sm: 'row' },
                                                        gap: { xs: 1, sm: 0 },
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'var(--secondary-text-color)',
                                                            fontWeight: 500,
                                                            minWidth: '140px',
                                                            fontSize: 'var(--font-size-xs)',
                                                        }}
                                                    >
                                                        {format(parseISO(track.updated_at), 'MMM d, yyyy h:mm a')}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'var(--primary-text-color)',
                                                            fontWeight: 500,
                                                            textAlign: { xs: 'center', sm: 'center' },
                                                            flex: 1,
                                                            mx: 2,
                                                            fontSize: 'var(--font-size-xs)',
                                                        }}
                                                    >
                                                        {track.remarks || 'Status updated'}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            backgroundColor: isCancelledTrack
                                                                ? 'var(--error-color)'
                                                                : isFailedTrack
                                                                    ? 'var(--warning-color)'
                                                                    : 'var(--success-color)',
                                                            color: 'white',
                                                            px: 2,
                                                            py: 0.5,
                                                            borderRadius: 'var(--border-radius-sm)',
                                                            fontSize: 'var(--font-size-xs)',
                                                            fontWeight: 600,
                                                            textTransform: 'capitalize',
                                                            minWidth: '100px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {track.status.replace(/_/g, ' ').toLowerCase()}
                                                    </Box>
                                                </Box>
                                            );
                                        }) || (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        textAlign: 'center',
                                                        py: 2,
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    No tracking details available
                                                </Typography>
                                            )}
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 6,
                                    color: 'var(--secondary-text-color)',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                        color: 'var(--secondary-text-color)',
                                        fontSize: 'var(--font-size-md)',
                                    }}
                                >
                                    No Tracking Information
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontSize: 'var(--font-size-xs)' }}
                                >
                                    Tracking details are not available for this order yet.
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default OrderHistoryPage;