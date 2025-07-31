import React, { useState, useEffect, useRef } from 'react';
import useEstimationQuery from '../../../hooks/products/useEstimationQuery';
import { useMediaQuery } from 'react-responsive';
import { CSVLink } from 'react-csv';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Card, CardContent
} from '@mui/material';
import { Download, PictureAsPdf, Print, Visibility } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { styled } from '@mui/system';

const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    overflow: 'auto',
    background: '#ffffff',
    boxShadow: '0 8px 32px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    maxHeight: '60vh',
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

const ModernCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #3B8FF3 0%, #F29F67 50%, #34B1AA 100%)',
    },
}));

const EstimationProductsPage = () => {
    const { data, isLoading, isError, refetch } = useEstimationQuery();
    const [exportData, setExportData] = useState([]);
    const [previewModal, setPreviewModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [visibleItems, setVisibleItems] = useState(50);
    const [loadedData, setLoadedData] = useState([]);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [currentExportType, setCurrentExportType] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const tableContainerRef = useRef(null);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

    useEffect(() => {
        if (data) {
            const processedData = Array.isArray(data) ? data : [data];
            setLoadedData(processedData);
        }
    }, [data]);

    // Lazy loading with scroll detection for table container
    useEffect(() => {
        const handleTableScroll = () => {
            if (!tableContainerRef.current) return;
            
            const container = tableContainerRef.current;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            // Load more when user is near bottom (within 100px)
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                if (visibleItems < loadedData.length && !isLoadingMore) {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setVisibleItems(prev => Math.min(prev + 20, loadedData.length));
                        setIsLoadingMore(false);
                    }, 300); // Faster response for better UX
                }
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleTableScroll);
            return () => tableContainer.removeEventListener('scroll', handleTableScroll);
        }
    }, [visibleItems, loadedData.length, isLoadingMore]);

    const handlePreviewClick = (item) => {
        setSelectedItem(item);
        setPreviewModal(true);
    };

    const formatCurrency = (value, decimals = 2) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(numValue).replace('INR', '₹').replace(/\s/g, '');
    };

    const prepareExportData = () => {
        if (!Array.isArray(loadedData)) return [loadedData].filter(Boolean);
        return loadedData.map(item => ({
            'Name': `${item.ITEMNAME}`,
            'SubItemName': `${item.SUBITEMNAME}`,
            'SKU': `${item.ITEMID}-${item.TAGNO}`,
            'Description': item.Description || 'N/A',
            'PCS': item.PCS,
            'Rate': formatCurrency(item.Rate),
            'Gross Amount': formatCurrency(item.GrossAmount),
            'GST (%)': item.GSTPer,
            'GST Amount': formatCurrency(item.GSTAmount),
            'Grand Total': formatCurrency(item.GrandTotal),
            'Purity': `${item.PURITY}`,
            'Net Weight': `${item.NETWT}g`,
            'Gross Weight': `${item.GRSWT}g`,
            'Wastage': `${item.Wastage}`,
            'Making Charges': formatCurrency(item.MC),
            'Stone Amount': formatCurrency(item.StoneAmount),
            'Misc Amount': formatCurrency(item.MiscAmount)
        }));
    };

    const handleExportClick = (type) => {
        setCurrentExportType(type);
        setExportDialogOpen(true);
    };

    const handleExportConfirm = (exportAll) => {
        setExportDialogOpen(false);
        switch (currentExportType) {
            case 'csv':
                handleExportCSV(exportAll);
                break;
            case 'excel':
                handleExportExcel(exportAll);
                break;
            case 'pdf':
                handleExportPDF(exportAll);
                break;
            case 'print':
                handlePrint(exportAll);
                break;
            default:
                break;
        }
    };

    const handleExportCSV = (exportAll) => {
        setExportData(exportAll ? prepareExportData() : prepareExportData().slice(0, visibleItems));
    };

    const handlePrint = (printAll) => {
        const dataToPrint = printAll ? loadedData : loadedData.slice(0, visibleItems);

        const tableRows = dataToPrint.map(item => `
            <tr>
                <td style="text-align:left">${item.ITEMID}-${item.TAGNO}</td>
                <td style="text-align:left">${item.Description || 'No description'}</td>
                <td style="text-align:right">${item.NETWT}g</td>
                <td style="text-align:right">${item.GRSWT}g</td>
                <td style="text-align:right">${item.Wastage}%</td>
                <td style="text-align:right">${formatCurrency(item.GrossAmount)}</td>
                <td style="text-align:right">${item.GSTPer}%</td>
                <td style="text-align:right">${formatCurrency(item.GSTAmount)}</td>
                <td style="text-align:right"><strong>${formatCurrency(item.GrandTotal)}</strong></td>
            </tr>
        `).join('');

        const printWindow = window.open('', '', 'width=1000,height=700');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Product Estimation Print</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        h2 {
                            color: #2196f3;
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .generated-date {
                            font-size: 12px;
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12px;
                        }
                        th {
                            background-color: #2196f3;
                            color: white;
                            padding: 8px;
                            text-align: left;
                            border: 1px solid #ccc;
                        }
                        td {
                            padding: 6px;
                            border: 1px solid #ccc;
                        }
                        .summary {
                            margin-top: 20px;
                            font-size: 14px;
                            text-align: right;
                        }
                    </style>
                </head>
                <body>
                    <h2>Product Estimation Report</h2>
                    <div class="generated-date">Generated: ${new Date().toLocaleString()}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Description</th>
                                <th>Net WT</th>
                                <th>GRS WT</th>
                                <th>Wastage</th>
                                <th>Amount</th>
                                <th>GST%</th>
                                <th>GST Amt</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <div class="summary">
                        <strong>Total Products: ${dataToPrint.length}</strong><br>
                        <strong>Grand Total: ${formatCurrency(dataToPrint.reduce((sum, item) => sum + parseFloat(item.GrandTotal), 0))}</strong>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    const handleExportExcel = (exportAll) => {
        const rawData = exportAll ? prepareExportData() : prepareExportData().slice(0, visibleItems);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(rawData, { cellStyles: true });

        // Column widths
        worksheet['!cols'] = [
            { wch: 12 },  // SKU
            { wch: 50 },  // Description
            { wch: 8 },   // PCS
            { wch: 15 },  // Rate
            { wch: 18 },  // Gross Amount
            { wch: 10 },  // GST (%)
            { wch: 15 },  // GST Amount
            { wch: 18 },  // Grand Total
            { wch: 15 } ,  // Purity
            { wch: 15 } ,  // Purity
            { wch: 15 } ,  // Purity
            { wch: 15 } ,  // Purity
            { wch: 15 } ,  // Purity
            { wch: 15 } ,  // Purity
            { wch: 15 } ,  // Purity
        ];

        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // Format header row
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            const cell = worksheet[cellRef];
            if (cell) {
                cell.s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4472C4" } }, // Dark Blue
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };
            }
        }

        // Format body rows
        for (let R = range.s.r + 1; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellRef];
                if (!cell) continue;

                if (!cell.s) cell.s = {};

                // Numeric columns
                if ([3, 4, 6, 7,  12, 13 , 14].includes(C)) {
                    if (typeof cell.v === 'string' && cell.v.includes("₹")) {
                        const clean = parseFloat(cell.v.replace(/[₹,]/g, ""));
                        if (!isNaN(clean)) {
                            cell.v = clean;
                            cell.t = 'n';
                        }
                    }

                    cell.s.alignment = { horizontal: "right" };
                    cell.s.numFmt = '"₹"#,##0.00';
                } else if (C === 5) {
                    cell.s.alignment = { horizontal: "center" };
                } else {
                    cell.s.alignment = { horizontal: "left" };
                }

                // Borders
                cell.s.border = {
                    top: { style: "thin", color: { rgb: "D9D9D9" } },
                    bottom: { style: "thin", color: { rgb: "D9D9D9" } },
                    left: { style: "thin", color: { rgb: "D9D9D9" } },
                    right: { style: "thin", color: { rgb: "D9D9D9" } }
                };
            }
        }

        // Add total row
        const totalRowIdx = range.e.r + 1;
        const totalRow = [
            `Total: ${rawData.length} items`, '', '', '',
            { f: `SUM(E2:E${totalRowIdx})` },
            '',
            { f: `SUM(G2:G${totalRowIdx})` },
            { f: `SUM(H2:H${totalRowIdx})` },
            ''
        ];

        XLSX.utils.sheet_add_aoa(worksheet, [totalRow], { origin: -1 });

        // Format total row
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: totalRowIdx, c: C });
            const cell = worksheet[cellRef];
            if (!cell) continue;

            if (!cell.s) cell.s = {};
            cell.s.font = { bold: true };
            cell.s.fill = { fgColor: { rgb: "F2F2F2" } };
            cell.s.border = {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            };

            if ([4, 6, 7].includes(C)) {
                cell.s.numFmt = '"₹"#,##0.00';
                cell.s.alignment = { horizontal: "right" };
            }
        }

        // Save the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estimations");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
            cellStyles: true
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(blob, `Product_Estimations_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };
    
    
    

    const handleExportPDF = (exportAll) => {
        const doc = new jsPDF({ orientation: 'landscape' }); // Landscape to allow more space
        const dataToExport = exportAll ? loadedData : loadedData.slice(0, visibleItems);
        const totalCount = dataToExport.length;
        const grandTotal = dataToExport.reduce((sum, item) => sum + parseFloat(item.GrandTotal || 0), 0);

        // Title and header
        doc.setFontSize(16);
        doc.setTextColor(33, 150, 243); // Blue
        doc.text('Product Estimation Report', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

        autoTable(doc, {
            startY: 35,
            head: [['SKU', 'Purity', 'Net WT', 'GRS WT', 'Wastage ', 'Amount ', 'GST ', 'Total ']],
            body: dataToExport.map(item => [
                `${item.ITEMID}-${item.TAGNO}`,
                `${item.PURITY || ''}`,
                `${item.NETWT}g`,
                `${item.GRSWT}g`,
                `${item.Wastage}`,
                `${item.GrossAmount}`,
                `${item.GSTPer} - ${item.GSTAmount}`,
                `${item.GrandTotal}`
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [33, 150, 243],
                textColor: [255, 255, 255],
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: 25, halign: 'left' },   // SKU
                1: { cellWidth: 20, halign: 'center' }, // Purity
                2: { cellWidth: 25, halign: 'right' },  // Net WT
                3: { cellWidth: 25, halign: 'right' },  // GRS WT
                4: { cellWidth: 25, halign: 'right' },  // Wastage
                5: { cellWidth: 35, halign: 'right' },  // Amount
                6: { cellWidth: 35, halign: 'right' },  // GST
                7: { cellWidth: 35, halign: 'right' }   // Total
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle'
            },
            margin: { top: 30, left: 10, right: 10 }
        });

        // Summary Section
        const finalY = doc.lastAutoTable.finalY || 35;
        doc.setFontSize(10);
        doc.text(`Total Products: ${totalCount}`, 14, finalY + 10);
        doc.text(`Grand Total: ${grandTotal.toFixed(2) }`, 14, finalY + 16);

        doc.save(`estimations_${new Date().toISOString().slice(0, 10)}.pdf`);
    };
    

    if (isError) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ borderRadius: '12px', backgroundColor: '#fff5f5', color: '#d32f2f' }}>
                    Failed to load estimation products. Please try again.
                </Alert>
                <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)' }}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box p={isMobile ? 1 : 3} sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
            <ModernCard>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ color: '#1E1E2C', fontWeight: 700 }}>
                        Product Estimations
                    </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                        <Button
                            variant="outlined"
                            startIcon={<Print />}
                            onClick={() => handleExportClick('print')}
                            size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#3B8FF3', borderColor: '#3B8FF3', fontWeight: 600 }}
                        >
                            {isSmallScreen ? 'Print' : 'Print Report'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleExportClick('pdf')}
                            size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#F29F67', borderColor: '#F29F67', fontWeight: 600 }}
                        >
                            {isSmallScreen ? 'PDF' : 'Export PDF'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleExportClick('excel')}
                            size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#34B1AA', borderColor: '#34B1AA', fontWeight: 600 }}
                        >
                            {isSmallScreen ? 'Excel' : 'Export Excel'}
                        </Button>
                        {exportData.length > 0 && (
                            <CSVLink
                                data={exportData}
                                filename={`estimations_${new Date().toISOString().slice(0, 10)}.csv`}
                                onClick={() => setExportData([])}
                                style={{ display: 'none' }}
                            />
                        )}
                    </Stack>
                    </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
                <>
                    <Box mb={2}>
                                <Typography variant="subtitle1" sx={{ color: '#6B7280', fontWeight: 500 }}>
                            Showing {Math.min(visibleItems, loadedData.length)} of {loadedData.length} products
                        </Typography>
                    </Box>
                            <StyledTableContainer ref={tableContainerRef}>
                            <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>SubItemName</TableCell>
                                        <TableCell>SKU</TableCell>
                                        <TableCell>Details</TableCell>
                                        {!isMobile && <TableCell>Purity/Weight</TableCell>}
                                            <TableCell align="right">Amount</TableCell>
                                        <TableCell align="center">GST</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loadedData.length > 0 ? (
                                        loadedData.slice(0, visibleItems).map((item, index) => (
                                            <React.Fragment key={`${item.SubItemId}-${item.ITEMID}-${index}`}>
                                                <TableRow hover>
                                                        <TableCell>{item.ITEMNAME}</TableCell>
                                                        <TableCell>{item.SUBITEMNAME}</TableCell>
                                                        <TableCell>{item.ITEMID}-{item.TAGNO}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center">
                                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                                {item.Description || 'No description'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2">{item.PURITY}</Typography>
                                                                <Typography variant="caption">
                                                                    {item.NETWT}g (Gross: {item.GRSWT}g)
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    )}
                                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#F29F67' }}>{formatCurrency(item.GrossAmount)}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={`${item.GSTPer} (${formatCurrency(item.GSTAmount)})`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                                    color: '#3B8FF3',
                                                                    fontWeight: 600
                                                            }}
                                                        />
                                                    </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, color: '#34B1AA' }}>
                                                            {formatCurrency(item.GrandTotal)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                    onClick={() => handlePreviewClick(item)}
                                                                color="primary"
                                                                    sx={{ borderRadius: '8px', backgroundColor: 'rgba(59, 143, 243, 0.08)' }}
                                                            >
                                                                    <Visibility />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                                <TableCell colSpan={isMobile ? 6 : 8} align="center">
                                                No estimation products found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            </StyledTableContainer>

                            {isLoadingMore && (
                                <Box mt={3} display="flex" justifyContent="center" alignItems="center">
                                    <CircularProgress size={20} sx={{ color: '#3B8FF3' }} />
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, ml: 1 }}>
                                        Loading more...
                                    </Typography>
                        </Box>
                            )}
                        </>
                    )}

                    {/* Export Confirmation Dialog */}
                    <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
                        <DialogTitle>Export Options</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Do you want to export all {loadedData.length} products or just the currently visible {Math.min(visibleItems, loadedData.length)} products?
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => handleExportConfirm(false)} color="primary" sx={{ fontWeight: 600 }}>
                                Current View ({Math.min(visibleItems, loadedData.length)})
                            </Button>
                            <Button onClick={() => handleExportConfirm(true)} color="primary" variant="contained" sx={{ fontWeight: 600 }}>
                                All Products ({loadedData.length})
                            </Button>
                            <Button onClick={() => setExportDialogOpen(false)} color="secondary" sx={{ fontWeight: 600 }}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Preview Modal */}
                    <Dialog 
                        open={previewModal} 
                        onClose={() => setPreviewModal(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle sx={{ 
                            background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.2rem'
                        }}>
                            Product Details Preview
                        </DialogTitle>
                        <DialogContent sx={{ 
                            p: 3,
                            maxHeight: '70vh',
                            overflow: 'auto'
                        }}>
                            {selectedItem && (
                                <Box>
                                    {/* Header Info */}
                                    <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '12px' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E1E2C', mb: 1 }}>
                                            {selectedItem.ITEMNAME} - {selectedItem.SUBITEMNAME}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#3B8FF3', fontWeight: 600, fontFamily: 'monospace' }}>
                                            SKU: {selectedItem.ITEMID}-{selectedItem.TAGNO}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                                            {selectedItem.Description || 'No description available'}
                                        </Typography>
                                    </Box>

                                    {/* Single Combined Table */}
                                    <Box sx={{ 
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                        borderRadius: '12px',
                                        p: 2,
                                        border: '1px solid rgba(30, 30, 44, 0.06)',
                                        boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)'
                                    }}>
                                        <Table size="small" sx={{ 
                                            background: 'transparent',
                                            '& .MuiTableCell-root': {
                                                padding: '8px 12px'
                                            }
                                        }}>
                                            <TableBody>
                                                {/* Additional Details Section */}
                                                <TableRow>
                                                    <TableCell colSpan={2} sx={{ 
                                                        backgroundColor: 'rgba(59, 143, 243, 0.08)',
                                                        borderBottom: '2px solid #3B8FF3',
                                                        py: 1
                                                    }}>
                                                        <Typography sx={{ 
                                                            fontWeight: 700, 
                                                            color: '#3B8FF3', 
                                                            fontSize: '0.95rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Additional Details
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Wastage</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{selectedItem.Wastage}%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Making Charges</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{formatCurrency(selectedItem.MC)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Stone Amount</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{formatCurrency(selectedItem.StoneAmount)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Misc Amount</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{formatCurrency(selectedItem.MiscAmount)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Purity</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{selectedItem.PURITY}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Net Weight</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{selectedItem.NETWT}g</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Gross Weight</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#3B8FF3', fontSize: '0.85rem' }}>{selectedItem.GRSWT}g</TableCell>
                                                </TableRow>

                                                {/* Calculation Breakdown Section */}
                                                <TableRow>
                                                    <TableCell colSpan={2} sx={{ 
                                                        backgroundColor: 'rgba(242, 159, 103, 0.08)',
                                                        borderBottom: '2px solid #F29F67',
                                                        py: 1,
                                                        mt: 2
                                                    }}>
                                                        <Typography sx={{ 
                                                            fontWeight: 700, 
                                                            color: '#F29F67', 
                                                            fontSize: '0.95rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Calculation Breakdown
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>Gross Amount</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#F29F67', fontSize: '0.85rem' }}>{formatCurrency(selectedItem.GrossAmount)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.85rem' }}>GST ({selectedItem.GSTPer}%)</TableCell>
                                                    <TableCell align='right' sx={{ fontWeight: 600, color: '#F29F67', fontSize: '0.85rem' }}>{formatCurrency(selectedItem.GSTAmount)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>
                                                        <Typography fontWeight="bold" color="#1E1E2C" fontSize="0.9rem">Grand Total</Typography>
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Typography fontWeight="bold" color="#34B1AA" fontSize="0.9rem">
                                                            {formatCurrency(selectedItem.GrandTotal)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button 
                                onClick={() => setPreviewModal(false)} 
                                variant="contained"
                                sx={{ 
                                    borderRadius: '8px', 
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)'
                                }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default EstimationProductsPage;