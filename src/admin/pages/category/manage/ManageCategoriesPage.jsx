import { useState, useContext ,useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useMenu, useUpdateMenuItem, useDeleteMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    Image as ImageIcon,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageCategoriesPage.css';
import BannerTable from '../../../components/banner/manageBannerTable';
import { FaTrash  , FaEdit } from 'react-icons/fa';

const ManageCategoriesPage = () => {
    
    const navigate = useNavigate();

    const { data: banner, isLoading, refetch } = useMenu();
    const { mutate: deleteBanner } = useDeleteMenuItem();

    console.log(banner,'banner');

    const handleDelete = (id) => {
        if (window.confirm("Delete this banner?")) {
            deleteBanner(id, {
                onSuccess: () => refetch(), // Refresh list after deletion
            });
        }
    };


    const tableData = banner?.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        LABEL: item.LABEL || "—",
        KEY: item.MENU_KEY || "—",
        VALUE: item.VALUE || "—",
        CATEGORY: item.CATEGORY === "Y" ? 'Yes' : 'No',
        ACTIVE: item.ACTIVE === "Y" ? 'Yes' : 'No',
        ORDER: item.DISPLAYORDER || "—",

    }));
    const handleClick = () => navigate('/category/add')

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Banners"
                button= "Add New"
                onClick={handleClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "LABEL", label: "Label" },
                    { key: "KEY", label: "Key Name" },
                    { key: "VALUE", label: "Key Value" },
                    { key: "CATEGORY", label: "IsCategory" },
                    { key: "ACTIVE", label: "Active" },
                    { key: "ORDER", label: "Display Order" },

                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                   
                 
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/category/add', { state: { rowData: row, mode: 'edit' } })}
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

export default ManageCategoriesPage;