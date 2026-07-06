import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Hash, Link2, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import BannerTable from "../../../components/banner/manageBannerTable";
import { useFooterEntries, useDeleteFooterEntry } from "../../../hooks/footer/useFooter";

const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        active
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-gray-200 bg-gray-100 text-gray-500"
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-400"}`} />
        {active ? "Active" : "Inactive"}
    </span>
);

StatusBadge.propTypes = {
    active: PropTypes.bool.isRequired,
};

const LinkCell = ({ value }) => {
    if (!value) return <span className="text-xs text-gray-300">-</span>;

    return (
        <span
            title={value}
            className="inline-flex max-w-[240px] items-center gap-1.5 truncate rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 font-mono text-[11px] text-indigo-700"
        >
            <Link2 size={12} className="shrink-0" />
            <span className="truncate">{value}</span>
        </span>
    );
};

LinkCell.propTypes = {
    value: PropTypes.string,
};

const OrderBadge = ({ value }) => (
    <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600">
        {value || "-"}
    </span>
);

OrderBadge.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const HEADERS = [
    { key: "sno", label: "#", align: "center" },
    { key: "itemId", label: "Item ID", align: "center" },
    { key: "title", label: "Title" },
    { key: "link", label: "Link" },
    { key: "order", label: "Order", align: "center" },
    { key: "active", label: "Status", align: "center" },
    { key: "actions", label: "Actions", align: "center" },
];

const FooterCategory = () => {
    const navigate = useNavigate();
    const { data: entries = [], isLoading, isError, error, refetch } = useFooterEntries();
    const deleteFooter = useDeleteFooterEntry();

    const tableData = useMemo(() =>
        [...entries].reverse().map((entry, index) => ({
            id: entry.id,
            sno: index + 1,
            itemId: entry.itemId ?? entry.ITEMID ?? "-",
            title: entry.title ?? entry.itemName ?? "-",
            link: entry.link ?? "",
            order: entry.displayorder ?? entry.displayOrder ?? "-",
            active: entry.active === "Y" || entry.active === true || entry.active === 1,
            _raw: entry,
        }))
    , [entries]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this footer entry?")) {
            deleteFooter.mutate(id, { onSuccess: () => refetch() });
        }
    };

    const handleEdit = (id) => {
        navigate("/admin/category/footer/add", { state: { id, mode: "edit" } });
    };

    const renderCell = (key, row) => {
        if (key === "sno") {
            return <span className="text-xs font-medium text-gray-400">{row.sno}</span>;
        }

        if (key === "itemId") {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600">
                    <Hash size={11} />
                    {row.itemId}
                </span>
            );
        }

        if (key === "title") {
            return <span className="text-xs font-semibold text-gray-700">{row.title}</span>;
        }

        if (key === "link") return <LinkCell value={row.link} />;
        if (key === "order") return <OrderBadge value={row.order} />;
        if (key === "active") return <StatusBadge active={row.active} />;

        if (key === "actions") {
            return (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        title="Edit"
                        onClick={() => handleEdit(row.id)}
                        className="rounded-md p-1.5 text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                        disabled={deleteFooter.isPending || deleteFooter.isLoading}
                        className="rounded-md p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            );
        }

        return row[key];
    };

    return (
        <div className="mx-auto mt-4 max-w-7xl px-4">
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <BannerTable
                    title="Footer Categories"
                    subtitle={`${tableData.length} footer ${tableData.length === 1 ? "entry" : "entries"} configured`}
                    button="+ Add New"
                    onClick={() => navigate("/admin/category/footer/add")}
                    headers={HEADERS}
                    data={tableData}
                    renderCell={renderCell}
                    loading={isLoading}
                    error={isError ? error : null}
                    emptyMessage="No footer categories found."
                />

            </div>
        </div>
    );
};

export default FooterCategory;
