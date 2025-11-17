"use client";

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
import { useGenderBanner } from "../../../hooks/banners/genderBanner/useGenderBanners";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";
import FileUploader from "../../../components/banner/FileUploader";
import { toast } from "react-toastify";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js.js";

const ManageGenderBanner = () => {
    const {
        genderBanners,
        isFetching,
        deleteGenderImages,
        updateGenderImages,
        isDeleting,
        isUpdating,
    } = useGenderBanner();

    const { items: itemNames } = useItemNames();
    const [selectedItemId, setSelectedItemId] = useState(null);

    console.log(selectedItemId, 'idfor')
    const { items: subItemList } = useItemNames(selectedItemId);
    const subItemOptions = subItemList?.[0]?.subitems || [];

    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [itemName, setItemName] = useState("");
    const [subItemName, setSubItemName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // Handle Edit
    const handleEdit = (banner) => {
        setSelectedBanner(banner);
        setTitle(banner.title || "");
        setSubtitle(banner.subtitle || "");
        setItemName(banner.itemName || "");
        setSubItemName(banner.subItemName || "");
        setSelectedFile(null);
        setOpenEditModal(true);

        const itemObj = itemNames.find(
            (i) => i.ITEMCTRNAME.toLowerCase() === banner.itemName?.toLowerCase()
        );
        setSelectedItemId(itemObj?.ITEMCTRID || null);
    };

    // Handle Update
    const handleUpdate = () => {
        if (!title || !subtitle || !itemName || !subItemName) {
            toast.error("⚠️ Please fill all fields");
            return;
        }

        const formData = new FormData();
        formData.append("id", selectedBanner.id);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("itemName", itemName);
        formData.append("subItemName", subItemName);
        if (selectedFile) formData.append("image", selectedFile);

        updateGenderImages(formData, {
            onSuccess: () => {
                toast.success("✅ Banner updated successfully");
                setOpenEditModal(false);
            },
            onError: () => toast.error("❌ Failed to update banner"),
        });
    };

    // Handle Delete
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;

        deleteGenderImages(id, {
            onSuccess: () => toast.success("🗑️ Banner deleted successfully"),
            onError: () => toast.error("❌ Failed to delete banner"),
        });
    };

    const handleAddNew = () => {
        window.location.href = "/genderbanner/add";
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, mt: { xs: 2, md: 4 } }}>
            <Box sx={{ border: '1px solid #e4e4e4ff', p: { xs: 2, md: 4 }, borderRadius: 2 }}>            {/* Header section */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Manage Gender Banners
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={handleAddNew}
                    >
                        Add New Banner
                    </Button>
                </Box>

                {/* Table Section */}
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Subtitle</TableCell>
                                <TableCell>Item Name</TableCell>
                                <TableCell>Sub Item Name</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isFetching ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Loading banners...
                                    </TableCell>
                                </TableRow>
                            ) : genderBanners && genderBanners.length > 0 ? (
                                genderBanners.map((banner, index) => (
                                    <TableRow key={banner.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <img
                                                src={getProductImages(banner.image_path)}
                                                alt={banner.title}
                                                width="80"
                                                height="60"
                                                style={{
                                                    borderRadius: 6,
                                                    objectFit: "cover",
                                                    border: "1px solid #ddd",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{banner.title}</TableCell>
                                        <TableCell>{banner.subtitle}</TableCell>
                                        <TableCell>{banner.itemName}</TableCell>
                                        <TableCell>{banner.subItemName}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEdit(banner)}
                                            >
                                                <Pencil size={18} />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(banner.id)}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No banners found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Edit Modal */}
                <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Gender Banner</DialogTitle>
                    <DialogContent sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            margin="dense"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Subtitle"
                            margin="dense"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                        />

                        {/* Item Dropdown */}
                        <Select
                            fullWidth
                            value={itemName}
                            onChange={(e) => {
                                const selectedItem = itemNames.find(
                                    (item) => item.ITEMCTRNAME === e.target.value
                                );
                                setItemName(e.target.value);
                                setSelectedItemId(selectedItem?.ITEMCTRID || null);
                                setSubItemName("");
                            }}
                            sx={{ mt: 2 }}
                            displayEmpty
                        >
                            <MenuItem value="">Select Item Name</MenuItem>
                            {itemNames.map((item) => (
                                <MenuItem key={item.ITEMCTRID} value={item.ITEMCTRNAME}>
                                    {item.ITEMCTRNAME}
                                </MenuItem>
                            ))}
                        </Select>

                        {/* SubItem Dropdown */}
                        <Select
                            fullWidth
                            value={subItemName}
                            onChange={(e) => setSubItemName(e.target.value)}
                            sx={{ mt: 2 }}
                            disabled={!itemName}
                            displayEmpty
                        >
                            <MenuItem value="">Select Sub Item</MenuItem>
                            {subItemOptions.map((sub) => (
                                <MenuItem key={sub.SUBITEMID} value={sub.SUBITEMNAME}>
                                    {sub.SUBITEMNAME}
                                </MenuItem>
                            ))}
                        </Select>

                        {/* File Uploader */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Upload Image (optional)
                            </Typography>
                            <FileUploader
                                selectedFile={selectedFile}
                                onFileSelect={handleFileSelect}
                                height={160}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleUpdate}>
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Backdrop Progress */}
                <BackdropProgress
                    open={isDeleting || isUpdating}
                    title="Processing"
                    body="Please wait while we update your changes..."
                    progress={100}
                />
            </Box>
        </Box>

    );
};

export default ManageGenderBanner;
