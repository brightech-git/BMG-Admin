import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Card, CardContent,
    TextField, Avatar
} from '@mui/material';
import { 
    Download, PictureAsPdf, Print, Visibility, Edit, Delete,
    Add, Refresh, Search, CloudUpload
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import {
    useBannersQuery,
} from '../../../hooks/banners/useBannersQuery';
import {
    useUpdateBannerMutation,
    useDeleteBannerMutation,
} from '../../../hooks/banners/useUploadBannerMutation';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

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

const ModernButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '12px 24px',
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
}));

const ManageBanner = () => {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleItems, setVisibleItems] = useState(20);
    const [loadedData, setLoadedData] = useState([]);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [currentExportType, setCurrentExportType] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const tableContainerRef = useRef(null);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

    const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
    const { mutate: updateBanner, isLoading: isUpdating } = useUpdateBannerMutation();
    const { mutate: deleteBanner, isLoading: isDeleting } = useDeleteBannerMutation();

    const banners = useMemo(() => bannersData?.data || [], [bannersData?.data]);

    useEffect(() => {
        if (banners.length > 0) {
            const filtered = banners.filter(
                (banner) =>
                    banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    banner.id.toString().includes(searchQuery)
            );
            setLoadedData(filtered);
        } else {
            setLoadedData([]);
        }
    }, [banners, searchQuery]);

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
                    }, 300);
                }
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleTableScroll);
            return () => tableContainer.removeEventListener('scroll', handleTableScroll);
        }
    }, [visibleItems, loadedData.length, isLoadingMore]);

    const handleRefreshClick = () => {
        refetch();
        setSearchQuery('');
    };

    const handleEditClick = (banner) => {
        setSelectedId(banner.id);
        setEditFile(null);
        setEditTitle(banner.title || '');
        setErrorMessage('');
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setErrorMessage('Please select a valid image file (JPEG, PNG, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('File size exceeds maximum limit of 5MB');
            return;
        }

        setEditFile(file);
        setErrorMessage('');
    };

    const handleEditTitleChange = (e) => {
        setEditTitle(e.target.value);
        setErrorMessage('');
    };

    const handleSaveEdit = (id) => {
        if (!editFile) {
            setErrorMessage('Please select an image to update.');
            return;
        }
        if (!editTitle.trim()) {
            setErrorMessage('Please provide a title for the banner.');
            return;
        }

        updateBanner(
            { image: editFile, title: editTitle, id },
            {
                onSuccess: () => {
                    setSuccessMessage('Banner updated successfully!');
                    setSelectedId(null);
                    setEditFile(null);
                    setEditTitle('');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to update banner.');
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setSelectedId(null);
        setEditFile(null);
        setEditTitle('');
        setErrorMessage('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteBanner(id, {
                onSuccess: () => {
                    setSuccessMessage('Banner deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to delete banner.');
                },
            });
        }
    };

    const handlePreviewClick = (banner) => {
        setSelectedBanner(banner);
        setPreviewModal(true);
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

    const prepareExportData = () => {
        return loadedData.map(banner => ({
            'ID': banner.id,
            'Title': banner.title || 'Untitled',
            'Image Path': `${BASE_IMAGE_URL}${banner.image_path}`,
            'Created At': new Date(banner.created_at).toLocaleString(),
            'Status': 'Active'
        }));
    };

    const handleExportCSV = (exportAll) => {
        const dataToExport = exportAll ? prepareExportData() : prepareExportData().slice(0, visibleItems);
        const csvContent = [
            ['ID', 'Title', 'Image Path', 'Created At', 'Status'],
            ...dataToExport.map(item => [
                item.ID,
                item.Title,
                item['Image Path'],
                item['Created At'],
                item.Status
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `banners_${new Date().toISOString().slice(0, 10)}.csv`);
        setSuccessMessage('CSV exported successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleExportExcel = (exportAll) => {
        const dataToExport = exportAll ? prepareExportData() : prepareExportData().slice(0, visibleItems);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Column widths
        worksheet['!cols'] = [
            { wch: 10 },  // ID
            { wch: 30 },  // Title
            { wch: 50 },  // Image Path
            { wch: 20 },  // Created At
            { wch: 15 },  // Status
        ];

        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // Format header row
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            const cell = worksheet[cellRef];
            if (cell) {
                cell.s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4472C4" } },
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
                cell.s.alignment = { horizontal: "left" };
                cell.s.border = {
                    top: { style: "thin", color: { rgb: "D9D9D9" } },
                    bottom: { style: "thin", color: { rgb: "D9D9D9" } },
                    left: { style: "thin", color: { rgb: "D9D9D9" } },
                    right: { style: "thin", color: { rgb: "D9D9D9" } }
                };
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, "Banners");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `banners_${new Date().toISOString().slice(0, 10)}.xlsx`);
        setSuccessMessage('Excel exported successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleExportPDF = (exportAll) => {
        const dataToExport = exportAll ? loadedData : loadedData.slice(0, visibleItems);
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.setTextColor(33, 150, 243);
        doc.text('Banner Management Report', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

        autoTable(doc, {
            startY: 35,
            head: [['ID', 'Title', 'Image Path', 'Created At']],
            body: dataToExport.map(banner => [
                banner.id,
                banner.title || 'Untitled',
                `${BASE_IMAGE_URL}${banner.image_path}`,
                new Date(banner.created_at).toLocaleDateString()
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [33, 150, 243],
                textColor: [255, 255, 255],
                fontSize: 9
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle'
            },
            margin: { top: 30, left: 10, right: 10 }
        });

        doc.save(`banners_${new Date().toISOString().slice(0, 10)}.pdf`);
        setSuccessMessage('PDF exported successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handlePrint = (printAll) => {
        const dataToPrint = printAll ? loadedData : loadedData.slice(0, visibleItems);

        const tableRows = dataToPrint.map(banner => `
            <tr>
                <td style="text-align:left">${banner.id}</td>
                <td style="text-align:left">${banner.title || 'Untitled'}</td>
                <td style="text-align:left">${BASE_IMAGE_URL}${banner.image_path}</td>
                <td style="text-align:left">${new Date(banner.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '', 'width=1000,height=700');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Banner Management Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { color: #2196f3; text-align: center; margin-bottom: 10px; }
                        .generated-date { font-size: 12px; text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th { background-color: #2196f3; color: white; padding: 8px; text-align: left; border: 1px solid #ccc; }
                        td { padding: 6px; border: 1px solid #ccc; }
                        .summary { margin-top: 20px; font-size: 14px; text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>Banner Management Report</h2>
                    <div class="generated-date">Generated: ${new Date().toLocaleString()}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Image Path</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <div class="summary">
                        <strong>Total Banners: ${dataToPrint.length}</strong>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ borderRadius: '12px', backgroundColor: '#fff5f5', color: '#d32f2f' }}>
                    Failed to load banners. Please try again.
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
                            Manage Banners
                        </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                            <ModernButton
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate('/admin/banner/add')}
                                size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)' }}
                            >
                                {isSmallScreen ? 'Add' : 'Add Banner'}
                            </ModernButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={handleRefreshClick}
                                size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#3B8FF3', borderColor: '#3B8FF3', fontWeight: 600 }}
                            >
                                {isSmallScreen ? 'Refresh' : 'Refresh'}
                            </ModernButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={() => handleExportClick('print')}
                                size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#3B8FF3', borderColor: '#3B8FF3', fontWeight: 600 }}
                            >
                                {isSmallScreen ? 'Print' : 'Print Report'}
                            </ModernButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<PictureAsPdf />}
                                onClick={() => handleExportClick('pdf')}
                                size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#F29F67', borderColor: '#F29F67', fontWeight: 600 }}
                            >
                                {isSmallScreen ? 'PDF' : 'Export PDF'}
                            </ModernButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => handleExportClick('excel')}
                                size={isSmallScreen ? 'small' : 'medium'}
                                sx={{ borderRadius: '8px', color: '#34B1AA', borderColor: '#34B1AA', fontWeight: 600 }}
                            >
                                {isSmallScreen ? 'Excel' : 'Export Excel'}
                            </ModernButton>
                        </Stack>
                    </Box>

                    {/* Search Bar */}
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            placeholder="Search banners by title or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ color: '#6B7280', mr: 1 }} />,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: '#fff',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3B8FF3',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3B8FF3',
                                        borderWidth: '2px',
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Feedback Messages */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box mb={3}>
                                    <Alert
                                        severity="error"
                                        sx={{
                                            borderRadius: '12px',
                                            backgroundColor: '#fff5f5',
                                            color: '#d32f2f',
                                        }}
                                    >
                                        {errorMessage}
                                    </Alert>
                                </Box>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box mb={3}>
                                    <Alert
                                        severity="success"
                                        sx={{
                                            borderRadius: '12px',
                                            backgroundColor: '#f0f9ff',
                                            color: '#0d9488',
                                        }}
                                    >
                                        {successMessage}
                                    </Alert>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : loadedData.length === 0 ? (
                        <Box textAlign="center" p={4}>
                            <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                {searchQuery ? 'No banners match your search' : 'No banners available'}
                            </Alert>
                        </Box>
                    ) : (
                        <>
                            <Box mb={2}>
                                <Typography variant="subtitle1" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    Showing {Math.min(visibleItems, loadedData.length)} of {loadedData.length} banners
                                </Typography>
                            </Box>
                            <StyledTableContainer ref={tableContainerRef}>
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Image</TableCell>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Created At</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loadedData.slice(0, visibleItems).map((banner) => (
                                            <TableRow key={banner.id} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={`#${banner.id}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                            color: '#3B8FF3',
                                                            fontWeight: 600,
                                                            fontFamily: 'monospace'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <Box>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleEditFileChange}
                                                                style={{ display: 'none' }}
                                                                id={`file-${banner.id}`}
                                                            />
                                                            <label htmlFor={`file-${banner.id}`}>
                                                                <Button
                                                                    component="span"
                                                                    variant="outlined"
                                                                    startIcon={<CloudUpload />}
                                                                    size="small"
                                                                    sx={{ mb: 1 }}
                                                                >
                                                                    Choose Image
                                                                </Button>
                                                            </label>
                                                            {editFile && (
                                                                <Chip
                                                                    label={`Selected: ${editFile.name}`}
                                                                    color="info"
                                                                    size="small"
                                                                    sx={{ display: 'block', mt: 1 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Avatar
                                                            src={`${BASE_IMAGE_URL}${banner.image_path}`}
                                                            variant="rounded"
                                                            sx={{
                                                                width: 80,
                                                                height: 60,
                                                                cursor: 'pointer',
                                                                '&:hover': { opacity: 0.8 }
                                                            }}
                                                            onClick={() => handlePreviewClick(banner)}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <TextField
                                                            value={editTitle}
                                                            onChange={handleEditTitleChange}
                                                            placeholder="Enter banner title"
                                                            size="small"
                                                            fullWidth
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '8px',
                                                                },
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {banner.title || 'Untitled Banner'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                        {new Date(banner.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {selectedId === banner.id ? (
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() => handleSaveEdit(banner.id)}
                                                                disabled={!editFile || isUpdating}
                                                                sx={{
                                                                    borderRadius: '8px',
                                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                                    minWidth: '60px'
                                                                }}
                                                            >
                                                                {isUpdating ? <CircularProgress size={16} /> : 'Save'}
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={handleCancelEdit}
                                                                disabled={isUpdating}
                                                                sx={{ borderRadius: '8px', minWidth: '60px' }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Stack>
                                                    ) : (
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <Tooltip title="View Details">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handlePreviewClick(banner)}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(59, 143, 243, 0.08)',
                                                                        color: '#3B8FF3'
                                                                    }}
                                                                >
                                                                    <Visibility />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit Banner">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(banner)}
                                                                    disabled={isDeleting}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(242, 159, 103, 0.08)',
                                                                        color: '#F29F67'
                                                                    }}
                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Banner">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(banner.id)}
                                                                    disabled={isDeleting}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                                                        color: '#ef4444'
                                                                    }}
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                                Do you want to export all {loadedData.length} banners or just the currently visible {Math.min(visibleItems, loadedData.length)} banners?
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => handleExportConfirm(false)} color="primary" sx={{ fontWeight: 600 }}>
                                Current View ({Math.min(visibleItems, loadedData.length)})
                            </Button>
                            <Button onClick={() => handleExportConfirm(true)} color="primary" variant="contained" sx={{ fontWeight: 600 }}>
                                All Banners ({loadedData.length})
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
                            Banner Details Preview
                        </DialogTitle>
                        <DialogContent sx={{ 
                            p: 3,
                            maxHeight: '70vh',
                            overflow: 'auto'
                        }}>
                            {selectedBanner && (
                                <Box>
                                    <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '12px' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E1E2C', mb: 1 }}>
                                            {selectedBanner.title || 'Untitled Banner'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#3B8FF3', fontWeight: 600, fontFamily: 'monospace' }}>
                                            ID: #{selectedBanner.id}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                                            Created: {new Date(selectedBanner.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ 
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                        borderRadius: '12px',
                                        p: 2,
                                        border: '1px solid rgba(30, 30, 44, 0.06)',
                                        boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
                                        textAlign: 'center'
                                    }}>
                                        <img 
                                            src={`${BASE_IMAGE_URL}${selectedBanner.image_path}`}
                                            alt={selectedBanner.title || 'Banner'}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'contain',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 2, fontFamily: 'monospace' }}>
                                            {BASE_IMAGE_URL}{selectedBanner.image_path}
                                        </Typography>
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

export default ManageBanner;