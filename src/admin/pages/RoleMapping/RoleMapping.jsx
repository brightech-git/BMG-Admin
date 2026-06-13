import React, { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2, User, Shield, Save, Trash2, Search,
    RefreshCw, CheckCircle2, XCircle, AlertCircle,
    Users, Loader2,Edit
} from 'lucide-react';
import { MyContext } from '../../context/themeContext/themeContext';
import { useRoleMapping } from '../../hooks/RoleMapping/useRoleMapping';
import { useRoleMaster } from '../../hooks/RoleMaster/useRoleMaster';
import { useUsers } from '../../hooks/userMaster/useUsers';
import { useEmployees } from '../../hooks/employee/useEmployees';
import ComboBox from '../../components/ui/ComboBoxField';
import AdvancedTable from '../../components/table/ResponsiveTable';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const RoleMapping = () => {
    const { themeMode } = useContext(MyContext);
    const isDark = themeMode === 'dark';

    // ── Data hooks ────────────────────────────────────────────────────────────
    const { createRoleMapping, updateRoleMapping, deleteRoleMapping, getRoleMappings } = useRoleMapping();
    const { getRoles } = useRoleMaster();
    const { getAll : employees, getLoading: usersLoading } = useEmployees();


    const { data: mappings = [], isLoading, isError, refetch } = getRoleMappings;
    const { mutate: saveMapping, isPending: isSaving, isError: saveError, error: saveErr } = createRoleMapping;
    const { mutate: doUpdate, isPending: isUpdating } = updateRoleMapping;
    const { mutate: doDelete, isPending: isDeleting } = deleteRoleMapping;

    // ── UI state ──────────────────────────────────────────────────────────────
    const initialForm = { userId: '', roleId: '' };
    const [formData, setFormData] = useState(initialForm);
    const [editId, setEditId] = useState(null);

    console.log(editId,'editId')

    const [errors, setErrors] = useState({});
    const [searchText, setSearchText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState(null);

    // ── ComboBox options ──────────────────────────────────────────────────────
    const userOptions = useMemo(
        () => (Array.isArray(employees?.data) ? employees?.data : []).map(u => ({ value: String(u.id), label: u.name })),
        [employees]
    );

    const roleOptions = useMemo(() => {
        const roles = Array.isArray(getRoles.data) ? getRoles.data : (getRoles.data?.data ?? []);
        return roles.map(r => ({ value: String(r.roleid ?? r.id), label: r.rolename ?? r.roleName }));
    }, [getRoles.data]);

    const selectedUserLabel = userOptions.find(o => o.value === formData.userId)?.label ?? '';
    const selectedRoleLabel = roleOptions.find(o => o.value === formData.roleId)?.label ?? '';

    // ── Filtered table data ───────────────────────────────────────────────────
    const filteredMappings = useMemo(() => {
        if (!searchText.trim()) return mappings;
        const q = searchText.toLowerCase();
        return mappings.filter(m =>
            m.userName?.toLowerCase().includes(q) ||
            m.roleName?.toLowerCase().includes(q)
        );
    }, [mappings, searchText]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditId(null);
        setErrors({});
    };

    const validate = () => {
        const e = {};
        if (!formData.userId) e.userId = 'User is required';
        if (!formData.roleId) e.roleId = 'Role is required';

        const isDuplicate = mappings.some((map) => Number(map.userId) === Number(formData.userId) && Number(formData.userId) !== Number(editId));
     

        if (isDuplicate) e.userId = "User Already Mapped";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = () => {
        if (!validate()) return;


        if (editId) {
            doUpdate({ id: editId, data: formData }, {
                onSuccess: () => { resetForm(); showToast('success', 'Role mapping updated!'); },
                onError: () => showToast('error', 'Failed to update mapping.'),
            });
        } else {
            saveMapping(formData, {
                onSuccess: () => { resetForm(); showToast('success', 'Role mapping saved!'); },
                onError: () => showToast('error', 'Failed to save mapping.'),
            });
        }
    };

    const handleEdit = (mapping) => {
        setFormData({
            userId: String(mapping.userId ?? mapping.id ?? ''),
            roleId: String(mapping.roleId ?? ''),
        });
        setEditId(mapping.id);
        setErrors({});
    };

    const handleDeleteClick = (mapping) => {
        setDeleteTarget(mapping);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        doDelete(deleteTarget.id, {
            onSuccess: () => {
                showToast('success', 'Mapping deleted.');
                setShowDeleteModal(false);
                setDeleteTarget(null);
            },
            onError: () => {
                showToast('error', 'Failed to delete mapping.');
                setShowDeleteModal(false);
            },
        });
    };

    const isBusy = isSaving || isUpdating;

    const headers = [
        { key: 'userName', label: 'User', sortable: true },
        { key: 'roleName', label: 'Role', sortable: true },
        { key: 'ACTIONS', label: 'Actions', sortable: false },
    ];

    // ── Error state ───────────────────────────────────────────────────────────
    if (isError) {
        return (
            <div className={`p-4 ${isDark ? 'bg-gray-950' : 'bg-orange-50'}`}>
                <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2 text-red-500 mb-3">
                        <Users className="w-6 h-6" />
                        <h3 className="text-lg font-semibold">Error loading mappings</h3>
                    </div>
                    <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Failed to load role mappings. Please try again.
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

    return (
        <div className={`flex flex-col lg:flex-row ${isDark ? 'bg-gray-950' : 'bg-orange-50'}`}>

            {/* ── Left: form ─────────────────────────────────────────────────── */}
            <div className="flex items-start justify-center p-2 w-full lg:w-[35%]">
                <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

                    {/* Card header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 sm:p-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-xl p-2 flex items-center justify-center">
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-white font-semibold text-lg leading-tight">
                                    {editId ? 'Edit Mapping' : 'Map Role'}
                                </h1>
                                <p className="text-orange-100 text-xs mt-0.5">
                                    {editId ? 'Update an existing role mapping' : 'Assign a role to a user'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form body */}
                    <div className="p-3 sm:p-4 flex flex-col gap-4">

                        {saveError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {saveErr?.message || 'Failed to save mapping'}
                            </div>
                        )}

                        {/* User */}
                        <ComboBox
                            label="User"
                            field="userId"
                            value={formData.userId}
                            displayValue={selectedUserLabel}
                            onChange={handleChange}
                            options={userOptions}
                            placeholder="Search user..."
                            required
                            isDark={isDark}
                            error={errors.userId}
                            loading={usersLoading}
                            icon={<User className="w-4 h-4" />}
                            maxVisible={2}
                            disabled={editId}
                        />

                        {/* Role */}
                        <ComboBox
                            label="Role"
                            field="roleId"
                            value={formData.roleId}
                            displayValue={selectedRoleLabel}
                            onChange={handleChange}
                            options={roleOptions}
                            placeholder="Search role..."
                            required
                            isDark={isDark}
                            error={errors.roleId}
                            loading={getRoles.isLoading}
                            icon={<Shield className="w-4 h-4" />}
                        />

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-1">
                            {editId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={isBusy}
                                    className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border border-orange-500 text-orange-500 bg-transparent hover:bg-orange-50 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isBusy}
                                className="flex-1 py-2 px-4 text-sm font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                            >
                                {isBusy ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {editId ? 'Update' : 'Save'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right: table ───────────────────────────────────────────────── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full lg:w-[65%] p-2"
            >
                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="fixed top-4 right-4 z-[9999]"
                        >
                            <div className={`border-l-4 p-2 rounded-lg shadow-lg flex items-center gap-2 m-0
                                ${toast.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
                            >
                                {toast.type === 'success'
                                    ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 m-0" />
                                    : <XCircle className="h-5 w-5 text-red-500 shrink-0 m-0" />
                                }
                                <p className={`text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'} m-0`}>
                                    {toast.msg}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table card */}
                <motion.div
                    variants={itemVariants}
                    className={`rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                >
                    <div className="p-2 md:p-3">

                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Role Mappings
                                </h1>
                                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    User–role assignments
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-auto
                                ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                                {filteredMappings.length} mappings
                            </span>
                        </div>

                        {/* Search + Refresh */}
                        <motion.div variants={itemVariants} className="flex gap-3 mb-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user or role..."
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none transition-all
                                        focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                                        ${isDark
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                        }`}
                                />
                            </div>
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
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </motion.button>
                        </motion.div>

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-14">
                                <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                                <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading mappings...
                                </p>
                            </div>
                        )}

                        {/* Table */}
                        {!isLoading && (
                            <AdvancedTable
                                headers={headers}
                                data={filteredMappings}
                                isLoading={isLoading}
                                onRetry={refetch}
                                rowText="text-sm"
                                renderCell={(key, row) => {
                                  
                                   
                                    if (key === "ACTIONS") {
                                        return (
                                            <div className="flex gap-2 items-center justify-center">
                                                <button
                                                    onClick={() => handleEdit(row)}
                                                    title="Edit"
                                                    className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(row)}
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

                        {/* Empty */}
                        {!isLoading && filteredMappings.length === 0 && (
                            <div className="text-center py-14">
                                <Users className={`mx-auto w-12 h-12 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                                <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    No mappings found
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {searchText ? 'Try adjusting your search.' : 'Create the first role mapping on the left.'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Delete modal */}
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
                                <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </div>
                                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            Confirm deletion
                                        </h3>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Delete mapping for{' '}
                                        <span className="font-semibold text-orange-500">"{deleteTarget?.userName}"</span>?
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                        className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50
                                            ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
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

export default RoleMapping;
