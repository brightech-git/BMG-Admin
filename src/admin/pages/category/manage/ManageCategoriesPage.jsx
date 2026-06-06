import { useState, useContext ,useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useMenu, useUpdateMenuItem, useDeleteMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import { MyContext } from '../../../context/themeContext/themeContext';
import BannerTable from '../../../components/banner/manageBannerTable';
import { FaTrash  , FaEdit } from 'react-icons/fa';

const ManageCategoriesPage = () => {
    
    const navigate = useNavigate();

    const { data: headerContent, isLoading, refetch } = useMenu();


    const { mutate: deleteBanner } = useDeleteMenuItem();

    console.log(headerContent,'headerContent');

    const handleDelete = (id) => {
        if (window.confirm("Delete this header content?")) {
            deleteBanner(id, {
                onSuccess: () => refetch(), // Refresh list after deletion
            });
        }
    };


    const tableData = headerContent?.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        headerKey: item.name || "—",
        label: item.label || "—",
        key: item.menu_key || "—",
        value: item.value || "—",
        category: item.category === "Y" ? 'Yes' : 'No',
        active: item.active === "Y" ? 'Yes' : 'No',
        order: item.displayorder || "—",
        headerContent : item

    }));
    const handleClick = () => navigate('/category/add')

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Header Contents"
                button= "Add New"
                onClick={handleClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    {key:"headerKey" , label: "Header Key" },
                    { key: "label", label: "Label" },
                    { key: "key", label: "Key Name" },
                    { key: "value", label: "Key Value" },
                    { key: "category", label: "IsCategory" },
                    { key: "isItem", label: "Item Category" },

           
                    { key: "active", label: "Active" },
                    { key: "order", label: "Display Order" },

                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                   
                 
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/category/add', { state: { rowData: row.headerContent, mode: 'edit' } })}
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
                emptyMessage="No Header Contents found"
            />
        </div>
    );
};

export default ManageCategoriesPage;