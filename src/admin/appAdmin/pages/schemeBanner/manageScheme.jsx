import React, { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

import AdvancedTable from "../../../components/table/ResponsiveTable";
import { useDelete, useSchemeDetails, useSchemeDetailsBySchemeId } from "../../hooks/scheme/useScheme";

import { useNavigate } from "react-router-dom";

const ManageScheme = () => {
    const { data: schemeData, isLoading, isError, error, refetch } = useSchemeDetails();

    console.log(schemeData, 'schemeData')

    const { mutate: deleteScheme } = useDelete();

    const [showForm, setShowForm] = useState(false);
    const [editScheme, setEditScheme] = useState(null);

    const BASE_URL = "https://scheme.bmgjewellers.com";

    const navigate= useNavigate();
    /* ----------------------- DATA FORMAT ----------------------- */
    const finalData =
        schemeData?.data?.map((scheme, index) => ({
            sno: index + 1,
            ...scheme,
        })) ?? [];

    /* ----------------------- HEADERS ----------------------- */
    const headers = [
        { key: "sno", label: "S.No" },
        { key: "schemeId", label: "Scheme ID", align: "center" },
        { key: "schemeName", label: "Scheme Name" },
        { key: "schemeDescription", label: "Description" },
        { key: "schemeImage", label: "Mobile View", align: "center" },
        { key: "BigSchemeImage", label: "Desc View", align: "center" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    /* ----------------------- CELL RENDER ----------------------- */
    const renderCell = (key, row) => {
        if (key === "sno") return row.sno;

        if (key === "schemeImage") {
            return (
                <img
                    src={`${BASE_URL}${row.SchemeImage}`}
                    alt={row.schemeName}
                    className="w-10 h-10 rounded object-cover mx-auto"
                />
            );
        }
        if (key === "BigSchemeImage") {
            return (
                <img
                    src={`${BASE_URL}${row.BigSchemeImage}`}
                    alt={row.schemeName}
                    className="w-10 h-10 rounded object-cover mx-auto"
                />
            );
        }
        
        if (key === "schemeDescription") {
            return (
                <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {row.SchemeDescription}
                </div>
            );
        }

        if (key === "actions") {
            return (
                <div className="flex items-center justify-center gap-2">
                    {/* EDIT */}
                    <button
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Edit"
                        onClick={() => {
                            navigate("/app/admin/scheme/add", {
                                state: {
                                    id: row.Id,                 // REQUIRED for edit
                                    schemeId: row.schemeId,
                                    schemeName: row.schemeName,
                                    schemeDescription: row.SchemeDescription,
                                    schemeLink: row.SchemeLink,
                                    androidLink: row.AndroidLink,
                                    iosLink: row.IOSLink,
                                    keyvalue: row.KeyValue,
                                    language: row.Language ?? "EN",
                                    schemeImage: `${BASE_URL}${row.SchemeImage}`,     // existing image path
                                    bigschemeImage: `${BASE_URL}${row.BigSchemeImage}`
                                }
                            });
                        }}
                    >
                        <Pencil size={16} />
                    </button>

                    {/* DELETE */}
                    <button
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                         onClick={() => {
                            if (window.confirm("Are you sure?")) {
                                deleteScheme(row.Id);
                            }
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            );
        }

        return row[key] ?? "-";
    };

    /* ----------------------- UI ----------------------- */
    return (
        <div className="p-3 mt-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-[var(--primary-text-color)]">
                    Manage Schemes
                </h2>

                <button
                    className="flex items-center gap-2 bg-white text-[var(--primary-text-color)] text-xs px-2 py-1.5"
                    onClick={() => {
                        setEditScheme(null);
                        navigate('/app/admin/scheme/add');

                    }}
                >
                    <Plus size={16} /> Add Scheme
                </button>
            </div>

            {/* Table */}
            <AdvancedTable
                headers={headers}
                data={finalData}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                renderCell={renderCell}
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
                actionColumn="actions"
            />

            {/* Modal (optional) */}
          
        </div>
    );
};

export default ManageScheme;
