import React, { useState, useMemo, useEffect } from 'react';
import ComboBox from '../../components/ui/ComboBoxField';
import { useRoleMaster } from '../../hooks/RoleMaster/useRoleMaster';
import { useRolePermissionView } from '../../hooks/RolePermission/useRolePermission';
import { useRoleTransaction } from '../../hooks/RoleTransaction/useRoleTransaction';
import AdvancedTable from '../../components/table/ResponsiveTable';
import {
    ShieldCheck, ChevronDown, ChevronRight, Loader2, Plus, Save,
    CheckCircle2, XCircle, X, Trash2, ClipboardList, AlertCircle, Eye,
} from 'lucide-react';

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
const PermissionTree = ({ records = [], selected = [], onChange, disabled = false }) => {
    const [expandedModules, setExpandedModules] = useState({});
    const [expandedSubs, setExpandedSubs] = useState({});

    const toggleModule = (id) => setExpandedModules((p) => ({ ...p, [id]: !p[id] }));
    const toggleSub = (id) => setExpandedSubs((p) => ({ ...p, [id]: !p[id] }));

    const toggle = (id) => {
        if (disabled) return;
        onChange(
            selected.includes(id)
                ? selected.filter((x) => x !== id)
                : [...selected, id]
        );
    };

    // Collect all leaf ids under a node list
    const collectIds = (items) =>
        (items ?? []).flatMap((item) =>
            item.moduleContent
                ? collectIds(item.moduleContent)
                : [item.id]
        );

    // Select/deselect all leaves under a module or submodule
    const toggleGroup = (leafIds) => {
        if (disabled) return;
        const allSelected = leafIds.every((id) => selected.includes(id));
        if (allSelected) {
            onChange(selected.filter((id) => !leafIds.includes(id)));
        } else {
            onChange([...new Set([...selected, ...leafIds])]);
        }
    };

    if (records.length === 0) {
        return (
            <div className="py-6 text-center text-xs text-gray-400">No permissions available</div>
        );
    }

    return (
        <div className="space-y-1">
            {records.map((module) => {
                const hasSubMods = (module.subModulel ?? []).length > 0;
                const hasContent = (module.moduleContent ?? []).length > 0;
                const hasChildren = hasSubMods || hasContent;
                const isOpen = !!expandedModules[module.id];

                // All leaf ids for this module (for group select)
                const allLeafIds = [
                    ...(module.moduleContent ?? []).map((c) => c.id),
                    ...(module.subModulel ?? []).flatMap((s) =>
                        (s.moduleContent ?? []).map((c) => c.id)
                    ),
                ];
                const allChecked = allLeafIds.length > 0 && allLeafIds.every((id) => selected.includes(id));
                const someChecked = allLeafIds.some((id) => selected.includes(id));

                return (
                    <div key={module.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        {/* Module row */}
                        <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-100/60">
                            {/* Group checkbox */}
                            {allLeafIds.length > 0 && (
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    ref={(el) => el && (el.indeterminate = someChecked && !allChecked)}
                                    onChange={() => toggleGroup(allLeafIds)}
                                    disabled={disabled}
                                    className="w-3.5 h-3.5 accent-orange-500 shrink-0 cursor-pointer"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => hasChildren && toggleModule(module.id)}
                                className="flex-1 flex items-center gap-1.5 text-left min-w-0"
                            >
                                <span className="text-xs font-bold text-gray-700 capitalize truncate">
                                    {module.name.replace(/-/g, ' ')}
                                </span>
                                {allLeafIds.length > 0 && (
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                        ({allLeafIds.filter((id) => selected.includes(id)).length}/{allLeafIds.length})
                                    </span>
                                )}
                                {hasChildren && (
                                    <span className="ml-auto shrink-0 text-gray-400">
                                        {isOpen
                                            ? <ChevronDown className="w-3 h-3" />
                                            : <ChevronRight className="w-3 h-3" />}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Expanded contents */}
                        {isOpen && (
                            <div className="px-2 py-1.5 space-y-1 bg-white">

                                {/* Sub-modules */}
                                {(module.subModulel ?? []).map((sub) => {
                                    const subLeafIds = (sub.moduleContent ?? []).map((c) => c.id);
                                    const subAllChecked = subLeafIds.length > 0 && subLeafIds.every((id) => selected.includes(id));
                                    const subSomeChecked = subLeafIds.some((id) => selected.includes(id));
                                    const isSubOpen = !!expandedSubs[sub.id];

                                    return (
                                        <div key={sub.id} className="rounded-md border border-gray-100 overflow-hidden">
                                            {/* Sub-module row */}
                                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-green-50/50">
                                                <input
                                                    type="checkbox"
                                                    checked={subAllChecked}
                                                    ref={(el) => el && (el.indeterminate = subSomeChecked && !subAllChecked)}
                                                    onChange={() => toggleGroup(subLeafIds)}
                                                    disabled={disabled}
                                                    className="w-3.5 h-3.5 accent-green-600 shrink-0 cursor-pointer"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSub(sub.id)}
                                                    className="flex-1 flex items-center gap-1.5 text-left min-w-0"
                                                >
                                                    <span className="text-xs font-semibold text-gray-600 capitalize truncate">
                                                        {sub.name.replace(/-/g, ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 shrink-0">
                                                        ({subLeafIds.filter((id) => selected.includes(id)).length}/{subLeafIds.length})
                                                    </span>
                                                    <span className="ml-auto shrink-0 text-gray-400">
                                                        {isSubOpen
                                                            ? <ChevronDown className="w-3 h-3" />
                                                            : <ChevronRight className="w-3 h-3" />}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Sub-module leaves */}
                                            {isSubOpen && (
                                                <div className="px-2.5 py-1.5 grid grid-cols-1 gap-0.5">
                                                    {(sub.moduleContent ?? []).map((leaf) => (
                                                        <label
                                                            key={leaf.id}
                                                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
                                                                ${selected.includes(leaf.id) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(leaf.id)}
                                                                onChange={() => toggle(leaf.id)}
                                                                disabled={disabled}
                                                                className="w-3.5 h-3.5 accent-orange-500 shrink-0"
                                                            />
                                                            <span className="text-xs text-gray-700 capitalize truncate">
                                                                {leaf.name.replace(/-/g, ' ')}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Direct module content (no sub-module) */}
                                {(module.moduleContent ?? []).map((leaf) => (
                                    <label
                                        key={leaf.id}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
                                            ${selected.includes(leaf.id) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(leaf.id)}
                                            onChange={() => toggle(leaf.id)}
                                            disabled={disabled}
                                            className="w-3.5 h-3.5 accent-orange-500 shrink-0"
                                        />
                                        <span className="text-xs text-gray-700 capitalize truncate">
                                            {leaf.name.replace(/-/g, ' ')}
                                        </span>
                                    </label>
                                ))}
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
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
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
    const { getRoles } = useRoleMaster();

    const {data:rolesList} = getRoles;
    const getAll = useRolePermissionView();
    const getContents =getAll?.data || [];

 




    const [viewRoleId, setViewRoleId] = useState('');
    const [viewRoleName, setViewRoleName] = useState('');

    const { create, getByRoleId } = useRoleTransaction(viewRoleId);
    const existingRecords = getByRoleId.data ?? [];

    console.log(existingRecords,getByRoleId.data, viewRoleId,'existingRecords');

    const existingContentIds = useMemo(
        () => new Set(existingRecords.map((r) => r.contentid)),
        [existingRecords]
    );

    const [form, setForm] = useState({
        roleId: '', roleName: '', isActive: true, selectedPermissions: [],
    });

    const [staged, setStaged]       = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast]         = useState(null);

    const roleOptions = useMemo(() => {
        const roles = rolesList?.data ?? [];

        return roles?.map((r) => ({
            value: r.roleid,
            label: r.rolename ,
        }));
    }, [getRoles.data]);

    const contentRecords = getContents ?? [];
    const canAddRow = form.roleId && form.selectedPermissions.length > 0;

    // Build id→label and id→full-detail lookups from the API data
    const { contentLabelMap, contentDetailMap } = useMemo(() => {
        const labelMap = {};
        const detailMap = {};
        for (const module of contentRecords) {
            for (const item of module.moduleContent ?? []) {
                labelMap[item.id] = item.name.replace(/-/g, ' ');
                detailMap[item.id] = {
                    moduleid: module.id,
                    modulename: module.name,
                    submoduleid: null,
                    submodulename: null,
                    contentid: item.id,
                    contentname:   item.name,
                };
            }
            for (const sub of module.subModulel ?? []) {
                for (const item of sub.moduleContent ?? []) {
                    labelMap[item.id] = item.name.replace(/-/g, ' ');
                    detailMap[item.id] = {
                       moduleid: module.id,
                       modulename: module.name,
                       submoduleid: sub.id,
                       submodulename: sub.name,
                       contentid: item.id,
                       contentname:   item.name,
                    };
                }
            }
        }
        return { contentLabelMap: labelMap, contentDetailMap: detailMap };
    }, [contentRecords]);

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
            const allRecords = staged.flatMap((row) =>
                row.selectedPermissions
                    .filter((pid) => contentDetailMap[pid])
                    .map((pid) => {
                        const d = contentDetailMap[pid];
                        return {
                            roleid:        Number(row.roleId),
                            rolename:      row.roleName,
                            moduleid:      d.moduleid      ?? null,
                            modulename:    d.modulename    ?? null,
                            submoduleid:   d.submoduleid   ?? null,
                            submodulename: d.submodulename ?? null,
                            contentid:     d.contentid     ?? null,
                            contentname:   d.contentname   ?? null,
                            active:        row.isActive,
                        };
                    })
            );
            const newRecords = allRecords.filter(
                (r) => !(String(r.roleid) === String(viewRoleId) && existingContentIds.has(r.contentid))
            );
            const skipped = allRecords.length - newRecords.length;
            if (newRecords.length === 0) {
                setToast({ type: 'error', msg: `All ${skipped} permission(s) already exist for this role.` });
                return;
            }
            await create.mutateAsync(newRecords);
            setToast({
                type: 'success',
                msg: `${newRecords.length} permission(s) saved.${skipped > 0 ? ` ${skipped} duplicate(s) skipped.` : ''}`,
            });
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
                    <Badge color="blue">{existingRecords.length} Records</Badge>
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

                                {getContents?.isLoading ? (
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
                                                        {row.selectedPermissions.slice(0, 4).map((pid) => (
                                                            <span key={pid}
                                                                className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                                                                {contentLabelMap[pid] ?? pid}
                                                            </span>
                                                        ))}
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

                {/* ── Existing Records Viewer ─────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">Existing Records by Role</span>
                        <div className="w-52 ml-auto">
                            <ComboBox
                                field="viewRoleId"
                                value={viewRoleId}
                                displayValue={viewRoleName}
                                onChange={(_, val, opt) => { setViewRoleId(val); setViewRoleName(opt?.label ?? ''); }}
                                options={roleOptions}
                                placeholder="Select role..."
                                loading={getRoles.isLoading}
                            />
                        </div>
                    </div>
                    <AdvancedTable
                        headers={[
                            { key: 'sno',           label: 'SNO',        align: 'center' },
                            { key: 'rolename',      label: 'Role' },
                            { key: 'modulename',    label: 'Module' },
                            { key: 'submodulename', label: 'Sub Module' },
                            { key: 'contentname',   label: 'Content' },
                            { key: 'active',        label: 'Status',     align: 'center' },
                        ]}
                        data={existingRecords}
                        isLoading={getByRoleId.isLoading}
                        isError={getByRoleId.isError}
                        error={getByRoleId.error}
                        maxHeight="350px"
                        emptyMessage={viewRoleId ? 'No records found for this role' : 'Select a role to view records'}
                        renderCell={(key, row) => {
                            if (key === 'active') return (
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                                    ${row.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${row.active ? 'bg-green-500' : 'bg-red-400'}`} />
                                    {row.active ? 'Active' : 'Inactive'}
                                </span>
                            );
                            if (key === 'submodulename') return <span className="text-gray-400 italic">{row.submodulename ?? '—'}</span>;
                            return row[key];
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RoleTransactionPage;
