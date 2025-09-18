import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useEmployees } from '../../../hooks/employee/useEmployees';
import * as XLSX from 'sheetjs-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Alert, IconButton, Chip, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Card, CardContent,
    Avatar, InputAdornment, Menu, MenuItem
} from '@mui/material';
import {
    Add as AddIcon, Search as SearchIcon, Refresh as RefreshIcon, Delete as DeleteIcon,
    Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Security as SecurityIcon,
    Group, MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageEmployees.css';

const ManageEmployees = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    const { employees, isLoading, isError, refetch, deleteEmployee, isDeleting } = useEmployees();

    const [searchText, setSearchText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [visibleItems, setVisibleItems] = useState(10);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [message, setMessage] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    const tableContainerRef = useRef(null);

    const filteredEmployees = useMemo(() => {
        return employees
            .filter(emp => emp.roles?.some(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role)))
            .filter(emp =>
                emp.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.contactNumber?.includes(searchText)
            );
    }, [searchText, employees]);

    const displayedEmployees = filteredEmployees.slice(0, visibleItems);

    const totalEmployees = filteredEmployees.length;
    const adminCount = filteredEmployees.filter(emp => emp.roles?.some(role => role === 'ROLE_ADMIN')).length;
    const employeeCount = filteredEmployees.filter(emp => emp.roles?.some(role => role === 'ROLE_EMPLOYEE')).length;

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
                setTimeout(() => setShowSuccess(false), 4000);
            },
            onError: (error) => {
                console.error('Delete error:', error);
                setMessage('Failed to delete employee.');
                setShowError(true);
                setShowDeleteModal(false);
                setTimeout(() => setShowError(false), 4000);
            }
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
                .join(', ')
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];

        const headerStyle = {
            fill: { fgColor: { rgb: 'D3D3D3' } },
            font: { bold: true, color: { rgb: '000000' } },
            alignment: { horizontal: 'center' }
        };

        const headerCells = ['A1', 'B1', 'C1', 'D1'];
        headerCells.forEach(cell => {
            if (worksheet[cell]) worksheet[cell].s = headerStyle;
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
        XLSX.writeFile(workbook, `employees_${new Date().toISOString().slice(0, 10)}.xlsx`);

        setMessage('Excel exported successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
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
                .join(', ')
        ]);

        doc.setFontSize(18);
        doc.setTextColor(59, 143, 243); // Use --primary-color if possible in future enhancements
        doc.text('Employee Management Report', 14, 15);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: {
                fillColor: [205, 134, 92], // --primary-color RGB
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 30 }
        });

        doc.save(`employees_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        setMessage('PDF exported successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Employee List</title>
                    <style>
                        body {
                            font-family: var(--font-primary, 'Inter', 'Roboto', sans-serif);
                            margin: 40px;
                            color: var(--primary-text-color, #041f60);
                        }
                        h1 {
                            color: var(--primary-color, #cd865c);
                            margin-bottom: 5px;
                        }
                        p {
                            color: var(--secondary-text-color, #6B7280);
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
                            background-color: var(--primary-color, #cd865c);
                            color: #ffffff;
                            padding: 10px;
                            text-align: left;
                            border-bottom: 2px solid var(--border-color, #e0e0e0);
                        }
                        td {
                            padding: 10px;
                            border-bottom: 1px solid var(--border-color, #e0e0e0);
                        }
                        tr:nth-child(even) {
                            background-color: var(--active-bg, #fafafa);
                        }
                        .print-footer {
                            font-size: 12px;
                            color: var(--secondary-text-color, #777);
                            border-top: 1px solid var(--border-color, #ccc);
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
            <div className={`manage-employees-container ${themeMode}`}>
                <Card className="error-card">
                    <CardContent>
                        <Alert severity="error" className="alert error">
                            Failed to load employees. Please try again.
                        </Alert>
                        <Button
                            variant="contained"
                            onClick={() => refetch()}
                            className="btn primary"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={`manage-employees-container ${themeMode}`}>
            {showSuccess && (
                <Alert
                    severity="success"
                    onClose={() => setShowSuccess(false)}
                    className="alert success"
                >
                    {message}
                </Alert>
            )}

            {showError && (
                <Alert
                    severity="error"
                    onClose={() => setShowError(false)}
                    className="alert error"
                >
                    {message}
                </Alert>
            )}

            <Card className="main-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                            
                            <Box>
                                
                                <Typography variant={isSmallScreen ? 'h6' : 'h4'} className="header-title">
                                    Manage Employees
                                </Typography>
                                <Typography variant="body2" className="header-subtitle">
                                    Manage your team members and their roles
                                </Typography>
                            </Box>
                            <Box mt={2} display="flex" alignItems="center" gap={2}>
                                <Chip
                                    label={`${totalEmployees} employees`}
                                    size="small"
                                    className="chip"
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/admin/employee/add')}
                                    className="btn primary"
                                >
                                    Add Employee
                                </Button>
                            </Box>
                        </Stack>
                        
                    </Box>

                    <Box className="summary-section" mb={3}>
                        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                            <Box className="summary-item">
                                <Group className="summary-icon" />
                                <Typography variant="body2" className="summary-text">
                                    Total: <strong>{totalEmployees}</strong>
                                </Typography>
                            </Box>
                            <Box className="summary-item">
                                <SecurityIcon className="summary-icon" />
                                <Typography variant="body2" className="summary-text">
                                    Admins: <strong>{adminCount}</strong>
                                </Typography>
                            </Box>
                            <Box className="summary-item">
                                <PersonIcon className="summary-icon" />
                                <Typography variant="body2" className="summary-text">
                                    Employees: <strong>{employeeCount}</strong>
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box className="search-actions" mb={3}>
                        <TextField
                            placeholder="Search by username, email, or contact..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="form-input search"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon className="input-icon" />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box className="action-button">
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={refetch}
                                disabled={isLoading}
                                className="btn secondary"
                            >
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </Button>
                            <Button
                                variant="outlined"
                                endIcon={<MoreVertIcon />}
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                className="btn secondary"
                            >
                                Export
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                                PaperProps={{ className: 'export-menu' }}
                            >
                                <MenuItem onClick={() => { exportToExcel(); setAnchorEl(null); }}>Excel</MenuItem>
                                <MenuItem onClick={() => { exportToPDF(); setAnchorEl(null); }}>PDF</MenuItem>
                                <MenuItem onClick={() => { handlePrint(); setAnchorEl(null); }}>Print</MenuItem>
                            </Menu>
                        </Box>
                    </Box>

                    {isLoading && (
                        <Box className="loading-state">
                            <CircularProgress size={40} />
                            <Typography variant="body2" className="loading-text">
                                Loading employees...
                            </Typography>
                        </Box>
                    )}

                    {!isLoading && !isMobile && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TableContainer ref={tableContainerRef} className="table-container">
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
                                                        <Box className="employee-cell">
                                                            <Avatar className="avatar">
                                                                {emp.username?.charAt(0)?.toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="body2" className="employee-name">
                                                                {emp.username}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box className="employee-cell">
                                                            <EmailIcon className="icon" />
                                                            <Typography variant="body2" className="employee-text">
                                                                {emp.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box className="employee-cell">
                                                            <PhoneIcon className="icon" />
                                                            <Typography variant="body2" className="employee-text">
                                                                {emp.contactNumber}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box className="employee-cell">
                                                            {emp.roles
                                                                .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                                                                .map(role => (
                                                                    <Chip
                                                                        key={role}
                                                                        label={role.replace('ROLE_', '')}
                                                                        size="small"
                                                                        className={`chip ${role.replace('ROLE_', '').toLowerCase()}`}
                                                                    />
                                                                ))}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Delete Employee">
                                                            <IconButton
                                                                onClick={() => handleDelete(emp)}
                                                                className="icon-btn delete"
                                                                disabled={isDeleting}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {!isLoading && isMobile && (
                        <Stack spacing={2}>
                            {displayedEmployees.map(emp => (
                                <Card key={emp.id} className="employee-card">
                                    <CardContent>
                                        <Box className="employee-header">
                                            <Box className="employee-cell">
                                                <Avatar className="avatar">
                                                    {emp.username?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                                <Typography variant="h6" className="employee-name">
                                                    {emp.username}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleDelete(emp)}
                                                startIcon={<DeleteIcon />}
                                                className="btn secondary delete"
                                                disabled={isDeleting}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                        <Stack spacing={1}>
                                            <Box className="employee-cell">
                                                <EmailIcon className="icon" />
                                                <Typography variant="body2" className="employee-text">
                                                    {emp.email}
                                                </Typography>
                                            </Box>
                                            <Box className="employee-cell">
                                                <PhoneIcon className="icon" />
                                                <Typography variant="body2" className="employee-text">
                                                    {emp.contactNumber}
                                                </Typography>
                                            </Box>
                                            <Box className="employee-cell">
                                                <SecurityIcon className="icon" />
                                                <Box className="chip-container">
                                                    {emp.roles
                                                        .filter(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role))
                                                        .map(role => (
                                                            <Chip
                                                                key={role}
                                                                label={role.replace('ROLE_', '')}
                                                                size="small"
                                                                className={`chip ${role.replace('ROLE_', '').toLowerCase()}`}
                                                            />
                                                        ))}
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {!isLoading && displayedEmployees.length === 0 && (
                        <Card className="empty-state">
                            <CardContent>
                                <Group className="empty-icon" />
                                <Typography variant="h6" className="empty-title">
                                    No employees found
                                </Typography>
                                <Typography variant="body2" className="empty-text">
                                    {searchText ? 'Try adjusting your search criteria.' : 'Add your first employee to get started.'}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                PaperProps={{ className: 'dialog-paper' }}
            >
                <DialogTitle className="dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" className="dialog-text">
                        Are you sure you want to delete the employee &quot;{deleteTarget?.username}&quot;?
                    </Typography>
                    <Typography variant="body2" className="dialog-subtext">
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions className="dialog-actions">
                    <Button
                        variant="outlined"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="btn secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                        className="btn error"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManageEmployees;