import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useEmployees } from '../../../hooks/employee/useEmployees';
import * as XLSX from 'sheetjs-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { MyContext } from '../../../context/themeContext/themeContext';
import {
    FiPlus, FiSearch, FiRefreshCw, FiTrash2, FiUser, FiMail, FiPhone,
    FiShield, FiUsers, FiMoreVertical, FiDownload, FiPrinter
} from 'react-icons/fi';
import AdvancedTable from '../../../components/table/ResponsiveTable';

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
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

    const exportMenuRef = useRef(null);
    const tableContainerRef = useRef(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const filteredEmployees = useMemo(() => {
        let filtered = employees
            .filter(emp => emp.roles?.some(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role)))
            .filter(emp =>
                emp.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.contactNumber?.includes(searchText)
            );

        // Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'roles') {
                    aVal = a.roles?.join(',');
                    bVal = b.roles?.join(',');
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [searchText, employees, sortConfig]);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
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
        setShowExportMenu(false);
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
        doc.setTextColor(59, 143, 243);
        doc.text('Employee Management Report', 14, 15);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: {
                fillColor: [205, 134, 92],
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
        setShowExportMenu(false);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Employee List</title>
                    <style>
                        body {
                            font-family: 'Inter', 'Roboto', sans-serif;
                            margin: 40px;
                            color: #041f60;
                        }
                        h1 {
                            color: #cd865c;
                            margin-bottom: 5px;
                        }
                        p {
                            color: #6B7280;
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
                            background-color: #cd865c;
                            color: #ffffff;
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
        setShowExportMenu(false);
    };

    const SortIcon = ({ direction }) => (
        <span className="ml-1 inline-block">
            {direction === 'asc' ? '↑' : '↓'}
        </span>
    );

  
      const   headers=[
            { key: 'username', label: 'Username', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'contactNumber', label: 'Contact', sortable: true },
            { key: 'roles', label: 'Roles', sortable: true },
            { key: 'actions', label: 'Actions', sortable: false }
        ]
     

    if (isError) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 md:p-6 lg:p-8 mt-5 ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
            >
                <div className={`rounded-xl shadow-sm border ${themeMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-6">
                        <div className="flex items-center space-x-2 text-red-600 mb-4">
                            <FiUsers className="text-2xl" />
                            <h3 className="text-lg font-semibold">Error Loading Employees</h3>
                        </div>
                        <p className={`mb-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Failed to load employees. Please try again.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-[#cd865c] text-white rounded-lg hover:bg-[#b6744d] transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#cd865c] focus:ring-offset-2"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={` p-4 md:p-6 lg:p-8 mt-3 ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
        >
            {/* Alert Messages */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{message}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{message}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                variants={itemVariants}
                className={`rounded-xl shadow-sm border `}
            >
                <div className="p-2">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h1 className={`text-lg font-bold `}>
                                Manage Employees
                            </h1>
                            <p className={`text-sm `}>
                                Manage your team members and their roles
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold`}>
                                {totalEmployees} employees
                            </span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/admin/employee/add')}
                                className="px-2 py-1.5 bg-[#cd865c] text-white rounded-lg text-xs hover:bg-[#b6744d] transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#cd865c] focus:ring-offset-2"
                            >
                                <FiPlus className="text-sm" />
                                Add Employee
                            </motion.button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <motion.div
                        variants={itemVariants}
                        className={`grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 p-3 rounded-lg border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <FiUsers className={`text-xl ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Total: <strong className={themeMode === 'dark' ? 'text-white' : 'text-gray-900'}>{totalEmployees}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiShield className={`text-xl ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Admins: <strong className="text-[#cd865c]">{adminCount}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiUser className={`text-xl ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Employees: <strong className="text-[#cd865c]">{employeeCount}</strong>
                            </span>
                        </div>
                    </motion.div>

                    {/* Search and Actions */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-3 mb-3"
                    >
                        <div className="flex-1 relative">
                            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search by username, email, or contact..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#cd865c] transition-all ${themeMode === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                            />
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={refetch}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${themeMode === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <FiRefreshCw className={`text-lg ${isLoading ? 'animate-spin' : ''}`} />
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </motion.button>

                            {/* Export Dropdown */}
                            <div className="relative" ref={exportMenuRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${themeMode === 'dark'
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiDownload className="text-lg" />
                                    Export
                                    <FiMoreVertical className="text-lg" />
                                </motion.button>

                                <AnimatePresence>
                                    {showExportMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden z-10 ${themeMode === 'dark'
                                                    ? 'bg-gray-800 border-gray-700'
                                                    : 'bg-white border-gray-200'
                                                }`}
                                        >
                                            <button
                                                onClick={exportToExcel}
                                                className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${themeMode === 'dark'
                                                        ? 'text-gray-300 hover:bg-gray-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Excel
                                            </button>
                                            <button
                                                onClick={exportToPDF}
                                                className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${themeMode === 'dark'
                                                        ? 'text-gray-300 hover:bg-gray-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                PDF
                                            </button>
                                            <button
                                                onClick={handlePrint}
                                                className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${themeMode === 'dark'
                                                        ? 'text-gray-300 hover:bg-gray-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <FiPrinter className="text-lg" />
                                                Print
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Loading State */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cd865c]"></div>
                            <p className={`mt-4 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Loading employees...
                            </p>
                        </motion.div>
                    )}

                    {/* Table */}
                    {!isLoading && 
                    <AdvancedTable 
                    headers={headers}
                    data={displayedEmployees}
                    isLoading={isLoading}
                    onRetry={refetch}
                    rowText='text-sm'
                 

                    />}

                    {/* Empty State */}
                    {!isLoading && displayedEmployees.length === 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="text-center py-12"
                        >
                            <FiUsers className={`mx-auto text-5xl mb-4 ${themeMode === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                            <h3 className={`text-lg font-semibold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                No employees found
                            </h3>
                            <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {searchText ? 'Try adjusting your search criteria.' : 'Add your first employee to get started.'}
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`max-w-md w-full rounded-lg shadow-xl overflow-hidden ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                                }`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={`p-6 border-b ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Confirm Deletion
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className={`mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Are you sure you want to delete the employee "{deleteTarget?.username}"?
                                </p>
                                <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className={`p-6 border-t flex justify-end gap-3 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className={`px-4 py-2 rounded-lg border transition-all ${themeMode === 'dark'
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FiTrash2 />
                                            Delete
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManageEmployees;