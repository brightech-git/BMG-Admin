import React, { useState, useContext, useMemo } from 'react';
import { useOrdersByStatus } from '../../hooks/order/useAllOrder';
import { orderService } from '../../service/orderService';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';
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
    Box,
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
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
    Close as CloseIcon,
    Visibility as ViewIcon,
    ExpandMore,
    Receipt
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useLocation } from 'react-router-dom';
import { MyContext } from '../../context/themeContext/themeContext';
import './OrderManagement.css';

// ========== ENHANCED STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)({
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
});

const ModernButton = styled(Button)({
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
});

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

const TableHeaderCard = styled(Card)({
    borderRadius: 'var(--border-radius-lg)',
    background: 'var(--card-background-color)',
    border: `1px solid var(--border-color)`,
    marginBottom: 'var(--spacing-lg)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-1px)',
    },
});

const PendingOrders = () => {
    const { themeMode } = useContext(MyContext);
    const location = useLocation();
    const { key } = location.state || {};
    const status = key;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [exportType, setExportType] = useState('');
    const [exportMode, setExportMode] = useState('current');
    const [isFetchingFullList, setIsFetchingFullList] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

    // API hooks
    const { data, isLoading, isError, error, refetch } = useOrdersByStatus(status, page, rowsPerPage);

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

    // Get normalized orders from API data
    const orders = useMemo(() => {
        return (data?.orders || []).map(normalizeOrder);
    }, [data]);

    // Filter orders based on search term
    const filteredOrders = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return orders.filter(order => (
            order.order_id.toLowerCase().includes(lowerSearch) ||
            order.user_name.toLowerCase().includes(lowerSearch) ||
            order.email.toLowerCase().includes(lowerSearch) ||
            order.contact.toLowerCase().includes(lowerSearch)
        ));
    }, [orders, searchTerm]);

    // Toggle row expansion
    const toggleRowExpansion = (orderId) => {
        setExpandedRows(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Fetch full order list
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

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedOrder(null);
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
                fillColor: themeMode === 'dark' ? [51, 51, 51] : [37, 99, 235],
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
                8: { cellWidth: 75 },
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
            order.address ? `${order.address.addressLine}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : 'N/A',
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
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            ws[cellAddress].s = {
                fill: { fgColor: { rgb: themeMode === 'dark' ? '333333' : '2563EB' } },
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
            { wch: 8 },
            { wch: 22 },
            { wch: 28 },
            { wch: 22 },
            { wch: 35 },
            { wch: 60 },
            { wch: 18 },
            { wch: 18 },
            { wch: 28 },
            { wch: 22 },
            { wch: 15 }
        ];

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
                        font-family: var(--font-primary);
                        margin: 10px;
                        font-size: var(--font-size-sm);
                        color: var(--primary-text-color);
                    }
                    .print-header {
                        margin-bottom: var(--spacing-lg);
                    }
                    .print-title {
                        font-size: var(--font-size-xl);
                        font-weight: bold;
                        margin-bottom: var(--spacing-sm);
                    }
                    .print-meta {
                        font-size: var(--font-size-sm);
                        color: var(--secondary-text-color);
                        margin: var(--spacing-xs) 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        word-break: break-word;
                    }
                    th, td {
                        border: 1px solid var(--border-color);
                        padding: var(--spacing-sm) var(--spacing-md);
                        vertical-align: top;
                    }
                    th {
                        background-color: var(--primary-color);
                        color: var(--text-dark);
                        font-weight: bold;
                        text-align: center;
                        font-size: var(--font-size-sm);
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
                        margin-top: var(--spacing-md);
                        margin-bottom: var(--spacing-lg);
                    }
                    .product-header {
                        font-weight: bold;
                        margin-top: var(--spacing-md);
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
                                <td class="address">${order.address ? `${order.address.addressLine}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : 'N/A'}</td>
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
                mt: '20px',
                fontFamily: 'var(--font-secondary)',
            }}
        >
            <TableHeaderCard sx={{ fontFamily: 'var(--font-secondary)'}}>
                <CardContent sx={{ p: 3 }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Manage Pending Orders
                            </li>
                        </ol>
                    </nav>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                       
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--primary-text-color)' }}>
                                Order Management
                            </Typography>
                            <Chip
                                label={`${filteredOrders.length} orders`}
                                size="small"
                                sx={{
                                    backgroundColor: 'var(--active-bg)',
                                    color: 'var(--primary-color)',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                        <Box display="flex" gap={2} alignItems="center">
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={() => refetch()}
                                    sx={{
                                        backgroundColor: 'var(--active-bg)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            backgroundColor: 'var(--active-border)',
                                        },
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export to PDF">
                                <IconButton
                                    onClick={() => handleOpenExportDialog('pdf')}
                                    sx={{
                                        backgroundColor: 'var(--active-bg)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            backgroundColor: 'var(--active-border)',
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
                                        backgroundColor: 'var(--active-bg)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            backgroundColor: 'var(--active-border)',
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
                                        backgroundColor: 'var(--active-bg)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            backgroundColor: 'var(--active-border)',
                                        },
                                        fontFamily:'var(--font-secondary)'
                                    }}
                                    

                                >
                                    <PrintIcon />
                                </IconButton>
                            </Tooltip>
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
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 'var(--border-radius-md)',
                                        backgroundColor: 'var(--card-background-color)',
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--primary-text-color)',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'var(--border-color)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'var(--active-border)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'var(--active-border)',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'var(--secondary-text-color)',
                                        opacity: 0.8,
                                    },
                                    fontFamily: 'var(--font-secondary)'
                                }}
                            />
                        </Box>
                    </Box>

                    <StyledTableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)' }}>Order ID</TableCell>
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
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-color)' ,fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)'}}>
                                                        #{order.order_id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary) '}}>
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
                                                <TableCell align="center" sx={{fontSize: 'var(--font-size-xs)'}}>
                                                    <StatusChip
                                                        label={order.status.toUpperCase()}
                                                        status={order.status}
                                                        size="small"
                                                        sx={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-secondary)' }}
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
                                                                    }, fontSize: 'var(--font-size-xs)',
                                                                     fontFamily: 'var(--font-secondary)'
                                                                }}
                                                            >
                                                                <ViewIcon fontSize="small" />
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
                                                                                width: '30%',
                                                                                fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                Product
                                                                            </TableCell>
                                                                            <TableCell sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '20%',
                                                                                fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                SKU
                                                                            </TableCell>
                                                                            <TableCell align="center" sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '15%',
                                                                                fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                Quantity
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '15%',
                                                                                fontFamily: 'var(--font-primary)'
                                                                            }}>
                                                                                Unit Price
                                                                            </TableCell>
                                                                            <TableCell align="right" sx={{
                                                                                fontWeight: 700,
                                                                                color: 'var(--primary-color)',
                                                                                fontSize: 'var(--font-size-sm)',
                                                                                width: '20%',
                                                                                fontFamily: 'var(--font-primary)'
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
                                                    Try adjusting your search
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
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'var(--secondary-text-color)',
                                        fontWeight: 500,
                                        fontSize: 'var(--font-size-sm)',
                                        fontFamily: 'var(--font-secondary)'
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
                                            backgroundColor: 'var(--card-background-color)',
                                            color: 'var(--primary-text-color)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--border-color)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--active-border)',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--active-border)',
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

            <Dialog
                open={openExportDialog}
                onClose={handleCloseExportDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--card-background-color)',
                        color: 'var(--primary-text-color)',
                    }
                }}
            >
                <DialogTitle>Select Export/Print Option</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={exportMode}
                            onChange={(e) => setExportMode(e.target.value)}
                        >
                            <FormControlLabel
                                value="current"
                                control={<Radio sx={{ color: 'var(--primary-color)' }} />}
                                label={`Current View (${filteredOrders.length} orders)`}
                                sx={{ color: 'var(--primary-text-color)' }}
                            />
                            <FormControlLabel
                                value="full"
                                control={<Radio sx={{ color: 'var(--primary-color)' }} />}
                                label={`Full Order List (${data?.data?.totalOrders || 0} orders)`}
                                sx={{ color: 'var(--primary-text-color)' }}
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <ModernButton onClick={handleCloseExportDialog}>Cancel</ModernButton>
                    <ModernButton
                        onClick={handleExportConfirm}
                        disabled={isFetchingFullList}
                        startIcon={isFetchingFullList ? <CircularProgress size={20} sx={{ color: 'var(--text-dark)' }} /> : null}
                    >
                        {isFetchingFullList ? 'Preparing...' : 'Confirm'}
                    </ModernButton>
                </DialogActions>
            </Dialog>

            {selectedOrder && (
                <Dialog
                    open={openViewModal}
                    onClose={handleCloseViewModal}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: 'var(--card-background-color)',
                            color: 'var(--primary-text-color)',
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ color: 'var(--primary-text-color)' }}>
                            <Typography variant='h6'>Order Details - {selectedOrder.order_id}</Typography>
                            <IconButton onClick={handleCloseViewModal}>
                                <CloseIcon sx={{ color: 'var(--primary-text-color)' }} />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers sx={{ backgroundColor: 'var(--background-color)' }}>
                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'var(--primary-text-color)', textAlign: 'center', mb: 1, fontFamily: 'var(--font-primary)' }}>
                                User Details
                            </Typography>
                            <TableContainer component={Paper} sx={{ backgroundColor: 'var(--card-background-color)', border: `1px solid var(--border-color)` }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', width: '25%', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Order Number</TableCell>
                                            <TableCell sx={{ width: '25%' ,fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{selectedOrder.order_id}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: '25%' , fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Name</TableCell>
                                            <TableCell sx={{ width: '25%' ,fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{selectedOrder.user_name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Email</TableCell>
                                            <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{selectedOrder.email}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Mobile Number</TableCell>
                                            <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{selectedOrder.contact}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' ,  fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Address</TableCell>
                                            <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>
                                                {selectedOrder?.address ? (
                                                    <>
                                                        <div>{selectedOrder.address.name}</div>
                                                        <div>{selectedOrder.address.addressLine}</div>
                                                        {selectedOrder.address.landmark && <div>Landmark: {selectedOrder.address.landmark}</div>}
                                                        {selectedOrder.address.locality && <div>{selectedOrder.address.locality}</div>}
                                                        <div>
                                                            {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                                                        </div>
                                                        <div>Phone: {selectedOrder.address.phone}</div>
                                                        {selectedOrder.address.alternatePhone && <div>Alt: {selectedOrder.address.alternatePhone}</div>}
                                                        {selectedOrder.address.companyName && <div>Company: {selectedOrder.address.companyName}</div>}
                                                    </>
                                                ) : (
                                                    <div>No address available</div>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Order Date</TableCell>
                                            <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{new Date(selectedOrder.order_time).toLocaleString()}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'var(--primary-text-color)', textAlign: 'center', mb: 2 }}>
                                Order Details
                            </Typography>
                            <TableContainer component={Paper} sx={{ backgroundColor: 'var(--card-background-color)', border: `1px solid var(--border-color)` }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'var(--active-bg)' }}>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>S.No</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Product ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Product Image</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Product Name</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Quantity</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Price</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedOrder.orderItems?.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{index + 1}</TableCell>
                                                <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{item.tagno || item.sno || '-'}</TableCell>
                                                <TableCell>
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
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }}>{item.product_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }} align="center">{item.quantity}</TableCell>
                                                <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }} align="right">₹{item.price.toFixed(2)}</TableCell>
                                                <TableCell sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--primary-text-color)' }} align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{ backgroundColor: 'var(--active-bg)' }}>
                                            <TableCell colSpan={6} sx={{ fontWeight: 'bold', textAlign: 'right', color: 'var(--primary-text-color)' }}>
                                                Grand Total
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--primary-text-color)' }}>
                                                ₹{selectedOrder.total_amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <ModernButton onClick={handleCloseViewModal} variant="contained">
                            Close
                        </ModernButton>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default PendingOrders;