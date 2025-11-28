import React from "react";
import AdvancedTable from '../../../components/table/ResponsiveTable';
import { useFooterEntries, useDeleteFooterEntry } from "../../../hooks/footer/useFooter";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FooterCategory = () => {
    const { data: entries = [], isLoading, isError, error, refetch } = useFooterEntries();
    const deleteFooter = useDeleteFooterEntry();
    const navigate = useNavigate();

    // Reverse entries so latest first
    const reversedEntries = [...entries].reverse();

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this footer entry?")) {
            deleteFooter.mutate(id);
        }
    };

    const handleEdit = (id) => {
        // Navigate to add/edit page with id and isEdit=true
        console.log(id ,'handleedit')
        navigate('/admin/category/footer/add', { state: { id:id, mode: 'edit' }});
    };

    const headers = [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "itemCtrName", label: "Item Container Name" },
        { key: "link", label: "Link" },
        { key: "active", label: "Active" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const renderCell = (key, row) => {
        if (key === "actions") {
            return (
                <div className="flex justify-center gap-2">
                    <button
                        title="Edit"
                        onClick={() => handleEdit(row.id)}
                        className="p-1 r"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                        className="p-1  text-[var(--error-color)]"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            );
        }

        if (key === "active") {
            return row.active ? "Yes" : "No";
        }

        return row[key];
    };

    return (
        <div className="max-w-8xl mx-auto mt-4 p-2.5 ">
            <header className="flex justify-between mb-2" >
            <h4 className="text-sm">Manage Footer Categories </h4>
                <button className="border text-xs p-1" onClick={() => navigate('/admin/category/footer/add')}>Add New </button>
            </header>

            <AdvancedTable
                headers={headers}
                data={reversedEntries}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                renderCell={renderCell}
                actionColumn="actions"
                emptyMessage="No footer entries available"
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
            />
        </div>
    );
};

export default FooterCategory;
