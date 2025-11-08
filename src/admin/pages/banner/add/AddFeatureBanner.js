"use client";

import React, { useState } from "react";
import FileUploader from "../../../components/banner/FileUploader";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";
import { useUploadFeaturedBannerMutation } from "../../../hooks/banners/FeatureProductsBanner/useFeatureBanner";
import {
    Box,
    Button,
    TextField,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const UploadFeatureDesign = () => {
    const [name, setName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [openBackdrop, setOpenBackdrop] = useState(false);

    const [toast, setToast] = useState({ open: false, message: "", severity: "error" });

    const navigate = useNavigate();

    const uploadMutation = useUploadFeaturedBannerMutation();

    // Handle file selection from FileUploader
    const handleFileSelect = (file, err) => {
        setSelectedFile(file);
        if (err) {
            showToast(err, "error");
        }
    };

    const showToast = (message, severity = "error") => {
        setToast({ open: true, message, severity });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    const handleUpload = () => {
        if (!name) return showToast("Please enter a design name");
        if (!selectedFile) return showToast("Please select an image file");

        setOpenBackdrop(true);
        setProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        uploadMutation.mutate(
            { name, image: selectedFile },
            {
                onSuccess: () => {
                    setProgress(100);
                    setTimeout(() => {
                        setOpenBackdrop(false);
                        setProgress(0);
                        setName("");
                        setSelectedFile(null);
                        showToast("Banner uploaded successfully!", "success");
                        navigate("/featurebanner/manage");
                    }, 800);
                },
                onError: (err) => {
                    setOpenBackdrop(false);
                    showToast(err.message || "Upload failed", "error");
                },
            }
        );
    };

    const handleCancel = () => {
        setName("");
        setSelectedFile(null);
    };

    return (
        <Box sx={{ padding: 4, margin: "0px auto", mt: { xs: 2, md: 3 } }}>
            <Box
                sx={{
                    padding: 2,
                    maxWidth: 600,
                    margin: "0 auto",
                    border: "1px solid #cfcfcfff",
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    Upload Featured Product Banner
                </Typography>

                <TextField
                    fullWidth
                    label="Design Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <FileUploader
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    loading={uploadMutation.isLoading}
                    height={200}
                />

                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1, md: 2 },
                        mt: { xs: 1, md: 2 },
                        justifyContent: "flex-end",
                    }}
                >
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        disabled={uploadMutation.isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={uploadMutation.isLoading}
                    >
                        {uploadMutation.isLoading ? "Uploading..." : "Upload"}
                    </Button>
                </Box>

                {/* Backdrop Progress */}
                <BackdropProgress
                    open={openBackdrop}
                    title="Uploading Banner"
                    body="Please wait while we upload your banner..."
                    progress={progress}
                />
            </Box>

            {/* Toast Notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseToast}
                    severity={toast.severity}
                    sx={{ width: "100%" }}
                    variant="filled"
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UploadFeatureDesign;
