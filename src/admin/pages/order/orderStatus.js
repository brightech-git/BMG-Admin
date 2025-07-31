import React, { useState } from 'react';
import { useAllOrders, useUpdateOrderStatus } from '../../hooks/order/useAllOrder';
import { orderService } from '../../service/orderService';
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
    CardContent
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
    Receipt
} from '@mui/icons-material';
import { styled } from '@mui/system';
import './OrderManagement.css';

// ========== ENHANCED STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    overflow: 'visible',
    background: '#ffffff',
    boxShadow: '0 8px 32px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    maxHeight: 'none',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #1E1E2C 0%, #2c2c3d 100%)',
        '& .MuiTableCell-head': {
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: '16px 12px',
        }
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(242, 159, 103, 0.04)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(30, 30, 44, 0.06)',
        padding: '12px',
    },
}));

const ModernButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '10px 20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: buttonVariant === 'contained' ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 6px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    ...(color === 'primary' && {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #2a7bd9 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #2a7bd9 0%, #1e5fb8 100%)',
        }
    }),
    ...(color === 'secondary' && {
        background: 'linear-gradient(135deg, #F29F67 0%, #e08f5a 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #e08f5a 0%, #cc7a45 100%)',
        }
    }),
    ...(color === 'dark' && {
        background: 'linear-gradient(135deg, #1E1E2C 0%, #2c2c3d 100%)',
        color: '#FFFFFF',
        '&:hover': {
            background: 'linear-gradient(135deg, #2c2c3d 0%, #3a3a4f 100%)',
        }
    }),
}));

const StatusChip = styled(Chip)(({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'delivered':
                return {
                    background: 'linear-gradient(135deg, #34B1AA 0%, #2a9891 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(52, 177, 170, 0.3)',
                };
            case 'pending':
                return {
                    background: 'linear-gradient(135deg, #E0B50F 0%, #c9a00d 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(224, 181, 15, 0.3)',
                };
            case 'processing':
                return {
                    background: 'linear-gradient(135deg, #3B8FF3 0%, #2a7bd9 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(59, 143, 243, 0.3)',
                };
            case 'shipped':
                return {
                    background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
                };
            case 'cancelled':
                return {
                    background: 'linear-gradient(135deg, #F36868 0%, #e04545 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(243, 104, 104, 0.3)',
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #3B8FF3 0%, #2a7bd9 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(59, 143, 243, 0.3)',
                };
        }
    };

    return {
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: '0.7rem',
        minWidth: '90px',
        height: '28px',
        borderRadius: '14px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ...getStatusStyles(status),
        '&:hover': {
            transform: 'scale(1.05)',
        },
    };
});

// Header styled component for the table header with filters
const TableHeaderCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
}));

// Helper function to get color based on order status
const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'PROCESSING': return 'info';
        case 'SHIPPED': return 'primary';
        case 'DELIVERED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

const OrderStatusManagement = () => {
    // State management
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

    // API hooks
    const { data, isLoading, isError, error, refetch } = useAllOrders(page, rowsPerPage);
    const updateOrderStatus = useUpdateOrderStatus();

    // Normalize order data with fallback values
    const normalizeOrder = (order = {}) => ({
        id: order.id || 'N/A',
        order_id: order.order_id || order.orderId || 'N/A',
        user_name: order.user_name || order.customerName || 'N/A',
        contact: order.contact || 'N/A',
        email: order.email || 'N/A',
        total_amount: parseFloat(order.total_amount || order.totalAmount || order.amount || 0),
        status: order.status || 'PENDING',
        order_time: order.order_time || order.orderTime || order.date || 'N/A',
        payment_mode: order.payment_mode || 'N/A',
        address: order.address || 'N/A',
        orderItems: (order.orderItems || []).map(item => ({
            product_name: item.product_name || item.productName || 'N/A',
            quantity: item.quantity || 0,
            price: parseFloat(item.price || 0),
            sno: item.sno || 'N/A',
            tagno: item.tagno || 'N/A',
            item_id: item.item_id || item.itemid || 'N/A',
            image_path: item.image_path || item.imagePath || null
        }))
    });

    // Get normalized orders from API data
    const orders = React.useMemo(() => {
        return (data?.data?.orders || []).map(normalizeOrder);
    }, [data]);

    // Toggle row expansion
    const toggleRowExpansion = (orderId) => {
        setExpandedRows(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Fetch full order list using the hook
    const fetchFullOrderList = async () => {
        setIsFetchingFullList(true);
        try {
            const totalOrders = data?.data?.totalOrders || 1000;
            const response = await orderService.getAllOrders(0, totalOrders);
            const normalizedOrders = (response?.data?.orders || []).map(normalizeOrder);
            return normalizedOrders;
        } catch (err) {
            console.error("Error fetching full order list:", err);
            return [];
        } finally {
            setIsFetchingFullList(false);
        }
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

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    // Filter orders based on search term and status filter
    const filteredOrders = React.useMemo(() => {
        return orders.filter(order => {
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

    // Modal handlers
    const handleViewOrder = (order) => {
        setSelectedOrder(normalizeOrder(order));
        setOpenViewModal(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(normalizeOrder(order));
        setEditForm({
            status: order.status,
            remarks: '',
            paymentMode: order.payment_mode || 'ONLINE',
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
            setFormError('Status and Payment Mode are required.');
            return;
        }

        const payload = {
            orderId: selectedOrder.order_id,
            status: editForm.status,
            remarks: editForm.remarks,
            paymentMode: editForm.paymentMode,
            paymentStatus: 'UNKNOWN',
        };

        try {
            await updateOrderStatus.mutateAsync(payload);
            refetch();
            handleCloseEditModal();
        } catch (err) {
            setFormError(`Failed to update order: ${err.message || 'Unknown error'}`);
        }
    };

    // Export and Print handlers
    const handleOpenExportDialog = (type) => {
        setExportType(type);
        setOpenExportDialog(true);
    };

    const handleCloseExportDialog = () => {
        setOpenExportDialog(false);
        setExportType('');
        setExportMode('current');
    };

    const handleExportConfirm = async () => {
        let ordersToExport = filteredOrders;

        if (exportMode === 'full') {
            const fullData = await fetchFullOrderList();
            if (!fullData || fullData.length === 0) {
                alert("Failed to fetch full order list");
                return;
            }
            ordersToExport = fullData;
        }

        switch (exportType) {
            case 'pdf':
                exportToPDF(ordersToExport);
                break;
            case 'excel':
                exportToExcel(ordersToExport);
                break;
            case 'print':
                handlePrint(ordersToExport);
                break;
            default:
                break;
        }

        handleCloseExportDialog();
    };

    const exportToPDF = (orders) => {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        const timestamp = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        const date = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).split("/").join("-");

        // Header
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text("Order Management Report", 14, 14);
        doc.setFontSize(10);
        doc.text(`Generated: ${timestamp} ${date}`, 14, 22);
        doc.text(`Total Orders: ${orders.length}`, 14, 28);

        const mainHeaders = [
            "S.No", "Order ID", "Customer", "Phone", "Amount", "Status", "Order Time", "Payment", "Items"
        ];

        const mainData = orders.map((order, index) => {
            const itemsFormatted = (order.orderItems || []).map(item =>
                `• ${item.product_name}\n  SKU: ${item.item_id}-${item.tagno}, ₹${parseFloat(item.price).toFixed(2)}`
            ).join('\n\n');

            return [
                index + 1,
                order.order_id || "N/A",
                order.user_name || "N/A",
                order.contact || "N/A",
                parseFloat(order.total_amount)?.toFixed(2) || "0.00",
                order.status || "N/A",
                order.order_time ? new Date(order.order_time).toLocaleString() : "N/A",
                order.payment_mode || "N/A",
                itemsFormatted?.trim().length ? itemsFormatted : "No items available"
            ];
        });

        autoTable(doc, {
            startY: 34,
            head: [mainHeaders],
            body: mainData,
            styles: {
                fontSize: 8,
                cellPadding: 1.5,
                overflow: "linebreak",
                valign: "top",
                halign: "left",
                minCellHeight: 10
            },
            headStyles: {
                fillColor: [25, 118, 210],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "center"
            },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 30 },
                2: { cellWidth: 28 },
                3: { cellWidth: 26 },
                4: { cellWidth: 20 },
                5: { cellWidth: 24 },
                6: { cellWidth: 36 },
                7: { cellWidth: 25 },
                8: { cellWidth: 75 }, // Items
            },
            pageBreak: 'auto',
            margin: { top: 34, left: 10, right: 10 },
            didDrawPage: (data) => {
                doc.setFontSize(8);
                const pageHeight = doc.internal.pageSize.height;
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, pageHeight - 5);
            }
        });

        doc.save(`orders_${date}.pdf`);
    };

    const exportToExcel = (orders) => {
        const workbook = XLSX.utils.book_new();

        // Create main orders sheet
        const orderHeader = [
            'S.No',
            'Order ID',
            'Customer Name',
            'Phone',
            'Email',
            'Address',
            'Amount (₹)',
            'Status',
            'Order Time',
            'Payment Mode',
            'Product Count'
        ];

        const orderData = orders.map((order, index) => [
            index + 1,
            order.order_id || 'N/A',
            order.user_name || 'N/A',
            order.contact || 'N/A',
            order.email || 'N/A',
            order.address || 'N/A',
            parseFloat(order.total_amount)?.toFixed(2) || '0.00',
            order.status || 'N/A',
            order.order_time ? new Date(order.order_time).toLocaleString() : 'N/A',
            order.payment_mode || 'N/A',
            order.orderItems?.length || 0
        ]);

        const orderSheet = XLSX.utils.aoa_to_sheet([orderHeader, ...orderData]);
        XLSX.utils.book_append_sheet(workbook, orderSheet, 'Orders');

        // Create products sheet if there are any products
        const hasProducts = orders.some(order => order.orderItems && order.orderItems.length > 0);
        if (hasProducts) {
            const productHeader = [
                'Order ID',
                'Product Name',
                'Tag No',
                'S.No',
                'Quantity',
                'Price',
                'Total'
            ];

            const productData = [];
            orders.forEach(order => {
                if (order.orderItems && order.orderItems.length > 0) {
                    order.orderItems.forEach(item => {
                        productData.push([
                            order.order_id || 'N/A',
                            item.product_name || 'N/A',
                            item.tagno || 'N/A',
                            item.sno || 'N/A',
                            item.quantity || 0,
                            parseFloat(item.price)?.toFixed(2) || '0.00',
                            (item.quantity * parseFloat(item.price))?.toFixed(2) || '0.00'
                        ]);
                    });
                }
            });

            const productSheet = XLSX.utils.aoa_to_sheet([productHeader, ...productData]);
            XLSX.utils.book_append_sheet(workbook, productSheet, 'Products');
        }

        // Apply styles
        const ws = workbook.Sheets['Orders'];

        // Style header
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            ws[cellAddress].s = {
                fill: { fgColor: { rgb: '1976D2' } },
                font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } },
                },
            };
        }

        // Set column widths
        ws['!cols'] = [
            { wch: 8 },   // S.No
            { wch: 22 },   // Order ID
            { wch: 28 },   // Customer Name
            { wch: 22 },   // Phone
            { wch: 35 },   // Email
            { wch: 60 },   // Address
            { wch: 18 },   // Amount
            { wch: 18 },   // Status
            { wch: 28 },   // Order Time
            { wch: 22 },   // Payment Mode
            { wch: 15 }    // Product Count
        ];

        // Save the file
        XLSX.writeFile(workbook, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handlePrint = (orders) => {
        const printWindow = window.open('', '_blank');
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');

        printWindow.document.write(`
        <html>
        <head>
            <title>Order Report</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 10px;
                    font-size: 10px;
                    color: #000;
                }
                .print-header {
                    margin-bottom: 12px;
                }
                .print-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                .print-meta {
                    font-size: 10px;
                    color: #555;
                    margin: 2px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    word-break: break-word;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 6px 8px;
                    vertical-align: top;
                }
                th {
                    background-color: #1976D2;
                    color: white;
                    font-weight: bold;
                    text-align: center;
                    font-size: 10px;
                }
                td.amount {
                    text-align: right;
                    white-space: nowrap;
                }
                td.address {
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                td.order-id {
                    word-break: break-word;
                }
                .product-table {
                    margin-top: 10px;
                    margin-bottom: 20px;
                }
                .product-header {
                    font-weight: bold;
                    margin-top: 10px;
                }
                @media print {
                    .no-print { display: none; }
                }
                col.order-id { width: 18%; }
                col.customer { width: 15%; }
                col.phone { width: 14%; }
                col.address { width: 25%; }
                col.amount { width: 10%; }
                col.status { width: 14%; }
                col.time { width: 18%; }
                col.payment { width: 12%; }
            </style>
        </head>
        <body>
            <div class="print-header">
                <div class="print-title">Order Management Report</div>
                <div class="print-meta">Generated: ${time} ${date}</div>
                <div class="print-meta">Total Orders: ${orders.length}</div>
            </div>
            <table>
                <colgroup>
                    <col class="order-id" />
                    <col class="customer" />
                    <col class="phone" />
                    <col class="address" />
                    <col class="amount" />
                    <col class="status" />
                    <col class="time" />
                    <col class="payment" />
                </colgroup>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th>Order Time</th>
                        <th>Payment</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td class="order-id">${order.order_id || 'N/A'}</td>
                            <td>${order.user_name || 'N/A'}</td>
                            <td>${order.contact || 'N/A'}</td>
                            <td class="address">${order.address || 'N/A'}</td>
                            <td class="amount">₹${parseFloat(order.total_amount)?.toFixed(2) || '0.00'}</td>
                            <td>${order.status || 'N/A'}</td>
                            <td>${order.order_time ? new Date(order.order_time).toLocaleString() : 'N/A'}</td>
                            <td>${order.payment_mode || 'N/A'}</td>
                        </tr>
                        ${order.orderItems && order.orderItems.length > 0 ? `
                        <tr>
                            <td colspan="8" style="padding: 0;">
                                <div class="product-header">Products (${order.orderItems.length})</div>
                                <table class="product-table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Tag No</th>
                                            <th>S.No</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.orderItems.map(item => `
                                            <tr>
                                                <td>${item.product_name || 'N/A'}</td>
                                                <td>${item.tagno || 'N/A'}</td>
                                                <td>${item.sno || 'N/A'}</td>
                                                <td>${item.quantity || 0}</td>
                                                <td>₹${parseFloat(item.price)?.toFixed(2) || '0.00'}</td>
                                                <td>₹${(item.quantity * parseFloat(item.price))?.toFixed(2) || '0.00'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        ` : ''}
                    `).join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 200);
                };
            </script>
        </body>
        </html>
        `);

        printWindow.document.close();
    };

    // Loading and error states
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">Error loading orders: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Box
            p={2}
            sx={{
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                overflow: 'visible'
            }}
        >
            {/* Order Management Table with Integrated Filters */}
            <TableHeaderCard>
                <CardContent sx={{ p: 3 }}>
                    {/* Table Header with Filters */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 700 }}>
                    Order Management
                </Typography>
                            <Chip
                                label={`${filteredOrders.length} orders`}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                    color: '#3B8FF3',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>

                        {/* Action Buttons */}
                        <Box display="flex" gap={2} alignItems="center">
                    <Tooltip title="Refresh">
                                <IconButton 
                                    onClick={() => refetch()} 
                                    sx={{
                                        backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                        borderRadius: '8px',
                                        color: '#3B8FF3',
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 143, 243, 0.2)',
                                        },
                                    }}
                                >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Export to PDF">
                                <IconButton 
                                    onClick={() => handleOpenExportDialog('pdf')}
                                    sx={{
                                        backgroundColor: 'rgba(242, 159, 103, 0.1)',
                                        borderRadius: '8px',
                                        color: '#F29F67',
                                        '&:hover': {
                                            backgroundColor: 'rgba(242, 159, 103, 0.2)',
                                        },
                                    }}
                                >
                            <PdfIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Export to Excel">
                                <IconButton 
                                    onClick={() => handleOpenExportDialog('excel')}
                                    sx={{
                                        backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                        borderRadius: '8px',
                                        color: '#34B1AA',
                                        '&:hover': {
                                            backgroundColor: 'rgba(52, 177, 170, 0.2)',
                                        },
                                    }}
                                >
                            <ExcelIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Print">
                                <IconButton 
                                    onClick={() => handleOpenExportDialog('print')}
                                    sx={{
                                        backgroundColor: 'rgba(30, 30, 44, 0.1)',
                                        borderRadius: '8px',
                                        color: '#1E1E2C',
                                        '&:hover': {
                                            backgroundColor: 'rgba(30, 30, 44, 0.2)',
                                        },
                                    }}
                                >
                            <PrintIcon />
                        </IconButton>
                    </Tooltip>
                        </Box>
            </Box>

            {/* Filter Section */}
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
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        minWidth: 200,
                        maxWidth: { xs: '100%', sm: 300 },
                        width: '100%',
                                flexGrow: { xs: 1, sm: 0 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    fontSize: '0.875rem',
                                },
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        label="Status"
                                sx={{
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    fontSize: '0.875rem',
                                }}
                    >
                        <MenuItem value="ALL">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="PROCESSING">Processing</MenuItem>
                        <MenuItem value="SHIPPED">Shipped</MenuItem>
                        <MenuItem value="DELIVERED">Delivered</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Orders Table */}
                    {isLoading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
                            <CircularProgress
                                size={50}
                                sx={{ color: '#F29F67', mb: 2 }}
                            />
                            <Typography variant="body1" sx={{ color: '#6B7280' }}>
                                Loading orders...
                            </Typography>
                        </Box>
                    ) : isError ? (
                        <Box p={3}>
                            <Alert
                                severity="error"
                                sx={{
                                    backgroundColor: '#fff5f5',
                                    color: '#d32f2f',
                                    borderRadius: '12px',
                                    '& .MuiAlert-icon': { color: '#d32f2f' }
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
                        <StyledTableContainer>
                            <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Order ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Customer</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Amount</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Order Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Payment Mode</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <React.Fragment key={order.id}>
                                                <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(242, 159, 103, 0.02)' } }}>
                                        <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#3B8FF3' }}>
                                                            #{order.order_id}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                                                {order.user_name}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                                {order.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#F29F67', fontSize: '1rem' }}>
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
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {new Date(order.order_time).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                            {new Date(order.order_time).toLocaleTimeString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.payment_mode}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                                                color: '#34B1AA',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
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
                                                                        color: '#3B8FF3',
                                                                        backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                                        borderRadius: '6px',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(59, 143, 243, 0.2)',
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
                                                                        color: '#F29F67',
                                                                        backgroundColor: 'rgba(242, 159, 103, 0.1)',
                                                                        borderRadius: '6px',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(242, 159, 103, 0.2)',
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
                                                        onClick={() => toggleRowExpansion(order.id)}
                                                                    sx={{
                                                                        color: '#34B1AA',
                                                                        backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                                                        borderRadius: '6px',
                                                                        transition: 'transform 0.2s ease',
                                                                        transform: expandedRows[order.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(52, 177, 170, 0.2)',
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
                                                            borderBottom: expandedRows[order.id] ? '1px solid rgba(30, 30, 44, 0.06)' : 0,
                                                            mb: expandedRows[order.id] ? 2 : 0
                                                        }}
                                                    >
                                            <Collapse in={expandedRows[order.id]} timeout="auto" unmountOnExit>
                                                            <Box sx={{ 
                                                                backgroundColor: '#f8f9fa', 
                                                                borderTop: '1px solid rgba(30, 30, 44, 0.06)',
                                                                borderBottom: '1px solid rgba(30, 30, 44, 0.06)',
                                                                py: 2,
                                                                px: 2,
                                                                position: 'relative',
                                                                zIndex: 1
                                                            }}>
                                                                <Box sx={{
                                                                    maxWidth: '95%',
                                                                    margin: '0 auto',
                                                                    backgroundColor: '#ffffff', 
                                                                    borderRadius: '12px',
                                                                    overflow: 'visible',
                                                                    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
                                                                    border: '1px solid rgba(30, 30, 44, 0.06)',
                                                                    position: 'relative'
                                                                }}>
                                                                    <Table size="small" sx={{ 
                                                                        width: '100%',
                                                                        '& .MuiTableCell-root': {
                                                                            borderBottom: '1px solid rgba(30, 30, 44, 0.08)',
                                                                            padding: '12px 16px',
                                                                        }
                                                                    }}>
                                                        <TableHead>
                                                                            <TableRow sx={{ backgroundColor: 'rgba(59, 143, 243, 0.08)' }}>
                                                                                <TableCell sx={{ 
                                                                                    fontWeight: 700, 
                                                                                    color: '#3B8FF3', 
                                                                                    fontSize: '0.85rem',
                                                                                    width: '35%'
                                                                                }}>
                                                                                    Product
                                                                                </TableCell>
                                                                                <TableCell sx={{ 
                                                                                    fontWeight: 700, 
                                                                                    color: '#3B8FF3', 
                                                                                    fontSize: '0.85rem',
                                                                                    width: '20%'
                                                                                }}>
                                                                                    SKU
                                                                                </TableCell>
                                                                                <TableCell align="center" sx={{ 
                                                                                    fontWeight: 700, 
                                                                                    color: '#3B8FF3', 
                                                                                    fontSize: '0.85rem',
                                                                                    width: '15%'
                                                                                }}>
                                                                                    Quantity
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ 
                                                                                    fontWeight: 700, 
                                                                                    color: '#3B8FF3', 
                                                                                    fontSize: '0.85rem',
                                                                                    width: '15%'
                                                                                }}>
                                                                                    Unit Price
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ 
                                                                                    fontWeight: 700, 
                                                                                    color: '#3B8FF3', 
                                                                                    fontSize: '0.85rem',
                                                                                    width: '15%'
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
                                                                                            '&:hover': {
                                                                                                backgroundColor: 'rgba(242, 159, 103, 0.04)',
                                                                                            },
                                                                                            borderBottom: isLastRow ? 'none' : '1px solid rgba(30, 30, 44, 0.08)',
                                                                                        }}
                                                                                    >
                                                                    <TableCell>
                                                                                            <Box display="flex" alignItems="center" gap={2}>
                                                                            {item.image_path && (
                                                                                                    <Box
                                                                                                        sx={{
                                                                                                            width: 40,
                                                                                                            height: 40,
                                                                                                            borderRadius: '8px',
                                                                                                            overflow: 'hidden',
                                                                                                            backgroundColor: '#f8f9fa',
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            justifyContent: 'center',
                                                                                                            flexShrink: 0,
                                                                                                            border: '1px solid rgba(30, 30, 44, 0.08)',
                                                                                                        }}
                                                                                                    >
                                                                                                        <img
                                                                                    src={item.image_path}
                                                                                    alt={item.product_name}
                                                                                                            style={{
                                                                                                                width: '100%',
                                                                                                                height: '100%',
                                                                                                                objectFit: 'cover',
                                                                                                            }}
                                                                                                        />
                                                                                                    </Box>
                                                                                                )}
                                                                                                <Typography variant="body2" sx={{ 
                                                                                                    fontWeight: 600, 
                                                                                                    color: '#1E1E2C',
                                                                                                    lineHeight: 1.4
                                                                                                }}>
                                                                            {item.product_name}
                                                                                                </Typography>
                                                                        </Box>
                                                                    </TableCell>
                                                                                        <TableCell>
                                                                                            <Typography variant="body2" sx={{ 
                                                                                                color: '#34B1AA', 
                                                                                                fontWeight: 500, 
                                                                                                fontFamily: 'monospace', 
                                                                                                fontSize: '0.8rem',
                                                                                                backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                                                                                padding: '4px 8px',
                                                                                                borderRadius: '4px',
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
                                                                                                    backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                                                                                    color: '#34B1AA',
                                                                                                    fontWeight: 600,
                                                                                                    minWidth: '40px',
                                                                                                    fontSize: '0.75rem',
                                                                                                    height: '28px',
                                                                                                }}
                                                                                            />
                                                                                        </TableCell>
                                                                                        <TableCell align="right">
                                                                                            <Typography variant="body2" sx={{ 
                                                                                                color: '#6B7280', 
                                                                                                fontWeight: 500,
                                                                                                fontSize: '0.9rem'
                                                                                            }}>
                                                                                                ₹{item.price.toFixed(2)}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell align="right">
                                                                                            <Typography variant="body2" sx={{ 
                                                                                                color: '#F29F67', 
                                                                                                fontWeight: 700, 
                                                                                                fontSize: '0.95rem'
                                                                                            }}>
                                                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                </TableRow>
                                                                                );
                                                                            })}

                                                                            {/* Total Row */}
                                                                            <TableRow sx={{ 
                                                                                backgroundColor: 'rgba(242, 159, 103, 0.05)',
                                                                                borderTop: '2px solid rgba(242, 159, 103, 0.2)'
                                                                            }}>
                                                                                <TableCell colSpan={4} sx={{ py: 2 }}>
                                                                                    <Typography variant="body2" sx={{ 
                                                                                        fontWeight: 700, 
                                                                                        color: '#1E1E2C', 
                                                                                        textAlign: 'right',
                                                                                        fontSize: '0.95rem'
                                                                                    }}>
                                                                                        Order Total:
                                                                                    </Typography>
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ py: 2 }}>
                                                                                    <Typography variant="h6" sx={{ 
                                                                                        color: '#F29F67', 
                                                                                        fontWeight: 700,
                                                                                        fontSize: '1.1rem'
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
                                                    <Receipt sx={{ fontSize: 60, color: '#E5E7EB' }} />
                                                    <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    No orders found
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
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

                    {/* Enhanced Pagination */}
                    {filteredOrders.length > 0 && (
                        <Box 
                                sx={{
                                mt: 3,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                padding: '16px 24px',
                                boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
                                border: '1px solid rgba(30, 30, 44, 0.06)',
                                        flexWrap: 'wrap',
                                gap: 2
                            }}
                        >
                            {/* Pagination Info */}
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, data?.data?.totalOrders || 0)} of {data?.data?.totalOrders || 0} orders
                                </Typography>
                                <Chip
                                    label={`${filteredOrders.length} filtered`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                        color: '#34B1AA',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                    }}
                                />
                            </Box>

                            {/* Pagination Controls */}
                            <Box display="flex" alignItems="center" gap={2}>
                                {/* Rows per page selector */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.875rem' }}>
                                        Rows per page:
                                    </Typography>
                                    <FormControl size="small" sx={{ minWidth: 80 }}>
                                        <Select
                                            value={rowsPerPage}
                                            onChange={handleChangeRowsPerPage}
                                            sx={{
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                backgroundColor: '#f8f9fa',
                                                '& .MuiOutlinedInput-root': {
                                                    border: '1px solid rgba(30, 30, 44, 0.08)',
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

                                {/* Page navigation */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.875rem' }}>
                                        Page {page + 1} of {Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage)}
                                    </Typography>
                                    
                                    <Box display="flex" gap={1}>
                                        <IconButton
                                            onClick={(e) => handleChangePage(e, 0)}
                                            disabled={page === 0}
                                            sx={{
                                                backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                borderRadius: '8px',
                                                color: page === 0 ? '#9CA3AF' : '#3B8FF3',
                                                '&:hover': {
                                                    backgroundColor: page === 0 ? 'rgba(59, 143, 243, 0.1)' : 'rgba(59, 143, 243, 0.2)',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                                },
                                            }}
                                        >
                                            <FirstPage fontSize="small" />
                                        </IconButton>
                                        
                                        <IconButton
                                            onClick={(e) => handleChangePage(e, page - 1)}
                                            disabled={page === 0}
                                            sx={{
                                                backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                borderRadius: '8px',
                                                color: page === 0 ? '#9CA3AF' : '#3B8FF3',
                                                '&:hover': {
                                                    backgroundColor: page === 0 ? 'rgba(59, 143, 243, 0.1)' : 'rgba(59, 143, 243, 0.2)',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                                },
                                            }}
                                        >
                                            <KeyboardArrowLeft fontSize="small" />
                                        </IconButton>
                                        
                                        <IconButton
                                            onClick={(e) => handleChangePage(e, page + 1)}
                                            disabled={page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1}
                                            sx={{
                                                backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                borderRadius: '8px',
                                                color: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? '#9CA3AF' : '#3B8FF3',
                                                '&:hover': {
                                                    backgroundColor: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? 'rgba(59, 143, 243, 0.1)' : 'rgba(59, 143, 243, 0.2)',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                                },
                                            }}
                                        >
                                            <KeyboardArrowRight fontSize="small" />
                                        </IconButton>
                                        
                                        <IconButton
                                            onClick={(e) => handleChangePage(e, Math.max(0, Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1))}
                                            disabled={page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1}
                                            sx={{
                                                backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                borderRadius: '8px',
                                                color: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? '#9CA3AF' : '#3B8FF3',
                                                '&:hover': {
                                                    backgroundColor: page >= Math.ceil((data?.data?.totalOrders || 0) / rowsPerPage) - 1 ? 'rgba(59, 143, 243, 0.1)' : 'rgba(59, 143, 243, 0.2)',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                                },
                                            }}
                                        >
                                            <LastPage fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </TableHeaderCard>

            {/* Export/Print Selection Dialog */}
            <Dialog open={openExportDialog} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Select Export/Print Option</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={exportMode}
                            onChange={(e) => setExportMode(e.target.value)}
                        >
                            <FormControlLabel
                                value="current"
                                control={<Radio />}
                                label={`Current View (${filteredOrders.length} orders)`}
                            />
                            <FormControlLabel
                                value="full"
                                control={<Radio />}
                                label={`Full Order List (${data?.data?.totalOrders || 0} orders)`}
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseExportDialog}>Cancel</Button>
                    <Button
                        onClick={handleExportConfirm}
                        color="primary"
                        variant="contained"
                        disabled={isFetchingFullList}
                        startIcon={isFetchingFullList ? <CircularProgress size={20} /> : null}
                    >
                        {isFetchingFullList ? 'Preparing...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Order Modal */}
            {selectedOrder && (
                <Dialog open={openViewModal} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Order Details - {selectedOrder.order_id}</Typography>
                            <IconButton onClick={handleCloseViewModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
                                <Divider />
                                <Box mt={1}>
                                    <Typography><strong>Name:</strong> {selectedOrder.user_name}</Typography>
                                    <Typography><strong>Contact:</strong> {selectedOrder.contact}</Typography>
                                    <Typography><strong>Email:</strong> {selectedOrder.email}</Typography>
                                    <Typography><strong>Address:</strong> {selectedOrder.address || 'N/A'}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Order Details</Typography>
                                <Divider />
                                <Box mt={1}>
                                    <Typography>
                                        <strong>Order Date:</strong> {new Date(selectedOrder.order_time).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ mt: 1 }}>
                                        <strong>Status:</strong>
                                        <Chip
                                            label={selectedOrder.status}
                                            color={getStatusColor(selectedOrder.status)}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Typography>
                                    <Typography><strong>Payment Mode:</strong> {selectedOrder.payment_mode}</Typography>
                                    <Typography><strong>Amount:</strong> ₹{selectedOrder.total_amount.toFixed(2)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>Products ({selectedOrder.orderItems?.length || 0})</Typography>
                                <Divider />
                                <Box mt={1}>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Product</TableCell>
                                                    <TableCell>Tag No</TableCell>
                                                    <TableCell>S.No</TableCell>
                                                    <TableCell align="right">Quantity</TableCell>
                                                    <TableCell align="right">Price</TableCell>
                                                    <TableCell align="right">Total</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedOrder.orderItems?.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.product_name}</TableCell>
                                                        <TableCell>{item.tagno}</TableCell>
                                                        <TableCell>{item.sno}</TableCell>
                                                        <TableCell align="right">{item.quantity}</TableCell>
                                                        <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                                                        <TableCell align="right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseViewModal} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Edit Order Modal */}
            {selectedOrder && (
                <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Edit Order - {selectedOrder.order_id}</Typography>
                            <IconButton onClick={handleCloseEditModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            {formError && (
                                <Grid item xs={12}>
                                    <Alert severity="error">{formError}</Alert>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditFormChange}
                                        label="Status"
                                        disabled={updateOrderStatus.isLoading}
                                    >
                                        <MenuItem value="PENDING">Pending</MenuItem>
                                        <MenuItem value="PROCESSING">Processing</MenuItem>
                                        <MenuItem value="SHIPPED">Shipped</MenuItem>
                                        <MenuItem value="DELIVERED">Delivered</MenuItem>
                                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size="medium"
                                    label="Remarks"
                                    name="remarks"
                                    value={editForm.remarks}
                                    onChange={handleEditFormChange}
                                    multiline
                                    rows={8}
                                    placeholder="Enter any remarks about this status change"
                                    disabled={updateOrderStatus.isLoading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Payment Mode</InputLabel>
                                    <Select
                                        name="paymentMode"
                                        value={editForm.paymentMode}
                                        onChange={handleEditFormChange}
                                        label="Payment Mode"
                                        disabled={updateOrderStatus.isLoading}
                                    >
                                        <MenuItem value="ONLINE">Online</MenuItem>
                                        <MenuItem value="CASH_ON_DELIVERY">Cash on Delivery</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditModal} disabled={updateOrderStatus.isLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            color="primary"
                            variant="contained"
                            disabled={updateOrderStatus.isLoading}
                            startIcon={updateOrderStatus.isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {updateOrderStatus.isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default OrderStatusManagement;