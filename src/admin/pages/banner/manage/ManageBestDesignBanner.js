"use client";

import React, { useState } from "react";
import {
    useBestDesignsQuery,
    useUpdateBestDesignMutation,
    useDeleteBestDesignMutation,
} from "../../../hooks/banners/BestDesignedProductsBanner/useBestDesign";
import { useNavigate } from "react-router-dom";
import FileUploader from "../../../components/banner/FileUploader";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";

import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    Card,
    CardContent,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { getProductImages } from "../../../../utils/image/getProductImages";

const ManageBestDesignBanner = () => {
    const { data: designs, isLoading } = useBestDesignsQuery();
    const updateMutation = useUpdateBestDesignMutation();
    const deleteMutation = useDeleteBestDesignMutation();
    const navigate = useNavigate();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editFile, setEditFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [backdropOpen, setBackdropOpen] = useState(false);

    const handleEdit = (design) => {
        setEditId(design.id);
        setEditName(design.Name);
        setEditFile(null);
        setEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editName) return;

        setBackdropOpen(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        updateMutation.mutate(
            { id: editId, name: editName, image: editFile },
            {
                onSuccess: () => {
                    setProgress(100);
                    setTimeout(() => {
                        setBackdropOpen(false);
                        setProgress(0);
                        setEditDialogOpen(false);
                    }, 500);
                },
                onError: () => setBackdropOpen(false),
            }
        );
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            deleteMutation.mutate(id);
        }
    };

    const onAddNew = () => {
        navigate("/bestbanner/add");
    };

    if (isLoading) return <p>Loading banners...</p>;

    return (
        <Box sx={{ mt: { xs: 3, md: 4 }, p: { xs: 2, md: 4 } }}>
            <Box sx={{ padding: 3, border: "1px solid #e0e0e0ff", borderRadius: 2 }}>
                {/* Top bar */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, fontSize: { md: "20px", sm: "16px", xs: "14px" } }}
                    >
                        Manage Best Designed Banners
                    </Typography>
                    <Button variant="contained" color="primary" onClick={onAddNew}>
                        Add New Banner
                    </Button>
                </Box>

                {/* Empty state */}
                {!designs || designs.length === 0 ? (
                    <Card
                        sx={{
                            textAlign: "center",
                            py: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            No banners found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You haven’t added any best design banners yet.
                        </Typography>
                        <Button variant="contained" color="primary" onClick={onAddNew}>
                            Add New Banner
                        </Button>
                    </Card>
                ) : (
                    <Paper sx={{ width: "100%", overflowX: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S.No</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {designs.map((design, index) => (
                                    <TableRow key={design.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <img
                                                src={getProductImages(design.Image)}
                                                alt={design.Name}
                                                style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4 }}
                                            />
                                        </TableCell>
                                        <TableCell>{design.Name}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleEdit(design)} size="small">
                                                <Edit />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(design.id)} size="small">
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                )}

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Edit Banner</DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Change Name or Image
                        </Typography>
                        <TextField
                            fullWidth
                            label="Banner Name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <FileUploader selectedFile={editFile} onFileSelect={setEditFile} height={200} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} variant="contained" color="primary">
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Backdrop Progress */}
                <BackdropProgress
                    open={backdropOpen}
                    title="Updating Banner"
                    body="Please wait while the banner is updated..."
                    progress={progress}
                />
            </Box>
        </Box>
    );
};

export default ManageBestDesignBanner;
