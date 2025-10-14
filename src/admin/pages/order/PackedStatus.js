import React, { useState, useContext } from 'react';
import { useUpdateOrderStatus, useOrdersByStatus } from '../../hooks/order/useAllOrder';
import { orderService } from '../../service/orderService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLabelQuery } from '../../hooks/shipping/useLabelQuery';
import * as XLSX from 'xlsx-js-style';
import { Link } from 'react-router-dom';
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
    Chip,
    Grid,
    Alert,
    Collapse,
    Card,
    CardContent
} from '@mui/material';
import {
    Print as PrintIcon,
    PictureAsPdf as PdfIcon,
    GridOn as ExcelIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    ExpandMore,
    Receipt
} from '@mui/icons-material';
import { styled } from '@mui/system'; // Corrected import
import { useLocation } from "react-router-dom";
import { getOrderStatus } from '../../service/orderService';
import { MyContext } from '../../context/themeContext/themeContext';
import './OrderManagement.css';

// ========== ENHANCED STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: 'var(--border-radius-lg)',
    background: 'var(--card-background-color)',
    border: `1px solid var(--border-color)`,
    '& .MuiTableHead-root': {
        background: 'var(--background-color)',
        '& .MuiTableCell-head': {
            color: 'var(--primary-text-color)',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            borderBottom: 'none',
            padding: 'var(--spacing-sm) var(--spacing-md)',
        }
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'var(--active-bg)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: `1px solid var(--border-color)`,
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
    },
}));

const ModernButton = styled(Button)(() => ({
    borderRadius: 'var(--border-radius-md)',
    textTransform: 'none',
    fontWeight: 600,
    padding: 'var(--spacing-sm) var(--spacing-md)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'var(--primary-color)',
    color: 'var(--text-dark)',
    '&:hover': {
        transform: 'translateY(-1px)',
        background: 'var(--active-border)',
    },
}));

const StatusChip = styled(Chip)(({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'delivered':
            case 'pending':
            case 'processing':
            case 'shipped':
                return {
                    background: 'var(--primary-color)',
                    color: 'var(--text-dark)',
                };
            case 'cancelled':
                return {
                    background: 'var(--error-color)',
                    color: 'var(--text-dark)',
                };
            default:
                return {
                    background: 'var(--primary-color)',
                    color: 'var(--text-dark)',
                };
        }
    };

    return {
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 'var(--font-size-xs)',
        minWidth: '90px',
        height: '28px',
        borderRadius: 'var(--border-radius-sm)',
        transition: 'all 0.2s ease',
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
    border: `1px solid var(--border-color)`,
    marginBottom: 'var(--spacing-lg)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-1px)',
    },
}));

// Helper function to get color based on order status
const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 'warning';
        case 'PROCESSING': return 'info';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

const PackedStatus = () => {
    const { themeMode } = useContext(MyContext);
    const location = useLocation();
    const { key } = location.state || {};
    const status = key;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        status: selectedOrder?.status,
        remarks: '',
        paymentMode: selectedOrder?.paymentMode,
    });
    console.log(editForm, 'editForm' )
    const [formError, setFormError] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    // API hooks
    const { data, isLoading, isError, error, refetch } = useOrdersByStatus(status, page, rowsPerPage);

    const labelPayload = {
        reference_number: selectedOrder?.courierTrackingId || 'NA',
        label_code: "SHIP_LABEL_4X6",
        label_format: "pdf"
    };

    const {
        data: labelData,
        isLoading: isLabelLoading,
        isError: isLabelError,
        error: labelError,
    } = useLabelQuery(labelPayload);
    const updateOrderStatus = useUpdateOrderStatus();

    // Normalize order data with fallback values
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
        payment_status: order.paymentStatus || order.payment_status || 'N/A',
        courierTrackingId: order.courierTrackingId || 'N/A',
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

    // Get normalized orders from API data
    const orders = React.useMemo(() => {
        return (data?.orders || []).map(normalizeOrder);
    }, [data]);

    // Filter orders based on search term
    const filteredOrders = React.useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return orders.filter(order => {
            return (
                order.order_id.toLowerCase().includes(lowerSearch) ||
                order.user_name.toLowerCase().includes(lowerSearch) ||
                order.email.toLowerCase().includes(lowerSearch) ||
                order.contact.toLowerCase().includes(lowerSearch)
            );
        });
    }, [orders, searchTerm]);

    // Toggle row expansion
    const toggleRowExpansion = (orderId) => {
        setExpandedRows(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Fetch full order list using the hook
    const fetchFullOrderList = async () => {
        try {
            const totalOrders = data?.data?.totalOrders || 1000;
            const response = await orderService.getAllOrders(0, totalOrders);
            const normalizedOrders = (response?.data?.orders || []).map(normalizeOrder);
            return normalizedOrders;
        } catch (err) {
            console.error("Error fetching full order list:", err);
            return [];
        }
    };

    const baseUrl = 'https://app.bmgjewellers.com';
    const normalizeImagePaths = (imagePath) => {
        if (!imagePath) return [];

        try {
            if (typeof imagePath === "string" && imagePath.trim().startsWith("[")) {
                const paths = JSON.parse(imagePath);
                return paths.map((p) =>
                    p.startsWith("http") ? p : `${baseUrl}${p}`
                );
            }
            if (typeof imagePath === "string") {
                return [imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`];
            }
            if (Array.isArray(imagePath)) {
                return imagePath.map((p) =>
                    p.startsWith("http") ? p : `${baseUrl}${p}`
                );
            }
        } catch (e) {
            console.error("Invalid imagePath format:", imagePath, e);
            return [];
        }
        return [];
    };

    // Event handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOpenViewModal(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setEditForm({
            status: order.status || status,
            remarks: '',
            paymentMode: order.payment_mode || '',
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
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async () => {
        if (!editForm.status || !editForm.paymentMode) {
            setFormError("Status and Payment Mode are required.");
            return;
        }

        const confirmLabel = window.confirm(
            "⚠️ Please confirm that the shipping label is correctly pasted on the package before updating the status."
        );

        if (!confirmLabel) {
            return;
        }

        const orderId = selectedOrder.order_id;
        const trackingId = selectedOrder.courierTrackingId;

        const payload = {
            orderId,
            newStatus: editForm.status,
            remarks: editForm.remarks,
            paymentMode: editForm.paymentMode,
            paymentStatus: selectedOrder.payment_status,
        };

        try {
            await updateOrderStatus.mutateAsync(payload);
            if (orderId && trackingId) {
                const updatedStatus = await getOrderStatus(orderId, trackingId);
                console.log("Updated order status:", updatedStatus);
            } else {
                throw new Error("Order ID or Tracking ID is missing");
            }
            refetch();
            handleCloseEditModal();
        } catch (err) {
            setFormError(
                `Failed to update order: ${err.message || "Unknown error"}`
            );
        }
    };

    const handleDownloadLabel = () => {
        if (!labelData) return;
        window.open(labelData, "_blank");
        const link = document.createElement("a");
        link.href = labelData;
        link.download = `label_${labelPayload.reference_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Loading and error states
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress sx={{ color: 'var(--primary-color)' }} />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography sx={{ color: 'var(--error-color)' }}>
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
                color: 'var(--primary-text-color)',
                mt: '20px'
            }}
        >
            <TableHeaderCard>
                <CardContent sx={{ p: 3 }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Manage Packed Orders
                            </li>
                        </ol>
                    </nav>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={0}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>
                                Order Management
                            </Typography>
                            <Chip
                                label={`${filteredOrders.length} orders`}
                                size="small"
                                sx={{
                                    backgroundColor: 'var(--active-bg)',
                                    color: 'var(--primary-color)',
                                    fontWeight: 600,
                                     fontFamily: 'var(--font-secondary)'
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
                                            <SearchIcon sx={{ color: 'var(--primary-text-color)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    minWidth: 200,
                                    maxWidth: { xs: '100%', sm: 300 },
                                    width: '100%',
                                    borderRadius: 'var(--border-radius-md)',
                                    backgroundColor: 'var(--card-background-color)',
                                    fontSize: 'var(--font-size-sm)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--border-color)',
                                         fontFamily: 'var(--font-secondary)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--active-border)',
                                         fontFamily: 'var(--font-secondary)'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--active-border)',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'var(--primary-text-color)',
                                        '::placeholder': {
                                            color: 'var(--secondary-text-color)',
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        </Box>

                    </Box>

                    <StyledTableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Order ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Customer</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Amount</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Order Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Payment Mode</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <React.Fragment key={order.id}>
                                            <TableRow sx={{ '&:hover': { backgroundColor: 'var(--active-bg)' } }}>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}>
                                                        #{order.order_id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}>
                                                            {order.user_name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'var(--secondary-text-color)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}>
                                                            {order.email}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-secondary)' }}>
                                                        ₹{order.total_amount.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}>
                                                    <StatusChip
                                                        label={order.status.toUpperCase()}
                                                        status={order.status}
                                                        size="small"
                                                        onClick={() => handleEditOrder(order)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}>
                                                        {new Date(order.order_time).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'var(--secondary-text-color)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}>
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
                                                            fontSize: 'var(--font-size-xs)',
                                                            fontFamily: 'var(--font-secondary)'
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
                                                                    color: 'var(--success-color)',
                                                                    backgroundColor: 'var(--active-bg)',
                                                                    borderRadius: 'var(--border-radius-sm)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'var(--active-border)',
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
                                                                    color: 'var(--success-color)',
                                                                    backgroundColor: 'var(--active-bg)',
                                                                    borderRadius: 'var(--border-radius-sm)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'var(--active-border)',
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
                                                                    color: 'var(--success-color)',
                                                                    backgroundColor: 'var(--active-bg)',
                                                                    borderRadius: 'var(--border-radius-sm)',
                                                                    transition: 'transform 0.2s ease',
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

                                            {/* Expanded Row for Product Details */}
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    sx={{
                                                        py: 0,
                                                        px: 0,
                                                        borderBottom: expandedRows[order.order_id] ? `1px solid var(--border-color)` : 0,
                                                    }}
                                                >
                                                    <Collapse in={expandedRows[order.order_id]} timeout="auto" unmountOnExit>
                                                        <Box sx={{
                                                            backgroundColor: 'var(--background-color)',
                                                            borderTop: `1px solid var(--border-color)`,
                                                            py: 2,
                                                            px: 2,
                                                        }}>
                                                            <Box sx={{
                                                                maxWidth: '95%',
                                                                margin: '0 auto',
                                                                backgroundColor: 'var(--card-background-color)',
                                                                borderRadius: 'var(--border-radius-lg)',
                                                                border: `1px solid var(--border-color)`,
                                                            }}>
                                                                <Table size="small" sx={{
                                                                    width: '100%',
                                                                    '& .MuiTableCell-root': {
                                                                        borderBottom: `1px solid var(--border-color)`,
                                                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                    }
                                                                }}>
                                                                    <TableHead>
                                                                        <TableRow sx={{ backgroundColor: 'var(--active-bg)' }}>
                                                                            <TableCell sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '30%', fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                Product
                                                                            </TableCell>
                                                                            <TableCell sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '20%', fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                SKU
                                                                            </TableCell>
                                                                            <TableCell align="center" sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '15%', fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                Quantity
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '15%', fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                Unit Price
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '20%', fontFamily: 'var(--font-primary)'
                                                                            }}>
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
                                                                                        '&:hover': { backgroundColor: 'var(--active-bg)' },
                                                                                        borderBottom: isLastRow ? 'none' : `1px solid var(--border-color)`,
                                                                                        fontFamily: 'var(--font-secondary)'
                                                                                    }}
                                                                                >
                                                                                    <TableCell sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '8px'
                                                                                    }}>
                                                                                        {normalizeImagePaths(item.image_path)[0] ? (
                                                                                            <img
                                                                                                src={normalizeImagePaths(item.image_path)[0]}
                                                                                                alt={item.product_name}
                                                                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                                                            />
                                                                                        ) : (
                                                                                            <Box
                                                                                                sx={{
                                                                                                    width: 40,
                                                                                                    height: 40,
                                                                                                    backgroundColor: 'var(--border-color)',
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    justifyContent: 'center',
                                                                                                    borderRadius: 1
                                                                                                }}
                                                                                            >
                                                                                                <Typography variant="caption" sx={{ color: 'var(--secondary-text-color)' }}>
                                                                                                    No Image
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        )}
                                                                                        <Typography variant="body2" sx={{
                                                                                            color: 'var(--primary-text-color)',
                                                                                            fontWeight: 500,
                                                                                            fontSize: 'var(--font-size-sm)',
                                                                                            fontFamily: 'var(--font-secondary)'
                                                                                        }}>
                                                                                            {item.product_name}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Typography variant="body2" sx={{
                                                                                            color: 'var(--primary-color)',
                                                                                            fontWeight: 500,
                                                                                            fontFamily: 'monospace',
                                                                                            fontSize: 'var(--font-size-sm)',
                                                                                            backgroundColor: 'var(--active-bg)',
                                                                                            padding: '4px 8px',
                                                                                            borderRadius: 'var(--border-radius-sm)',
                                                                                            display: 'inline-block'
                                                                                        }}>
                                                                                            {item.item_id}-{item.tagno}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="center">
                                                                                        <Chip
                                                                                            label={item.quantity}
                                                                                            size="small"
                                                                                            sx={{
                                                                                                backgroundColor: 'var(--active-bg)',
                                                                                                color: 'var(--primary-color)',
                                                                                                fontWeight: 600,
                                                                                                minWidth: '40px',
                                                                                                fontSize: 'var(--font-size-xs)',
                                                                                                height: '28px',
                                                                                                fontFamily: 'var(--font-secondary)'
                                                                                            }}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <Typography variant="body2" sx={{
                                                                                            color: 'var(--secondary-text-color)',
                                                                                            fontWeight: 500,
                                                                                            fontSize: 'var(--font-size-sm)',
                                                                                            fontFamily: 'var(--font-secondary)'
                                                                                        }}>
                                                                                            ₹{item.price.toFixed(2)}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <Typography variant="body2" sx={{
                                                                                            color: 'var(--primary-color)',
                                                                                            fontWeight: 700,
                                                                                            fontSize: 'var(--font-size-sm)',
                                                                                            fontFamily: 'var(--font-secondary)'
                                                                                        }}>
                                                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                        <TableRow sx={{
                                                                            backgroundColor: 'var(--active-bg)',
                                                                            borderTop: `2px solid var(--border-color)`
                                                                        }}>
                                                                            <TableCell colSpan={4} sx={{ py: 2 }}>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 700,
                                                                                    color: 'var(--primary-text-color)',
                                                                                    textAlign: 'right',
                                                                                    fontSize: 'var(--font-size-sm)',
                                                                                    fontFamily: 'var(--font-secondary)'
                                                                                }}>
                                                                                    Order Total:
                                                                                </Typography>
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{ py: 2 }}>
                                                                                <Typography variant="h6" sx={{
                                                                                    color: 'var(--primary-color)',
                                                                                    fontWeight: 700,
                                                                                    fontSize: 'var(--font-size-md)',
                                                                                    fontFamily: 'var(--font-secondary)'
                                                                                }}>
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
                                                <Typography variant="h6" sx={{ color: 'var(--secondary-text-color)', fontWeight: 500 }}>
                                                    No orders found
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'var(--secondary-text-color)' }}>
                                                    Try adjusting your search or filters
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>

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
                                border: `1px solid var(--border-color)`,
                                flexWrap: 'wrap',
                                gap: 2
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="body2" sx={{ color: 'var(--secondary-text-color)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                                    Rows per page:
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 80 }}>
                                    <Select
                                        value={rowsPerPage}
                                        onChange={handleChangeRowsPerPage}
                                        sx={{
                                            borderRadius: 'var(--border-radius-md)',
                                            fontSize: 'var(--font-size-sm)',
                                            backgroundColor: 'var(--card-background-color)',
                                            '& .MuiOutlinedInput-root': {
                                                border: `1px solid var(--border-color)`,
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
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: 'var(--card-background-color)',
                            color: 'var(--primary-text-color)',
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6 " sx={{ color: 'var(--primary-text-color)' }}>Edit Order - {selectedOrder.order_id}</Typography>
                            {!isLabelLoading && !isLabelError && (
                                <ModernButton
                                    onClick={handleDownloadLabel}
                                    variant="contained"
                                    sx={{ color: 'var(--primary-text-color)' }}
                                >
                                    Download Label
                                </ModernButton>
                            )}
                            {isLabelLoading && <CircularProgress size={20} sx={{ color: 'var(--primary-text-color)' }} />}
                            {isLabelError && <Typography sx={{ color: 'var(--error-color)' }}>{labelError.message}</Typography>}
                            <IconButton onClick={handleCloseEditModal}>
                                <CloseIcon sx={{ color: 'var(--primary-text-color)' }} />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers sx={{ backgroundColor: 'var(--background-color)' }}>
                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'var(--primary-text-color)', textAlign: 'center', mb: 2 }}>
                                Current Order Information
                            </Typography>
                            <TableContainer component={Paper} sx={{ backgroundColor: 'var(--card-background-color)', border: `1px solid var(--border-color)` }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', width: '25%', backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                                                Order ID
                                            </TableCell>
                                            <TableCell sx={{ width: '25%', color: 'var(--primary-text-color)' }}>{selectedOrder.order_id}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: '25%', backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                                                Customer Name
                                            </TableCell>
                                            <TableCell sx={{ width: '25%', color: 'var(--primary-text-color)' }}>{selectedOrder.user_name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                                                Current Status
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={selectedOrder.status}
                                                    color={getStatusColor(selectedOrder.status)}
                                                    size="small"
                                                    sx={{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-text-color)', }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'var(--active-bg)',color: 'var(--primary-text-color)' }}>
                                                Payment Mode
                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--primary-text-color)' }}>{selectedOrder.payment_mode}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                                                Order Date
                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--primary-text-color)' }}>{new Date(selectedOrder.order_time).toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                                                Total Amount
                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--primary-text-color)' }}>₹{selectedOrder.total_amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h6" gutterBottom sx={{ color: 'var(--primary-text-color)', textAlign: 'center', mb: 2 }}>
                                Update Order Information
                            </Typography>
                            <Paper sx={{ p: 3, width: '100%', maxWidth: 600, backgroundColor: 'var(--card-background-color)', border: `1px solid var(--border-color)` }}>
                                <Grid container spacing={2} justifyContent="center">
                                    {formError && (
                                        <Grid item xs={12}>
                                            <Alert severity="error" sx={{ backgroundColor: 'var(--error-color)', color: 'var(--priamry-text-color)' }}>
                                                {formError}
                                            </Alert>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={10}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: 'var(--primary-text-color)' }}>Status</InputLabel>
                                            <Select
                                                name="status"
                                                value={editForm.status}
                                                onChange={handleEditFormChange}
                                                label="Status"
                                                disabled={updateOrderStatus.isLoading}
                                                sx={{
                                                    backgroundColor: 'var(--card-background-color)',
                                                    borderRadius: 'var(--border-radius-md)',
                                                    color: 'var(--primary-text-color)',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--border-color)',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--primary-text-color)', // highlight on hover
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--primary-text-color)', // active border
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Packed" disabled>Packed</MenuItem>
                                                <MenuItem value="SHIPPED">Ready to Ship</MenuItem>
                                                <MenuItem value="CANCELLED">To Cancel</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* <Grid item xs={12} sm={10}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: 'var(--primary-text-color)' }}>Payment Mode</InputLabel>
                                            <Select
                                                name="paymentMode"
                                                value={editForm.paymentMode}
                                                onChange={handleEditFormChange}
                                                label="Payment Mode"
                                                disabled={updateOrderStatus.isLoading}
                                                sx={{
                                                    backgroundColor: 'var(--card-background-color)',
                                                    borderRadius: 'var(--border-radius-md)',
                                                    color: 'var(--primary-text-color)',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--border-color)',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--primary-text-color)', // hover state
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'var(--primary-text-color)', // focus state
                                                    },
                                                }}
                                            >
                                                <MenuItem value="COD">Cash on Delivery</MenuItem>
                                                <MenuItem value="ONLINE">Online Payment</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid> */}

                                    <Grid item xs={12} sm={10}>
                                        <TextField
                                            fullWidth
                                            size="medium"
                                            label="Remarks"
                                            name="remarks"
                                            value={editForm.remarks}
                                            onChange={handleEditFormChange}
                                            multiline
                                            rows={4}
                                            placeholder="Enter any remarks about this status change"
                                            disabled={updateOrderStatus.isLoading}
                                            helperText="Add specific notes or reasons for the status change"
                                            sx={{
                                                backgroundColor: 'var(--card-background-color)',
                                                borderRadius: 'var(--border-radius-md)',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--border-color)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--primary-text-color)', // hover state
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--primary-text-color)', // focused state
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: 'var(--primary-text-color)', // text color
                                                },
                                                '& .MuiFormLabel-root': {
                                                    color: 'var(--primary-text-color)', // label color
                                                },
                                                '& .MuiFormHelperText-root': {
                                                    color: 'var(--secondary-text-color)', // helper text color
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={10}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: 'var(--active-bg)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--primary-text-color)' }}>
                                                Update Summary:
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                color: 'var(--secondary-text-color)'
                                            }}>
                                                Status:
                                                <Chip
                                                    label={selectedOrder.status}
                                                    color={getStatusColor(selectedOrder.status)}
                                                    size="small"
                                                    sx={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-dark)' }}
                                                />
                                                →
                                                <Chip
                                                    label={editForm.status || 'Select Status'}
                                                    color={getStatusColor(editForm.status)}
                                                    size="small"
                                                    sx={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-dark)' }}
                                                />
                                                {editForm.status !== selectedOrder.status && (
                                                    <Chip
                                                        label="WILL BE UPDATED"
                                                        color="warning"
                                                        size="small"
                                                        sx={{ backgroundColor: 'var(--warning-color)', color: 'var(--text-dark)' }}
                                                    />
                                                )}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <ModernButton
                            onClick={handleCloseEditModal}
                            disabled={updateOrderStatus.isLoading}
                            variant="outlined"
                            sx={{ borderColor: 'var(--border-color)', color: 'var(--primary-text-color)' }}
                        >
                            Cancel
                        </ModernButton>
                        <ModernButton
                            onClick={handleEditSubmit}
                            variant="contained"
                            disabled={updateOrderStatus.isLoading}
                            startIcon={updateOrderStatus.isLoading ? <CircularProgress size={20} sx={{ color: 'var(--text-dark)' }} /> : null}
                            sx={{ minWidth: 120 }}
                        >
                            {updateOrderStatus.isLoading ? 'Saving...' : 'Save Changes'}
                        </ModernButton>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default PackedStatus;