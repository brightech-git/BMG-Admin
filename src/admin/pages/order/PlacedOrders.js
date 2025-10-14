import React, { useState, useEffect } from 'react';
import { useUpdateOrderStatus, useOrdersByStatus } from '../../hooks/order/useAllOrder';
import { orderService } from '../../service/orderService';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Chip,
    Grid,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    Collapse,
    Card,
    CardContent,
    CardHeader,
    FormLabel,
} from '@mui/material';
import {
    Print as PrintIcon,
    PictureAsPdf as PdfIcon,
    GridOn as ExcelIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    FirstPage,
    LastPage,
    Edit as EditIcon,
    Visibility as ViewIcon,
    ExpandMore,
    Receipt,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import './OrderManagement.css';
import { useLocation } from 'react-router-dom';

// ========== ENHANCED STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'visible',
    background: 'var(--card-background-color)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    maxHeight: 'none',
    '& .MuiTableHead-root': {
        background: 'var(--background-color)',
        '& .MuiTableCell-head': {
            color: 'var(--primary-text-color)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            textTransform: 'none',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: 'var(--spacing-sm) var(--spacing-md)',
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
    },
}));

const ModernButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: 'var(--border-radius-md)',
    textTransform: 'none',
    fontFamily: 'var(--font-secondary)',
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    transition: `all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1)`,
    boxShadow: buttonVariant === 'contained' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    ...(color === 'primary' && {
        background: 'var(--primary-color)',
        color: 'var(--text-dark)',
        '&:hover': {
            background: 'var(--active-border)',
        },
    }),
    ...(color === 'secondary' && {
        background: 'var(--secondary-color)',
        color: 'var(--text-dark)',
        '&:hover': {
            background: 'var(--active-bg)',
        },
    }),
    ...(color === 'dark' && {
        background: 'var(--dark-bg)',
        color: 'var(--text-dark)',
        '&:hover': {
            background: 'var(--active-border)',
        },
    }),
}));

const StatusChip = styled(Chip)(({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'delivered':
                return {
                    background: 'var(--success-color)',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                };
            case 'pending':
                return {
                    background: 'var(--warning-color)',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                };
            case 'processing':
                return {
                    background: 'var(--info-color)',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                };
            case 'shipped':
                return {
                    background: 'var(--primary-color)',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                };
            case 'cancelled':
                return {
                    background: 'var(--error-color)',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                };
            default:
                return {
                    background: 'var(--secondary-color)',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                };
        }
    };

    return {
        fontFamily: 'var(--font-primary)',
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 'var(--font-size-xs)',
        minWidth: '90px',
        height: '28px',
        borderRadius: 'var(--border-radius-md)',
        transition: `all var(--transition-speed) ease`,
        cursor: 'pointer',
        ...getStatusStyles(status),
        '&:hover': {
            transform: 'scale(1.05)',
        },
    };
});

const TableHeaderCard = styled(Card)(() => ({
    borderRadius: 'var(--border-radius-lg)',
    background: 'var(--card-background-color)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid var(--border-color)',
    marginBottom: 'var(--spacing-lg)',
    transition: `all var(--transition-speed) ease`,
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(30, 30, 44, 0.12)',
    },
}));

// Helper function to get color based on order status
const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'PROCESSING':
            return 'info';
        case 'SHIPPED':
            return 'primary';
        case 'DELIVERED':
            return 'success';
        case 'CANCELLED':
            return 'error';
        default:
            return 'default';
    }
};

// Rest of the component remains the same, with updates to `sx` props
const PlacedOrders = () => {
    const location = useLocation();
    const { key, values } = location.state || {};
    console.log(key, values, 'key');

    const status = key;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [exportType, setExportType] = useState('');
    const [exportMode, setExportMode] = useState('current');
    const [isFetchingFullList, setIsFetchingFullList] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        remarks: '',
        paymentMode: '',
    });
    const [formError, setFormError] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    const { data, isLoading, isError, error, refetch } = useOrdersByStatus(status, page, rowsPerPage);
    console.log(data, 'datastatus');
    const updateOrderStatus = useUpdateOrderStatus();

  

    const normalizeOrder = (order = {}) => ({
        id: order.order_id || order.orderId || 'N/A',
        order_id: order.order_id || order.orderId || 'N/A',
        user_name: order.user_name || order.customerName || 'N/A',
        contact: order.contact || 'N/A',
        email: order.email || 'N/A',
        total_amount: parseFloat(order.total_amount || order.totalAmount || order.amount || 0),
        status: order.status || 'PENDING',
        order_time: order.order_time || order.orderTime || order.date || 'N/A',
        payment_mode: order.paymentMode || order.payment_mode || 'payment',
        payment_status: order.paymentStatus || 'N/A',
        address: order.address
            ? {
                addressLine: order.address.addressLine || '',
                alternatePhone: order.address.alternatePhone || '',
                city: order.address.city || '',
                state: order.address.state || '',
                pincode: order.address.pincode || '',
                locality: order.address.locality || '',
                landmark: order.address.landmark || '',
                companyName: order.address.companyName || '',
                name: order.address.name || '',
                phone: order.address.phone || '',
                gstNumber: order.address.gstNumber || '',
                id: order.address.id || '',
                isDefault: order.address.isDefault || false,
                customerId: order.address.customerId || '',
            }
            : {},
        orderItems: (order.orderItems || []).map((item) => ({
            product_name: item.product_name || item.productName || 'N/A',
            quantity: item.quantity || 0,
            price: parseFloat(item.price || 0),
            sno: item.sno || 'N/A',
            tagno: item.tagno || 'N/A',
            item_id: item.item_id || item.itemid || 'N/A',
            image_path: item.image_path || item.imagePath || null,
        })),
    });

    console.log(data, 'data');
    const orders = React.useMemo(() => {
        return (data?.orders || []).map(normalizeOrder);
    }, [data]);

    console.log(orders, 'normalizeOrder');

    const toggleRowExpansion = (orderId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    const fetchFullOrderList = async () => {
        setIsFetchingFullList(true);
        try {
            const totalOrders = data?.data?.totalOrders || 1000;
            const response = await orderService.getAllOrders(0, totalOrders);
            const normalizedOrders = (response?.data?.orders || []).map(normalizeOrder);
            return normalizedOrders;
        } catch (err) {
            console.error('Error fetching full order list:', err);
            return [];
        } finally {
            setIsFetchingFullList(false);
        }
    };

    const baseUrl = 'https://app.bmgjewellers.com';

    const normalizeImagePaths = (imagePath) => {
        if (!imagePath) return [];

        try {
            if (typeof imagePath === 'string' && imagePath.trim().startsWith('[')) {
                const paths = JSON.parse(imagePath);
                return paths.map((p) => (p.startsWith('http') ? p : `${baseUrl}${p}`));
            }
            if (typeof imagePath === 'string') {
                return [imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`];
            }
            if (Array.isArray(imagePath)) {
                return imagePath.map((p) => (p.startsWith('http') ? p : `${baseUrl}${p}`));
            }
        } catch (e) {
            console.error('Invalid imagePath format:', imagePath, e);
            return [];
        }

        return [];
    };

    const getStatusImpactText = (status) => {
        switch (status) {
            case 'IN_PROCESSING':
                return 'Order will be moved to packing queue and consignment will be created with DTDC';
            case 'CANCELLED':
                return 'Order will be cancelled and customer will be notified. Refund process will be initiated if applicable';
            default:
                return 'Status will be updated and relevant notifications will be sent';
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredOrders = React.useMemo(() => {
        return orders.filter((order) => {
            const searchTermLower = (searchTerm || '').toLowerCase();
            const orderId = (order.order_id || '').toLowerCase();
            const userName = (order.user_name || '').toLowerCase();
            const contact = (order.contact || '').toLowerCase();
            const email = (order.email || '').toLowerCase();
            const status = order.status || '';

            const matchesSearch =
                orderId.includes(searchTermLower) ||
                userName.includes(searchTermLower) ||
                contact.includes(searchTermLower) ||
                email.includes(searchTermLower);

            const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const handleViewOrder = (order) => {
        console.log(order, 'selectbefore');
        setSelectedOrder(order);
        console.log('selectedorder', normalizeOrder(order));
        setOpenViewModal(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setEditForm({
            status: status,
            remarks: '',
            paymentMode: order.paymentMode || order.payment_mode || 'ONLINE',
        });
        setOpenEditModal(true);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedOrder(null);
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setSelectedOrder(null);
        setEditForm({ status: '', remarks: '', paymentMode: '' });
        setFormError('');
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async () => {
        if (!editForm.status || !editForm.paymentMode) {
            setFormError('Status and Payment Mode are required.');
            return;
        }

        try {
            if (editForm.status?.toUpperCase() === 'CANCELLED') {
                const payload = {
                    orderId: selectedOrder.order_id,
                    newStatus: editForm.status,
                    remarks: editForm.remarks,
                    paymentMode: editForm.paymentMode,
                    paymentStatus: editForm.payment_status,
                };

                await updateOrderStatus.mutateAsync(payload);
                refetch();
                handleCloseEditModal();
                return;
            }



           

           

            const payload = {
                orderId: selectedOrder.order_id,
                newStatus: editForm.status,
                remarks: editForm.remarks,
                paymentMode: editForm.paymentMode,
                paymentStatus: editForm.payment_status,
            };

            await updateOrderStatus.mutateAsync(payload);
            refetch();
            handleCloseEditModal();
        } catch (err) {
            setFormError(`Failed: ${err.message || 'Unknown error'}`);
        }
    };

    const handleOpenExportDialog = (type) => {
        setExportType(type);
        setOpenExportDialog(true);
    };

    const handleCloseExportDialog = () => {
        setOpenExportDialog(false);
        setExportType('');
        setExportMode('current');
    };

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="200px"
                sx={{ backgroundColor: 'var(--background-color)' }}
            >
                <CircularProgress sx={{ color: 'var(--primary-color)' }} />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="200px"
                sx={{ backgroundColor: 'var(--background-color)' }}
            >
                <Typography sx={{ color: 'var(--error-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-md)' }}>
                    Error loading orders: {error.message}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            p={2}
            sx={{
                backgroundColor: 'var(--background-color)',
                minHeight: '100vh',
                fontFamily: 'var(--font-primary)',
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                    width: '0.5em',
                    height: '0.5em', // for horizontal scroll
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: 'var(--border-radius-md)',
                },
                mt: '20px'
            }}
        >
            <TableHeaderCard>
                <CardContent sx={{ p: 'var(--spacing-lg)'  }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Manage QC Orders
                            </li>
                        </ol>
                    </nav>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'var(--primary-text-color)',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: 'var(--font-size-lg)',
                                }}
                            >
                                Order Management
                            </Typography>
                            <Chip
                                label={`${filteredOrders.length} orders`}
                                size="small"
                                sx={{
                                    backgroundColor: 'var(--active-bg)',
                                    color: 'var(--primary-color)',
                                    fontFamily: 'var(--font-primary)',
                                    fontWeight: 600,
                                    fontSize: 'var(--font-size-xs)',
                                }}
                            />
                        </Box>
                        <Box display="flex" gap={2} alignItems="center" mb={3}>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'var(--secondary-text-color)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    minWidth: 200,
                                    maxWidth: { xs: '100%', sm: 300 },
                                    width: '100%',
                                    flexGrow: { xs: 1, sm: 0 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 'var(--border-radius-md)',
                                        backgroundColor: 'var(--card-background-color)',
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--primary-text-color)',
                                        '& fieldset': {
                                            borderColor: 'var(--border-color)',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    

                    {isLoading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
                            <CircularProgress size={50} sx={{ color: 'var(--primary-color)', mb: 2 }} />
                            <Typography sx={{ color: 'var(--secondary-text-color)', fontFamily: 'var(--font-primary)', fontSize: 'var(--font-size-md)' }}>
                                Loading orders...
                            </Typography>
                        </Box>
                    ) : isError ? (
                        <Box p={3}>
                            <Alert
                                severity="error"
                                sx={{
                                    backgroundColor: 'var(--error-color)',
                                    color: 'var(--text-dark)',
                                    borderRadius: 'var(--border-radius-md)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: 'var(--font-size-sm)',
                                    '& .MuiAlert-icon': { color: 'var(--text-dark)' },
                                }}
                            >
                                Error loading orders: {error.message}
                            </Alert>
                            <ModernButton
                                onClick={() => refetch()}
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                            >
                                Retry
                            </ModernButton>
                        </Box>
                    ) : (
                                <StyledTableContainer sx={{
                                    width: '100%',
                
                                    overflowX: { xs: 'auto', md: 'visible' }, // horizontal scroll on mobile
                                    '&::-webkit-scrollbar': {
                                        height: '0.5em', // horizontal scrollbar height
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'var(--primary-color)',
                                        borderRadius: 'var(--border-radius-md)' },}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-primary)' }}>Order ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Customer</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Amount</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Order Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Payment Mode</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <React.Fragment key={order.id}>
                                                <TableRow sx={{ '&:hover': { backgroundColor: 'var(--active-bg)' } }}>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'var(--primary-color)',
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            {order.order_id}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: 'var(--primary-text-color)',
                                                                    fontFamily: 'var(--font-secondary)',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                }}
                                                            >
                                                                {order.user_name}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--secondary-text-color)',
                                                                    fontFamily: 'var(--font-secondary)',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                }}
                                                            >
                                                                {order.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: 'var(--primary-color)',
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            ₹{order.total_amount.toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <StatusChip
                                                            label={order.status.toUpperCase()}
                                                            status={order.status}
                                                            size="small"
                                                            onClick={() => handleEditOrder(order)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 500,
                                                                color: 'var(--primary-text-color)',
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            {new Date(order.order_time).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'var(--secondary-text-color)',
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            {new Date(order.order_time).toLocaleTimeString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.payment_mode}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'var(--info-color)',
                                                                color: 'var(--text-dark)',
                                                                fontWeight: 600,
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box display="flex" gap={1} justifyContent="center">
                                                            <Tooltip title="View Order" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleViewOrder(order)}
                                                                    sx={{
                                                                        color: 'var(--primary-color)',
                                                                        backgroundColor: 'var(--active-bg)',
                                                                        borderRadius: 'var(--border-radius-sm)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'var(--active-border)',
                                                                            transform: 'scale(1.05)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <ViewIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit Status" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditOrder(order)}
                                                                    sx={{
                                                                        color: 'var(--warning-color)',
                                                                        backgroundColor: 'var(--active-bg)',
                                                                        borderRadius: 'var(--border-radius-sm)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'var(--active-border)',
                                                                            transform: 'scale(1.05)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="View Products" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => toggleRowExpansion(order.order_id)}
                                                                    sx={{
                                                                        color: 'var(--info-color)',
                                                                        backgroundColor: 'var(--active-bg)',
                                                                        borderRadius: 'var(--border-radius-sm)',
                                                                        transition: `transform var(--transition-speed) ease`,
                                                                        transform: expandedRows[order.order_id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'var(--active-border)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <ExpandMore fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        sx={{
                                                            py: 0,
                                                            px: 0,
                                                            borderBottom: expandedRows[order.order_id] ? '1px solid var(--border-color)' : 0,
                                                            mb: expandedRows[order.order_id] ? 2 : 0,
                                                        }}
                                                    >
                                                        <Collapse in={expandedRows[order.order_id]} timeout="auto" unmountOnExit>
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: 'var(--background-color)',
                                                                    borderTop: '1px solid var(--border-color)',
                                                                    borderBottom: '1px solid var(--border-color)',
                                                                    py: 2,
                                                                    px: 2,
                                                                    position: 'relative',
                                                                    zIndex: 1,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        maxWidth: '95%',
                                                                        margin: '0 auto',
                                                                        backgroundColor: 'var(--card-background-color)',
                                                                        borderRadius: 'var(--border-radius-lg)',
                                                                        overflow: 'visible',
                                                                        boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
                                                                        border: '1px solid var(--border-color)',
                                                                        position: 'relative',
                                                                    }}
                                                                >
                                                                    <Table
                                                                        size="small"
                                                                        sx={{
                                                                            width: '100%',
                                                                            '& .MuiTableCell-root': {
                                                                                borderBottom: '1px solid var(--border-color)',
                                                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                                fontFamily: 'var(--font-secondary)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <TableHead>
                                                                            <TableRow sx={{ backgroundColor: 'var(--active-bg)' }}>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: 'var(--primary-color)',
                                                                                        fontSize: 'var(--font-size-sm)',
                                                                                        width: '35%',
                                                                                    }}
                                                                                >
                                                                                    Product
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: 'var(--primary-color)',
                                                                                        fontSize: 'var(--font-size-sm)',
                                                                                        width: '20%',
                                                                                    }}
                                                                                >
                                                                                    SKU
                                                                                </TableCell>
                                                                               
                                                                                <TableCell
                                                                                    align="right"
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: 'var(--primary-color)',
                                                                                        fontSize: 'var(--font-size-sm)',
                                                                                        width: '15%',
                                                                                    }}
                                                                                >
                                                                                    Unit Price
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    align="right"
                                                                                    sx={{
                                                                                        fontWeight: 700,
                                                                                        color: 'var(--primary-color)',
                                                                                        fontSize: 'var(--font-size-sm)',
                                                                                        width: '15%',
                                                                                    }}
                                                                                >
                                                                                    Total
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {order.orderItems?.map((item, index) => {
                                                                                const isLastRow = index === order.orderItems.length - 1;
                                                                                return (
                                                                                    <TableRow
                                                                                        key={index}
                                                                                        sx={{
                                                                                            '&:hover': {
                                                                                                backgroundColor: 'var(--active-bg)',
                                                                                            },
                                                                                            borderBottom: isLastRow ? 'none' : '1px solid var(--border-color)',
                                                                                        }}
                                                                                    >
                                                                                        <TableCell>
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--primary-text-color)',
                                                                                                    fontWeight: 500,
                                                                                                    fontFamily: 'var(--font-secondary)',
                                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                                }}
                                                                                            >
                                                                                                {item.product_name}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--info-color)',
                                                                                                    fontWeight: 500,
                                                                                                    fontFamily: 'monospace',
                                                                                                    fontSize: 'var(--font-size-xs)',
                                                                                                    backgroundColor: 'var(--active-bg)',
                                                                                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                                                                    borderRadius: 'var(--border-radius-sm)',
                                                                                                    display: 'inline-block',
                                                                                                }}
                                                                                            >
                                                                                                {item.item_id}-{item.tagno}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                       
                                                                                        <TableCell align="right">
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--secondary-text-color)',
                                                                                                    fontWeight: 500,
                                                                                                    fontFamily: 'var(--font-secondary)',
                                                                                                    fontSize: 'var(--font-size-sm)',
                                                                                                }}
                                                                                            >
                                                                                                ₹{item.price.toFixed(2)}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell align="right">
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--primary-color)',
                                                                                                    fontWeight: 700,
                                                                                                    fontFamily: 'var(--font-secondary)',
                                                                                                    fontSize: 'var(--font-size-sm)',
                                                                                                }}
                                                                                            >
                                                                                                ₹{item.price .toFixed(2)}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            })}
                                                                            <TableRow
                                                                                sx={{
                                                                                    backgroundColor: 'var(--active-bg)',
                                                                                    borderTop: '2px solid var(--border-color)',
                                                                                }}
                                                                            >
                                                                                <TableCell colSpan={3} sx={{ py: 2 }}>
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            color: 'var(--primary-text-color)',
                                                                                            textAlign: 'right',
                                                                                            fontFamily: 'var(--font-secondary)',
                                                                                            fontSize: 'var(--font-size-sm)',
                                                                                        }}
                                                                                    >
                                                                                        Order Total:
                                                                                    </Typography>
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ py: 2 }}>
                                                                                    <Typography
                                                                                        variant="h6"
                                                                                        sx={{
                                                                                            color: 'var(--primary-color)',
                                                                                            fontWeight: 700,
                                                                                            fontFamily: 'var(--font-secondary)',
                                                                                            fontSize: 'var(--font-size-lg)',
                                                                                        }}
                                                                                    >
                                                                                        ₹{order.total_amount.toFixed(2)}
                                                                                    </Typography>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </Box>
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
                                                    <Receipt sx={{ fontSize: 60, color: 'var(--border-color)' }} />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: 'var(--secondary-text-color)',
                                                            fontWeight: 500,
                                                            fontFamily: 'var(--font-primary)',
                                                            fontSize: 'var(--font-size-lg)',
                                                        }}
                                                    >
                                                        No orders found
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'var(--secondary-text-color)',
                                                            fontFamily: 'var(--font-primary)',
                                                            fontSize: 'var(--font-size-sm)',
                                                        }}
                                                    >
                                                        Try adjusting your search or filters
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
                    )}

                    {filteredOrders.length > 0 && (
                        <Box
                            sx={{
                                mt: 3,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--card-background-color)',
                                borderRadius: 'var(--border-radius-lg)',
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
                                border: '1px solid var(--border-color)',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={2}>
                              
                                <Chip
                                    label={`${filteredOrders.length} filtered`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--info-color)',
                                        color: 'var(--text-dark)',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-xs)',
                                    }}
                                />
                            </Box>

                            <Box display="flex" alignItems="center" gap={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'var(--secondary-text-color)',
                                            fontWeight: 500,
                                            fontFamily: 'var(--font-secondary)',
                                            fontSize: 'var(--font-size-sm)',
                                        }}
                                    >
                                        Rows per page:
                                    </Typography>
                                    <FormControl size="small" sx={{ minWidth: 80 }}>
                                        <Select
                                            value={rowsPerPage}
                                            onChange={handleChangeRowsPerPage}
                                            sx={{
                                                borderRadius: 'var(--border-radius-md)',
                                                fontSize: 'var(--font-size-sm)',
                                                backgroundColor: 'var(--background-color)',
                                                fontFamily: 'var(--font-secondary)',
                                                color: 'var(--primary-text-color)',
                                                '& .MuiOutlinedInput-root': {
                                                    border: '1px solid var(--border-color)',
                                                },
                                            }}
                                        >
                                            <MenuItem value={5}>5</MenuItem>
                                            <MenuItem value={10}>10</MenuItem>
                                            <MenuItem value={25}>25</MenuItem>
                                            <MenuItem value={50}>50</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </TableHeaderCard>

            {selectedOrder && (
                <Dialog
                    open={openViewModal}
                    onClose={handleCloseViewModal}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 'var(--border-radius-lg)',
                            backgroundColor: 'var(--card-background-color)',
                        },
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'var(--primary-text-color)',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: 'var(--font-size-md)', // Slightly larger for heading
                                }}
                            >
                                Order Details - {selectedOrder.order_id}
                            </Typography>
                            <IconButton
                                onClick={handleCloseViewModal}
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    '&:hover': {
                                        backgroundColor: 'var(--active-bg)',
                                    },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box mb={3}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    color: 'var(--primary-color)',
                                    textAlign: 'center',
                                    mb: 2,
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: 'var(--font-size-md)', // Slightly larger for section heading
                                }}
                            >
                                User Details
                            </Typography>
                            <TableContainer
                                component={Paper}
                                elevation={1}
                                sx={{
                                    backgroundColor: 'var(--card-background-color)',
                                    borderRadius: 'var(--border-radius-md)',
                                    border: '1px solid var(--border-color)',
                                }}
                            >
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    width: '25%',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Order Number
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    width: '25%',
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                {selectedOrder.order_id}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    width: '25%',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Name
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    width: '25%',
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                {selectedOrder.user_name}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Email
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                {selectedOrder.email}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Mobile Number
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                {selectedOrder.contact}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Address
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                {selectedOrder?.address ? (
                                                    <>
                                                        <div>{selectedOrder.address.name}</div>
                                                        <div>{selectedOrder.address.addressLine}</div>
                                                        {selectedOrder.address.landmark && <div>Landmark: {selectedOrder.address.landmark}</div>}
                                                        {selectedOrder.address.locality && <div>{selectedOrder.address.locality}</div>}
                                                        <div>
                                                            {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                                                        </div>
                                                        {selectedOrder.address.country && <div>{selectedOrder.address.country}</div>}
                                                        <div>Phone: {selectedOrder.address.phone}</div>
                                                        {selectedOrder.address.alternatePhone && <div>Alt: {selectedOrder.address.alternatePhone}</div>}
                                                        {selectedOrder.address.companyName && <div>Company: {selectedOrder.address.companyName}</div>}
                                                    </>
                                                ) : (
                                                    <div>No address available</div>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Order Date
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                {new Date(selectedOrder.order_time).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box mb={3}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    color: 'var(--primary-color)',
                                    textAlign: 'center',
                                    mb: 2,
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: 'var(--font-size-md)', // Slightly larger for section heading
                                }}
                            >
                                Order Details
                            </Typography>
                            <TableContainer
                                component={Paper}
                                elevation={1}
                                sx={{
                                    backgroundColor: 'var(--card-background-color)',
                                    borderRadius: 'var(--border-radius-md)',
                                    border: '1px solid var(--border-color)',
                                }}
                            >
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'var(--background-color)' }}>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                S.No
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Product ID
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Product Image
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Product Name
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Price
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary-text-color)',
                                                }}
                                            >
                                                Total
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedOrder.orderItems?.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell
                                                    sx={{
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    }}
                                                >
                                                    {item.tagno || item.sno || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {normalizeImagePaths(item.image_path)[0] ? (
                                                        <img
                                                            src={normalizeImagePaths(item.image_path)[0]}
                                                            alt={item.productName}
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                objectFit: 'cover',
                                                                borderRadius: 'var(--border-radius-sm)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                backgroundColor: 'var(--background-color)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: 'var(--border-radius-sm)',
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--secondary-text-color)',
                                                                    fontFamily: 'var(--font-secondary)',
                                                                    fontSize: 'var(--font-size-xs)',
                                                                }}
                                                            >
                                                                No Image
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    }}
                                                >
                                                    {item.product_name}
                                                </TableCell>
                                                <TableCell
                                                    align="right"
                                                    sx={{
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    }}
                                                >
                                                    ₹{item.price.toFixed(2)}
                                                </TableCell>
                                                <TableCell
                                                    align="right"
                                                    sx={{
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    }}
                                                >
                                                    ₹{(item.price * item.quantity).toFixed(2)} {/* Fixed: Use quantity for total */}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{ backgroundColor: 'var(--warning-color)' }}>
                                            <TableCell
                                                colSpan={5}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    textAlign: 'right',
                                                    color: 'var(--text-dark)',
                                                    fontFamily: 'var(--font-primary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                }}
                                            >
                                                Grand Total
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'var(--text-dark)',
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontSize: 'var(--font-size-xs)',
                                                }}
                                            >
                                                ₹{selectedOrder.total_amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCloseViewModal}
                            color="primary"
                            variant="contained"
                            sx={{
                                fontFamily: 'var(--font-secondary)',
                                fontSize: 'var(--font-size-xs)',
                                borderRadius: 'var(--border-radius-md)',
                                backgroundColor: 'var(--primary-color)',
                                color: 'var(--text-dark)',
                                '&:hover': {
                                    backgroundColor: 'var(--active-border)',
                                },
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {selectedOrder && (
                <Dialog
                    open={openEditModal}
                    onClose={handleCloseEditModal}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 'var(--border-radius-lg)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            maxHeight: '90vh',
                            backgroundColor: 'var(--card-background-color)',
                        },
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'var(--primary-text-color)',
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-lg)', // Keep larger for heading
                                        mb: 0.5,
                                    }}
                                >
                                    Edit Order
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'var(--secondary-text-color)',
                                        fontFamily: 'var(--font-primary)',
                                        fontSize: 'var(--font-size-xs)', // Use xs for secondary text
                                    }}
                                >
                                    Order ID: {selectedOrder.order_id}
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={handleCloseEditModal}
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    '&:hover': {
                                        backgroundColor: 'var(--active-bg)',
                                        color: 'var(--primary-text-color)',
                                    },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <DialogContent dividers sx={{ p: 0 }}>
                        <Box sx={{ p: 'var(--spacing-lg)' }}>
                            <Card
                                sx={{
                                    mb: 4,
                                    border: '1px solid var(--border-color)',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    backgroundColor: 'var(--card-background-color)',
                                }}
                            >
                                <CardHeader
                                    title={
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: 'var(--primary-text-color)',
                                                fontWeight: 600,
                                                fontFamily: 'var(--font-primary)',
                                                fontSize: 'var(--font-size-md)', // Slightly larger for card header
                                            }}
                                        >
                                            Order Overview
                                        </Typography>
                                    }
                                    sx={{ pb: 2 }}
                                />
                                <CardContent sx={{ pt: 0 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Customer Name
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: 'var(--primary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    {selectedOrder.user_name}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Current Status
                                                </Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Chip
                                                        label={selectedOrder.status}
                                                        color={getStatusColor(selectedOrder.status)}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontFamily: 'var(--font-secondary)',
                                                            fontSize: 'var(--font-size-xs)',
                                                            backgroundColor: `var(--warning-color)`,
                                                            color: 'var(--secondary-text-color)',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Payment Mode
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: 'var(--primary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    {selectedOrder.payment_mode || selectedOrder.paymentMode}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Payment Status
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    {selectedOrder.payment_status || selectedOrder.paymentStatus}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Total Amount
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: 'var(--success-color)',
                                                        fontWeight: 600,
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    ₹{selectedOrder.total_amount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--secondary-text-color)',
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Order Date
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'var(--primary-text-color)',
                                                        fontFamily: 'var(--font-secondary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    {new Date(selectedOrder.order_time).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Card
                                sx={{
                                    border: '1px solid var(--border-color)',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    backgroundColor: 'var(--card-background-color)',
                                }}
                            >
                                <CardHeader
                                    title={
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: 'var(--primary-text-color)',
                                                fontWeight: 600,
                                                fontFamily: 'var(--font-primary)',
                                                fontSize: 'var(--font-size-md)', // Slightly larger for card header
                                            }}
                                        >
                                            Update Order Status
                                        </Typography>
                                    }
                                    subheader={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'var(--secondary-text-color)',
                                                fontFamily: 'var(--font-secondary)',
                                                fontSize: 'var(--font-size-xs)',
                                            }}
                                        >
                                            Change the order status and add relevant remarks
                                        </Typography>
                                    }
                                    sx={{ pb: 2 }}
                                />
                                <CardContent sx={{ pt: 0 }}>
                                    {formError && (
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mb: 3,
                                                backgroundColor: 'var(--error-color)',
                                                color: 'var(--text-dark)',
                                                borderRadius: 'var(--border-radius-md)',
                                                fontFamily: 'var(--font-secondary)',
                                                fontSize: 'var(--font-size-xs)',
                                                '& .MuiAlert-icon': { fontSize: 'var(--font-size-xs)' },
                                            }}
                                        >
                                            {formError}
                                        </Alert>
                                    )}

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <FormControl component="fieldset">
                                                <FormLabel
                                                    component="legend"
                                                    sx={{
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    }}
                                                >
                                                    Select New Status
                                                </FormLabel>
                                                <RadioGroup
                                                    name="status"
                                                    value={editForm.status}
                                                    onChange={handleEditFormChange}
                                                >
                                                    <FormControlLabel
                                                        value="IN_PROCESSING"
                                                        control={<Radio sx={{ color: 'var(--primary-color)', '& .MuiSvgIcon-root': { fontSize: 'var(--font-size-xs)' } }} />}
                                                        label={
                                                            <Typography sx={{ fontFamily: 'var(--font-secondary)', fontSize: 'var(--font-size-xs)' , color: 'var(--primary-text-color)' }}>
                                                                Move to Quality Checking
                                                            </Typography>
                                                        }
                                                    />
                                                    <FormControlLabel
                                                        value="CANCELLED"
                                                        control={<Radio sx={{ color: 'var(--primary-color)', '& .MuiSvgIcon-root': { fontSize: 'var(--font-size-xs)' } }} />}
                                                        label={
                                                            <Typography sx={{ fontFamily: 'var(--font-secondary)', fontSize: 'var(--font-size-xs)', color: 'var(--primary-text-color)' }}>
                                                                Cancel Order
                                                            </Typography>
                                                        }
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Remarks & Notes"
                                                name="remarks"
                                                value={editForm.remarks}
                                                onChange={handleEditFormChange}
                                                multiline
                                                rows={4}
                                                placeholder="Enter detailed remarks about this status change..."
                                                disabled={updateOrderStatus.isLoading}
                                                helperText="Provide specific details about the status change (required for cancellations)"
                                                sx={{
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 500,
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    },
                                                    '& .MuiInputBase-root': {
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--primary-text-color)',
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--secondary-text-color)',
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--border-color)',
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    backgroundColor: 'var(--card-background-color)',
                                                    borderRadius: 'var(--border-radius-md)',
                                                    border: '1px solid var(--border-color)',
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        color: 'var(--primary-text-color)',
                                                        fontFamily: 'var(--font-primary)',
                                                        fontSize: 'var(--font-size-xs)',
                                                    }}
                                                >
                                                    Status Change Preview
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'var(--secondary-text-color)',
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            Current:
                                                        </Typography>
                                                        <Chip
                                                            label={selectedOrder.status}
                                                            color={getStatusColor(selectedOrder.status)}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                                backgroundColor: `var(--${getStatusColor(selectedOrder.status)}-color)`,
                                                                color: 'var(--primary-text-color)',
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--secondary-text-color)' }}>
                                                        →
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'var(--secondary-text-color)',
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            New:
                                                        </Typography>
                                                        <Chip
                                                            label={editForm.status || 'Select Status'}
                                                            color={editForm.status ? getStatusColor(editForm.status) : 'default'}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                                backgroundColor: editForm.status ? `var(--${getStatusColor(editForm.status)}-color)` : 'var(--secondary-color)',
                                                                color: 'var(--primary-text-color)',
                                                                border: editForm.status ? 'none' : '1px solid var(--border-color)',
                                                            }}
                                                            variant={editForm.status ? 'filled' : 'outlined'}
                                                        />
                                                    </Box>
                                                    {editForm.status && editForm.status !== selectedOrder.status && (
                                                        <Chip
                                                            label="WILL UPDATE"
                                                            color="warning"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                                backgroundColor: 'var(--warning-color)',
                                                                color: 'var(--primary-text-color)',
                                                                animation: 'pulse 2s infinite',
                                                                '@keyframes pulse': {
                                                                    '0%, 100%': { opacity: 1 },
                                                                    '50%': { opacity: 0.5 },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                {/* {editForm.status && (
                                                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'var(--card-background-color)', borderRadius: 'var(--border-radius-sm)' }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'var(--secondary-text-color)',
                                                                fontWeight: 500,
                                                                fontFamily: 'var(--font-secondary)',
                                                                fontSize: 'var(--font-size-xs)',
                                                            }}
                                                        >
                                                            Impact: {getStatusImpactText(editForm.status)}
                                                        </Typography>
                                                    </Box>
                                                )} */}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Box>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            p: 3,
                            backgroundColor: 'var(--background-color)',
                            borderTop: '1px solid var(--border-color)',
                        }}
                    >
                        <Button
                            onClick={handleCloseEditModal}
                            disabled={updateOrderStatus.isLoading }
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                fontFamily: 'var(--font-secondary)',
                                fontSize: 'var(--font-size-xs)',
                                borderRadius: 'var(--border-radius-md)',
                                color: 'var(--primary-text-color)',
                                borderColor: 'var(--border-color)',
                                '&:hover': {
                                    backgroundColor: 'var(--active-bg)',
                                    borderColor: 'var(--active-border)',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            color={editForm.status?.toUpperCase() === 'CANCELLED' ? 'error' : 'primary'}
                            variant="contained"
                            disabled={
                                updateOrderStatus.isLoading ||
                                !editForm.status ||
                                editForm.status === selectedOrder.status
                            }
                            startIcon={
                                (updateOrderStatus.isLoading ) ? (
                                    <CircularProgress size={16} sx={{ color: 'var(--text-dark)' }} />
                                ) : null
                            }
                            sx={{
                                minWidth: 180,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: 'var(--font-secondary)',
                                fontSize: 'var(--font-size-xs)',
                                borderRadius: 'var(--border-radius-md)',
                                backgroundColor: editForm.status?.toUpperCase() === 'CANCELLED' ? 'var(--error-color)' : 'var(--primary-color)',
                                color: 'var(--text-dark)',
                                '&:hover': {
                                    backgroundColor: editForm.status?.toUpperCase() === 'CANCELLED' ? 'var(--error-color)' : 'var(--active-border)',
                                },
                            }}
                        >
                            {(updateOrderStatus.isLoading )
                                ? 'Processing...'
                                : editForm.status?.toUpperCase() === 'CANCELLED'
                                    ? 'Cancel Order'
                                    : 'Update Status'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default PlacedOrders;