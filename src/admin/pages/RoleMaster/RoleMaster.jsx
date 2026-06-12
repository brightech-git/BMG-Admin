import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleMaster } from '../../hooks/RoleMaster/useRoleMaster';
import * as XLSX from 'sheetjs-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { MyContext } from '../../context/themeContext/themeContext';
import AdvancedTable from '../../components/table/ResponsiveTable';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/Select';


// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IconPlus = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const IconSearch = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
);
const IconRefresh = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);
const IconTrash = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const IconUsers = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const IconUser = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconShield = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);
const IconDownload = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const IconPrinter = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);
const IconChevronDown = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const IconCheck = ({ className }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const IconXCircle = ({ className }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const ManageRoleMaster = () => {


    const { themeMode } = useContext(MyContext);

    const { createRole, updateRole, deleteRole, getRoles } = useRoleMaster();
    const navigate = useNavigate();

    const {
        data: Roles,
        isLoading,
        isError,
        refetch,
    } = getRoles;

    const {
        mutate: createEmployee,
        isPending: createUserLoading,
        isError: createUserError,
        error,
        isSuccess,
    } = createRole;

    const {
        mutate: updateRoleById , 
        isPending : updateRoleLoading ,
        isError : updateRoleError ,
        isSuccess : updateRoleSuccess 
    }=updateRole;

    const {
        mutate: deleteEmployee,
        isPending: isDeleting,
    } = deleteRole;

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

    const isDark = themeMode === 'dark';

    const filteredRoles = useMemo(() => {
        let filtered = Roles?.data || []
            // .filter(emp => emp.roles?.some(role => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(role)))
            .filter(emp =>
                emp.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.contactNumber?.includes(searchText)
            );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = sortConfig.key === 'roles' ? a.roles?.join(',') : a[sortConfig.key];
                let bVal = sortConfig.key === 'roles' ? b.roles?.join(',') : b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [searchText, Roles, sortConfig]);

    const displayedRoles = filteredRoles.slice(0, visibleItems);

    console.log(displayedRoles,'displayedRoles');

    const totalRoles = filteredRoles.length;
    const adminCount = filteredRoles.filter(emp => emp.roles?.some(r => r === 'ROLE_ADMIN')).length;
    const employeeCount = filteredRoles.filter(emp => emp.roles?.some(r => r === 'ROLE_EMPLOYEE')).length;

    useEffect(() => {
        const el = tableContainerRef.current;
        if (!el) return;
        const onScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            if (scrollTop + clientHeight >= scrollHeight - 50)
                setVisibleItems(prev => Math.min(prev + 10, filteredRoles.length));
        };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [filteredRoles.length]);

    useEffect(() => {
        const handler = (e) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target))
                setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({ rolename: role.rolename, active: role.active });
        setErrors({});
    };

    const handleCancelEdit = () => {
        setEditingRole(null);
        setFormData(initialForm);
        setErrors({});
    };

    const handleDelete = (employee) => {
        setDeleteId(employee.roleid);
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
            onError: (err) => {
                console.error('Delete error:', err);
                setMessage('Failed to delete employee.');
                setShowError(true);
                setShowDeleteModal(false);
                setTimeout(() => setShowError(false), 4000);
            }
        });
    };

    const handleSort = (key) => {
        setSortConfig(cur => ({
            key,
            direction: cur.key === key && cur.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportToExcel = () => {
        const data = filteredRoles.map(emp => ({
            Username: emp.username,
            Email: emp.email,
            'Contact Number': emp.contactNumber,
            Roles: emp.roles
                .filter(r => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(r))
                .map(r => r.replace('ROLE_', ''))
                .join(', ')
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];
        const headerStyle = {
            fill: { fgColor: { rgb: 'D3D3D3' } },
            font: { bold: true, color: { rgb: '000000' } },
            alignment: { horizontal: 'center' }
        };
        ['A1', 'B1', 'C1', 'D1'].forEach(cell => {
            if (worksheet[cell]) worksheet[cell].s = headerStyle;
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Roles');
        XLSX.writeFile(workbook, `Roles_${new Date().toISOString().slice(0, 10)}.xlsx`);
        setMessage('Excel exported successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
        setShowExportMenu(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableRows = filteredRoles.map(emp => [
            emp.username,
            emp.email,
            emp.contactNumber,
            emp.roles.filter(r => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(r))
                .map(r => r.replace('ROLE_', '')).join(', ')
        ]);
        doc.setFontSize(18);
        doc.setTextColor(59, 143, 243);
        doc.text('Employee Management Report', 14, 15);
        autoTable(doc, {
            head: [['Username', 'Email', 'Contact', 'Roles']],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { top: 30 }
        });
        doc.save(`Roles_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        setMessage('PDF exported successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
        setShowExportMenu(false);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Employee List</title>
            <style>
                body { font-family: sans-serif; margin: 40px; color: #111; }
                h1 { color: #f97316; margin-bottom: 5px; }
                p { color: #6B7280; font-size: 14px; margin-top: 0; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
                th { background-color: #f97316; color: #fff; padding: 10px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
                tr:nth-child(even) { background-color: #fafafa; }
                .footer { font-size: 12px; color: #777; border-top: 1px solid #ccc; padding-top: 10px; text-align: right; }
            </style></head><body>
            <h1>Employee List</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <table>
                <thead><tr><th>Username</th><th>Email</th><th>Contact</th><th>Roles</th></tr></thead>
                <tbody>
                    ${filteredRoles.map(emp => `
                        <tr>
                            <td>${emp.username}</td>
                            <td>${emp.email}</td>
                            <td>${emp.contactNumber}</td>
                            <td>${emp.roles.filter(r => ['ROLE_EMPLOYEE', 'ROLE_ADMIN'].includes(r)).map(r => r.replace('ROLE_', '')).join(', ')}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
            <div class="footer">Total Roles: ${filteredRoles.length}</div>
            </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setShowExportMenu(false);
    };
    const initialForm = {
        rolename: '',
        active: 'Y',
        // adminAccess: '',

    }
    const [formData, setFormData] = useState(initialForm);
    const [editingRole, setEditingRole] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.rolename.trim()) {
            newErrors.rolename = 'rolename is required';
        } else if (formData.rolename.length < 3) {
            newErrors.rolename = 'Role must be at least 3 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const activeOptions = [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (editingRole) {
            updateRoleById({ id: editingRole.roleid, data: formData }, {
                onSuccess: () => {
                    setMessage('Role updated successfully!');
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 4000);
                    setEditingRole(null);
                    setFormData(initialForm);
                },
                onError: (err) => {
                    console.error('Update role error:', err);
                    setMessage('Failed to update role.');
                    setShowError(true);
                    setTimeout(() => setShowError(false), 4000);
                }
            });
        } else {
            createEmployee(formData, {
                onSuccess: () => {
                    setFormData(initialForm);
                },
                onError: (err) => {
                    console.error('Create employee error:', err);
                }
            });
        }
    };


    const headers = [
        { key: 'rolename', label: 'Role Name', sortable: true },
        { key: 'active', label: 'Active', sortable: true },
        { key: 'ACTIONS', label: 'Actions'},
    ];

    // ── Error state ────────────────────────────────────────────────────────────
    if (isError) {
        return (
            <div className={`p-2 md:p-4  ${isDark ? 'bg-gray-950' : 'bg-orange-50'}`}>
                <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2 text-red-500 mb-3">
                        <IconUsers className="w-6 h-6" />
                        <h3 className="text-lg font-semibold">Error loading Roles</h3>
                    </div>
                    <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Failed to load Roles. Please try again.
                    </p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── Main ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row  bg-orange-50">
            <div className={`flex items-center justify-center p-2 w-full lg:w-[35%] `}>
                <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-1 sm:p-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-xl p-2 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-white font-semibold text-lg leading-tight">
                                    {editingRole ? 'Edit Role' : 'Add Role'}
                                </h1>
                                <p className="text-orange-100 text-xs mt-0.5">
                                    {editingRole ? `Editing: ${editingRole.rolename}` : 'Create a new role for the admin panel'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-2 sm:p-4 flex flex-col gap-4">

                        {/* Error Alert */}
                        {createUserError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error?.message || 'Failed to create employee'}
                            </div>
                        )}

                        {/* Success Alert */}
                        {isSuccess && (
                            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Role created successfully!
                            </div>
                        )}

                        {/* Role Name */}
                        <InputField
                            label="Role Name"
                            field="rolename"
                            value={formData.rolename}
                            onChange={handleInputChange}
                            placeholder="Enter role name"
                            required
                            isDark={isDark}
                            error={errors.rolename}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            }
                        />

                        {/* Active */}
                        <SelectField
                            label="Active"
                            field="active"
                            value={formData.active}
                            onChange={handleInputChange}
                            options={activeOptions}
                            placeholder="Select status"
                            isDark={isDark}
                            error={errors.active}
                            icon={true}
                        />

                       
                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={editingRole ? handleCancelEdit : undefined}
                                disabled={createUserLoading || updateRoleLoading}
                                className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border border-orange-500 text-orange-500 bg-transparent hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={createUserLoading || updateRoleLoading}
                                className="flex-1 py-2 px-4 text-sm font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {(createUserLoading || updateRoleLoading) ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        {editingRole ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        {editingRole ? 'Update Role' : 'Add Role'}
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={` w-full lg:w-[65%]  p-2`}
            >
                {/* Toast alerts */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="fixed top-4 right-4 z-[9999]"
                        >
                            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-lg flex items-center gap-2" >
                                <IconCheck className="h-5 w-5 text-green-500 shrink-0 m-0" />
                                <p className="text-sm text-green-700 m-0">{message}</p>
                            </div>
                        </motion.div>
                    )}
                    {showError && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="fixed top-4 right-4 z-[9999]"
                        >
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg shadow-lg flex items-center gap-2">
                                <IconXCircle className="h-5 w-5 text-red-500 shrink-0 m-0" />
                                <p className="text-sm text-red-700 m-0">{message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Card */}
                <motion.div
                    variants={itemVariants}
                    className={`rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                >
                    <div className="p-2 md:p-3">

                        {/* ── Top header ── */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                            <div>
                                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Manage Users
                                </h1>
                                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Manage your members
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                                    {totalRoles} Roles
                                </span>
                             
                            </div>
                        </div>


                        {/* ── Search + actions ── */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-2">
                            <div className="relative flex-1">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by username, email, or contact..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none transition-all
                                    focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                                    ${isDark
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                        }`}
                                />
                            </div>

                            <div className="flex gap-2">
                                {/* Refresh */}
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={refetch}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50
                                    ${isDark
                                            ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Refreshing...' : 'Refresh'}
                                </motion.button>

                                {/* Export dropdown */}
                                <div className="relative" ref={exportMenuRef}>
                                    <motion.button
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => setShowExportMenu(v => !v)}
                                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors
                                        ${isDark
                                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <IconDownload className="w-4 h-4" />
                                        Export
                                        <IconChevronDown className="w-3.5 h-3.5" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {showExportMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                className={`absolute right-0 mt-2 w-44 rounded-lg shadow-lg border z-20 overflow-hidden
                                                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                            >
                                                {[
                                                    { label: 'Excel', onClick: exportToExcel, icon: null },
                                                    { label: 'PDF', onClick: exportToPDF, icon: null },
                                                    { label: 'Print', onClick: handlePrint, icon: <IconPrinter className="w-4 h-4" /> },
                                                ].map(({ label, onClick, icon }) => (
                                                    <button
                                                        key={label}
                                                        onClick={onClick}
                                                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors
                                                        ${isDark
                                                                ? 'text-gray-300 hover:bg-gray-700'
                                                                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                                                            }`}
                                                    >
                                                        {icon}
                                                        {label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Loading spinner ── */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-14">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
                                <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading Roles...
                                </p>
                            </div>
                        )}

                        {/* ── Table ── */}
                        {!isLoading && (
                            <AdvancedTable
                                headers={headers}
                                data={displayedRoles}
                                isLoading={isLoading}
                                onRetry={refetch}
                                rowText="text-sm"
                                renderCell={(key, row) => {
                                    if (key === "rolename") {
                                        return (
                                            <span className="font-medium">
                                                {row.rolename}
                                            </span>
                                        );
                                    }

                                    if (key === "active") {
                                        return row.active === "Y" ? (
                                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        );
                                    }

                                    if (key === "ACTIONS") {
                                        return (
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    onClick={() => handleEdit(row)}
                                                    title="Edit"
                                                    className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row)}
                                                    title="Delete"
                                                    className="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        );
                                    }

                                    return row[key];
                                }}
                            />
                        )}

                       
                    </div>
                </motion.div>

                {/* ── Delete modal ── */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                                className={`w-full max-w-md rounded-xl shadow-xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal header */}
                                <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <IconTrash className="w-4 h-4 text-red-600" />
                                        </div>
                                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            Confirm deletion
                                        </h3>
                                    </div>
                                </div>

                                {/* Modal body */}
                                <div className="px-6 py-4">
                                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Are you sure you want to delete{' '}
                                        <span className="font-semibold text-orange-500">"{deleteTarget?.rolename}"</span>?
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        This action cannot be undone.
                                    </p>
                                </div>

                                {/* Modal footer */}
                                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                        className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50
                                        ${isDark
                                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <IconTrash className="w-4 h-4" />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

        </div>

    );
};

export default ManageRoleMaster;