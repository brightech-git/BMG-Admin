
import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
} from "@mui/material";
import { Pencil, Trash2, Plus } from "lucide-react";
import {useGenderBanner } from "../../../hooks/banners/genderBanner/useGenderBanners";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";
import FileUploader from "../../../components/banner/FileUploader";
import { toast } from "react-toastify";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js";
import { FaTrash, FaEdit } from "react-icons/fa";
import BannerTable from "../../../components/banner/manageBannerTable.jsx";
import { useNavigate } from "react-router-dom";

const ManageGenderBanner = () => {

    const navigate = useNavigate();
 const { deleteGenderImages, genderBanners ,isLoading ,refetch} = useGenderBanner();
const bannersData =genderBanners || []
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
console.log(banners ,'bannerforGender')
    const handleDelete = (id) => {
        if (window.confirm("Delete this banner?")) {
            deleteGenderImages(id, {
                onSuccess: () => refetch(), // Refresh list after deletion
            });
        }
    };

    const tableData = banners.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.image_path,
        title: item.title || "—",
        // subtitle: item.subtitle || "—",
        itemname: item.itemName || "—",
    }));
    const handleOnClick = () => {
        navigate('/genderbanner/add')
    }
    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Gender Banners"
                button={banners.length < 3 ? ("Add Banner") : ('')}
                onClick={handleOnClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "image_path", label: "Image" },
                    { key: "title", label: "Title" },
                    // { key: "subtitle", label: "Subtitle" },
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
                                width={60}
                                height={40}
                                className="rounded shadow-sm object-contain"
                            />
                        );
                    }
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/genderbanner/add', { state: { id: row.id, mode: 'edit' } })}
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
                emptyMessage="No banners found"
            />
        </div>
    );
};

export default ManageGenderBanner;
