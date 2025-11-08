import { useState } from "react";
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
import FileUploader from "../../../components/banner/FileUploader";

import  useCategories from '../../../hooks/itemCategory/useItemCategory'
import { useDeleteCategory, useUpdateCategory } from '../../../hooks/itemCategory/useUploadCategory'
import { getProductImages } from "../../../../utils/image/getProductImages";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import { useNavigate } from "react-router-dom";

const baseUrl = "https://app.bmgjewellers.com";

const ManageItemCategory = () => {
    const { data: categories, isLoading, isError } = useCategories();
    const { mutateAsync: deleteCategory } = useDeleteCategory();
    const { mutateAsync: updateCategory, isLoading: updating } = useUpdateCategory();

    const [editingId, setEditingId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState("");
    const { items } = useItemNames();
    const navigate = useNavigate();

    const handleDelete = async (id) => {

        try {
            await deleteCategory( id );
            toast.success("Category deleted successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete category");
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setSelectedItemName(category.item_name);
        setSelectedFile(null); // reset file
    };

    const handleUpdate = async () => {
        if (!selectedItemName) {
            toast.error("Item name is required");
            return;
        }

        try {
            console.log(editingId ,selectedItemName ,selectedFile ,'update')
            await updateCategory({ id: editingId, itemName: selectedItemName, image: selectedFile });
            toast.success("Category updated successfully!");
            setEditingId(null);
            setSelectedFile(null);
            setSelectedItemName("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update category");
        }
    };

    if (isLoading) return <CircularProgress />;
    if (isError) return <Typography color="error">Failed to load categories</Typography>;

    return (
        <Box sx={{ maxWidth: "95%", mx: "auto", mt: 5 }}>
            <Box sx={{display:'flex' ,justifyContent:'space-between' ,flexDirection:'row' ,mb:{xs:2,md:3}}}>
                <Typography variant="h5" mb={3}>
                    Manage Item Categories
                </Typography>

                <Button variant="contained" color="primary" size="small" onClick={() => navigate("/admin/item-category/add")} >
                    Add Item Category
                </Button>
            </Box>
           
      

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="categories table">
                    <TableHead>
                        <TableRow>
                            <TableCell>S.No</TableCell>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories?.map((category, index) => {
                            const images = getProductImages(category.image_path);

                            return (
                                <TableRow key={category.id}>
                                    <TableCell>{index + 1}</TableCell>

                                    <TableCell>
                                        {editingId === category.id ? (
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <InputLabel id="item-select-label">Select Item</InputLabel>
                                                <Select
                                                    labelId="item-select-label"
                                                    value={selectedItemName}       // state variable holding selected value
                                                    label="Select Item"
                                                    onChange={(e) => setSelectedItemName(e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {items.map((item) => (
                                                        <MenuItem key={item.id} value={item.ITEMCTRNAME}>
                                                            {item.ITEMCTRNAME}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            // <input
                                            //     type="text"
                                            //     value={selectedItemName}
                                            //     onChange={(e) => setSelectedItemName(e.target.value)}
                                            //     style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                                            // />
                                        ) : (
                                            category.item_name
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {editingId === category.id ? (
                                            <FileUploader
                                                key={editingId} // reset FileUploader for each edit
                                                initialPreview={images[0]}
                                                onFileSelect={(file) => setSelectedFile(file)}
                                                height={80}
                                                width={80}
                                            />
                                        ) : (
                                            <img src={images[0]} alt={category.item_name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                                        )}
                                    </TableCell>

                                    {/* <TableCell>{new Date(category.created_at).toLocaleString()}</TableCell> */}

                                    <TableCell align="center">
                                        {editingId === category.id ? (
                                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                <Button variant="contained" size="small" onClick={handleUpdate} disabled={updating}>
                                                    {updating ? <CircularProgress size={20} /> : "Save"}
                                                </Button>
                                                <Button variant="outlined" size="small" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                <IconButton color="primary" onClick={() => handleEdit(category)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(category.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ManageItemCategory;
