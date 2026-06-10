import React, { useState, useMemo, useEffect } from 'react';
import ComboBox from '../../components/ui/ComboBoxField';
import { useRoleMaster } from '../../hooks/RoleMaster/useRoleMaster';
import { useContents } from '../../hooks/RolePermission/useRolePermission';
import { useRoleTransaction } from '../../hooks/RoleTransaction/useRoleTransaction';
import { MENU_CONFIG } from '../../components/slide/menuConfig';
import {
    ShieldCheck, ChevronDown, ChevronRight, Loader2, Plus, Save,
    CheckCircle2, XCircle, X, Trash2, ClipboardList, AlertCircle,
    Layers, LayoutGrid,
} from 'lucide-react';

// ── All leaf pages from MENU_CONFIG ─────────────────────────────────────────
const ALL_PAGES = MENU_CONFIG.flatMap((parent) => {
    const collect = (nodes) =>
        nodes.flatMap((node) =>
            node.children
                ? collect(node.children)
                : node.path
                    ? [{ value: node.id, label: node.title, path: node.path }]
                    : []
        );
    return collect(parent.children ?? []);
}).concat(
    MENU_CONFIG.filter((m) => !m.children && m.path).map((m) => ({
        value: m.id, label: m.title, path: m.path,
    }))
);

// ── Build tree from backend content records ──────────────────────────────────
function buildTree(records) {
    const modules = {};
    for (const rec of records) {
        const modKey = rec.moduleName || rec.moduleId || 'Unknown';
        if (!modules[modKey]) modules[modKey] = { name: modKey, subs: {}, direct: [] };

        const pages = (rec.contentIds ?? []).map((pid) => {
            const opt = ALL_PAGES.find((o) => o.value === pid);
            return { id: pid, label: opt?.label ?? pid };
        });

        if (rec.subModuleName) {
            if (!modules[modKey].subs[rec.subModuleName]) modules[modKey].subs[rec.subModuleName] = [];
            modules[modKey].subs[rec.subModuleName].push(...pages);
        } else {
            modules[modKey].direct.push(...pages);
        }
    }
    return Object.values(modules);
}

// ── Tiny Badge ───────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'blue' }) => {
    const map = {
        blue:   'bg-blue-50 text-blue-600 border border-blue-100',
        green:  'bg-green-50 text-green-600 border border-green-100',
        orange: 'bg-orange-50 text-orange-600 border border-orange-100',
        gray:   'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return (
        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>
            {children}
        </span>
    );
};

// ── Indeterminate checkbox helper ─────────────────────────────────────────────
const IndeterminateCheckbox = ({ checked, indeterminate, onChange, className }) => (
    <input
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = indeterminate; }}
        onChange={onChange}
        className={`w-4 h-4 accent-orange-600 shrink-0 ${className ?? ''}`}
    />
);

// ── Permission Tree ───────────────────────────────────────────────────────────
const PermissionTree = ({ records, selected, onChange, disabled }) => {
    const [openMods, setOpenMods] = useState({});
    const [openSubs, setOpenSubs] = useState({});
    const tree = useMemo(() => buildTree(records), [records]);

    const getModLeaves  = (mod)   => [...mod.direct.map((p) => p.id), ...Object.values(mod.subs).flat().map((p) => p.id)];
    const getSubLeaves  = (pages) => pages.map((p) => p.id);
    const allIn         = (ids)   => ids.length > 0 && ids.every((id) => selected.includes(id));
    const someIn        = (ids)   => ids.some((id) => selected.includes(id));

    const toggleLeaf = (id) => {
        if (disabled) return;
        onChange(selected.includes(id) ? selected.filter((i) => i !== id) : [...selected, id]);
    };

    const toggleGroup = (ids) => {
        if (disabled) return;
        if (allIn(ids)) onChange(selected.filter((id) => !ids.includes(id)));
        else            onChange([...new Set([...selected, ...ids])]);
    };

    if (tree.length === 0) {
        return (
            <div className="py-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-200" />
                <p className="text-xs text-gray-400">No content records found.</p>
                <p className="text-xs text-gray-300">Add content via Role Permission first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            {tree.map((mod) => {
                const modLeaves = getModLeaves(mod);
                const modChecked = allIn(modLeaves);
                const modIndet  = !modChecked && someIn(modLeaves);
                const isOpen    = !!openMods[mod.name];

                return (
                    <div key={mod.name}>
                        {/* Module row */}
                        <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-white transition-colors">
                            <IndeterminateCheckbox
                                checked={modChecked}
                                indeterminate={modIndet}
                                onChange={() => toggleGroup(modLeaves)}
                                className={disabled ? 'opacity-50' : ''}
                            />
                            <button
                                type="button"
                                onClick={() => setOpenMods((p) => ({ ...p, [mod.name]: !p[mod.name] }))}
                                className="flex items-center gap-1 flex-1 text-left min-w-0"
                            >
                                <span className="text-gray-400 shrink-0">
                                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </span>
                                <span className="shrink-0">
                                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                                <span className="text-sm font-semibold text-gray-700 truncate">{mod.name}</span>
                            </button>
                        </div>

                        {/* Module children */}
                        {isOpen && (
                            <div className="pl-5 space-y-0.5">
                                {/* Direct leaf pages */}
                                {mod.direct.map((page) => (
                                    <div key={page.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-white transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(page.id)}
                                            onChange={() => toggleLeaf(page.id)}
                                            disabled={disabled}
                                            className="w-4 h-4 accent-orange-600 shrink-0"
                                        />
                                        <span className="text-sm text-gray-600 truncate">{page.label}</span>
                                    </div>
                                ))}

                                {/* Sub-module groups */}
                                {Object.entries(mod.subs).map(([subName, pages]) => {
                                    const subKey    = `${mod.name}::${subName}`;
                                    const subLeaves = getSubLeaves(pages);
                                    const subChecked = allIn(subLeaves);
                                    const subIndet   = !subChecked && someIn(subLeaves);
                                    const isSubOpen  = !!openSubs[subKey];

                                    return (
                                        <div key={subName}>
                                            <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-white transition-colors">
                                                <IndeterminateCheckbox
                                                    checked={subChecked}
                                                    indeterminate={subIndet}
                                                    onChange={() => toggleGroup(subLeaves)}
                                                    className={disabled ? 'opacity-50' : ''}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenSubs((p) => ({ ...p, [subKey]: !p[subKey] }))}
                                                    className="flex items-center gap-1 flex-1 text-left min-w-0"
                                                >
                                                    <span className="text-gray-400 shrink-0">
                                                        {isSubOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </span>
                                                    <span className="shrink-0">
                                                        <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-600 truncate">{subName}</span>
                                                </button>
                                            </div>

                                            {isSubOpen && (
                                                <div className="pl-5 space-y-0.5">
                                                    {pages.map((page) => (
                                                        <div key={page.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-white transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(page.id)}
                                                                onChange={() => toggleLeaf(page.id)}
                                                                disabled={disabled}
                                                                className="w-4 h-4 accent-orange-600 shrink-0"
                                                            />
                                                            <span className="text-sm text-gray-600 truncate">{page.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onDismiss }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [toast, onDismiss]);

    if (!toast) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {toast.type === 'success'
                ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                : <XCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const RoleTransactionPage = () => {
    const { getRoles }                  = useRoleMaster();
    const { getAll: getContents }       = useContents();
    const { create, getAll: getTxns }   = useRoleTransaction();

    const [form, setForm] = useState({
        roleId: '', roleName: '', isActive: true, selectedPermissions: [],
    });
    const [staged, setStaged]       = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast]         = useState(null);

    const roleOptions = useMemo(() => {
        const roles = getRoles.data ?? [];
        return roles.map((r) => ({
            value: r.id ?? r.roleId,
            label: r.roleName ?? r.name ?? r.role ?? String(r.id),
        }));
    }, [getRoles.data]);

    const contentRecords = getContents.data  ?? [];
    const txnCount       = getTxns.data?.length ?? 0;
    const canAddRow      = form.roleId && form.selectedPermissions.length > 0;

    const handleRoleChange = (field, val, opt) =>
        setForm((p) => ({ ...p, roleId: val, roleName: opt?.label ?? '' }));

    const handlePermissionsChange = (newSel) =>
        setForm((p) => ({ ...p, selectedPermissions: newSel }));

    const handleAddRows = () => {
        if (!canAddRow) return;
        setStaged((p) => [...p, { ...form, _stageId: Date.now() }]);
        setForm((p) => ({ ...p, selectedPermissions: [] }));
    };

    const handleRemove = (stageId) =>
        setStaged((p) => p.filter((r) => r._stageId !== stageId));

    const handleSaveAll = async () => {
        if (staged.length === 0) return;
        setSubmitting(true);
        try {
            await Promise.all(
                staged.map((row) =>
                    create.mutateAsync({
                        roleId:      row.roleId,
                        roleName:    row.roleName,
                        isActive:    row.isActive,
                        permissions: row.selectedPermissions,
                    })
                )
            );
            setToast({ type: 'success', msg: `${staged.length} transaction(s) saved successfully.` });
            setStaged([]);
        } catch (e) {
            setToast({ type: 'error', msg: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-2 ">
            <Toast toast={toast} onDismiss={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-3">
                {/* Page header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                  
                        <div>
                            <h1 className="text-base font-bold text-gray-900 m-0">Role Transaction</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Assign permissions to roles</p>
                        </div>
                    </div>
                    <Badge color="blue">{txnCount} Saved</Badge>
                </div>

                <div className="flex gap-3 items-start">
                    {/* ── Left: New Transaction form ────────────────────────── */}
                    <div className="w-72 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-color)]">
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span className="text-sm font-semibold text-white">New Transaction</span>
                        </div>

                        <div className="p-3 space-y-3">
                            {/* Role combobox */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Role <span className="text-orange-500">*</span>
                                </label>
                                <ComboBox
                                    field="roleId"
                                    value={form.roleId}
                                    displayValue={form.roleName}
                                    onChange={handleRoleChange}
                                    options={roleOptions}
                                    placeholder="Select role..."
                                    loading={getRoles.isLoading}
                                    required
                                />
                            </div>

                            {/* Active Permission toggle */}
                            <label className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors select-none
                                ${form.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                                    className="w-4 h-4 accent-green-600 shrink-0"
                                />
                                <span className={`text-sm font-semibold ${form.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                                    Active Permission
                                </span>
                            </label>

                            {/* Permissions tree */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Permissions
                                    {form.selectedPermissions.length > 0 && (
                                        <span className="ml-1.5 normal-case font-semibold text-orange-500">
                                            ({form.selectedPermissions.length} selected)
                                        </span>
                                    )}
                                </label>

                                {getContents.isLoading ? (
                                    <div className="py-10 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 max-h-80 overflow-y-auto">
                                        <PermissionTree
                                            records={contentRecords}
                                            selected={form.selectedPermissions}
                                            onChange={handlePermissionsChange}
                                            disabled={false}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Add Row(s) button */}
                            <button
                                type="button"
                                onClick={handleAddRows}
                                disabled={!canAddRow}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-full
                                           bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold
                                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Row(s)
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Staged Transactions ────────────────────────── */}
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-700">Staged Transactions</span>
                                <Badge color={staged.length > 0 ? 'orange' : 'gray'}>{staged.length}</Badge>
                            </div>
                            {staged.length > 0 && (
                                <button
                                    onClick={handleSaveAll}
                                    disabled={submitting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700
                                               text-white text-xs font-semibold rounded-lg disabled:opacity-60 transition-colors"
                                >
                                    {submitting
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Save className="w-3.5 h-3.5" />}
                                    Save All
                                </button>
                            )}
                        </div>

                        {staged.length === 0 ? (
                            <div className="py-20 text-center space-y-2">
                                <AlertCircle className="w-10 h-10 mx-auto text-gray-200" />
                                <p className="text-sm text-gray-400">No rows added yet</p>
                                <p className="text-xs text-gray-300">
                                    Select a role and permissions, then click "Add Row(s)"
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            {['#', 'Role', 'Status', 'Permissions', ''].map((h) => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {staged.map((row, i) => (
                                            <tr key={row._stageId} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-800">{row.roleName}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full
                                                        ${row.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                                                        {row.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {row.selectedPermissions.slice(0, 4).map((pid) => {
                                                            const opt = ALL_PAGES.find((o) => o.value === pid);
                                                            return (
                                                                <span key={pid}
                                                                    className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                                                                    {opt?.label ?? pid}
                                                                </span>
                                                            );
                                                        })}
                                                        {row.selectedPermissions.length > 4 && (
                                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                                +{row.selectedPermissions.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => handleRemove(row._stageId)}
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleTransactionPage;
