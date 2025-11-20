import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Card, CardContent,
    TextField, Avatar, MenuItem, InputAdornment
} from '@mui/material';
import { Visibility, Edit, Delete, Add, Refresh, Search, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    useBannersQuery,
} from '../../../hooks/banners/occasionBanner/useOccasionBannerQuery';
import { useDeleteOccasionBannerMutation, useUpdateOccasionBannerMutation } from '../../../hooks/banners/occasionBanner/useUploadOccasionBanner';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageOccasionBanner.css';
import BannerTable from '../../../components/banner/manageBannerTable';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import { FaEdit ,FaTrash } from 'react-icons/fa';

import { useEcomMarketingAttributes } from '../../../hooks/market-options/useEcomMarketingAttributes';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

// const ManageOccasionBanner = () => {
//     const { themeMode } = useContext(MyContext);
//     const navigate = useNavigate();
//     const [selectedId, setSelectedId] = useState(null);
//     const [editFile, setEditFile] = useState(null);
//     const [editTitle, setEditTitle] = useState('');
//     const [editSubTitle, setEditSubTitle] = useState('');
//     const [editItemName, setEditItemName] = useState('');
//     const [editGender, setEditGender] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [visibleItems, setVisibleItems] = useState(20);
//     const [loadedData, setLoadedData] = useState([]);
//     const [isLoadingMore, setIsLoadingMore] = useState(false);
//     const [previewModal, setPreviewModal] = useState(false);
//     const [selectedBanner, setSelectedBanner] = useState(null);
//     const tableContainerRef = useRef(null);
//     const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
//     const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

//     const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
//     const { mutate: updateOccasionBanner, isLoading: isUpdating } = useUpdateOccasionBannerMutation();
//     const { mutate: deleteOccasionBanner, isLoading: isDeleting } = useDeleteOccasionBannerMutation();

//     const banners = useMemo(() => bannersData?.data || [], [bannersData?.data]);

//     const { attributes } = useEcomMarketingAttributes();

//     const genderAttribute = attributes?.find((attr) => attr.description === 'Gender');
//     const genderOptions = genderAttribute
//         ? JSON.parse(genderAttribute.valuesJson)
//         : [];

//     const occasionAttributes = attributes?.find(attr=>attr.description=="Occasion");
//     const occasionOptions = occasionAttributes
//         ? JSON.parse(occasionAttributes.valuesJson)
//         : [];

//     useEffect(() => {
//         if (banners.length > 0) {
//             const filtered = banners.filter(
//                 (banner) =>
//                     banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                     banner.id.toString().includes(searchQuery)
//             );
//             setLoadedData(filtered);
//         } else {
//             setLoadedData([]);
//         }
//     }, [banners, searchQuery]);

//     useEffect(() => {
//         const handleTableScroll = () => {
//             if (!tableContainerRef.current) return;

//             const container = tableContainerRef.current;
//             const scrollTop = container.scrollTop;
//             const scrollHeight = container.scrollHeight;
//             const clientHeight = container.clientHeight;

//             if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingMore) {
//                 setIsLoadingMore(true);
//                 setTimeout(() => {
//                     setVisibleItems((prev) => Math.min(prev + 20, loadedData.length));
//                     setIsLoadingMore(false);
//                 }, 300);
//             }
//         };

//         const tableContainer = tableContainerRef.current;
//         if (tableContainer) {
//             tableContainer.addEventListener('scroll', handleTableScroll);
//             return () => tableContainer.removeEventListener('scroll', handleTableScroll);
//         }
//     }, [visibleItems, loadedData.length, isLoadingMore]);

//     const handleRefreshClick = () => {
//         refetch();
//         setSearchQuery('');
//     };

//     const handleEditClick = (banner) => {
//         setSelectedId(banner.id);
//         setEditFile(banner.image_path);
//         setEditTitle(banner.title || '');
//         setEditSubTitle(banner.subtitle || '');
//         setEditItemName(banner.occasion || '');
//         setEditGender(banner.gender || '');
//         setErrorMessage('');
//     };

//     const handleEditFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         if (!file.type.match('image.*')) {
//             setErrorMessage('Please select a valid image file (JPEG, PNG, etc.)');
//             return;
//         }

//         if (file.size > 5 * 1024 * 1024) {
//             setErrorMessage('File size exceeds maximum limit of 5MB');
//             return;
//         }

//         setEditFile(file);
//         setErrorMessage('');
//     };

//     const handleEditTitleChange = (e) => {
//         setEditTitle(e.target.value);
//         setErrorMessage('');
//     };

//     const handleSubTitleChange = (e) => {
//         setEditSubTitle(e.target.value);
//         setErrorMessage('');
//     };

//     const handleGender = (e) => {
//         setEditGender(e.target.value);
//         setErrorMessage('');
//     };

//     const handleSaveEdit = (id) => {
//         if (!editTitle.trim()) {
//             setErrorMessage('Please provide a title for the banner.');
//             return;
//         }

//         const payload = {
//             id,
//             title: editTitle,
//             subtitle: editSubTitle,
//             occasion: editItemName,
//             gender: editGender,
//         };

//         if (editFile instanceof File) {
//             payload.image = editFile;
//         }

//         updateOccasionBanner(payload, {
//             onSuccess: () => {
//                 setSuccessMessage('Banner updated successfully!');
//                 setSelectedId(null);
//                 setEditFile(null);
//                 setEditTitle('');
//                 setEditSubTitle('');
//                 setEditItemName('');
//                 setEditGender('');
//                 setTimeout(() => setSuccessMessage(''), 3000);
//                 refetch();
//             },
//             onError: (error) => {
//                 setErrorMessage(error.response?.data?.error || 'Failed to update banner.');
//             },
//         });
//     };

//     const handleCancelEdit = () => {
//         setSelectedId(null);
//         setEditFile(null);
//         setEditTitle('');
//         setEditSubTitle('');
//         setEditItemName('');
//         setEditGender('');
//         setErrorMessage('');
//     };

//     const handleDelete = (id) => {
//         if (window.confirm('Are you sure you want to delete this banner?')) {
//             deleteOccasionBanner(id, {
//                 onSuccess: () => {
//                     setSuccessMessage('Banner deleted successfully!');
//                     setTimeout(() => setSuccessMessage(''), 3000);
//                     refetch();
//                 },
//                 onError: (error) => {
//                     setErrorMessage(error.response?.data?.error || 'Failed to delete banner.');
//                 },
//             });
//         }
//     };

//     const handlePreviewClick = (banner) => {
//         setSelectedBanner(banner);
//         setPreviewModal(true);
//     };

//     if (error) {
//         return (
//             <div className={`manage-occasion-banner-container ${themeMode}`}>
//                 <Box p={3}>
//                     <Alert severity="error" className="alert error">
//                         Failed to load banners. Please try again.
//                     </Alert>
//                     <Button
//                         variant="contained"
//                         onClick={() => refetch()}
//                         className="btn primary"
//                     >
//                         Retry
//                     </Button>
//                 </Box>
//             </div>
//         );
//     }

//     return (
//         <div className={`manage-occasion-banner-container ${themeMode}`}>
//             <Card className="manage-occasion-banner-card">
//                 <CardContent>
//                     <Box className="header-section" mb={2}>
//                         <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'}>
//                             <Box>
//                                 <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
//                                     Manage Occasion Banners
//                                 </Typography>
                             
//                             </Box>
//                             <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
//                                 <Button
//                                     variant="contained"
//                                     startIcon={<Add />}
//                                     onClick={() => navigate('/admin/occasionbanner/add')}
//                                     size={isSmallScreen ? 'small' : 'medium'}
//                                     className="btn primary"
//                                 >
//                                     {isSmallScreen ? 'Add' : 'Add Banner'}
//                                 </Button>
                               
//                             </Stack>
//                         </Box>
//                     </Box>

//                     {/* <Box className="summary-section" mb={2}>
//                         <Box className="summary-content">
                          
//                             <Box>
//                                 <Typography  className="summary-title">
//                                     Banner Overview
//                                 </Typography>
//                                 <Typography variant="body2" className="summary-text">
//                                     Total Banners: {loadedData.length} • Active Banners: {loadedData.filter(b => b.status === 'active').length}
//                                 </Typography>
//                             </Box>
//                         </Box>
//                     </Box> */}

//                     <Box mb={3}>
//                         <TextField
//                             fullWidth
//                             placeholder="Search banners by title or ID..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             InputProps={{
//                                 startAdornment: (
//                                     <InputAdornment position="start">
//                                         <Search className="search-icon" />
//                                     </InputAdornment>
//                                 ),
//                             }}
//                             className="search-input"
//                         />
//                     </Box>

//                     <AnimatePresence>
//                         {errorMessage && (
//                             <motion.div
//                                 initial={{ opacity: 0, height: 0 }}
//                                 animate={{ opacity: 1, height: 'auto' }}
//                                 exit={{ opacity: 0, height: 0 }}
//                                 transition={{ duration: 0.2 }}
//                             >
//                                 <Alert severity="error" className="alert error">
//                                     {errorMessage}
//                                 </Alert>
//                             </motion.div>
//                         )}
//                         {successMessage && (
//                             <motion.div
//                                 initial={{ opacity: 0, height: 0 }}
//                                 animate={{ opacity: 1, height: 'auto' }}
//                                 exit={{ opacity: 0, height: 0 }}
//                                 transition={{ duration: 0.2 }}
//                             >
//                                 <Alert severity="success" className="alert success">
//                                     {successMessage}
//                                 </Alert>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>

//                     {isLoading ? (
//                         <Box className="loading-container">
//                             <CircularProgress className="loading-spinner" />
//                         </Box>
//                     ) : loadedData.length === 0 ? (
//                         <Box className="empty-state">
//                             <Alert severity="info" className="alert info">
//                                 {searchQuery ? 'No banners match your search' : 'No banners available'}
//                             </Alert>
//                         </Box>
//                     ) : (
//                         <>
//                             <Box mb={2}>
//                                 <Typography variant="subtitle1" className="table-info">
//                                     Showing {Math.min(visibleItems, loadedData.length)} of {loadedData.length} banners
//                                 </Typography>
//                             </Box>
//                             <TableContainer className="banner-table" ref={tableContainerRef}>
//                                 <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
//                                     <TableHead>
//                                         <TableRow>
//                                             <TableCell>ID</TableCell>
//                                             <TableCell>Image</TableCell>
//                                             <TableCell>Title</TableCell>
//                                             <TableCell>Subtitle</TableCell>
//                                             <TableCell>Occasion</TableCell>
//                                             <TableCell>Gender</TableCell>
//                                             <TableCell align='center'>Actions</TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {loadedData.slice(0, visibleItems).map((banner) => (
//                                             <TableRow key={banner.id} hover>
//                                                 <TableCell>
//                                                     <Chip
//                                                         label={`#${banner.id}`}
//                                                         size="small"
//                                                         className="id-chip"
//                                                     />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <Box>
//                                                             <input
//                                                                 type="file"
//                                                                 accept="image/*"
//                                                                 onChange={handleEditFileChange}
//                                                                 style={{ display: 'none' }}
//                                                                 id={`file-${banner.id}`}
//                                                             />
//                                                             <label htmlFor={`file-${banner.id}`}>
//                                                                 <Button
//                                                                     component="span"
//                                                                     variant="outlined"
//                                                                     startIcon={<CloudUpload />}
//                                                                     size="small"
//                                                                     className="btn secondary"
//                                                                 >
//                                                                     Choose Image
//                                                                 </Button>
//                                                             </label>
//                                                             {editFile && (
//                                                                 <Chip
//                                                                     label={`Selected: ${editFile.name || 'Current Image'}`}
//                                                                     size="small"
//                                                                     className="file-chip"
//                                                                 />
//                                                             )}
//                                                         </Box>
//                                                     ) : (
//                                                         <Avatar
//                                                             src={`${BASE_IMAGE_URL}${banner.image_path}`}
//                                                             variant="rounded"
//                                                             className="banner-image"
//                                                             onClick={() => handlePreviewClick(banner)}
//                                                         />
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <TextField
//                                                             value={editTitle}
//                                                             onChange={handleEditTitleChange}
//                                                             placeholder="Enter banner title"
//                                                             size="small"
//                                                             fullWidth
//                                                             className="form-input"
//                                                         />
//                                                     ) : (
//                                                         <Typography variant="body2" className="table-text">
//                                                             {banner.title || 'Untitled Banner'}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <TextField
//                                                             value={editSubTitle}
//                                                             onChange={handleSubTitleChange}
//                                                             placeholder="Enter banner subtitle"
//                                                             size="small"
//                                                             fullWidth
//                                                             className="form-input"
//                                                         />
//                                                     ) : (
//                                                         <Typography variant="body2" className="table-text">
//                                                             {banner.subtitle || 'Untitled Banner'}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <TextField
//                                                             select
//                                                             value={editItemName}
//                                                             onChange={(e) => setEditItemName(e.target.value)}
//                                                             size="small"
//                                                             fullWidth
//                                                             className="form-input"
//                                                         >
//                                                             <MenuItem value="">Select an Occasion</MenuItem>
//                                                             {occasionOptions.map((occasion) => (
//                                                                 <MenuItem key={occasion} value={occasion}>
//                                                                     {occasion}
//                                                                 </MenuItem>
//                                                             ))}

                                                            
//                                                         </TextField>
//                                                     ) : (
//                                                         <Typography variant="body2" className="table-text">
//                                                             {banner.occasion || 'No Occasion'}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <TextField
//                                                             select
//                                                             value={editGender}
//                                                             onChange={handleGender}
//                                                             size="small"
//                                                             fullWidth
//                                                             className="form-input"
//                                                         >
//                                                             <MenuItem value="">Select Gender</MenuItem>
//                                                            { genderOptions.map((gender) => (
//                                                                 <MenuItem key={gender} value={gender}>
//                                                                     {gender}
//                                                                 </MenuItem>
//                                                             ))}
//                                                         </TextField>
//                                                     ) : (
//                                                         <Typography variant="body2" className="table-text">
//                                                             {banner.gender || 'No Gender'}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell >
//                                                     {selectedId === banner.id ? (
//                                                         <Stack spacing={1} >
//                                                             <Button
//                                                                 size="small"
//                                                                 variant="contained"
//                                                                 onClick={() => handleSaveEdit(banner.id)}
//                                                                 disabled={isUpdating}
//                                                                 className="btn primary"
//                                                             >
//                                                                 {isUpdating ? <CircularProgress size={16} /> : 'Save'}
//                                                             </Button>
//                                                             <Button
//                                                                 size="small"
//                                                                 variant="outlined"
//                                                                 onClick={handleCancelEdit}
//                                                                 disabled={isUpdating}
//                                                                 className="btn secondary"
//                                                             >
//                                                                 Cancel
//                                                             </Button>
//                                                         </Stack>
//                                                     ) : (
//                                                         <Stack direction="row" spacing={1} justifyContent="center">
//                                                             <Tooltip title="View Details">
//                                                                 <IconButton
//                                                                     size="small"
//                                                                     onClick={() => handlePreviewClick(banner)}
//                                                                     className="action-icon"
//                                                                 >
//                                                                     <Visibility />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                             <Tooltip title="Edit Banner">
//                                                                 <IconButton
//                                                                     size="small"
//                                                                     onClick={() => handleEditClick(banner)}
//                                                                     disabled={isDeleting}
//                                                                     className="action-icon"
//                                                                 >
//                                                                     <Edit />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                             <Tooltip title="Delete Banner">
//                                                                 <IconButton
//                                                                     size="small"
//                                                                     onClick={() => handleDelete(banner.id)}
//                                                                     disabled={isDeleting}
//                                                                     className="action-icon"
//                                                                 >
//                                                                     <Delete />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                         </Stack>
//                                                     )}
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </TableContainer>

//                             {isLoadingMore && (
//                                 <Box className="loading-more">
//                                     <CircularProgress size={20} className="loading-spinner" />
//                                     <Typography className="loading-text">
//                                         Loading more...
//                                     </Typography>
//                                 </Box>
//                             )}
//                         </>
//                     )}

//                     <Dialog
//                         open={previewModal}
//                         onClose={() => setPreviewModal(false)}
//                         maxWidth="md"
//                         fullWidth
//                         className="preview-dialog"
//                     >
//                         <DialogTitle className="dialog-title">
//                             Banner Details Preview
//                         </DialogTitle>
//                         <DialogContent className="dialog-content">
//                             {selectedBanner && (
//                                 <Box>
//                                     <Box className="preview-header">
//                                         <Typography variant="h6" className="preview-title">
//                                             {selectedBanner.title || 'Untitled Banner'}
//                                         </Typography>
//                                         <Typography variant="body1" className="preview-id">
//                                             ID: #{selectedBanner.id}
//                                         </Typography>
//                                         <Typography variant="body2" className="preview-date">
//                                             Created: {new Date(selectedBanner.created_at).toLocaleString()}
//                                         </Typography>
//                                     </Box>
//                                     <Box className="preview-image-container">
//                                         <img
//                                             src={`${BASE_IMAGE_URL}${selectedBanner.image_path}`}
//                                             alt={selectedBanner.title || 'Banner'}
//                                             className="preview-image"
//                                         />
//                                         <Typography variant="body2" className="preview-image-url">
//                                             {BASE_IMAGE_URL}{selectedBanner.image_path}
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             )}
//                         </DialogContent>
//                         <DialogActions>
//                             <Button
//                                 onClick={() => setPreviewModal(false)}
//                                 variant="contained"
//                                 className="btn primary"
//                             >
//                                 Close
//                             </Button>
//                         </DialogActions>
//                     </Dialog>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

const ManageOccasionBanner =() =>{

    const navigate=useNavigate();
    const { mutate: deleteBanner } = useDeleteOccasionBannerMutation();
    const { data: bannersData , isLoading ,isError ,refetch} = useBannersQuery();

    console.log(bannersData?.data ,'dataforoccasion')

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteBanner(id, {
                onSuccess: () => {
                    refetch();
                },
                
            });
        }
    };
    const handleOnClick = () => {
        navigate('/admin/occasionbanner/add')
    }
      const banners = useMemo(() => {
                if (!bannersData) return [];
        
                // Handle different possible response structures
                if (Array.isArray(bannersData)) {
                    return bannersData;
                } else if (Array.isArray(bannersData?.data)) {
                    return bannersData.data;
                } else if (Array.isArray(bannersData?.banners)) {
                    return bannersData.banners;
                } else if (Array.isArray(bannersData?.results)) {
                    return bannersData.results;
                }
        
                console.warn('Unexpected banners data structure:', bannersData);
                return [];
            }, [bannersData]);

    const header = [
        { key: "sno", label: "S.No" },
        { key: "image_path", label: "Image" },
        // { key: "title", label: "Title" },
        // { key: "subtitle", label: "Subtitle" },
        { key: "itemname", label: "Item Name" },
        { key: "actions", label: "Actions", align: "center" },
    ]

            console.log(banners ,'dataforoccasiosn')
    const tableData = banners.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.image_path,
        // title: item.title || "—",
        // subtitle: item.subtitle || "—",
        itemname: item.occasion || "—",
    }));
    return(
            <div className='max-w-8xl mx-auto mt-4 p-3'>
            <BannerTable  title="Manage Occasion Banner"
                button={banners.length < 3 ? ("Add Banner") : ('')} 
                onClick={handleOnClick}
                headers={header} data={tableData} 
                loading={isLoading} emptyMessage='No Banner Found'  
                renderCell={(key, row) => {
                                if (key === "image_path") {
                                    return (
                                        <img
                                            src={getProductImages(row.image_path)}
                                            alt={row.title}
                                            width={60}
                                            height={40}
                                            className="rounded shadow-sm object-cover"
                                        />
                                    );
                                }
                                if (key === "actions") {
                                    return (
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => navigate('/admin/occasionbanner/add', { state: { id: row.id, mode: 'edit' } })}
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
                            }} />
            </div>
    )
}

export default ManageOccasionBanner;