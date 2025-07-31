import React, { useState, useEffect, useRef } from 'react';
import { useOrdersByDateRange } from '../../hooks/order/useAllOrder';
import { format, subDays, parseISO } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import { CSVLink } from 'react-csv';
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Menu, MenuItem, Select, FormControl,
    Chip, Collapse, Tooltip, Card, CardContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    Download, MoreVert, PictureAsPdf, Print, ExpandMore,
    Receipt
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { styled } from '@mui/system';

// ========== ENHANCED STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    overflow: 'visible', // Changed from 'hidden' to 'visible' to allow expanded content
    background: '#ffffff',
    boxShadow: '0 8px 32px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    maxHeight: 'none', // Removed maxHeight constraint to allow full expansion
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
        '& .MuiTableCell-head': {
            color: '#FFFFFF !important',
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

const OrderHistoryPage = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [exportData, setExportData] = useState([]);
    const [exportType, setExportType] = useState('csv');
    const [anchorEl, setAnchorEl] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const csvLinkRef = useRef(null);

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
    const { data: orders = [], isLoading, isError, refetch } = useOrdersByDateRange(
        formattedStartDate,
        formattedEndDate
    );

    const handleQuickDateSelect = (days) => {
        const newStartDate = subDays(new Date(), days);
        setStartDate(newStartDate);
        setEndDate(new Date());
    };

    useEffect(() => {
        console.log('Start Date:', formattedStartDate);
        console.log('End Date:', formattedEndDate);
        console.log('Orders Data:', orders);
    }, [formattedStartDate, formattedEndDate, orders]);

    const toggleRowExpansion = (orderId) => {
        setExpandedRows(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const prepareExportData = () => {
        if (!Array.isArray(orders)) return [];
        return orders.map(order => ({
            'Order ID': order.orderId,
            'Customer': order.customerName,
            'Contact': order.contact,
            'Email': order.email,
            'Date': format(parseISO(order.orderTime), 'yyyy-MM-dd hh:mm a'),
            'Amount': `₹${order.totalAmount.toFixed(2)}`,
            'Status': order.status,
            'Product Count': order.orderItems.length,
            'Products': order.orderItems.map(item =>
                `${item.productName} (SKU: ${item.itemid}-${item.tagno}, Qty: ${item.quantity}, Price: ₹${item.price.toFixed(2)})`
            ).join(' | '),
        }));
    };

    const handleExportClick = () => {
        const data = prepareExportData();
        setExportData(data);

        if (exportType === 'csv') {
            setTimeout(() => {
                if (csvLinkRef.current) {
                    csvLinkRef.current.link.click();
                }
            }, 100);
        }
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handlePrint = () => {
        const printContent = `
            <html>
                <head>
                    <title>Order History Report</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1E1E2C; }
                        h1 { color: #1E1E2C; border-bottom: 3px solid #F29F67; padding-bottom: 10px; }
                        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background: #1E1E2C; color: white; font-weight: 600; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .status { padding: 4px 12px; border-radius: 12px; color: white; font-weight: bold; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <h1>Order History Report</h1>
                    <div class="summary">
                        <p><strong>Date Range:</strong> ${startDate ? format(startDate, 'dd/MM/yyyy') : 'All'} to ${endDate ? format(endDate, 'dd/MM/yyyy') : 'Present'}</p>
                        <p><strong>Total Orders:</strong> ${Array.isArray(orders) ? orders.length : 0}</p>
                        <p><strong>Total Amount:</strong> ₹${Array.isArray(orders) ? orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2) : '0.00'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.isArray(orders) ? orders.map(order => `
                                <tr>
                                    <td>${order.orderId}</td>
                                    <td>${order.customerName}</td>
                                    <td>${order.contact}</td>
                                    <td>${format(parseISO(order.orderTime), 'dd/MM/yyyy HH:mm')}</td>
                                    <td>₹${order.totalAmount.toFixed(2)}</td>
                                    <td><span class="status">${order.status}</span></td>
                                </tr>
                            `).join('') : ''}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        handleMenuClose();
    };

    const handleExportPDF = (singleOrder = null) => {
        const doc = new jsPDF();
        const dataToExport = singleOrder ? [singleOrder] : (Array.isArray(orders) ? orders : []);

        // Header
        doc.setFontSize(20);
        doc.setTextColor(30, 30, 44);
        doc.text(singleOrder ? 'Order Receipt' : 'Order History Report', 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

        if (singleOrder) {
            // Single order details
            doc.setFontSize(12);
            doc.setTextColor(30, 30, 44);

            const details = [
                `Customer: ${singleOrder.customerName}`,
                `Contact: ${singleOrder.contact}`,
                `Email: ${singleOrder.email}`,
                `Order ID: ${singleOrder.orderId}`,
                `Order Date: ${format(parseISO(singleOrder.orderTime), 'dd/MM/yyyy hh:mm a')}`,
                `Status: ${singleOrder.status.toUpperCase()}`
            ];

            details.forEach((detail, index) => {
                doc.text(detail, 14, 45 + (index * 7));
            });

            autoTable(doc, {
                startY: 90,
                head: [['Product', 'SKU', 'Qty', 'Unit Price', 'Total']],
                body: singleOrder.orderItems.map(item => [
                    item.productName,
                    `${item.itemid}-${item.tagno}`,
                    item.quantity.toString(),
                    `₹${item.price.toFixed(2)}`,
                    `₹${(item.price * item.quantity).toFixed(2)}`
                ]),
                foot: [[
                    '', '', '',
                    { content: 'Grand Total:', styles: { fontStyle: 'bold', fillColor: [242, 159, 103] } },
                    { content: `₹${singleOrder.totalAmount.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: [242, 159, 103] } }
                ]],
                theme: 'striped',
                headStyles: {
                    fillColor: [30, 30, 44],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: { fontSize: 9 }
            });
        } else {
            autoTable(doc, {
                startY: 40,
                head: [['Order ID', 'Customer', 'Date', 'Products', 'Amount', 'Status']],
                body: dataToExport.map(order => [
                    order.orderId,
                    order.customerName,
                    format(parseISO(order.orderTime), 'dd/MM/yyyy'),
                    `${order.orderItems.length} item(s)`,
                    `₹${order.totalAmount.toFixed(2)}`,
                    order.status.toUpperCase()
                ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [30, 30, 44],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: { fontSize: 9 }
            });
        }

        doc.save(`${singleOrder ? 'order_' : 'orders_'}${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
        handleMenuClose();
    };

    const totalOrders = Array.isArray(orders) ? orders.length : 0;

    if (isError) {
        return (
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
                    Failed to load orders. Please try again.
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
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
                p={isMobile ? 2 : 4}
                sx={{
                    backgroundColor: '#f8f9fa',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    overflow: 'visible'
                }}
            >

                {/* Order Details Table with Integrated Filters */}
                <TableHeaderCard>
                    <CardContent sx={{ p: 3 }}>
                        {/* Table Header with Filters */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 700 }}>
                                    Order Details
                                </Typography>
                                <Chip
                                    label={`${totalOrders} orders`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                        color: '#3B8FF3',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>

                            {/* Filters and Export Options */}
                            <Box display="flex" gap={2} alignItems="center">
                                {/* Date Range */}
                                <Box display="flex" gap={1} alignItems="center">
                                    <DatePicker
                                        label="From"
                                        value={startDate}
                                        onChange={(val) => setStartDate(val)}
                                        maxDate={endDate}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                sx={{
                                                    width: 140,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        backgroundColor: '#ffffff',
                                                        fontSize: '0.875rem',
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                    <Typography variant="body2" sx={{ color: '#6B7280' }}>to</Typography>
                                    <DatePicker
                                        label="To"
                                        value={endDate}
                                        onChange={(val) => setEndDate(val)}
                                        minDate={startDate}
                                        maxDate={new Date()}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                sx={{
                                                    width: 140,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        backgroundColor: '#ffffff',
                                                        fontSize: '0.875rem',
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Quick Filters */}
                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuickDateSelect(0)}
                                        sx={{
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                        }}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuickDateSelect(7)}
                                        sx={{
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                        }}
                                    >
                                        7 Days
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuickDateSelect(30)}
                                        sx={{
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                        }}
                                    >
                                        30 Days
                                    </Button>
                                </Box>

                                {/* Export Options */}
                                <Box display="flex" gap={1}>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <Select
                                            value={exportType}
                                            onChange={(e) => setExportType(e.target.value)}
                                            sx={{
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                backgroundColor: '#ffffff',
                                            }}
                                        >
                                            <MenuItem value="csv">CSV</MenuItem>
                                            <MenuItem value="json">JSON</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <IconButton
                                        onClick={handleMenuOpen}
                                        sx={{
                                            backgroundColor: 'rgba(30, 30, 44, 0.05)',
                                            borderRadius: '6px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(30, 30, 44, 0.1)',
                                            },
                                        }}
                                    >
                                        <MoreVert fontSize="small" />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        PaperProps={{
                                            sx: {
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 20px rgba(30, 30, 44, 0.15)',
                                                minWidth: '180px',
                                            }
                                        }}
                                    >
                                        <MenuItem onClick={handlePrint} sx={{ py: 1 }}>
                                            <Print sx={{ mr: 2, color: '#3B8FF3' }} fontSize="small" />
                                            Print Report
                                        </MenuItem>
                                        <MenuItem onClick={() => handleExportPDF()} sx={{ py: 1 }}>
                                            <PictureAsPdf sx={{ mr: 2, color: '#F29F67' }} fontSize="small" />
                                            Export PDF
                                        </MenuItem>
                                        <MenuItem onClick={handleExportClick} sx={{ py: 1 }}>
                                            <Download sx={{ mr: 2, color: '#34B1AA' }} fontSize="small" />
                                            Export {exportType.toUpperCase()}
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            </Box>
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
                        ) : (
                            <StyledTableContainer>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Order ID</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Customer</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Date & Time</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Products</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Amount</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Status</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.isArray(orders) && orders.length > 0 ? (
                                            orders.map((order) => (
                                                <React.Fragment key={order.orderId}>
                                                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(242, 159, 103, 0.02)' } }}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#3B8FF3' }}>
                                                                #{order.orderId}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                                                    {order.customerName}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                                    {order.email}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {format(parseISO(order.orderTime), 'dd/MM/yyyy')}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                                {format(parseISO(order.orderTime), 'hh:mm a')}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Chip
                                                                    label={`${order.orderItems.length} item${order.orderItems.length > 1 ? 's' : ''}`}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                                                        color: '#34B1AA',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => toggleRowExpansion(order.orderId)}
                                                                    sx={{
                                                                        color: '#3B8FF3',
                                                                        transition: 'transform 0.2s ease',
                                                                        transform: expandedRows[order.orderId] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    }}
                                                                >
                                                                    <ExpandMore fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#F29F67', fontSize: '1rem' }}>
                                                                ₹{order.totalAmount.toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <StatusChip
                                                                label={order.status.toUpperCase()}
                                                                status={order.status}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Download Receipt" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleExportPDF(order)}
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
                                                                    <PictureAsPdf fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Expanded Row for Product Details */}
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            sx={{
                                                                py: 0,
                                                                px: 0,
                                                                borderBottom: expandedRows[order.orderId] ? '1px solid rgba(30, 30, 44, 0.06)' : 0,
                                                                mb: expandedRows[order.orderId] ? 2 : 0
                                                            }}
                                                        >
                                                            <Collapse in={expandedRows[order.orderId]} timeout="auto" unmountOnExit>
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
                                                                            {order.orderItems.map((item, index) => {
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
                                                                                                {item.imagePath && (
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
                                                                                                            src={item.imagePath}
                                                                                                            alt={item.productName}
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
                                                                                                    {item.productName}
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
                                                                                                {item.itemid}-{item.tagno}
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
                                                                                        ₹{order.totalAmount.toFixed(2)}
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
                                                            Try adjusting your date range or filters
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

                {/* Hidden CSV Link */}
                {exportData.length > 0 && exportType === 'csv' && (
                    <CSVLink
                        ref={csvLinkRef}
                        data={exportData}
                        filename={`orders_${format(new Date(), 'yyyyMMdd')}.csv`}
                        onClick={() => setExportData([])}
                        style={{ display: 'none' }}
                    />
                )}

                {/* Hidden JSON Export */}
                {exportData.length > 0 && exportType === 'json' && (
                    <a
                        href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`}
                        download={`orders_${format(new Date(), 'yyyyMMdd')}.json`}
                        style={{ display: 'none' }}
                        ref={(node) => {
                            if (node) {
                                node.click();
                                setExportData([]);
                            }
                        }}
                    />
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default OrderHistoryPage;