import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useGetAllFilterSettings ,useDeleteFilterSetting } from '../../../hooks/filter/useFilterSetting';

import 'animate.css';
import BannerTable from '../../../components/banner/manageBannerTable';




const ManageFilterSettings = () => {
    const navigate = useNavigate();
    const { data: filtersData, isLoading, error, refetch } = useGetAllFilterSettings();


    const { mutate: deleteFilterKey } = useDeleteFilterSetting();

    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const filters = useMemo(() => {
        if (!filtersData || !Array.isArray(filtersData.data)) {
            return [];
        }
        return filtersData.data;
    }, [filtersData]);

    console.log(filters, 'filters')

    const handleRefresh = () => {
        refetch();
        setSearchQuery('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteFilterKey(id, {
                onSuccess: () => {
                    setSuccessMessage('Budget Banner deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: () => {
                    setSuccessMessage('Failed to delete banner');
                    setTimeout(() => setSuccessMessage(''), 3000);
                },
            });
        }
    };


    const handleAdd = () => {
        navigate('/admin/filter/setting/add');
    };

    const handleEdit = (filter) => {
        console.log(filter,'filter')
        // Send full banner details including images array when editing
        navigate('/admin/filter/setting/add', {
            state: {
                mode: 'edit',
                filterData: filter // Send entire banner object
            }
        });
    };

    // Prepare table data from API response
    const tableData = useMemo(() => {
        return filters.map((filter, idx) => ({
            sno: idx + 1,
            id: filter.id,
            filterLabel:filter.filterLabel,
            filterKey: filter.filterKey,
            active:filter.isActive,
            used:filter.isUsed,

            // Store full banner object for actions
            _filterData: filter
        }));
    }, [filters]);

    

    const headers = [
        { key: 'sno', label: 'S.No', width: '80px' },

        { key: 'filterLabel', label: 'Filter Name',align:'center' },
        { key: 'filterKey', label: 'Filter Key' ,align:'center' },
        { key: 'active', label: 'IsActive' ,align:'center'},
        { key: 'used', label: 'IsUsed'  ,align:'center' },

        { key: 'actions', label: 'Actions', align: 'center', width: '100px' },
    ];

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 animate__animated animate__shakeX"
            >
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Failed to load banners. Please try again.
                </div>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors animate__animated animate__pulse"
                >
                    Retry
                </button>
            </motion.div>
        );
    }

    return (
        <div className="p-2">
            {/* Success Message */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-2 p-2 rounded-lg ${successMessage.includes('Failed')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                        } animate__animated animate__fadeInDown`}
                >
                    {successMessage}
                </motion.div>
            )}

            {/* BannerTable Component */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <BannerTable
                    title="Manage Filters"
                    description={`${filters.length} banner${filters.length !== 1 ? 's' : ''} available`}
                    button='Add Filter'
                    onClick={handleAdd}
                    onRefresh={handleRefresh}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search by title or image key..."
                    headers={headers}
                    data={tableData}
                    loading={isLoading}
                    emptyMessage="No banners found. Add your first banner to get started."
                    renderCell={(key, row) => {
                        // Image Key column
                        if(key === "active"){
                            console.log(row, 'row[key]')
                            if( row[key] === true){
                                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                            }else{
                                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
                            }
                        }
                        if (key === "used") {
                            console.log(row, 'row[key]')
                            if (row[key] === true) {
                                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                            } else {
                                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
                            }
                        }
                       
                        // Actions column
                        if (key === 'actions') {
                            return (
                                <div className="flex gap-2 justify-center animate__animated animate__fadeIn">
                                    <button
                                        onClick={() => handleEdit(row._filterData)}
                                        className="text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-1 animate__animated animate__pulse animate__infinite"
                                        title="Edit Banner"
                                    >
                                        <span>✏️</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        className="text-red-50 text-red-600  rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-1"
                                        title="Delete Banner"
                                    >
                                        <span>🗑️</span>
                                    </button>
                                </div>
                            );
                        }

                        // Default rendering
                        return <span className="text-gray-800 ">{row[key]}</span>;
                    }}
                />
            </motion.div>


        </div>
    );
};

export default ManageFilterSettings;