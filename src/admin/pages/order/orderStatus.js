import React, { useState, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MyContext } from '../../context/themeContext/themeContext'; // Corrected import path
import { useAllOrders } from '../../hooks/order/useAllOrder';
import { useTrackOrderById } from '../../hooks/order/useTrackOrder'; // Corrected hook import
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Tooltip, TextField, InputAdornment, MenuItem, Select, FormControl,
    InputLabel, Box, Typography, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Divider, Chip, Grid, Alert, Collapse, Card, CardContent
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Close as CloseIcon, KeyboardArrowLeft,
    KeyboardArrowRight, FirstPage, LastPage, Visibility as ViewIcon, ExpandMore, Receipt,
    LocalShipping as TrackIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
// Styled Components with Theme Support
const StyledTableContainer = styled(TableContainer)(({ themeMode }) => ({
    borderRadius: 'var(--border-radius-lg)',
    background: 'var(--background-color)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    '& .MuiTableHead-root': {
        background: themeMode === 'dark'
            ? 'linear-gradient(135deg, #2c2c3d 0%, #1e1e2c 100%)'
            : 'linear-gradient(135deg, #fdf1e8 0%, #f5e6d4 100%)',
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
            backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(235, 167, 72, 0.04)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: `1px solid var(--border-color)`,
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-primary)',
        color: 'var(--primary-text-color)',
    },
    // Responsive table adjustments
    '@media (max-width: 600px)': {
        '& .MuiTableCell-head, & .MuiTableCell-body': {
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            fontSize: 'var(--font-size-xs)',
        },
        // Hide non-essential columns on mobile
        '& .MuiTableCell-head:nth-of-type(5), & .MuiTableCell-body:nth-of-type(5)': {
            display: 'none', // Hide Order Date
        },
        '& .MuiTableCell-head:nth-of-type(6), & .MuiTableCell-body:nth-of-type(6)': {
            display: 'none', // Hide Payment Mode
        },
    },
}));

const ModernButton = styled(Button)(({ themeMode, color }) => ({
    borderRadius: 'var(--border-radius-md)',
    textTransform: 'none',
    fontWeight: 600,
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontFamily: 'var(--font-primary)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    ...(color === 'primary' && {
        background: 'var(--primary-color)',
        color: themeMode === 'dark' ? '#ffffff' : 'var(--text-light)',
        '&:hover': {
            background: themeMode === 'dark' ? '#60a5fa' : '#2563eb',
        },
    }),
}));

const StatusChip = styled(Chip)(({ status, themeMode }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'delivered':
                return {
                    background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)'
                        : 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: '#ffffff',
                };
            case 'pending':
                return { background: 'var(--warning-color)', color: '#ffffff' };
            case 'processing':
                return { background: 'var(--info-color)', color: '#ffffff' };
            case 'shipped':
                return { background: 'var(--primary-color)', color: '#ffffff' };
            case 'cancelled':
                return { background: 'var(--error-color)', color: '#ffffff' };
            default:
                return { background: 'var(--secondary-color)', color: '#ffffff' };
        }
    };

    return {
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 'var(--font-size-xs)',
        minWidth: '90px',
        height: '28px',
        borderRadius: 'var(--border-radius-md)',
        fontFamily: 'var(--font-primary)',
        ...getStatusStyles(status),
    };
});

const TableHeaderCard = styled(Card)(({ themeMode }) => ({
    borderRadius: 'var(--border-radius-lg)',
    background: themeMode === 'dark'
        ? 'var(--card-background-color)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: `1px solid var(--border-color)`,
    marginBottom: 'var(--spacing-lg)',
}));

const OrderStatusManagement = () => {
    const { themeMode } = useContext(MyContext); // Access theme mode from context
    const location = useLocation();
    const { key, values } = location.state || {};
    console.log(key, values, 'key');

    // State management
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openTrackModal, setOpenTrackModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

    // API hooks
    const { data, isLoading, isError, error, refetch } = useAllOrders(page, rowsPerPage);
    const { data: trackingData, isLoading: isTrackingLoading, isError: isTrackingError, error: trackingError } = useTrackOrderById(selectedOrder?.order_id);
    console.log(trackingData ,'trackdata');

    // Normalize order data
    const normalizeOrder = (order = {}) => ({
        id: order.id || 'N/A',
        order_id: order.order_id || order.orderId || 'N/A',
        user_name: order.user_name || order.customerName || 'N/A',
        contact: order.contact || 'N/A',
        email: order.email || 'N/A',
        total_amount: parseFloat(order.total_amount || order.totalAmount || order.amount || 0),
        status: order.status || 'PENDING',
        order_time: order.order_time || order.orderTime || order.date || 'N/A',
        payment_mode: order.payment_mode || order.paymentMode || 'N/A',
        payment_status: order.paymentStatus || 'N/A',
        address: order.address || 'N/A',
        orderItems: (order.orderItems || []).map(item => ({
            product_name: item.product_name || item.productName || 'N/A',
            quantity: item.quantity || 0,
            price: parseFloat(item.price || 0),
            sno: item.sno || 'N/A',
            tagno: item.tagno || 'N/A',
            item_id: item.item_id || item.itemid || 'N/A',
            image_path: item.image_path || item.imagePath || null,
        })),
    });

    const orders = useMemo(() => (data?.data?.orders || []).map(normalizeOrder), [data]);

    // Event handlers
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleSearchChange = (event) => setSearchTerm(event.target.value);
    const handleStatusFilterChange = (event) => setStatusFilter(event.target.value);
    const handleViewOrder = (order) => {
        setSelectedOrder(normalizeOrder(order));
        setOpenViewModal(true);
    };
    const handleTrackOrder = (order) => {
        setSelectedOrder(normalizeOrder(order));
        setOpenTrackModal(true);
    };
    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedOrder(null);
    };
    const handleCloseTrackModal = () => {
        setOpenTrackModal(false);
        setSelectedOrder(null);
    };
    const toggleRowExpansion = (orderId) => {
        setExpandedRows((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch =
                order.order_id.toLowerCase().includes(searchTermLower) ||
                order.user_name.toLowerCase().includes(searchTermLower) ||
                order.contact.toLowerCase().includes(searchTermLower) ||
                order.email.toLowerCase().includes(searchTermLower);
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    // Loading and Error States
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress sx={{ color: 'var(--primary-color)' }} />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Alert severity="error" sx={{ borderRadius: 'var(--border-radius-md)', fontFamily: 'var(--font-primary)' }}>
                    Error loading orders: {error.message}
                    <ModernButton onClick={() => refetch()} variant="contained" color="primary" sx={{ mt: 2 }} themeMode={themeMode}>
                        Retry
                    </ModernButton>
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)', md: 'var(--spacing-lg)' },
                backgroundColor: 'var(--background-color)',
                minHeight: '100vh',
                margin: '10px 0 0 0',
            }}
        >
            {/* Order Management Table */}
            <TableHeaderCard themeMode={themeMode}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                     <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <Link to="/">Dashboard</Link>
                                                </li>
                                                <li className="breadcrumb-item active" aria-current="page">
                                                    Manage Orders
                                                </li>
                                            </ol>
                                        </nav>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{ color: 'var(--primary-text-color)', fontWeight: 700, fontFamily: 'var(--font-primary)' }}
                            >
                                Order Management
                            </Typography>
                            <Chip
                                label={`${filteredOrders.length} orders`}
                                size="small"
                                sx={{
                                    backgroundColor: 'var(--active-bg)',
                                    color: 'var(--primary-color)',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-primary)',
                                }}
                            />
                        </Box>
                        <ModernButton
                            onClick={() => refetch()}
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            sx={{ fontSize: 'var(--font-size-xs)' }}
                            themeMode={themeMode}
                        >
                            Refresh
                        </ModernButton>
                    </Box>

                    {/* Filter Section */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'var(--primary-text-color)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 'var(--border-radius-md)',
                                        backgroundColor: 'var(--card-background-color)',
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-xs)',
                                        '& fieldset': { borderColor: 'var(--border-color)' },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl size="small" fullWidth>
                                <InputLabel sx={{ fontFamily: 'var(--font-primary)', color: 'var(--primary-text-color)' }}>
                                    Status
                                </InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    label="Status"
                                    sx={{
                                        borderRadius: 'var(--border-radius-md)',
                                        backgroundColor: 'var(--card-background-color)',
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-xs)',
                                        '& fieldset': { borderColor: 'var(--border-color)' },
                                    }}
                                >
                                    <MenuItem value="ALL">All Statuses</MenuItem>
                                    <MenuItem value="PLACED">Placed</MenuItem>
                                    <MenuItem value="IN_PROCESSING">Processing</MenuItem>
                                    <MenuItem value="READY">Ready to Ship</MenuItem>
                                    <MenuItem value="PACKED">Packed</MenuItem>
                                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Orders Table */}
                    <StyledTableContainer themeMode={themeMode}>
                        <Table stickyHeader aria-label="orders table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell>Payment Mode</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <React.Fragment key={order.id}>
                                            <TableRow sx={{ '&:hover': { backgroundColor: 'var(--active-bg)' } }}>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: 'var(--font-size-sm)' }}>
                                                        #{order.order_id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-sm)' }}>
                                                            {order.user_name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'var(--secondary-text-color)', fontSize: 'var(--font-size-sm)' }}>
                                                            {order.email}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography sx={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: 'var(--font-size-sm)' }}>
                                                        ₹{order.total_amount.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <StatusChip label={order.status} status={order.status} themeMode={themeMode} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                                                        {new Date(order.order_time).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'var(--secondary-text-color)', fontSize: 'var(--font-size-sm)' }}>
                                                        {new Date(order.order_time).toLocaleTimeString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={order.payment_mode}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'var(--active-bg)',
                                                            color: 'var(--primary-color)',
                                                            fontWeight: 600,
                                                            fontFamily: 'var(--font-primary)',
                                                            fontSize: 'var(--font-size-sm)'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <Tooltip title="View Order" arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewOrder(order)}
                                                                sx={{
                                                                    color: 'var(--primary-color)',
                                                                    backgroundColor: 'var(--active-bg)',
                                                                    '&:hover': { backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 143, 243, 0.2)' },
                                                                }}
                                                            >
                                                                <ViewIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Track Order" arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleTrackOrder(order)}
                                                                sx={{
                                                                    color: 'var(--info-color)',
                                                                    backgroundColor: 'var(--active-bg)',
                                                                    '&:hover': { backgroundColor: themeMode === 'dark' ? 'rgba(23, 162, 184, 0.2)' : 'rgba(52, 177, 170, 0.2)' },
                                                                }}
                                                            >
                                                                <TrackIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                <Receipt sx={{ fontSize: 60, color: 'var(--secondary-text-color)' }} />
                                                <Typography sx={{ color: 'var(--primary-text-color)', fontWeight: 500 }}>
                                                    No orders found
                                                </Typography>
                                                <Typography sx={{ color: 'var(--secondary-text-color)' }}>
                                                    Try adjusting your search or filters
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>

                    {/* Pagination */}
                    {filteredOrders.length > 0 && (
                        <Box
                            sx={{
                                mt: 3,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--card-background-color)',
                                borderRadius: 'var(--border-radius-lg)',
                                padding: 'var(--spacing-md)',
                                boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography sx={{ color: 'var(--secondary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                    Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, data?.data?.totalOrders || 0)} of {data?.data?.totalOrders || 0} orders
                                </Typography>
                                <Chip
                                    label={`${filteredOrders.length} filtered`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--active-bg)',
                                        color: 'var(--primary-color)',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-sm)'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <FormControl size="small">
                                    <Select
                                        value={rowsPerPage}
                                        onChange={handleChangeRowsPerPage}
                                        sx={{
                                            borderRadius: 'var(--border-radius-md)',
                                            backgroundColor: 'var(--card-background-color)',
                                            fontFamily: 'var(--font-primary)',
                                            fontSize: 'var(--font-size-xs)',
                                        }}
                                    >
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                    </Select>
                                </FormControl>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        onClick={(e) => handleChangePage(e, 0)}
                                        disabled={page === 0}
                                        sx={{
                                            backgroundColor: 'var(--active-bg)',
                                            color: page === 0 ? 'var(--secondary-text-color)' : 'var(--primary-color)', fontSize: 'var(--font-size-sm)',
                                            '&:hover': { backgroundColor: page === 0 ? 'var(--active-bg)' : themeMode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 143, 243, 0.2)' },
                                        }}
                                    >
                                        <FirstPage fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => handleChangePage(e, page - 1)}
                                        disabled={page === 0}
                                        sx={{
                                            backgroundColor: 'var(--active-bg)',
                                            color: page === 0 ? 'var(--secondary-text-color)' : 'var(--primary-color)',
                                            '&:hover': { backgroundColor: page === 0 ? 'var(--active-bg)' : themeMode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 143, 243, 0.2)' },
                                        }}
                                    >
                                        <KeyboardArrowLeft fontSize="small" />
                                    </IconButton>
                                    <Typography sx={{ alignSelf: 'center', color: 'var(--secondary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        Page {page + 1} of {Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage)}
                                    </Typography>
                                    <IconButton
                                        onClick={(e) => handleChangePage(e, page + 1)}
                                        disabled={page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1}
                                        sx={{
                                            backgroundColor: 'var(--active-bg)',
                                            color: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? 'var(--secondary-text-color)' : 'var(--primary-color)',
                                            '&:hover': { backgroundColor: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? 'var(--active-bg)' : themeMode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 143, 243, 0.2)' },
                                        }}
                                    >
                                        <KeyboardArrowRight fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => handleChangePage(e, Math.max(0, Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1))}
                                        disabled={page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1}
                                        sx={{
                                            backgroundColor: 'var(--active-bg)',
                                            color: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? 'var(--secondary-text-color)' : 'var(--primary-color)',
                                            '&:hover': { backgroundColor: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? 'var(--active-bg)' : themeMode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 143, 243, 0.2)' },
                                        }}
                                    >
                                        <LastPage fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </TableHeaderCard>

            {/* View Order Modal */}
            {selectedOrder && (
                <Dialog
                    open={openViewModal}
                    onClose={handleCloseViewModal}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: 'var(--border-radius-lg)',
                            backgroundColor: 'var(--card-background-color)',
                        },
                    }}
                >
                    <DialogTitle sx={{ fontFamily: 'var(--font-primary)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-md)' }}>
                                Order Details - {selectedOrder.order_id}
                            </Typography>
                            <IconButton onClick={handleCloseViewModal}>
                                <CloseIcon sx={{ color: 'var(--primary-text-color)' }} />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                                    Customer Information
                                </Typography>
                                <Divider sx={{ borderColor: 'var(--border-color)', my: 1 }} />
                                <Box>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Name:</strong> {selectedOrder.user_name}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Contact:</strong> {selectedOrder.contact}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Email:</strong> {selectedOrder.email}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Address:</strong> {selectedOrder.address || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                                    Order Details
                                </Typography>
                                <Divider sx={{ borderColor: 'var(--border-color)', my: 1 }} />
                                <Box>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Order Date:</strong> {new Date(selectedOrder.order_time).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ mt: 1, color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Status:</strong>
                                        <StatusChip label={selectedOrder.status} status={selectedOrder.status} themeMode={themeMode} sx={{ ml: 1 }} />
                                    </Typography>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Payment Mode:</strong> {selectedOrder.payment_mode}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        <strong>Amount:</strong> ₹{selectedOrder.total_amount.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                                    Products ({selectedOrder.orderItems?.length || 0})
                                </Typography>
                                <Divider sx={{ borderColor: 'var(--border-color)', my: 1 }} />
                                <TableContainer component={Paper} sx={{ mt: 1, backgroundColor: 'var(--card-background-color)' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)' }}>Product</TableCell>
                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)' }}>Tag No</TableCell>
                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)' }}>S.No</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)' }}>Quantity</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)' }}>Price</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)' }}>Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.orderItems?.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-xs)' }}>{item.product_name}</TableCell>
                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-xs)' }}>{item.tagno}</TableCell>
                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-xs)' }}>{item.sno}</TableCell>
                                                    <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-xs)' }}>{item.quantity}</TableCell>
                                                    <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-xs)' }}>
                                                        ₹{item.price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: 'var(--primary-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-xs)' }}>
                                                        ₹{(item.quantity * item.price).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <ModernButton onClick={handleCloseViewModal} color="primary" themeMode={themeMode}>
                            Close
                        </ModernButton>
                    </DialogActions>
                </Dialog>
            )}

            {/* Track Order Modal */}
            {selectedOrder && (
                <Dialog
                    open={openTrackModal}
                    onClose={handleCloseTrackModal}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: 'var(--border-radius-lg)',
                            backgroundColor: 'var(--card-background-color)',
                        },
                    }}
                >
                    <DialogTitle sx={{ fontFamily: 'var(--font-primary)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'var(--primary-text-color)' }}>
                                Track Order - {selectedOrder.order_id}
                            </Typography>
                            <IconButton onClick={handleCloseTrackModal}>
                                <CloseIcon sx={{ color: 'var(--primary-text-color)' }} />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <DialogContent>
                        {isTrackingLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                                <CircularProgress sx={{ color: 'var(--primary-color)' }} />
                            </Box>
                        ) : isTrackingError ? (
                            <Alert
                                severity="error"
                                sx={{ borderRadius: 'var(--border-radius-md)', fontFamily: 'var(--font-primary)' }}
                            >
                                Error tracking order: {trackingError.message}
                            </Alert>
                        ) : (
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: 'var(--primary-text-color)',
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-md)',
                                        fontWeight: 600,
                                    }}
                                >
                                    Tracking Details
                                </Typography>
                                <Divider sx={{ borderColor: 'var(--border-color)', my: 1 }} />

                                {trackingData ? (
                                    <Box>
                                        {/* ✅ Current Status + Order ID */}
                                        <Typography
                                            sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}
                                        >
                                            <strong>Current Status:</strong> {trackingData.current_status || 'N/A'}
                                        </Typography>
                                        <Typography
                                            sx={{ color: 'var(--primary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}
                                        >
                                                    <strong>Order ID:</strong> {trackingData.order_id || 'Nan'}
                                        </Typography>

                                        {/* ✅ Timeline (History) */}
                                        {trackingData.history && trackingData.history.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: 'var(--primary-text-color)',
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Tracking History
                                                </Typography>
                                                <TableContainer
                                                    component={Paper}
                                                    sx={{ mt: 1, backgroundColor: 'var(--card-background-color)' }}
                                                >
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Date
                                                                </TableCell>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Status
                                                                </TableCell>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Remarks
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {trackingData.history.map((event, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        {event.updated_at
                                                                            ? new Date(event.updated_at).toLocaleString()
                                                                            : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        {event.status || 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        {event.remarks || 'N/A'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {/* ✅ Items */}
                                        {trackingData.items && trackingData.items.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: 'var(--primary-text-color)',
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Order Items
                                                </Typography>
                                                <TableContainer
                                                    component={Paper}
                                                    sx={{ mt: 1, backgroundColor: 'var(--card-background-color)' }}
                                                >
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Image
                                                                </TableCell>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Product
                                                                </TableCell>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Tag No
                                                                </TableCell>
                                                                <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    S.No
                                                                </TableCell>
                                                          
                                                                <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Price
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                    Total
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {trackingData.items.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {item.image_path ? (
                                                                            <Box
                                                                                sx={{
                                                                                    width: 40,
                                                                                    height: 40,
                                                                                    borderRadius: 'var(--border-radius-sm)',
                                                                                    overflow: 'hidden',
                                                                                    backgroundColor: 'var(--card-background-color)',
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={item.image_path}
                                                                                    alt={item.productName}
                                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                />
                                                                            </Box>
                                                                        ) : (
                                                                            <Typography
                                                                                sx={{
                                                                                    color: 'var(--secondary-text-color)',
                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                }}
                                                                            >
                                                                                No Image
                                                                            </Typography>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        {item.productName || 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        {item.tagno || 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        {item.sno || 'N/A'}
                                                                    </TableCell>
                                                                
                                                                    <TableCell align="right" sx={{ color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        ₹{(item.price || 0).toFixed(2)}
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={{ color: 'var(--primary-color)', fontSize: 'var(--font-size-xs)' }}>
                                                                        ₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography
                                        sx={{ color: 'var(--secondary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-sm)' }}
                                    >
                                        No tracking information available.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions>
                        {trackingData?.canCancel && (
                            <ModernButton
                                onClick={() => {
                                    console.log(`Cancel order: ${selectedOrder.order_id}`);
                                    // 🔴 implement cancel API call here
                                }}
                                color="error"
                                themeMode={themeMode}
                            >
                                Cancel Order
                            </ModernButton>
                        )}
                        <ModernButton onClick={handleCloseTrackModal} color="primary" themeMode={themeMode}>
                            Close
                        </ModernButton>
                    </DialogActions>
                </Dialog>
            )}


        </Box>
    );
};

export default OrderStatusManagement;