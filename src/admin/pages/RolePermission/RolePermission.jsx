import React, { useState, useMemo, useEffect } from 'react';
import { MENU_CONFIG } from '../../components/slide/menuConfig';
import ComboBox from '../../components/ui/ComboBoxField';
import Checkbox from '../../components/ui/CheckBox';
import { useModules, useSubModules, useContents, useRolePermissionView } from '../../hooks/RolePermission/useRolePermission';
import {
    Layers, LayoutGrid, FileText, Eye, Trash2, Pencil, Plus, Save, X,
    CheckCircle2, XCircle, ChevronDown, ChevronRight, Loader2
} from 'lucide-react';

// ── Static option sources ────────────────────────────────────────────────────

const moduleOptions = MENU_CONFIG.map((m) => ({ value: m.id, label: m.title }));

const subModuleOptions = MENU_CONFIG.flatMap((parent) =>
    (parent.children ?? [])
        .filter((c) => c.children && c.children.length > 0)
        .map((c) => ({ value: c.id, label: c.title, parentId: parent.id }))
);

const contentOptions = MENU_CONFIG.flatMap((parent) => {
    const collect = (nodes) =>
        nodes.flatMap((node) =>
            node.children
                ? collect(node.children)
                : node.path
                    ? [{ value: node.id, label: node.title, path: node.path, moduleId: parent.id }]
                    : []
        );
    return collect(parent.children ?? []);
}).concat(
    MENU_CONFIG.filter((m) => !m.children && m.path).map((m) => ({
        value: m.id, label: m.title, path: m.path, moduleId: m.id,
    }))
);

// ── Tiny shared components ───────────────────────────────────────────────────

const Badge = ({ children, color = 'blue' }) => {
    const map = {
        blue:   'bg-blue-50 text-blue-600 border border-blue-100',
        green:  'bg-green-50 text-green-600 border border-green-100',
        orange: 'bg-orange-50 text-orange-600 border border-orange-100',
        purple: 'bg-purple-50 text-purple-600 border border-purple-100',
        gray:   'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{children}</span>;
};

const StatusBadge = ({ active = true }) => (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-400'}`} />
        {active ? 'Active' : 'Inactive'}
    </span>
);

const ActionCell = ({ onEdit, onDelete }) => (
    <div className="flex items-center gap-1.5">
        <button onClick={onEdit}   className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg bg-red-50  text-red-500  hover:bg-red-100  transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
);

const Toast = ({ toast, onDismiss }) => {
    if (!toast) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
    );
};

const DeleteModal = ({ open, onConfirm, onCancel, loading }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Delete Record</p>
                        <p className="text-xs text-gray-400">This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel}  className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60">
                        {loading ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FormPanel = ({ title, children, onSubmit, onCancel, submitLabel = 'Create', loading = false, editMode = false }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm ">
        <div className="p-2 border-b border-gray-100 m-0 bg-[var(--primary-color)] ">
            <p className="text-sm font-semibold text-white m-0 items-center">{title}</p>
        </div>
        <div className="p-2 space-y-2">
            {children}
            <div className="flex gap-2 px-2">
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800
                               text-white text-sm font-semibold  py-1.5 rounded-full transition-colors disabled:opacity-60"
                >
                    {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : editMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {submitLabel}
                </button>
                {editMode && (
                    <button onClick={onCancel} className="px-4 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    </div>
);

const CrudTable = ({ title, count, countColor = 'blue', isLoading, columns, rows, emptyText }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            <Badge color={countColor}>{count} records</Badge>
        </div>
        {isLoading ? (
            <div className="py-16 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            {columns.map((col) => (
                                <th key={col.key} className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 ${col.className ?? ''}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => (
                            <tr key={row.id ?? i} className="hover:bg-gray-50/60 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.key} className={`px-5 py-3 ${col.className ?? ''}`}>
                                        {col.render ? col.render(row, i) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr><td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-gray-400">{emptyText ?? 'No records found.'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

// ── useTabState — shared state helpers per tab ────────────────────────────────
const useTabState = () => {
    const [editId, setEditId]   = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast]     = useState(null);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);
    return { editId, setEditId, deleteId, setDeleteId, toast, setToast };
};

// ── Tier 1 — Module ──────────────────────────────────────────────────────────
const Tier1Tab = () => {
    const { getAll, create, update, delete: del } = useModules();
    const { editId, setEditId, deleteId, setDeleteId, toast, setToast } = useTabState();
    const [form, setForm] = useState({ moduleId: '', moduleName: '' });

    const handleChange = (field, val, opt) =>
        setForm({ moduleId: val, moduleName: opt?.label ?? '' });

    const reset = () => { setForm({ moduleId: '', moduleName: '' }); setEditId(null); };

    const handleSubmit = () => {
        if (!form.moduleId) return;
        const cbs = {
            onSuccess: () => { setToast({ type: 'success', msg: editId ? 'Module updated.' : 'Module created.' }); reset(); },
            onError:   (e) => setToast({ type: 'error', msg: e.message }),
        };
        editId
            ? update.mutate({ id: editId, data: form }, cbs)
            : create.mutate(form, cbs);
    };

    const handleEdit = (row) => { setForm({ moduleId: row.moduleId, moduleName: row.moduleName }); setEditId(row.id); };

    const handleDelete = () =>
        del.mutate(deleteId, {
            onSuccess: () => { setToast({ type: 'success', msg: 'Module deleted.' }); setDeleteId(null); },
            onError:   (e) => { setToast({ type: 'error', msg: e.message }); setDeleteId(null); },
        });

    const rows = getAll.data ?? [];

    const columns = [
        { key: '#',          label: '#',          render: (_, i) => <span className="text-gray-400 font-medium">{i + 1}</span> },
        { key: 'moduleName', label: 'Module Name', render: (r) => <span className="font-semibold text-gray-800">{r.moduleName}</span> },
        { key: 'status',     label: 'Status',      render: () => <StatusBadge active /> },
        { key: 'actions',    label: 'Actions',     render: (r) => <ActionCell onEdit={() => handleEdit(r)} onDelete={() => setDeleteId(r.id)} /> },
    ];

    return (
        <>
            <Toast toast={toast} onDismiss={() => setToast(null)} />
            <DeleteModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={del.isPending} />
            <div className="flex gap-2">
                <div className="w-72 shrink-0">
                    <FormPanel
                        title={editId ? 'Edit Module' : 'New Module'}
                        onSubmit={handleSubmit}
                        onCancel={reset}
                        submitLabel={editId ? 'Update Module' : 'Create Module'}
                        loading={create.isPending || update.isPending}
                        editMode={!!editId}
                    >
                        <ComboBox
                            label="Module"
                            field="moduleId"
                            value={form.moduleId}
                            displayValue={form.moduleName}
                            onChange={handleChange}
                            options={moduleOptions}
                            placeholder="Search module…"
                            icon={<Layers className="w-4 h-4" />}
                            required
                            maxVisible={2}
                            
                        />
                    </FormPanel>
                </div>
                <div className="flex-1 min-w-0">
                    <CrudTable title="All Modules" count={rows.length} isLoading={getAll.isLoading} columns={columns} rows={rows} emptyText="No modules added yet." />
                </div>
            </div>
        </>
    );
};

// ── Tier 2 — Sub Module ──────────────────────────────────────────────────────
const Tier2Tab = () => {
    const { getAll, create, update, delete: del } = useSubModules();
    const { editId, setEditId, deleteId, setDeleteId, toast, setToast } = useTabState();
    const [form, setForm] = useState({ parentModuleId: '', parentModuleName: '', subModuleId: '', subModuleName: '' });

    const filteredSubOptions = useMemo(
        () => subModuleOptions.filter((o) => !form.parentModuleId || o.parentId === form.parentModuleId),
        [form.parentModuleId]
    );

    const handleChange = (field, val, opt) => {
        if (field === 'parentModuleId') {
            setForm({ parentModuleId: val, parentModuleName: opt?.label ?? '', subModuleId: '', subModuleName: '' });
        } else {
            setForm((p) => ({ ...p, subModuleId: val, subModuleName: opt?.label ?? '' }));
        }
    };

    const reset = () => { setForm({ parentModuleId: '', parentModuleName: '', subModuleId: '', subModuleName: '' }); setEditId(null); };

    const handleSubmit = () => {
        if (!form.parentModuleId || !form.subModuleId) return;
        const cbs = {
            onSuccess: () => { setToast({ type: 'success', msg: editId ? 'Sub module updated.' : 'Sub module created.' }); reset(); },
            onError:   (e) => setToast({ type: 'error', msg: e.message }),
        };
        editId
            ? update.mutate({ id: editId, data: form }, cbs)
            : create.mutate(form, cbs);
    };

    const handleEdit = (row) => {
        setForm({ parentModuleId: row.parentModuleId, parentModuleName: row.parentModuleName, subModuleId: row.subModuleId, subModuleName: row.subModuleName });
        setEditId(row.id);
    };

    const handleDelete = () =>
        del.mutate(deleteId, {
            onSuccess: () => { setToast({ type: 'success', msg: 'Sub module deleted.' }); setDeleteId(null); },
            onError:   (e) => { setToast({ type: 'error', msg: e.message }); setDeleteId(null); },
        });

    const rows = getAll.data ?? [];

    const columns = [
        { key: '#',             label: '#',            render: (_, i) => <span className="text-gray-400 font-medium">{i + 1}</span> },
        { key: 'subModuleName', label: 'Sub Module',   render: (r) => <span className="font-semibold text-gray-800">{r.subModuleName}</span> },
        { key: 'parentModuleName', label: 'Parent',    render: (r) => <Badge color="purple">{r.parentModuleName}</Badge> },
        { key: 'status',        label: 'Status',       render: () => <StatusBadge active /> },
        { key: 'actions',       label: 'Actions',      render: (r) => <ActionCell onEdit={() => handleEdit(r)} onDelete={() => setDeleteId(r.id)} /> },
    ];

    return (
        <>
            <Toast toast={toast} onDismiss={() => setToast(null)} />
            <DeleteModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={del.isPending} />
            <div className="flex gap-2">
                <div className="w-72 shrink-0">
                    <FormPanel
                        title={editId ? 'Edit Sub Module' : 'New Sub Module'}
                        onSubmit={handleSubmit}
                        onCancel={reset}
                        submitLabel={editId ? 'Update Sub Module' : 'Create Sub Module'}
                        loading={create.isPending || update.isPending}
                        editMode={!!editId}
                    >
                        <ComboBox
                            label="Parent Module"
                            field="parentModuleId"
                            value={form.parentModuleId}
                            displayValue={form.parentModuleName}
                            onChange={handleChange}
                            options={moduleOptions}
                            placeholder="Search module…"
                            icon={<Layers className="w-4 h-4" />}
                            required
                        />
                        <ComboBox
                            label="Sub Module"
                            field="subModuleId"
                            value={form.subModuleId}
                            displayValue={form.subModuleName}
                            onChange={handleChange}
                            options={filteredSubOptions}
                            placeholder="Search sub module…"
                            icon={<LayoutGrid className="w-4 h-4" />}
                            disabled={!form.parentModuleId}
                            required
                        />
                    </FormPanel>
                </div>
                <div className="flex-1 min-w-0">
                    <CrudTable title="All Sub Modules" count={rows.length} countColor="purple" isLoading={getAll.isLoading} columns={columns} rows={rows} emptyText="No sub modules added yet." />
                </div>
            </div>
        </>
    );
};

// ── Tier 3 — Content ─────────────────────────────────────────────────────────
const Tier3Tab = () => {
    const { getAll, create, update, delete: del } = useContents();
    const { editId, setEditId, deleteId, setDeleteId, toast, setToast } = useTabState();

    const [form, setForm] = useState({
        moduleId: '',
        moduleName: '',
        subModuleId: '',
        subModuleName: '',
        contentIds: [],   // selected page ids
    });

    // ── Derived options ───────────────────────────────────────────────────────

    // Tier-1 modules as combobox options
    const moduleOptions = useMemo(
        () => MENU_CONFIG.map((m) => ({ label: m.title, value: m.id })),
        []
    );

    // Sub-modules (children that have their own children) for the selected module
    const subModuleOptions = useMemo(() => {
        if (!form.moduleId) return [];
        const parent = MENU_CONFIG.find((m) => m.id === form.moduleId);
        if (!parent?.children) return [];
        return parent.children
            .filter((c) => c.children && c.children.length > 0)
            .map((c) => ({ label: c.title, value: c.id }));
    }, [form.moduleId]);

    const hasSubModules = subModuleOptions.length > 0;

    // Leaf pages available based on selection
    // — if module has sub-modules → show leaves of selected sub-module
    // — if module has no sub-modules → show direct leaves of the module
    const pageOptions = useMemo(() => {
        if (!form.moduleId) return [];
        const parent = MENU_CONFIG.find((m) => m.id === form.moduleId);
        if (!parent) return [];

        if (hasSubModules) {
            if (!form.subModuleId) return [];
            const sub = parent.children.find((c) => c.id === form.subModuleId);
            return (sub?.children ?? [])
                .filter((leaf) => leaf.path)
                .map((leaf) => ({ label: leaf.title, value: leaf.id, path: leaf.path }));
        }

        // No sub-modules — return direct leaf children
        return (parent.children ?? [])
            .filter((leaf) => leaf.path)
            .map((leaf) => ({ label: leaf.title, value: leaf.id, path: leaf.path }));
    }, [form.moduleId, form.subModuleId, hasSubModules]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleModuleChange = (field, val, opt) => {
        setForm({
            moduleId: val,
            moduleName: opt?.label ?? '',
            subModuleId: '',
            subModuleName: '',
            contentIds: [],
        });
    };

    const handleSubModuleChange = (field, val, opt) => {
        setForm((p) => ({
            ...p,
            subModuleId: val,
            subModuleName: opt?.label ?? '',
            contentIds: [],
        }));
    };

    // Checkbox onChange gives back the full new selectedValues array
    const handleContentChange = (newSelected) => {
        setForm((p) => ({ ...p, contentIds: newSelected }));
    };

    const reset = () => {
        setForm({ moduleId: '', moduleName: '', subModuleId: '', subModuleName: '', contentIds: [] });
        setEditId(null);
    };

    const handleSubmit = () => {
        if (!form.moduleId || form.contentIds.length === 0) return;
        const payload = { ...form };
        const cbs = {
            onSuccess: () => {
                setToast({ type: 'success', msg: editId ? 'Content updated.' : 'Content created.' });
                reset();
            },
            onError: (e) => setToast({ type: 'error', msg: e.message }),
        };
        editId
            ? update.mutate({ id: editId, data: payload }, cbs)
            : create.mutate(payload, cbs);
    };

    const handleEdit = (row) => {
        setForm({
            moduleId: row.moduleId,
            moduleName: row.moduleName,
            subModuleId: row.subModuleId ?? '',
            subModuleName: row.subModuleName ?? '',
            contentIds: row.contentIds ?? [],
        });
        setEditId(row.id);
    };

    const handleDelete = () =>
        del.mutate(deleteId, {
            onSuccess: () => { setToast({ type: 'success', msg: 'Content deleted.' }); setDeleteId(null); },
            onError: (e) => { setToast({ type: 'error', msg: e.message }); setDeleteId(null); },
        });

    const rows = getAll.data ?? [];

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns = [
        {
            key: '#',
            label: '#',
            render: (_, i) => <span className="text-gray-400 font-medium">{i + 1}</span>,
        },
        {
            key: 'moduleName',
            label: 'Module',
            render: (r) => <Badge color="blue">{r.moduleName}</Badge>,
        },
        {
            key: 'subModuleName',
            label: 'Sub Module',
            render: (r) =>
                r.subModuleName
                    ? <Badge color="purple">{r.subModuleName}</Badge>
                    : <span className="text-xs text-gray-400">—</span>,
        },
        {
            key: 'contentIds',
            label: 'Contents',
            render: (r) => (
                <div className="flex flex-wrap gap-1">
                    {(r.contentIds ?? []).map((id) => {
                        const opt = pageOptions.find((o) => o.value === id);
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600
                                           border border-orange-100 px-2 py-0.5 rounded-full font-medium"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                {opt?.label ?? id}
                            </span>
                        );
                    })}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: () => <StatusBadge active />,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
                <ActionCell onEdit={() => handleEdit(r)} onDelete={() => setDeleteId(r.id)} />
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Toast toast={toast} onDismiss={() => setToast(null)} />
            <DeleteModal
                open={!!deleteId}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                loading={del.isPending}
            />

            <div className="flex gap-2">
                {/* ── Form panel ──────────────────────────────────────────── */}
                <div className="w-72 shrink-0">
                    <FormPanel
                        title={editId ? 'Edit Content' : 'New Content'}
                        onSubmit={handleSubmit}
                        onCancel={reset}
                        submitLabel={editId ? 'Update Content' : 'Create Content'}
                        loading={create.isPending || update.isPending}
                        editMode={!!editId}
                    >
                        {/* Step 1 — Module */}
                        <ComboBox
                            label="Module"
                            field="moduleId"
                            value={form.moduleId}
                            displayValue={form.moduleName}
                            onChange={handleModuleChange}
                            options={moduleOptions}
                            placeholder="Search module…"
                            icon={<Layers className="w-4 h-4" />}
                            required
                        />

                        {/* Step 2 — Sub Module (only if the selected module has sub-modules) */}
                        {form.moduleId && hasSubModules && (
                            <ComboBox
                                label="Sub Module"
                                field="subModuleId"
                                value={form.subModuleId}
                                displayValue={form.subModuleName}
                                onChange={handleSubModuleChange}
                                options={subModuleOptions}
                                placeholder="Search sub module…"
                                // icon={<SubModuleIcon className="w-4 h-4" />}
                                required
                            />
                        )}

                        {/* Step 3 — Pages via Checkbox
                            Show when:
                            - module has no sub-modules → show immediately after module pick
                            - module has sub-modules    → show only after sub-module is picked  */}
                        {pageOptions.length > 0 && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Pages
                                    <span className="text-orange-500 ml-0.5">*</span>
                                    {form.contentIds.length > 0 && (
                                        <span className="ml-1.5 normal-case font-semibold text-orange-500">
                                            ({form.contentIds.length} selected)
                                        </span>
                                    )}
                                </label>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 max-h-56 overflow-y-auto">
                                    <Checkbox
                                        options={pageOptions}
                                        selectedValues={form.contentIds}
                                        onChange={handleContentChange}
                                        multiple={true}
                                        layout="vertical"
                                        disabled={create.isPending || update.isPending}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Hint when module is picked but has sub-modules and none selected yet */}
                        {form.moduleId && hasSubModules && !form.subModuleId && (
                            <p className="text-xs text-gray-400 italic">
                                Select a sub module to see available pages.
                            </p>
                        )}

                        {/* Hint when module picked, no sub-modules, and no pages exist */}
                        {form.moduleId && !hasSubModules && pageOptions.length === 0 && (
                            <p className="text-xs text-gray-400 italic">
                                No pages found for this module.
                            </p>
                        )}
                    </FormPanel>
                </div>

                {/* ── Table ───────────────────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    <CrudTable
                        title="All Contents"
                        count={rows.length}
                        countColor="orange"
                        isLoading={getAll.isLoading}
                        columns={columns}
                        rows={rows}
                        emptyText="No content added yet."
                    />
                </div>
            </div>
        </>
    );
};

// ── View Tab ─────────────────────────────────────────────────────────────────
const ViewTab = () => {
    const viewQuery = useRolePermissionView();
    const [expandedModules, setExpandedModules] = useState({ [MENU_CONFIG[0]?.id]: true });
    const [expandedSubMods, setExpandedSubMods] = useState({});

    const toggleModule = (id) => setExpandedModules((p) => ({ ...p, [id]: !p[id] }));
    const toggleSub    = (id) => setExpandedSubMods((p) => ({ ...p, [id]: !p[id] }));

    const countLeaves = (nodes) => {
        let n = 0;
        for (const node of nodes) {
            if (node.children) n += countLeaves(node.children);
            else if (node.path) n += 1;
        }
        return n;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
                <div>
                    <p className="text-sm font-semibold text-gray-800">Module Hierarchy</p>
                    <p className="text-xs text-gray-400 mt-0.5">Expand modules to explore contents</p>
                </div>
                <div className="flex items-center gap-2">
                    {viewQuery.isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    <Badge color="orange">{MENU_CONFIG.length} Modules</Badge>
                </div>
            </div>

            {MENU_CONFIG.map((module) => {
                const isOpen    = !!expandedModules[module.id];
                const hasChildren = (module.children ?? []).length > 0;
                const leafCount = countLeaves(module.children ?? (module.path ? [module] : []));

                return (
                    <div key={module.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
                        >
                            <span className="shrink-0 w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base">
                                {module.icon ?? <Layers className="w-4 h-4" />}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="text-sm font-bold text-gray-800">{module.title}</span>
                                    {leafCount > 0 && <Badge color="orange">{leafCount} Contents</Badge>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{hasChildren ? 'Click to expand' : 'Direct page link'}</p>
                            </div>
                            <span className="shrink-0 text-gray-400">
                                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                        </button>

                        {isOpen && hasChildren && (
                            <div className="border-t border-gray-100 bg-gray-50/40 p-4 space-y-2">
                                {(module.children ?? []).map((child) => {
                                    const hasSubs   = child.children && child.children.length > 0;
                                    const isSubOpen = !!expandedSubMods[child.id];
                                    return (
                                        <div key={child.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => hasSubs && toggleSub(child.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${hasSubs ? 'hover:bg-green-50/40 cursor-pointer' : 'cursor-default'}`}
                                            >
                                                <span className="shrink-0 w-7 h-7 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                                                    <LayoutGrid className="w-3.5 h-3.5" />
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-semibold text-gray-700">{child.title}</span>
                                                    {!hasSubs && child.path && (
                                                        <code className="text-xs text-gray-400 font-mono ml-2">{child.path}</code>
                                                    )}
                                                </div>
                                                {hasSubs && (
                                                    <span className="text-gray-400">
                                                        {isSubOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </span>
                                                )}
                                            </button>

                                            {isSubOpen && hasSubs && (
                                                <div className="border-t border-gray-50 bg-gray-50/60 px-4 py-3">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {child.children.map((leaf) => (
                                                            <div key={leaf.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-100">
                                                                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                                                <span className="text-xs font-medium text-gray-700 truncate">{leaf.title}</span>
                                                                <FileText className="w-3.5 h-3.5 shrink-0 ml-auto text-gray-300" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {isOpen && !hasChildren && module.path && (
                            <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/40 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-purple-400" />
                                <code className="text-xs font-mono text-gray-500">{module.path}</code>
                                <StatusBadge active />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
    { id: 'tier1', label: 'Module',     icon: <Layers className="w-4 h-4" />,     component: Tier1Tab },
    { id: 'tier2', label: 'Sub Module', icon: <LayoutGrid className="w-4 h-4" />, component: Tier2Tab },
    { id: 'tier3', label: 'Content',    icon: <FileText className="w-4 h-4" />,   component: Tier3Tab },
    { id: 'view',  label: 'View',       icon: <Eye className="w-4 h-4" />,        component: ViewTab  },
];

const TAB_ACTIVE_STYLE = {
    tier1: 'bg-blue-600   text-white shadow-md shadow-blue-200',
    tier2: 'bg-purple-600 text-white shadow-md shadow-purple-200',
    tier3: 'bg-orange-500 text-white shadow-md shadow-orange-200',
    view:  'bg-green-600  text-white shadow-md shadow-green-200',
};

// ── Main page ────────────────────────────────────────────────────────────────
const RoleTransactionPage = () => {
    const [activeTab, setActiveTab] = useState('tier1');
    const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component ?? Tier1Tab;

    return (
        <div className="bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="w-1 h-12 rounded-full bg-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Role Permission</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Manage Modules, Sub Modules &amp; Contents</p>
                        </div>
                    </div>
                    <Badge color="blue">{MENU_CONFIG.length} Modules</Badge>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex gap-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                                            text-sm font-semibold transition-all duration-150
                                            ${isActive ? TAB_ACTIVE_STYLE[tab.id] : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                            >
                                <span className={isActive ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <ActiveComponent />
            </div>
        </div>
    );
};

export default RoleTransactionPage;
