import { useState } from "react";
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import { useUploadCategory } from "../../../hooks/itemCategory/useUploadCategory";
import { useItemNames } from '../../../hooks/itemName/useItemNames';
import FileUploader from "../../../components/banner/FileUploader";
import { toast } from 'react-toastify';

const ItemCategory = () => {
    const { items } = useItemNames();
    const { mutateAsync: uploadCategory, isLoading } = useUploadCategory();

    const [selectedItem, setSelectedItem] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [resetKey, setResetKey] = useState(0); // force FileUploader reset

    const handleFileSelect = (file, error) => {
        setSelectedFile(file);
        setFileError(error);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile || !selectedItem) {
            toast.error("Please select both an image and an item.");
            return;
        }

        try {
            console.log('data',selectedFile,selectedItem)
            await uploadCategory({ image: selectedFile, itemName: selectedItem });
            toast.success("Category uploaded successfully!");

            // Reset file and item after upload
            setSelectedFile(null);
            setSelectedItem('');
            setFileError(null);

            // Force FileUploader to reset preview
            setResetKey(prev => prev + 1);
        } catch (error) {
            console.error(error);
            toast.error("Upload failed. Please try again.");
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 600,
                mx: "auto",
                mt: 5,
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Typography variant="h5" mb={3} textAlign="center">
                Upload Item Category
            </Typography>

            <form onSubmit={handleUpload}>
                {/* FileUploader */}
                <FileUploader
                    key={resetKey} // key change will reset internal state
                    onFileSelect={handleFileSelect}
                    loading={isLoading}
                    initialPreview={null}
                />

                {/* Item Select */}
                <FormControl fullWidth sx={{ my: 3 }}>
                    <InputLabel id="item-name-label">Select Item</InputLabel>
                    <Select
                        labelId="item-name-label"
                        value={selectedItem}
                        label="Select Item"
                        onChange={(e) => setSelectedItem(e.target.value)}
                    >
                        {items?.map((item) => (
                            <MenuItem key={item.ITEMCTRID} value={item.ITEMCTRNAME}>
                                {item.ITEMCTRNAME}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Upload Button */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isLoading || !selectedFile || !selectedItem}
                    sx={{ py: 1.5 }}
                >
                    {isLoading ? <CircularProgress size={24} /> : "Upload Category"}
                </Button>
            </form>
        </Box>
    );
};

export default ItemCategory;
