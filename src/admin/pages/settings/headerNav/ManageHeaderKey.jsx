import { useState, useContext ,useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useHeaderKeys, useDeleteHeaderKey} from '../../../hooks/navItems/useHeaderNavKey';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import { MyContext } from '../../../context/themeContext/themeContext';
import BannerTable from '../../../components/banner/manageBannerTable';
import { FaTrash  , FaEdit } from 'react-icons/fa';

const ManageHeaderNavKey = () => {
    
    const navigate = useNavigate();

    const { data: headerKeys, isLoading, refetch } = useHeaderKeys();
    const { mutate: deleteHeaderKey } = useDeleteHeaderKey();

    console.log(headerKeys,'headerKeys');


    const handleDelete = (id) => {
        if (window.confirm("Delete this HeaderKey?")) {
            deleteHeaderKey(id, {
                onSuccess: () => refetch(), // Refresh list after deletion
            });
        }
    };

    console.log(headerKeys,'headerKeys');

    const tableData = headerKeys ? headerKeys.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        name: item.name || "—",
        active: item.active || "—",
        order: item.displayOrder || "—",
        dropdown: item.isDropdown ,
        link:item.link,
        filterKey: item.filterLabel,
        filterId: item.filterId

    })) : [] ;
    const handleClick = () => navigate('/admin/header/setting/add')

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Header Keys"
                button= "Add New"
                onClick={handleClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "name", label: "Key Name" },
                    { key: "dropdown", label: "DropDown" },
                    {key:"filterKey" ,label:"Filter Key" },
                    { key: "link", label: "Link" },
                    { key: "order", label: "Display Order" },
                    { key: "active", label: "Active" },
                    

                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                    
                    if(key === "dropdown") {
                        return(
                            <div>
                                {row[key] === "Y" ? "Yes" : "No"}
                            </div>
                        )
                    }
                 
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/admin/header/setting/add', { state: { rowData: row, mode: 'edit' } })}
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

export default ManageHeaderNavKey;