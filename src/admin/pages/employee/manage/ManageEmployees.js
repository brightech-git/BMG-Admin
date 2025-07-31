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
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== ENHANCED STYLED COMPONENTS ==========
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    maxHeight: '60vh',
    overflow: 'auto',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
        '& .MuiTableCell-head': {
            color: '#FFFFFF !important',
            fontWeight: 700,
            fontSize: '0.95rem',
            textAlign: 'center',
            padding: '16px',
            borderBottom: 'none',
        },
    },
    '& .MuiTableCell-body': {
        padding: '16px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
        fontSize: '0.9rem',
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: 'rgba(59, 143, 243, 0.04)',
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

const SearchField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: '1rem',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
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
        background: 'linear-gradient(135deg, #3B8FF3 0%, #2a7bd9 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #2a7bd9 0%, #1e5fb8 100%)',
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
    const { employees, isLoading, refetch, deleteEmployee, isDeleting } = useEmployees();
    
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

            <ModernCard>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    {/* Header Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', md: 'center' },
                        mb: 4,
                        gap: 2
                    }}>
                        <Box>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: '#1E1E2C', 
                                    fontWeight: 700,
                                    mb: 1
                                }}
                            >
                                Manage Employees
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#6B7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 20 }} />
                                {filteredEmployees.length} employees
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/admin/employee/add')}
                                sx={{ minWidth: '140px' }}
                            >
                                Add Employee
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
                                            '&:last-of-type': { borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' },
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
                                            '&:first-of-type': { borderTopLeftRadius: '12px', borderTopRightRadius: '12px' },
                                            '&:last-of-type': { borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' },
                                        }}
                                    >
                                        Print
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Search and Refresh */}
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
                        <ActionButton
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={refetch}
                            disabled={isLoading}
                            sx={{ minWidth: '120px' }}
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </ActionButton>
                    </Box>

                    {/* Desktop Table */}
                    {!isMobile && (
                        <StyledTableContainer ref={tableContainerRef}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Contact Number</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayedEmployees.map(emp => (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <PersonIcon sx={{ color: '#3B8FF3', fontSize: 20 }} />
                                                    <Typography sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                                        {emp.username}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <EmailIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
                                                        {emp.email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <PhoneIcon sx={{ color: '#6B7280', fontSize: 16 }} />
                                                    <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
                                                        {emp.contactNumber}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    {emp.roles
                                                        .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                                                        .map(role => (
                                                            <Chip
                                                                key={role}
                                                                label={role.replace('ROLE_', '')}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: role === 'ROLE_ADMIN' 
                                                                        ? 'rgba(59, 143, 243, 0.1)' 
                                                                        : 'rgba(242, 159, 103, 0.1)',
                                                                    color: role === 'ROLE_ADMIN' ? '#3B8FF3' : '#F29F67',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            />
                                                        ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
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
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
                    )}

                    {/* Mobile Card Layout */}
                    {isMobile && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {displayedEmployees.map(emp => (
                                <EmployeeCard key={emp.id}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon sx={{ color: '#3B8FF3', fontSize: 24 }} />
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
                                                                <Chip
                                                                    key={role}
                                                                    label={role.replace('ROLE_', '')}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: role === 'ROLE_ADMIN' 
                                                                            ? 'rgba(59, 143, 243, 0.1)' 
                                                                            : 'rgba(242, 159, 103, 0.1)',
                                                                        color: role === 'ROLE_ADMIN' ? '#3B8FF3' : '#F29F67',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                    }}
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

                    {/* Loading State */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {/* No Data State */}
                    {!isLoading && displayedEmployees.length === 0 && (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            color: '#6B7280'
                        }}>
                            <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                No employees found
                            </Typography>
                            <Typography variant="body2">
                                {searchText ? 'Try adjusting your search criteria.' : 'Add your first employee to get started.'}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </ModernCard>

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