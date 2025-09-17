import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../../hooks/employee/useEmployees';
import * as XLSX from 'sheetjs-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Box,
    Typography,
    Button,
    TextField,
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
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Card,
    CardContent,
    useMediaQuery,
    useTheme,
    Grid,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Security as SecurityIcon,
    ArrowForward,
    TrendingUp,
    Group
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ========== ENHANCED STYLED COMPONENTS (Similar to LatestOrders) ==========
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(30, 30, 44, 0.12)',
    },
}));

const CompactTable = styled(TableContainer)(() => ({
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #fdf1e8 0%, #f5e6d4 100%)',
        '& .MuiTableCell-head': {
            color: '#1a1a1a !important',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: '8px 12px',
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
        padding: '8px 12px',
        fontSize: '0.8rem',
    },
}));

const StatusChip = styled(Chip)(({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'admin':
                return {
                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(235, 167, 72, 0.3)',
                };
            case 'employee':
                return {
                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(235, 167, 72, 0.3)',
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(235, 167, 72, 0.3)',
                };
        }
    };

    return {
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: '0.7rem',
        minWidth: '80px',
        height: '24px',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        ...getStatusStyles(status),
        '&:hover': {
            transform: 'scale(1.05)',
        },
    };
});

const SearchField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: '1rem',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#eba748',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#eba748',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#6B7280',
        fontWeight: 500,
    },
}));

const ActionButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: buttonVariant === 'contained' ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 6px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    ...(color === 'primary' && {
        background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 100%)',
        }
    }),
    ...(color === 'error' && {
        background: 'linear-gradient(135deg, #F29F67 0%, #e08f5a 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #e08f5a 0%, #cc7a45 100%)',
        }
    }),
}));

const EmployeeCard = styled(Card)(() => ({
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 2px 12px rgba(30, 30, 44, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(30, 30, 44, 0.12)',
    },
}));

const ManageEmployees = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { employees, isLoading, isError, refetch, deleteEmployee, isDeleting } = useEmployees();
    
    const [searchText, setSearchText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [visibleItems, setVisibleItems] = useState(10);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [message, setMessage] = useState('');
    
    const tableContainerRef = useRef(null);

    const filteredEmployees = useMemo(() => {
        return employees
            .filter(emp =>
                emp.roles?.some(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
            )
            .filter(emp =>
                emp.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.contactNumber?.includes(searchText)
            );
    }, [searchText, employees]);

    const displayedEmployees = filteredEmployees.slice(0, visibleItems);

    // Calculate statistics
    const totalEmployees = filteredEmployees.length;
    const adminCount = filteredEmployees.filter(emp => 
        emp.roles?.some(role => role === 'ROLE_ADMIN')
    ).length;
    const employeeCount = filteredEmployees.filter(emp => 
        emp.roles?.some(role => role === 'ROLE_EMPLOYEE')
    ).length;

    useEffect(() => {
        const handleTableScroll = () => {
            if (tableContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
                if (scrollTop + clientHeight >= scrollHeight - 50) {
                    setVisibleItems(prev => Math.min(prev + 10, filteredEmployees.length));
                }
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleTableScroll);
            return () => tableContainer.removeEventListener('scroll', handleTableScroll);
        }
    }, [filteredEmployees.length]);

    const handleDelete = (employee) => {
        setDeleteId(employee.id);
        setDeleteTarget(employee);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        deleteEmployee(deleteId, {
            onSuccess: () => {
                setMessage('Employee deleted successfully!');
                setShowSuccess(true);
                setShowDeleteModal(false);
                setTimeout(() => setShowSuccess(false), 3000);
            },
            onError: (error) => {
                console.error('Delete error:', error);
                setMessage('Failed to delete employee.');
                setShowError(true);
                setShowDeleteModal(false);
                setTimeout(() => setShowError(false), 3000);
            },
        });
    };

    const exportToExcel = () => {
        const data = filteredEmployees.map(emp => ({
            Username: emp.username,
            Email: emp.email,
            'Contact Number': emp.contactNumber,
            Roles: emp.roles
                .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                .map(role => role.replace('ROLE_', ''))
                .join(', '),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!cols'] = [
            { wch: 20 },
            { wch: 30 },
            { wch: 15 },
            { wch: 20 },
        ];

        const headerStyle = {
            fill: { fgColor: { rgb: 'D3D3D3' } },
            font: { bold: true, color: { rgb: '000000' } },
            alignment: { horizontal: 'center' },
        };

        const headerCells = ['A1', 'B1', 'C1', 'D1'];
        headerCells.forEach(cell => {
            if (worksheet[cell]) {
                worksheet[cell].s = headerStyle;
            }
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
        XLSX.writeFile(workbook, `employees_${new Date().toISOString().slice(0, 10)}.xlsx`);

        setMessage('Excel exported successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ['Username', 'Email', 'Contact', 'Roles'];
        const tableRows = filteredEmployees.map(emp => [
            emp.username,
            emp.email,
            emp.contactNumber,
            emp.roles
                .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                .map(role => role.replace('ROLE_', ''))
                .join(', '),
        ]);

        doc.setFontSize(18);
        doc.setTextColor(59, 143, 243);
        doc.text('Employee Management Report', 14, 15);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: {
                fillColor: [59, 143, 243],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 30 },
        });

        doc.save(`employees_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        setMessage('PDF exported successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <html>
          <head>
            <title>Employee List</title>
            <style>
              * { box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 40px;
                color: #333;
              }
              h1 {
                color: #3B8FF3;
                margin-bottom: 5px;
              }
              p {
                color: #555;
                font-size: 14px;
                margin-top: 0;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 14px;
              }
              th {
                background-color: #3B8FF3;
                color: white;
                padding: 10px;
                text-align: left;
                border-bottom: 2px solid #e0e0e0;
              }
              td {
                padding: 10px;
                border-bottom: 1px solid #e0e0e0;
              }
              tr:nth-child(even) {
                background-color: #fafafa;
              }
              .print-footer {
                font-size: 12px;
                color: #777;
                border-top: 1px solid #ccc;
                padding-top: 10px;
                text-align: right;
              }
              @media print {
                body { margin: 10mm; }
                h1, p { page-break-inside: avoid; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <h1>Employee List</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                ${filteredEmployees
                .map(emp => `
                    <tr>
                      <td>${emp.username}</td>
                      <td>${emp.email}</td>
                      <td>${emp.contactNumber}</td>
                      <td>${emp.roles
                        .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                        .map(role => role.replace('ROLE_', ''))
                        .join(', ')}</td>
                    </tr>
                `)
                .join('')}
              </tbody>
            </table>
            <div class="print-footer">
              Total Employees: ${filteredEmployees.length}
            </div>
          </body>
        </html>
      `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    if (isError) {
        return (
            <StyledCard>
                <CardContent>
                    <Alert
                        severity="error"
                        sx={{
                            backgroundColor: '#fff5f5',
                            color: '#d32f2f',
                            borderRadius: '12px',
                            '& .MuiAlert-icon': { color: '#d32f2f' }
                        }}
                    >
                        Failed to load employees. Please try again.
                    </Alert>
                    <Button
                        onClick={() => refetch()}
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Retry
                    </Button>
                </CardContent>
            </StyledCard>
        );
    }

    return (
        <Box
            p={3}
            sx={{
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            }}
        >
            {/* Success/Error Messages */}
            {showSuccess && (
                <Box mb={3}>
                    <Alert
                        severity="success"
                        onClose={() => setShowSuccess(false)}
                        sx={{
                            borderRadius: '12px',
                            backgroundColor: '#f0f9ff',
                            color: '#0d9488',
                        }}
                    >
                        {message}
                    </Alert>
                </Box>
            )}

            {showError && (
                <Box mb={3}>
                    <Alert
                        severity="error"
                        onClose={() => setShowError(false)}
                        sx={{
                            borderRadius: '12px',
                            backgroundColor: '#fff5f5',
                            color: '#d32f2f',
                        }}
                    >
                        {message}
                    </Alert>
                </Box>
            )}

            <StyledCard>
                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                                sx={{
                                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Group />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 700 }}>
                                    Manage Employees
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                    Manage your team members and their roles
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={2}>
                            <Chip
                                label={`${totalEmployees} employees`}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                    color: '#3B8FF3',
                                    fontWeight: 600,
                                }}
                            />
                            <Tooltip title="Add new employee">
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/admin/employee/add')}
                                    sx={{ minWidth: '140px' }}
                                >
                                    Add Employee
                                </ActionButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Quick Summary */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            gap: isMobile ? 1 : 2, 
                            mb: 3, 
                            p: 2, 
                            backgroundColor: 'rgba(59, 143, 243, 0.05)', 
                            borderRadius: '12px',
                            border: '1px solid rgba(59, 143, 243, 0.1)',
                            flexDirection: isMobile ? 'column' : 'row',
                            flexWrap: isMobile ? 'wrap' : 'nowrap'
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <Group sx={{ color: '#3B8FF3', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                Total: <strong style={{ color: '#3B8FF3' }}>{totalEmployees}</strong>
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <SecurityIcon sx={{ color: '#34B1AA', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                Admins: <strong style={{ color: '#34B1AA' }}>{adminCount}</strong>
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ color: '#F29F67', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                Employees: <strong style={{ color: '#F29F67' }}>{employeeCount}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Search and Actions */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 3
                    }}>
                        <SearchField
                            placeholder="Search by username, email, or contact..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon sx={{ color: '#6B7280', mr: 1 }} />
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <ActionButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={refetch}
                                disabled={isLoading}
                                sx={{ minWidth: '120px' }}
                            >
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </ActionButton>
                            
                            <Box sx={{ position: 'relative' }}>
                                <ActionButton
                                    variant="outlined"
                                    sx={{ minWidth: '120px' }}
                                    onClick={() => {
                                        const menu = document.getElementById('export-menu');
                                        if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                    }}
                                >
                                    Export
                                </ActionButton>
                                <Box
                                    id="export-menu"
                                    sx={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        mt: 1,
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        display: 'none',
                                        zIndex: 1000,
                                        minWidth: '150px',
                                    }}
                                >
                                    <Button
                                        fullWidth
                                        onClick={exportToExcel}
                                        sx={{ 
                                            justifyContent: 'flex-start',
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: 0,
                                            '&:first-of-type': { borderTopLeftRadius: '12px', borderTopRightRadius: '12px' },
                                        }}
                                    >
                                        Excel
                                    </Button>
                                    <Button
                                        fullWidth
                                        onClick={exportToPDF}
                                        sx={{ 
                                            justifyContent: 'flex-start',
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: 0,
                                        }}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        fullWidth
                                        onClick={handlePrint}
                                        sx={{ 
                                            justifyContent: 'flex-start',
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: 0,
                                            '&:last-of-type': { borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' },
                                        }}
                                    >
                                        Print
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Loading State */}
                    {isLoading && (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
                            <CircularProgress
                                size={40}
                                sx={{ color: '#F29F67', mb: 2 }}
                            />
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                Loading employees...
                            </Typography>
                        </Box>
                    )}

                    {/* Loading Skeleton for Employees */}
                    {isLoading && (
                        <Box>
                            {[1, 2, 3].map((index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        mb: 1,
                                        borderRadius: '12px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid rgba(30, 30, 44, 0.06)',
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: '#f0f0f0',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                        <Box>
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 16,
                                                    backgroundColor: '#f0f0f0',
                                                    borderRadius: '4px',
                                                    mb: 0.5,
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    height: 12,
                                                    backgroundColor: '#f0f0f0',
                                                    borderRadius: '4px',
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 16,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: '4px',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 24,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: '12px',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Desktop Table */}
                    {!isLoading && !isMobile && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CompactTable ref={tableContainerRef}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Employee</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Contact</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {displayedEmployees.map((emp) => (
                                                <TableRow key={emp.id}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                                                    fontSize: '0.8rem',
                                                                }}
                                                            >
                                                                {emp.username?.charAt(0)?.toUpperCase()}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                                                    {emp.username}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <EmailIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                                                {emp.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PhoneIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                                                {emp.contactNumber}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                            {emp.roles
                                                                .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                                                                .map(role => (
                                                                    <StatusChip
                                                                        key={role}
                                                                        label={role.replace('ROLE_', '')}
                                                                        status={role.replace('ROLE_', '')}
                                                                        size="small"
                                                                    />
                                                                ))}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Delete Employee">
                                                            <IconButton
                                                                onClick={() => handleDelete(emp)}
                                                                sx={{
                                                                    color: '#F29F67',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(242, 159, 103, 0.1)',
                                                                    },
                                                                }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CompactTable>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Mobile Card Layout */}
                    {!isLoading && isMobile && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {displayedEmployees.map(emp => (
                                <EmployeeCard key={emp.id}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                                    }}
                                                >
                                                    {emp.username?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                                    {emp.username}
                                                </Typography>
                                            </Box>
                                            <ActionButton
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDelete(emp)}
                                            >
                                                Delete
                                            </ActionButton>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <EmailIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                                        {emp.email}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <PhoneIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                                        {emp.contactNumber}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <SecurityIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {emp.roles
                                                            .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                                                            .map(role => (
                                                                <StatusChip
                                                                    key={role}
                                                                    label={role.replace('ROLE_', '')}
                                                                    status={role.replace('ROLE_', '')}
                                                                    size="small"
                                                                />
                                                            ))}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </EmployeeCard>
                            ))}
                        </Box>
                    )}

                    {/* Empty State */}
                    {!isLoading && displayedEmployees.length === 0 && (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
                            <Group sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500, mb: 1 }}>
                                No employees found
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center' }}>
                                {searchText ? 'Try adjusting your search criteria.' : 'Add your first employee to get started.'}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </StyledCard>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #F29F67 0%, #e08f5a 100%)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '16px 16px 0 0',
                }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography>
                        Are you sure you want to delete the employee &quot;{deleteTarget?.username}&quot;?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <ActionButton
                        variant="outlined"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        variant="contained"
                        color="error"
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </ActionButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageEmployees; 