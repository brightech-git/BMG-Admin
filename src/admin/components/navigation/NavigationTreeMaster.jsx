import { useEffect, useMemo, useState } from "react";
import {
    LayoutList, Plus, RotateCcw, Pencil, Trash2,
    X, Link2, Check, AlertTriangle, Search,
} from "lucide-react";

import InputField from "../ui/InputField";
import { Switch } from "../ui/Switch";
import BannerTable from "../banner/manageBannerTable";
import SelectComboBox from "../ui/ComboBoxField";
import { useItemNames, useSubItems } from "../../hooks/itemName/useItemNames";

// ─── Tree helpers ─────────────────────────────────────────────────────────────

const DEFAULT_LINK_BASE = "products-page";

const emptyNode = () => ({
    label: "",
    link: DEFAULT_LINK_BASE,
    displayOrder: 1,
    active: true,
    subLayers: [],
});

// A link is stored as "<base>?itemId=<id>&subItemId=<id>" — split/join helpers
// keep the base path (usually "products-page", but user-editable) in sync
// with the itemId/subItemId pickers.
function parseLinkParams(link) {
    if (!link) return { base: "", itemId: "", subItemId: "" };
    const [base, query] = link.split("?");
    const params = new URLSearchParams(query || "");
    return {
        base: base || "",
        itemId: params.get("itemId") || "",
        subItemId: params.get("subItemId") || "",
    };
}

function buildLink(base, itemId, subItemId) {
    const path = base || DEFAULT_LINK_BASE;
    if (!itemId) return path;
    const params = new URLSearchParams();
    params.set("itemId", itemId);
    if (subItemId) params.set("subItemId", subItemId);
    return `${path}?${params.toString()}`;
}

function assignLayers(node, depth = 1) {
    return {
        ...node,
        layer: depth,
        subLayers: node.subLayers.map((c) => assignLayers(c, depth + 1)),
    };
}

function updateAt(node, path, patch) {
    if (path.length === 0) return { ...node, ...patch };
    const [i, ...rest] = path;
    return {
        ...node,
        subLayers: node.subLayers.map((c, idx) => (idx === i ? updateAt(c, rest, patch) : c)),
    };
}

function addChildAt(node, path) {
    if (path.length === 0) return { ...node, subLayers: [...node.subLayers, emptyNode()] };
    const [i, ...rest] = path;
    return {
        ...node,
        subLayers: node.subLayers.map((c, idx) => (idx === i ? addChildAt(c, rest) : c)),
    };
}

function removeAt(node, path) {
    if (path.length === 1)
        return { ...node, subLayers: node.subLayers.filter((_, idx) => idx !== path[0]) };
    const [i, ...rest] = path;
    return {
        ...node,
        subLayers: node.subLayers.map((c, idx) => (idx === i ? removeAt(c, rest) : c)),
    };
}

function responseToNode(r) {
    return {
        label: r.label,
        link: r.link,
        displayOrder: r.displayOrder ?? 1,
        active: r.active ?? true,
        subLayers: (r.subLayers ?? []).map(responseToNode),
    };
}

function flattenNodes(nodes, depth = 0) {
    return nodes.flatMap((node) => [
        {
            id: node.id,
            label: node.label,
            link: node.link,
            layer: node.layer,
            depth,
            active: node.active,
            hasChildren: (node.subLayers ?? []).length > 0,
            isRoot: depth === 0,
            _raw: node,
        },
        ...flattenNodes(node.subLayers ?? [], depth + 1),
    ]);
}

// ─── Layer palette ────────────────────────────────────────────────────────────

const LAYER_COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706"];
const LAYER_BG = ["#f5f3ff", "#eff6ff", "#f0fdf4", "#fffbeb"];
const LAYER_BORDER = ["#ddd6fe", "#bfdbfe", "#bbf7d0", "#fde68a"];

// ─── Tree node editor (recursive) ─────────────────────────────────────────────

function TreeNodeEditor({ node, path, depth, onUpdate, onAddChild, onRemove }) {
    const color = LAYER_COLORS[depth] ?? "#6b7280";
    const bg = LAYER_BG[depth] ?? "#f9fafb";
    const borderC = LAYER_BORDER[depth] ?? "#e5e7eb";
    const isRoot = depth === 0;
    const [itemId, setItemId] = useState('');
    const [subItemId, setSubItemId] = useState('');

    const { items } = useItemNames();

    const { data: subitems } = useSubItems(itemId);

    // Keep the pickers in sync with the node's link (e.g. when loading a
    // row for edit, or when the link is typed directly).
    useEffect(() => {
        const parsed = parseLinkParams(node.link);
        setItemId(parsed.itemId);
        setSubItemId(parsed.subItemId);
    }, [node.link]);

    const itemNames = useMemo(() => {
        if (!items) return [];
        return items.map(item => ({
            label: item.ITEMNAME,
            value: item.ITEMID,
        }));
    }, [items]);

    const subItemNames = useMemo(() => {
        if (!subitems) return [];
        return subitems.map(item => ({
            label: item.subItemName,
            value: item.subItemId,
        }));
    }, [subitems]);

    const handleSelectItem = (_, val) => {
        setItemId(val);
        setSubItemId("");
        const { base } = parseLinkParams(node.link);
        onUpdate(path, { link: buildLink(base, val, "") });
    };

    const handleSelectSubItem = (_, val) => {
        setSubItemId(val);
        const { base } = parseLinkParams(node.link);
        onUpdate(path, { link: buildLink(base, itemId, val) });
    };


    return (
        <div>
            <div
                className="rounded-md p-3 mb-2 border"
                style={{ background: bg, borderColor: borderC }}
            >
                {/* Layer strip */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color }}
                    >
                        Layer {depth + 1}
                    </span>

                    {!isRoot && (
                        <button
                            type="button"
                            onClick={() => onRemove(path)}
                            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md border border-red-200 bg-red-50 text-red-600 text-[10px] font-semibold"
                        >
                            <X size={10} /> Remove
                        </button>
                    )}
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InputField
                        label="Label"
                        field="label"
                        required
                        value={node.label}
                        onChange={(_, v) => onUpdate(path, { label: v })}
                        placeholder="e.g. Category"
                    />
                    <div>
                        <label> ItemName </label>
                        <SelectComboBox
                            options={itemNames}
                            value={itemId}
                            field="itemId"
                            onChange={handleSelectItem}
                        />
                    </div>

                
                   
                    {
                        itemId &&
                        <div>
                            <label> SubItemName </label>
                                <SelectComboBox
                                    options={subItemNames}
                                    value={subItemId}
                                    field="subItemId"
                                    onChange={handleSelectSubItem}
                                />
                        </div>
                        
                    }

                    <InputField
                        label="Link / URL"
                        field="link"
                        required
                        value={node.link}
                        onChange={(_, v) => onUpdate(path, { link: v })}
                        placeholder="e.g. /product"
                    />
                    <InputField
                        label="Display Order"
                        field="displayOrder"
                        type="number"
                        value={String(node.displayOrder)}
                        onChange={(_, v) => onUpdate(path, { displayOrder: Number(v) || 0 })}
                    />
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                        <Switch checked={node.active} onChange={(v) => onUpdate(path, { active: v })} label="" />
                    </div>
                </div>

                {/* Add child — max 4 layers */}
                {depth < 3 && (
                    <div className="flex mt-3">
                        <button
                            type="button"
                            onClick={() => onAddChild(path)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed text-[10px] font-bold"
                            style={{ borderColor: color, color }}
                        >
                            <Plus size={10} /> Add Sub-layer
                        </button>
                    </div>
                )}
            </div>

            {/* Recursive children */}
            {node.subLayers.length > 0 && (
                <div className="ml-5 pl-4 border-l-2" style={{ borderColor: borderC }}>
                    {node.subLayers.map((child, i) => (
                        <TreeNodeEditor
                            key={i}
                            node={child}
                            path={[...path, i]}
                            depth={depth + 1}
                            onUpdate={onUpdate}
                            onAddChild={onAddChild}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Cell renderers ────────────────────────────────────────────────────────────

function LabelCell({ row }) {
    const color = LAYER_COLORS[row.depth] ?? "#6b7280";
    return (
        <div className="flex items-center" style={{ paddingLeft: row.depth * 20 }}>
            {row.depth > 0 && (
                <span className="mr-2 flex-shrink-0" style={{ color: LAYER_BORDER[row.depth - 1] ?? "#e5e7eb" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 0 L1 7 L14 7" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </span>
            )}
            <span className="w-[7px] h-[7px] rounded-full mr-2 flex-shrink-0" style={{ background: color }} />
            <span className={`text-xs ${row.isRoot ? "font-bold" : "font-medium"} text-gray-800`}>
                {row.label}
            </span>
        </div>
    );
}

function LayerBadge({ row }) {
    const color = LAYER_COLORS[row.depth] ?? "#6b7280";
    const bg = LAYER_BG[row.depth] ?? "#f9fafb";
    const bdr = LAYER_BORDER[row.depth] ?? "#e5e7eb";
    return (
        <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ background: bg, borderColor: bdr, color }}
        >
            L{row.layer}
        </span>
    );
}

function StatusBadge({ row }) {
    const on = row.active !== false;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                on ? "bg-violet-50 border-violet-200 text-violet-600" : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
        >
            {on ? <Check size={10} /> : <X size={10} />}
            {on ? "Active" : "Inactive"}
        </span>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NavigationTreeMaster({
    title = "Header Management",
    description = "Build and manage navigation header menus",
    useGetAll,
    useCreate,
    useUpdate,
    useDelete,
}) {
    const [tree, setTree] = useState(emptyNode());
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    const { data: apiData, isLoading, refetch } = useGetAll();
    const records = apiData?.data ?? apiData ?? [];

    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();

    const reset = () => {
        setTree(emptyNode());
        setEditId(null);
    };

    const handleUpdate = (path, patch) => setTree((prev) => updateAt(prev, path, patch));
    const handleAddChild = (path) => setTree((prev) => addChildAt(prev, path));
    const handleRemove = (path) => setTree((prev) => removeAt(prev, path));

    const handleSave = () => {
        if (!tree.label.trim()) return;
        const payload = assignLayers(tree);
        if (editId !== null) {
            updateMutation.mutate({ id: editId, data: payload }, { onSuccess: reset });
        } else {
            createMutation.mutate(payload, { onSuccess: reset });
        }
    };

    const handleEdit = (row) => {
        setTree(responseToNode(row._raw));
        setEditId(row._raw.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = (row) => {
        if (row.hasChildren) return;
        if (!window.confirm(`Delete "${row.label}"?`)) return;
        deleteMutation.mutate(row.id, { onSuccess: () => refetch() });
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const flatRows = useMemo(() => flattenNodes(records), [records]);
    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return flatRows;
        return flatRows.filter(
            (r) => r.label?.toLowerCase().includes(q) || r.link?.toLowerCase().includes(q)
        );
    }, [flatRows, search]);
    const noun = title.split(" ")[0];

    const headers = [
        { key: "index", label: "#", align: "center" },
        { key: "label", label: "Label" },
        { key: "link", label: "Link" },
        { key: "layer", label: "Layer", align: "center" },
        { key: "active", label: "Status", align: "center" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const renderCell = (key, row, _themeMode, _next, index) => {
        switch (key) {
            case "index":
                return <span className="text-[10px] font-bold text-gray-400">{String(index + 1).padStart(2, "0")}</span>;
            case "label":
                return <LabelCell row={row} />;
            case "link":
                return (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Link2 size={11} className="text-gray-400" /> {row.link}
                    </span>
                );
            case "layer":
                return <LayerBadge row={row} />;
            case "active":
                return <StatusBadge row={row} />;
            case "actions":
                return (
                    <div className="flex gap-1.5 justify-center items-center">
                        {row.isRoot && (
                            <button
                                type="button"
                                onClick={() => handleEdit(row)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-gray-600 text-[10px] font-semibold"
                            >
                                <Pencil size={10} /> Edit
                            </button>
                        )}
                        {row.hasChildren ? (
                            <span
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-600 text-[10px] font-semibold cursor-not-allowed"
                                title="Delete all sub-layers first before deleting this item"
                            >
                                <AlertTriangle size={10} /> Delete children first
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-[10px] font-semibold"
                            >
                                <Trash2 size={10} /> Delete
                            </button>
                        )}
                    </div>
                );
            default:
                return row[key];
        }
    };

    return (
        <div className="bg-white min-h-screen p-5">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--primary-color)] rounded-md flex items-center justify-center text-white flex-shrink-0">
                        <LayoutList size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{title}</p>
                        <p className="text-[10px] text-gray-400">{description}</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-violet-50 rounded-full border border-violet-200">
                    <span className="text-[10px] font-bold text-[var(--primary-color)]">
                        {flatRows.length} total items
                    </span>
                </div>
            </div>

            {/* Form card */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm mb-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border-b-2 border-violet-200">
                    <LayoutList size={13} className="text-[var(--primary-color)]" />
                    <span className="text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-wider">
                        {editId !== null ? `Edit ${noun} Tree` : `New ${noun} Tree`}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-2">
                        — build the full navigation tree and save it at once
                    </span>
                </div>

                <div className="p-4">
                    <TreeNodeEditor
                        node={tree}
                        path={[]}
                        depth={0}
                        onUpdate={handleUpdate}
                        onAddChild={handleAddChild}
                        onRemove={handleRemove}
                    />

                    <div className="flex gap-2 justify-end mt-4 flex-wrap">
                        {editId !== null && (
                            <button
                                type="button"
                                onClick={reset}
                                className="text-[10px] px-3 py-1.5 border rounded-full text-gray-500"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={reset}
                            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 border rounded-full text-gray-600"
                        >
                            <RotateCcw size={11} /> Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-[var(--primary-color)] text-white disabled:opacity-50"
                        >
                            <Plus size={11} />
                            {isSaving ? "Saving..." : editId !== null ? `Update ${noun}` : `Save ${noun}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-2 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search label or link…"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
                />
            </div>

            {/* Records table */}
            <BannerTable
                title={`Saved ${noun}s`}
                subtitle="Rows with children must have all sub-layers deleted before they can be removed"
                headers={headers}
                data={filteredRows}
                renderCell={(key, row) => renderCell(key, row, null, null, filteredRows.indexOf(row))}
                emptyMessage={`No ${noun.toLowerCase()}s yet. Add one above.`}
                loading={isLoading}
            />
        </div>
    );
}
