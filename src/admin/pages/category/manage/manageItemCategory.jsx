import { useState, useMemo, useEffect } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import FileUploader from "../../../components/banner/FileUploader.js";

import useCategories from '../../../hooks/itemCategory/useItemCategory.js'
import { useDeleteCategory, useUpdateCategory } from '../../../hooks/itemCategory/useUploadCategory.js'
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js";
import { useItemNames } from "../../../hooks/itemName/useItemNames.js";
import { useNavigate } from "react-router-dom";
import BannerTable from "../../../components/banner/manageBannerTable.jsx";
import { FaTrash, FaEdit } from "react-icons/fa";

const ManageItemCategory = () => {
    const navigate = useNavigate();

    const { data: bannersData, isLoading, refetch } = useCategories();
    const { mutate: deleteBanner } = useDeleteCategory();

    // Use memo to avoid unnecessary recalculations
    const banners = useMemo(() => {
        if (!bannersData) return [];

        // Handle different possible response structures
        if (Array.isArray(bannersData)) {
            return bannersData;
        } else if (Array.isArray(bannersData?.data)) {
            return bannersData.data;
        } else if (Array.isArray(bannersData?.banners)) {
            return bannersData.banners;
        } else if (Array.isArray(bannersData?.results)) {
            return bannersData.results;
        }

        console.warn('Unexpected banners data structure:', bannersData);
        return [];
    }, [bannersData]);

    const handleDelete = (id) => {
        if (window.confirm("Delete this Header Content?")) {
            deleteBanner(id, {
                onSuccess: () => refetch(), // Refresh list after deletion
            });
        }
    };
    console.log(bannersData, 'bannersData')
    const tableData = banners.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.image_path,
        itemname: item.item_name || "—",
    }));
    const hnadleClick = () => navigate('/item-category/add')
    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Banners"
                button="Add New"
                onClick={hnadleClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "image_path", label: "Image" },
                    { key: "itemname", label: "Item Name" },
                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                    if (key === "image_path") {
                        return (
                            <img
                                src={getProductImages(row.image_path)}
                                alt={row.title}
                                width={40}
                                height={30}
                                className="rounded shadow-sm object-contain"
                            />
                        );
                    }
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/item-category/add', { state: { id: row.id, mode: 'edit' } })}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        );
                    }
                    return row[key];
                }}
                loading={isLoading}
                emptyMessage="No Header Content found"
            />
        </div>
    );
};

export default ManageItemCategory;
