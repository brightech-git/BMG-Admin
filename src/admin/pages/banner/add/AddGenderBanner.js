"use client";

import React, { useState, useEffect } from "react";
import { useGenderBanner } from "../../../hooks/banners/genderBanner/useGenderBanners";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import FileUploader from "../../../components/banner/FileUploader";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Button,
    Typography,
    Paper,
} from "@mui/material";
import { toast } from "react-toastify";

const AddGenderBanner = () => {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [itemName, setItemName] = useState("");
    const [subItemName, setSubItemName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [progress, setProgress] = useState(0);

    const { uploadGenderImages, isUploading } = useGenderBanner();
    const { items: itemNames = [] } = useItemNames();

    // find selected item ID for sub-item fetching
    const itemCtrId = itemNames.find(
        (item) => item.ITEMCTRNAME.toLowerCase() === itemName.toLowerCase()
    )?.ITEMCTRID;

    const { items: subitemNames = [] } = useItemNames(itemCtrId);
    const subItemNameOptions = subitemNames?.[0]?.subitems || [];

    // Handle file selection
    const handleFileSelect = (file, err) => {
        if (err) {
            setError(err);
        } else {
            setSelectedFile(file);
            setError("");
        }
    };

    const handleSubmit = async () => {
        if (!title || !subtitle || !itemName || !subItemName || !selectedFile) {
            toast.error("⚠️ Please fill all fields before uploading!");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("itemName", itemName);
        formData.append("subItemName", subItemName);
        formData.append("image", selectedFile);

        setOpenBackdrop(true);
        setProgress(0);

        // Simulate progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        uploadGenderImages(formData, {
            onSuccess: () => {
                clearInterval(interval);
                setProgress(100);
                toast.success("🎉 Banner uploaded successfully!");
                setTimeout(() => {
                    setOpenBackdrop(false);
                    resetForm();
                }, 800);
                setTimeout(() => {
                    window.location.href = "/genderbanner/manage";
                }, 1000);
            },
            onError: (err) => {
                clearInterval(interval);
                setOpenBackdrop(false);
                toast.error(err?.message || "❌ Failed to upload banner.");
            },
        });
    };

    const resetForm = () => {
        setTitle("");
        setSubtitle("");
        setItemName("");
        setSubItemName("");
        setSelectedFile(null);
        setError("");
    };

    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", p: { xs: 2, md: 4 }  ,mt:{xs:2,md:3}}} >
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 2 }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
                >
                    Add Gender Banner
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Subtitle"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        fullWidth
                    />

                    <Select
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>Select Item Name</em>
                        </MenuItem>
                        {itemNames.map((item) => (
                            <MenuItem key={item.ITEMCTRID} value={item.ITEMCTRNAME}>
                                {item.ITEMCTRNAME}
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        value={subItemName}
                        onChange={(e) => setSubItemName(e.target.value)}
                        displayEmpty
                        fullWidth
                        disabled={!itemName}
                    >
                        <MenuItem value="">
                            <em>Select Sub Item Name</em>
                        </MenuItem>
                        {subItemNameOptions.map((item) => (
                            <MenuItem key={item.SUBITEMID} value={item.SUBITEMNAME}>
                                {item.SUBITEMNAME}
                            </MenuItem>
                        ))}
                    </Select>

                    <FileUploader
                        selectedFile={selectedFile}
                        onFileSelect={handleFileSelect}
                        height={200}
                    />

                    {error && (
                        <Typography color="error" sx={{ fontSize: 14 }}>
                            {error}
                        </Typography>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 2,
                            mt: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={resetForm}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload Banner"}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Backdrop progress indicator */}
            <BackdropProgress
                open={openBackdrop}
                title="Uploading Banner"
                body="Please wait while the banner is uploaded..."
                progress={progress}
            />
        </Box>
    );
};

export default AddGenderBanner;
