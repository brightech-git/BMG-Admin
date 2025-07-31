import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useOrderQueries } from '../../hooks/order/useOrderQueries';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { useMediaQuery } from 'react-responsive';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
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
    TableFooter,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    Divider,
    Stack,
    Card,
    CardContent,
    Avatar,
    Badge,
    alpha,
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
    Visibility as ViewIcon,
    TrendingUp,
    Assessment,
    FileDownload,
} from '@mui/icons-material';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme with the provided color scheme
const customTheme = createTheme({
    palette: {
        primary: {
            main: '#F29F67', // Orange
            light: '#F5B584',
            dark: '#E8894A',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#1E1E2C', // Dark Navy
            light: '#2A2A3E',
            dark: '#151520',
            contrastText: '#FFFFFF',
        },
        info: {
            main: '#368FF3', // Blue
            light: '#5BA3F5',
            dark: '#2B7CE0',
        },
        success: {
            main: '#34B1AA', // Teal/Green
            light: '#5BC1BB',
            dark: '#2A9B95',
        },
        warning: {
            main: '#E0B50F', // Yellow
            light: '#E6C340',
            dark: '#C9A20D',
        },
        background: {
            default: '#F8F9FA',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E1E2C',
            secondary: '#6B7280',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '1.75rem',
            color: '#1E1E2C',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#1E1E2C',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#1E1E2C',
        },
        subtitle1: {
            fontWeight: 500,
            fontSize: '1rem',
            color: '#374151',
        },
        body2: {
            color: '#6B7280',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '8px 20px',
                },
                contained: {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: 10,
                    '&:hover': {
                        backgroundColor: alpha('#F29F67', 0.1),
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#1E1E2C',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: 'none',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(even)': {
                        backgroundColor: '#F8F9FA',
                    },
                    '&:hover': {
                        backgroundColor: alpha('#F29F67', 0.05),
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #E5E7EB',
                    padding: '16px',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: '#FFFFFF',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#F29F67',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#F29F67',
                        },
                    },
                },
            },
        },
    },
});

// Custom pagination actions component
function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
                {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
                {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
            </IconButton>
        </Box>
    );
}

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

// Helper function to get status icon
const getStatusIcon = (status) => {
    switch (status) {
        case 'PENDING': return '⏳';
        case 'PROCESSING': return '🔄';
        case 'SHIPPED': return '🚚';
        case 'DELIVERED': return '✅';
        case 'CANCELLED': return '❌';
        default: return '📦';
    }
};

const OrderPage = ({ orderType, title }) => {
    const {
        usePendingOrders,
        useShippedOrders,
        useDeliveredOrders,
        useCancelledOrders,
        useTotalRevenue,
        useTodayRevenue,
        useMonthlySalesReport
    } = useOrderQueries();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [exportType, setExportType] = useState('');
    const [exportMode, setExportMode] = useState('current');
    const tableRef = useRef();

    // Add mobile responsiveness
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    // Call all hooks unconditionally
    const pendingQuery = usePendingOrders(page, rowsPerPage);
    const shippedQuery = useShippedOrders(page, rowsPerPage);
    const deliveredQuery = useDeliveredOrders(page, rowsPerPage);
    const cancelledQuery = useCancelledOrders(page, rowsPerPage);
    const totalRevenueQuery = useTotalRevenue();
    const todayRevenueQuery = useTodayRevenue();
    const capitalizedOrderType = orderType ? orderType.charAt(0).toUpperCase() + orderType.slice(1) : '';
    const monthlySalesQuery = useMonthlySalesReport();

    // Select the appropriate query result based on orderType
    const queryResult = {
        pending: pendingQuery,
        shipped: shippedQuery,
        delivered: deliveredQuery,
        cancelled: cancelledQuery,
        totalRevenue: totalRevenueQuery,
        todayRevenue: todayRevenueQuery,
        monthlySales: monthlySalesQuery
    }[orderType];

    const { data, isLoading, error, refetch } = queryResult;

    // Normalize API data to match expected field names
    const normalizeOrder = (order) => ({
        order_id: order.orderId || order.id || 'N/A',
        user_name: order.customerName || order.user_name || 'N/A',
        contact: order.contact || 'N/A',
        email: order.email || 'N/A',
        total_amount: order.totalAmount || order.amount || 0,
        status: order.status || orderType.toUpperCase(),
        order_time: order.orderTime || order.date || 'N/A',
        orderItems: (order.orderItems || []).map(item => ({
            product_name: item.productName || item.product_name || 'N/A',
            quantity: item.quantity || 0,
            price: item.price || 0,
            sno: item.sno || 'N/A',
            tagno: item.tagno || 'N/A',
            item_id: item.itemid || 'N/A'
        }))
    });

    // Handle pagination
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

    const handleRefresh = () => {
        refetch();
    };

    // Filter orders based on search term
    const filteredOrders = orderType === 'monthlySales' ? data || []
        : (data?.[`${orderType}Orders`] || []).map(normalizeOrder).filter(order => {
            return (
                order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

    // Modal handlers
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOpenViewModal(true);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedOrder(null);
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

    const exportToPDF = (orders) => {
        const doc = new jsPDF({ orientation: "landscape" });
        const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").join("-");

        doc.setFontSize(14);
        doc.text(`${title} Report`, 14, 14);
        doc.setFontSize(10);
        doc.text(`Generated: ${timestamp} ${date}`, 14, 22);
        doc.text(`Total Records: ${orders.length}`, 14, 28);

        const headers = orderType === 'monthlySales'
            ? ['S.No', 'Month', 'Sales (₹)', 'Order Count']
            : ['S.No', 'Order ID', 'Customer', 'Phone', 'Amount', 'Status', 'Order Time', 'Items'];

        const tableData = orderType === 'monthlySales'
            ? orders.map((report, index) => [
                index + 1,
                report.month || `Month ${index + 1}`,
                parseFloat(report.sales)?.toFixed(2) || '0.00',
                report.orderCount || 0
            ])
            : orders.map((order, index) => [
                index + 1,
                order.order_id,
                order.user_name,
                order.contact,
                parseFloat(order.total_amount)?.toFixed(2) || '0.00',
                order.status,
                order.order_time ? new Date(order.order_time).toLocaleString() : 'N/A',
                order.orderItems.map(item => `${item.product_name} (SKU: ${item.item_id}-${item.tagno} )${parseFloat(item.price)?.toFixed(2)}`).join('; ')
            ]);

        autoTable(doc, {
            startY: 34,
            head: [headers],
            body: tableData,
            styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak", valign: "middle", halign: "left" },
            headStyles: { fillColor: [30, 30, 44], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
            columnStyles: orderType === 'monthlySales'
                ? { 0: { cellWidth: 20 }, 1: { cellWidth: 60 }, 2: { cellWidth: 60, halign: "right" }, 3: { cellWidth: 60 } }
                : {
                    0: { cellWidth: 15 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 25 }, 4: { cellWidth: 30, halign: "right" }, 5: { cellWidth: 30 }, 6: { cellWidth: 25 }, 7: { cellWidth: 60 },
                    margin: { top: 34, left: 10, right: 10 }
                }
        });

        doc.save(`${orderType}_${date}.pdf`);
    };

    const exportToExcel = (orders) => {
        const header = orderType === 'monthlySales'
            ? ['S.No', 'Month', 'Sales (₹)', 'Order Count']
            : ['S.No', 'Order ID', 'Customer Name', 'Phone', 'Email', 'Amount (₹)', 'Status', 'Order Time', 'Items'];

        const tableData = orderType === 'monthlySales'
            ? orders.map((report, index) => [
                index + 1,
                report.month || `Month ${index + 1}`,
                parseFloat(report.sales)?.toFixed(2) || '0.00',
                report.orderCount || 0
            ])
            : orders.map((order, index) => [
                index + 1,
                order.order_id,
                order.user_name,
                order.contact,
                order.email,
                parseFloat(order.total_amount)?.toFixed(2) || '0.00',
                order.status,
                order.order_time ? new Date(order.order_time).toLocaleString() : 'N/A',
                order.orderItems
                    .map(item => `${item.product_name} (Qty: ${item.quantity}, ₹${parseFloat(item.price)?.toFixed(2)}, TAG: ${item.tagno}, ID: ${item.item_id})`)
                    .join('; ')
            ]);

        const worksheetData = [header, ...tableData];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Header styling with custom colors
        header.forEach((_, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
            worksheet[cellAddress] = {
                v: header[colIndex],
                s: {
                    fill: { fgColor: { rgb: '1E1E2C' } },
                    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                }
            };
        });

        // Body styling
        tableData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
                worksheet[cellAddress] = {
                    v: cell,
                    s: {
                        font: { sz: 9 },
                        alignment: {
                            horizontal: orderType !== 'monthlySales' && colIndex === 5 ? 'right' : 'left',
                            vertical: 'top',
                            wrapText: colIndex === 8
                        },
                        border: {
                            top: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                };
            });
        });

        // Adjust column widths
        worksheet['!cols'] = orderType === 'monthlySales'
            ? [
                { wch: 8 },   // S.No
                { wch: 25 },  // Month
                { wch: 15 },  // Sales
                { wch: 15 }   // Order Count
            ]
            : [
                { wch: 6 },    // S.No
                { wch: 20 },   // Order ID
                { wch: 22 },   // Customer Name
                { wch: 15 },   // Phone
                { wch: 25 },   // Email
                { wch: 12 },   // Amount
                { wch: 12 },   // Status
                { wch: 22 },   // Order Time
                { wch: 40 }    // Items
            ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, capitalizedOrderType);

        const timestamp = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").join("-");
        XLSX.writeFile(workbook, `${orderType}_${timestamp}.xlsx`);
    };

    const handlePrint = (orders) => {
        const printWindow = window.open('', '_blank');
        const time = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").join("-");

        printWindow.document.write(`
            <html>
            <head>
                <title>${title} Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #1E1E2C; }
                    .print-header { margin-bottom: 20px; border-bottom: 2px solid #1E1E2C; padding-bottom: 10px; }
                    .print-title { font-size: 24px; font-weight: bold; color: #1E1E2C; }
                    .print-meta { font-size: 12px; color: #6B7280; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
                    th { background-color: #1E1E2C; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #F8F9FA; }
                    .amount { text-align: right; font-weight: bold; color: #F29F67; }
                    .order-id { width: 12%; }
                    .customer { width: 15%; }
                    .phone { width: 12%; }
                    .amount { width: 10%; }
                    .status { width: 10%; }
                    .time { width: 15%; }
                    .items { width: 26%; }
                    .month { width: 30%; }
                    .sales { width: 25%; }
                    .count { width: 20%; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <div class="print-title">${title} Report</div>
                    <div class="print-meta">Generated: ${time} ${date}</div>
                    <div class="print-meta">Total Records: ${orders.length}</div>
                </div>
                <table>
                    <colgroup>
                        ${orderType === 'monthlySales'
                ? '<col class="month" /><col class="sales" /><col class="count" />'
                : '<col class="order-id" /><col class="customer" /><col class="phone" /><col class="amount" /><col class="status" /><col class="time" /><col class="items" />'}
                    </colgroup>
                    <thead>
                        <tr>
                            ${orderType === 'monthlySales'
                ? '<th>Month</th><th>Sales (₹)</th><th>Order Count</th>'
                : '<th>Order ID</th><th>Customer</th><th>Phone</th><th>Amount (₹)</th><th>Status</th><th>Order Time</th><th>Items</th>'}
                        </tr>
                    </thead>
                    <tbody>
                        ${orderType === 'monthlySales'
                ? orders.map((report, index) => `
                                <tr>
                                    <td>${report.month || `Month ${index + 1}`}</td>
                                    <td class="amount">₹${parseFloat(report.sales)?.toFixed(2) || '0.00'}</td>
                                    <td>${report.orderCount || 0}</td>
                                </tr>
                            `).join('')
                : orders.map(order => `
                                <tr>
                                    <td>${order.order_id}</td>
                                    <td>${order.user_name}</td>
                                    <td>${order.contact}</td>
                                    <td class="amount">₹${parseFloat(order.total_amount)?.toFixed(2) || '0.00'}</td>
                                    <td>${order.status}</td>
                                    <td>${order.order_time ? new Date(order.order_time).toLocaleString() : 'N/A'}</td>
                                    <td>${order.orderItems.map(item => `${item.product_name} (SKU: ${item.item_id}-${item.tagno}, ₹${parseFloat(item.price)?.toFixed(2)})`).join('; ')}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    // Loading and error states
    if (isLoading) {
        return (
            <ThemeProvider theme={customTheme}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                    backgroundColor: 'background.default'
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Loading {title.toLowerCase()}...
                        </Typography>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    }

    if (error) {
        return (
            <ThemeProvider theme={customTheme}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                    backgroundColor: 'background.default'
                }}>
                    <Card sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
                        <Typography variant="h6" color="error" gutterBottom>
                            Error Loading Data
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            {error.message}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon />}
                        >
                            Try Again
                        </Button>
                    </Card>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{
                width: '100%',
                p: 3,
                backgroundColor: 'background.default',
                minHeight: '100vh'
            }}>
                {/* Header Section */}
                <Card sx={{ mb: 3, overflow: 'visible' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{
                                    bgcolor: 'primary.main',
                                    width: 48,
                                    height: 48,
                                    fontSize: '1.5rem'
                                }}>
                                    {orderType === 'monthlySales' ? <Assessment /> : <TrendingUp />}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                                        {title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {filteredOrders.length} {orderType === 'monthlySales' ? 'records' : 'orders'} found
                                    </Typography>
                                </Box>
                            </Box>

                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Refresh Data">
                                    <IconButton
                                        onClick={handleRefresh}
                                        sx={{
                                            bgcolor: alpha(customTheme.palette.info.main, 0.1),
                                            color: 'info.main',
                                            '&:hover': { bgcolor: alpha(customTheme.palette.info.main, 0.2) }
                                        }}
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Export to PDF">
                                    <IconButton
                                        onClick={() => handleOpenExportDialog('pdf')}
                                        sx={{
                                            bgcolor: alpha(customTheme.palette.error.main, 0.1),
                                            color: 'error.main',
                                            '&:hover': { bgcolor: alpha(customTheme.palette.error.main, 0.2) }
                                        }}
                                    >
                                        <PdfIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Export to Excel">
                                    <IconButton
                                        onClick={() => handleOpenExportDialog('excel')}
                                        sx={{
                                            bgcolor: alpha(customTheme.palette.success.main, 0.1),
                                            color: 'success.main',
                                            '&:hover': { bgcolor: alpha(customTheme.palette.success.main, 0.2) }
                                        }}
                                    >
                                        <ExcelIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Print Report">
                                    <IconButton
                                        onClick={() => handleOpenExportDialog('print')}
                                        sx={{
                                            bgcolor: alpha(customTheme.palette.secondary.main, 0.1),
                                            color: 'secondary.main',
                                            '&:hover': { bgcolor: alpha(customTheme.palette.secondary.main, 0.2) }
                                        }}
                                    >
                                        <PrintIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>

                        {/* Search Bar */}
                        <TextField
                            variant="outlined"
                            size="medium"
                            placeholder={`Search ${orderType === 'monthlySales' ? 'reports' : 'orders'}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: { xs: '100%', sm: 400 },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'background.paper',
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card>
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                        <Table stickyHeader size="small" aria-label={`${orderType} table`} ref={tableRef}>
                            <TableHead>
                                <TableRow>
                                    {orderType === 'monthlySales'
                                        ? <>
                                            <TableCell sx={{color: '#000'}}>Month</TableCell>
                                            <TableCell align="right" sx={{color: '#000'}}>Sales (₹)</TableCell>
                                            <TableCell sx={{color: '#000'}}>Order Count</TableCell>
                                        </>
                                        : orderType === 'totalRevenue' || orderType === 'todayRevenue'
                                            ? <>
                                                <TableCell sx={{color: '#000'}}>Metric</TableCell>
                                                <TableCell align="right" sx={{color: '#000'}}>Amount (₹)</TableCell>
                                            </>
                                            : <>
                                                <TableCell sx={{color: '#000'}}>Order ID</TableCell>
                                                {!isMobile && <TableCell sx={{color: '#000'}}>Date</TableCell>}
                                                <TableCell sx={{color: '#000'}}>Customer</TableCell>
                                                {!isMobile && <TableCell sx={{color: '#000'}}>Contact</TableCell>}
                                                <TableCell sx={{color: '#000'}}>Products</TableCell>
                                                <TableCell align="right" sx={{color: '#000'}}>Amount</TableCell>
                                                <TableCell sx={{color: '#000'}}>Status</TableCell>
                                                <TableCell align="center" sx={{color: '#000'}}>Actions</TableCell>
                                            </>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    orderType === 'monthlySales'
                                        ? filteredOrders.map((report, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontWeight: 500 }}>
                                                    {report.month || `Month ${index + 1}`}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                    ₹{parseFloat(report.sales)?.toFixed(2) || '0.00'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge badgeContent={report.orderCount || 0} color="primary" max={999}>
                                                        <Box sx={{ width: 20 }} />
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        : orderType === 'totalRevenue' || orderType === 'todayRevenue'
                                            ? <TableRow hover>
                                                <TableCell sx={{ fontWeight: 500 }}>{title}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.1rem' }}>
                                                    ₹{parseFloat(data?.[`${orderType.replace('use', '').toLowerCase()}`])?.toFixed(2) || '0.00'}
                                                </TableCell>
                                            </TableRow>
                                            : filteredOrders.map(order => (
                                                <TableRow key={order.order_id} hover>
                                                    <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
                                                        #{order.order_id}
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell sx={{ color: 'text.secondary' }}>
                                                            {order.order_time ? new Date(order.order_time).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell sx={{ fontWeight: 500 }}>
                                                        {order.user_name}
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell sx={{ color: 'text.secondary' }}>
                                                            {order.contact}
                                                        </TableCell>
                                                    )}
                                                    <TableCell sx={{ maxWidth: '200px' }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 0.5,
                                                            maxHeight: '60px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {order.orderItems?.slice(0, 2).map((item, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={item.product_name}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.7rem' }}
                                                                />
                                                            ))}
                                                            {order.orderItems?.length > 2 && (
                                                                <Chip
                                                                    label={`+${order.orderItems.length - 2} more`}
                                                                    size="small"
                                                                    color="primary"
                                                                    sx={{ fontSize: '0.7rem' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                        ₹{parseFloat(order.total_amount)?.toFixed(2) || '0.00'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.status}
                                                            color={getStatusColor(order.status)}
                                                            size="small"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="View Order Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewOrder(order)}
                                                                sx={{
                                                                    bgcolor: alpha(customTheme.palette.primary.main, 0.1),
                                                                    color: 'primary.main',
                                                                    '&:hover': {
                                                                        bgcolor: alpha(customTheme.palette.primary.main, 0.2),
                                                                        transform: 'scale(1.1)'
                                                                    },
                                                                    transition: 'all 0.2s ease-in-out'
                                                                }}
                                                            >
                                                                <ViewIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                orderType === 'monthlySales' ? 3 :
                                                    orderType === 'totalRevenue' || orderType === 'todayRevenue' ? 2 :
                                                        isMobile ? 6 : 8
                                            }
                                            align="center"
                                            sx={{ py: 8 }}
                                        >
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    📭 No Data Found
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchTerm ? 'Try adjusting your search terms' : `No ${orderType === 'monthlySales' ? 'sales data' : 'orders'} available`}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {!(orderType === 'totalRevenue' || orderType === 'todayRevenue') && (
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, 50]}
                                            colSpan={
                                                orderType === 'monthlySales' ? 3 :
                                                    orderType === 'totalRevenue' || orderType === 'todayRevenue' ? 2 :
                                                        isMobile ? 6 : 8
                                            }
                                            count={data?.[`total${orderType.charAt(0).toUpperCase() + orderType.slice(1)}`] || data?.total || filteredOrders.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            SelectProps={{ inputProps: { 'aria-label': 'rows per page' }, native: true }}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            ActionsComponent={TablePaginationActions}
                                            sx={{
                                                '& .MuiTablePagination-toolbar': {
                                                    backgroundColor: alpha(customTheme.palette.secondary.main, 0.02),
                                                },
                                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                                    color: 'text.secondary',
                                                    fontWeight: 500,
                                                }
                                            }}
                                        />
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </TableContainer>
                </Card>

                {/* Export/Print Selection Dialog */}
                <Dialog
                    open={openExportDialog}
                    onClose={handleCloseExportDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3 }
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: 'secondary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <FileDownload />
                        Select Export/Print Option
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={exportMode}
                                onChange={(e) => setExportMode(e.target.value)}
                            >
                                <FormControlLabel
                                    value="current"
                                    control={<Radio sx={{ color: 'primary.main' }} />}
                                    label={
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Current View
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {filteredOrders.length} {orderType === 'monthlySales' ? 'records' : 'orders'}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            onClick={handleCloseExportDialog}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                switch (exportType) {
                                    case 'pdf': exportToPDF(filteredOrders); break;
                                    case 'excel': exportToExcel(filteredOrders); break;
                                    case 'print': handlePrint(filteredOrders); break;
                                    default: break;
                                }
                                handleCloseExportDialog();
                            }}
                            variant="contained"
                            sx={{ borderRadius: 2, minWidth: 120 }}
                        >
                            {exportType === 'pdf' ? 'Export PDF' :
                                exportType === 'excel' ? 'Export Excel' : 'Print'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* View Order Modal */}
                <OrderViewModal
                    open={openViewModal}
                    onClose={handleCloseViewModal}
                    order={selectedOrder}
                    orderType={orderType}
                />
            </Box>
        </ThemeProvider>
    );
};

// View Order Modal Component
const OrderViewModal = ({ open, onClose, order, orderType }) => {
    if (!order) return null;

    return (
        <ThemeProvider theme={customTheme}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, maxHeight: '90vh' }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    p: 3
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                📦
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Order Details
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    #{order.order_id || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: 'white',
                                '&:hover': { bgcolor: alpha('#FFFFFF', 0.1) }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 3, height: '100%', bgcolor: alpha(customTheme.palette.info.main, 0.05) }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        👤 Customer Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Name</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {order.user_name || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Contact</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {order.contact || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Email</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {order.email || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 3, height: '100%', bgcolor: alpha(customTheme.palette.success.main, 0.05) }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: '#000' // sets text color to black
                                        }}
                                    >
                                        📋 Order Details
                                    </Typography>

                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Order Date</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {order.order_time ? new Date(order.order_time).toLocaleString() : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Status</Typography>
                                            <Chip
                                                label={`${getStatusIcon(order.status)} ${order.status || orderType.toUpperCase()}`}
                                                color={getStatusColor(order.status || orderType.toUpperCase())}
                                                size="medium"
                                                sx={{ mt: 0.5, fontWeight: 500 }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                ₹{parseFloat(order.total_amount)?.toFixed(2) || '0.00'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        🛍️ Order Items
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <TableContainer>
                                        <Table size="small" className="modal-table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Price (₹)</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>SNO</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>SK-Unit</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {order.orderItems?.length > 0 ? (
                                                    order.orderItems.map((item, index) => (
                                                        <TableRow key={index} hover>
                                                            <TableCell sx={{ fontWeight: 500 }}>
                                                                {item.product_name || 'N/A'}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                                ₹{parseFloat(item.price)?.toFixed(2) || '0.00'}
                                                            </TableCell>
                                                            <TableCell>{item.sno || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={`${item.item_id} - ${item.tagno}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                            <Typography color="text.secondary">
                                                                📭 No items found
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: alpha(customTheme.palette.secondary.main, 0.05) }}>
                    <Button
                        onClick={onClose}
                        variant="contained"
                        sx={{ borderRadius: 2, minWidth: 100 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

// Individual page components for each order type
export const PendingOrdersPage = () => <OrderPage orderType="pending" title="Pending Orders" />;
export const ShippedOrdersPage = () => <OrderPage orderType="shipped" title="Shipped Orders" />;
export const DeliveredOrdersPage = () => <OrderPage orderType="delivered" title="Delivered Orders" />;
export const CancelledOrdersPage = () => <OrderPage orderType="cancelled" title="Cancelled Orders" />;
export const TotalRevenuePage = () => <OrderPage orderType="totalRevenue" title="Total Revenue" />;
export const TodayRevenuePage = () => <OrderPage orderType="todayRevenue" title="Today's Revenue" />;
export const MonthlySalesPage = () => <OrderPage orderType="monthlySales" title="Monthly Sales Report" />;

// PropTypes validation
TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

OrderPage.propTypes = {
    orderType: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
};

OrderViewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    order: PropTypes.object,
    orderType: PropTypes.string.isRequired,
};