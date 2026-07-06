import { useNavigate } from 'react-router-dom';
import { useMenu, useDeleteMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
import BannerTable from '../../../components/banner/manageBannerTable';
import { FaTrash, FaEdit } from 'react-icons/fa';

const StatusBadge = ({ value, yes = "Yes", no = "No" }) => {
    const isYes = value === "Yes" || value === true;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isYes
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"
        }`}>
            {isYes ? yes : no}
        </span>
    );
};

const LinkCell = ({ value }) => {
    if (!value || value === "—") return <span className="text-gray-300 text-xs">—</span>;
    return (
        <span
            title={value}
            className="inline-block max-w-[180px] truncate text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded"
        >
            {value}
        </span>
    );
};

const HEADERS = [
    { key: "sno",       label: "#",             align: "center" },
    { key: "headerKey", label: "Header Key" },
    { key: "label",     label: "Label" },
    { key: "link",      label: "Link" },
    { key: "category",  label: "Category",      align: "center" },
    { key: "active",    label: "Active",         align: "center" },
    { key: "order",     label: "Order",          align: "center" },
    { key: "actions",   label: "Actions",        align: "center" },
];

const ManageCategoriesPage = () => {
    const navigate = useNavigate();
    const { data: headerContent, isLoading, refetch } = useMenu();
    const { mutate: deleteItem } = useDeleteMenuItem();

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this menu item?")) {
            deleteItem(id, { onSuccess: () => refetch() });
        }
    };

    const tableData = headerContent?.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        headerKey: item.name || "—",
        label: item.label || "—",
        link: item.link || "—",
        category: item.category === "Y" ? "Yes" : "No",
        active: item.active === "Y" ? "Yes" : "No",
        order: item.displayorder ?? "—",
        _raw: item,
    }));

    const renderCell = (key, row) => {
        if (key === "category") return <StatusBadge value={row.category} />;
        if (key === "active")   return <StatusBadge value={row.active} />;
        if (key === "link")     return <LinkCell value={row.link} />;
        if (key === "sno")      return <span className="text-gray-400 text-xs font-medium">{row.sno}</span>;
        if (key === "order")    return <span className="text-xs font-semibold text-gray-600">{row.order}</span>;

        if (key === "actions") {
            return (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate('/admin/header/add', { state: { rowData: row._raw, mode: 'edit' } })}
                        title="Edit"
                        className="p-1.5 rounded-md text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <FaEdit size={13} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        title="Delete"
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <FaTrash size={13} />
                    </button>
                </div>
            );
        }

        return <span className="text-xs text-gray-700">{row[key]}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto mt-4 px-4">
            <BannerTable
                title="Header Menu Items"
                button="+ Add New"
                onClick={() => navigate('/admin/header/add')}
                headers={HEADERS}
                data={tableData}
                renderCell={renderCell}
                loading={isLoading}
                emptyMessage="No header menu items found."
            />
        </div>
    );
};

export default ManageCategoriesPage;
