
import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackdropProgress from "../../components/backDrop/BackdropProgress";
import { useEcomMarketingAttributes } from "../../hooks/market-options/useEcomMarketingAttributes";

export default function EcomMarketingAttributesTable() {
    const {
        attributes,
        loading,
        error,
        addAttribute,
        updateAttribute,
        deleteAttribute,
    } = useEcomMarketingAttributes();

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRow, setCurrentRow] = useState({
        sno: "",
        description: "",
        valuesJson: [],
        active: true,
    });
    const [progress, setProgress] = useState(0);
    const [backdropOpen, setBackdropOpen] = useState(false);

    // Convert JSON string to array
    const parseValues = (valuesJson) => {
        if (!valuesJson) return [];
        try {
            const parsed = JSON.parse(valuesJson);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const handleAddValue = (e) => {
        const value = e.target.value.trim();
        if (value && !currentRow.valuesJson.includes(value)) {
            setCurrentRow((prev) => ({
                ...prev,
                valuesJson: [...prev.valuesJson, value],
            }));
        }
        e.target.value = "";
    };

    const handleDeleteValue = (value) => {
        setCurrentRow((prev) => ({
            ...prev,
            valuesJson: prev.valuesJson.filter((v) => v !== value),
        }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentRow({
            sno: attributes.length + 1,
            description: "",
            valuesJson: [],
            active: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setIsEditing(true);
        setCurrentRow({
            ...row,
            valuesJson: parseValues(row.valuesJson),
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        setBackdropOpen(true);
        setProgress(30);

        try {
            if (isEditing) {
                await updateAttribute.mutateAsync({
                    id: currentRow.id,
                    payload: { ...currentRow, valuesJson: JSON.stringify(currentRow.valuesJson) },
                });
                toast.success("Updated successfully!");
            } else {
                await addAttribute.mutateAsync({
                    ...currentRow,
                    valuesJson: JSON.stringify(currentRow.valuesJson),
                });
                toast.success("Added successfully!");
            }
            setProgress(100);
            setTimeout(() => {
                setBackdropOpen(false);
                setProgress(0);
                setModalOpen(false);
            }, 800);
        } catch (err) {
            toast.error("Operation failed!");
            setBackdropOpen(false);
            setProgress(0);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure to delete?")) {
            deleteAttribute.mutate(id, {
                onSuccess: () => toast.success("Deleted successfully!"),
                onError: () => toast.error("Delete failed!"),
            });
        }
    };

    return (
        <Box
            sx={{
                padding: { xs: 0, md: 4},
                marginTop: { xs: 5, md: 5 },
                
                border: "1px solid var(--border-color)",
                borderRadius: "var(--border-radius-lg)",
                backgroundColor: "var(--background-color)",
                fontFamily: "var(--font-primary)",
                color: "var(--primary-text-color)",
            }}
        >
            <ToastContainer position="top-right" autoClose={3000} />

            <BackdropProgress open={backdropOpen} title="Processing..." body="" progress={progress} />

            <Button
                startIcon={<Add />}
                variant="contained"
                sx={{
                    mb: 2,
                    backgroundColor: "var(--primary-color)",
                    "&:hover": { backgroundColor: "var(--secondary-color)" },
                }}
                onClick={openAddModal}
            >
                Add Attribute
            </Button>

            <TableContainer
                component={Paper}
                sx={{
                    backgroundColor: "var(--card-background-color)",
                    borderRadius: "var(--border-radius-lg)",
                    overflowX: "auto",
                }}
            >
                <Table size="small">
                    <TableHead sx={{ backgroundColor: "var(--primary-color)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "white" }}>S.No</TableCell>
                            <TableCell sx={{ color: "white" }}>Description</TableCell>
                            <TableCell sx={{ color: "white" }}>Values</TableCell>
                            <TableCell sx={{ color: "white" }}>Active</TableCell>
                            <TableCell sx={{ color: "white" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attributes.map((attr) => (
                            <TableRow key={attr.id}>
                                <TableCell>{attr.sno}</TableCell>
                                <TableCell>{attr.description}</TableCell>
                                <TableCell>{parseValues(attr.valuesJson).join(", ")}</TableCell>
                                <TableCell>
                                    {attr.active ? (
                                        <span style={{ color: "var(--success-color)" }}>Active</span>
                                    ) : (
                                        <span style={{ color: "var(--error-color)" }}>Inactive</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => openEditModal(attr)} sx={{ color: "var(--primary-color)" }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(attr.id)} sx={{ color: "var(--error-color)" }}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 🟢 Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEditing ? "Edit Attribute" : "Add Attribute"}</DialogTitle>
                <DialogContent dividers>
                    {/* <TextField
                        label="S.No"
                        value={currentRow.sno}
                        disabled
                        fullWidth
                        margin="normal"
                    /> */}
                    <TextField
                        label="Description"
                        value={currentRow.description}
                        onChange={(e) => setCurrentRow({ ...currentRow, description: e.target.value })}
                        fullWidth
                        margin="normal"
                    />

                    {/* Values input with chips */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {currentRow.valuesJson.map((value, idx) => (
                            <Chip
                                key={idx}
                                label={value}
                                onDelete={() => handleDeleteValue(value)}
                                color="primary"
                            />
                        ))}
                        <TextField
                            placeholder="Type value and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddValue(e);
                                }
                            }}
                            size="small"
                        />
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={currentRow.active}
                                onChange={(e) => setCurrentRow({ ...currentRow, active: e.target.checked })}
                            />
                        }
                        label="Active"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)} color="error">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{ backgroundColor: "var(--primary-color)" }}
                    >
                        {isEditing ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
