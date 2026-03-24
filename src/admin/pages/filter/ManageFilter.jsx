import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetAllFilterContents ,useDeleteFilterContent } from '../../hooks/filter/useFilterContent';
import 'animate.css';
import BannerTable from '../../components/banner/manageBannerTable';


const ManageFilterContent = () => {
    const navigate = useNavigate();
    const { data: filterContentsData, isLoading, error, refetch } = useGetAllFilterContents();
    const { mutate: deleteFilterContent } = useDeleteFilterContent();

    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Get filter contents
    const filterContents = useMemo(() => {
        if (!filterContentsData || !Array.isArray(filterContentsData.filters)) {
            return [];
        }
        return filterContentsData.filters;
    }, [filterContentsData]);


    const handleRefresh = () => {
        refetch();
        setSearchQuery('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this filter content?')) {
            deleteFilterContent(id, {
                onSuccess: () => {
                    setSuccessMessage('Filter content deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: () => {
                    setSuccessMessage('Failed to delete filter content');
                    setTimeout(() => setSuccessMessage(''), 3000);
                },
            });
        }
    };

    const handleAdd = () => {
        navigate('/admin/filter/add');
    };

    const handleEdit = (content) => {
   
        navigate('/admin/filter/add', {
            state: {
                mode: 'edit',
                filterData: content
            }
        });
    };

    // Determine if a content is range type
    // const isRangeType = (content) => {
    //     return content?.min > 0 || content?.max > 0;
    // };

    // Get display value based on type
    const getDisplayValue = (content) => {
        if (content.isRange) {
            const min = content.min ?? '?';
            const max = content.max ?? '?';
            const step = content.step ? ` (step: ${content.step})` : '';
            return `${min} - ${max}${step}`;
        }
        return content.filterValue || '-';
    };

  
    // Prepare table data from API response
    const tableData = useMemo(() => {
        return filterContents.map((content, idx) => {

            return {
                sno: idx + 1,
                id: content.id,
                filterTitle: content.filterTitle,
                filterValue:content.filterValue,
                filterId: content.filterId,
                filterKey:content.filterKey,
                displayValue: getDisplayValue(content),
                isRange: content.isRange,
                active: content.isActive,
                displayOrder: content.displayOrder,
                // Store full content object for actions
                _filterData: content
            };
        });
    }, [filterContents]);

    const headers = [
        { key: 'sno', label: 'S.No', width: '60px' },
        { key: 'filterKey', label: 'Filter Key', align: 'left' },
        { key: 'filterTitle', label: 'Filter Title', align: 'left' },
        { key: 'displayValue', label: 'Value / Range', align: 'left' },
        { key: 'displayOrder', label: 'Order', align: 'center', width: '70px' },
        { key: 'active', label: 'Status', align: 'center', width: '80px' },
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
                    Failed to load filter contents. Please try again.
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
                    title="Manage Filter Contents"
                    description={`${filterContents.length} filter content${filterContents.length !== 1 ? 's' : ''} available`}
                    button='Add Filter Content'
                    onClick={handleAdd}
                    onRefresh={handleRefresh}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search by title, key, or value..."
                    headers={headers}
                    data={tableData}
                    loading={isLoading}
                    emptyMessage="No filter contents found. Add your first filter content to get started."
                    renderCell={(key, row) => {
                        // Status column (Active)

                      
                        if (key === "active") {
                            return row[key] === true ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    Active
                                </span>
                            ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                    Inactive
                                </span>
                            );
                        }

                        // Input Used column
                        if (key === "used") {
                            return row[key] === true ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    Yes
                                </span>
                            ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                    No
                                </span>
                            );
                        }

                        // Display Value with range indicator
                        if (key === "displayValue") {
                            return (
                                <div className="flex items-center gap-2">
                                    {row.isRange && (
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-medium">
                                            Range
                                        </span>
                                    )}
                                    <span className="text-gray-800">{row[key]}</span>
                                </div>
                            );
                        }

                        // Display Order
                        if (key === "displayOrder") {
                            return (
                                <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                                    {row[key]}
                                </span>
                            );
                        }

                        // Actions column
                        if (key === 'actions') {
                            return (
                                <div className="flex gap-2 justify-center animate__animated animate__fadeIn">
                                    <button
                                        onClick={() => handleEdit(row._filterData)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm flex items-center gap-1 hover:scale-110 transform duration-200"
                                        title="Edit Filter Content"
                                    >
                                        <span className="text-lg">✏️</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm flex items-center gap-1 hover:scale-110 transform duration-200"
                                        title="Delete Filter Content"
                                    >
                                        <span className="text-lg">🗑️</span>
                                    </button>
                                </div>
                            );
                        }

                        // Default rendering
                        return <span className="text-gray-800">{row[key]}</span>;
                    }}
                />
            </motion.div>
        </div>
    );
};

export default ManageFilterContent;