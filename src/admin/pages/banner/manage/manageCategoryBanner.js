// import { useState, useEffect, useRef, useMemo, useContext } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useMediaQuery } from 'react-responsive';
// import {
//     Box, Typography, Button, Table, TableBody, TableCell,
//     TableContainer, TableHead, TableRow, CircularProgress, Alert,
//     IconButton, Chip, Tooltip, Dialog, DialogTitle,
//     DialogContent, DialogActions, Stack, Card, CardContent,
//     TextField, Avatar, MenuItem
// } from '@mui/material';
// import { Visibility, Edit, Delete, Add, Refresh, Search, CloudUpload } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import {
//     useBannersQuery,
// } from '../../../hooks/banners/categoryBanner/useCategoryBannerQuery';
// import {
//     useCategoryUpdateMutation,
//     useDeleteCategoryBannerMutation,
// } from '../../../hooks/banners/categoryBanner/useCategoryBanner';
// import { MyContext } from '../../../context/themeContext/themeContext';
// import './ManageCategoryBanner.css';
// import { useItemNames } from '../../../hooks/itemName/useItemNames';
// import BackdropProgress from '../../../components/backDrop/BackdropProgress';
// import BannerTable from '../../../components/banner/manageBannerTable';
// import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
// import { FaEdit,FaTrash } from 'react-icons/fa';

// const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

// const ManageCategoryBanner = () => {
//     const { themeMode } = useContext(MyContext);
//     const navigate = useNavigate();
//     const [selectedId, setSelectedId] = useState(null);
//     const [editFile, setEditFile] = useState(null);
//     const [editTitle, setEditTitle] = useState('');
//     const [editSubTitle, setEditSubTitle] = useState('');
//     const [editItemName, setEditItemName] = useState('');
//     const [editSubItemName, setEditSubItemName] = useState('');
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
//     const [itemName , setItemName] =useState();
    

//     const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
//     const [backdropOpen ,setBackdropOpen]=useState(false);
//     const [progress,setProgress]=useState(0);

//     console.log(bannersData,'datainhandpick');
//     const { mutate: updateCategoryBanner, isLoading: isUpdating } = useCategoryUpdateMutation();
//     const { mutate: deleteCategoryBanner, isLoading: isDeleting } = useDeleteCategoryBannerMutation();

//     const banners = useMemo(() => bannersData?.data || [], [bannersData]);

//     console.log('banners', loadedData)

//        const { items: allItems, loading: loadingItems } = useItemNames(null);


    
//         // Fetch subitems based on selected item ID
//     console.log(itemName ,'itemName')
//     const { items: subItem, loading: loadingSub } = useItemNames(itemName || null);
//         const subItems = subItem?.[0]?.subitems || [];

//     const itemCategories = allItems;
    
//     useEffect(() => {
//         if (banners.length > 0) {
//             const filtered = banners.filter(
//                 (banner) =>
//                     banner?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                     banner?.id.toString().includes(searchQuery)
//             );
//             setLoadedData(filtered);
//         } else {
//             setLoadedData([]);
//         }
//     }, [banners, searchQuery ,bannersData]);

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

//     const handleEditItemNameChange = (id) =>{
        
//         setItemName(id);
//         console.log(id, 'id');
//     }

//     const handleRefreshClick = () => {
//         refetch();
//         setSearchQuery('');
//     };

//     const handleEditClick = (banner) => {
//         setSelectedId(banner.id);
//         setEditFile(banner.image_path);
//         setEditTitle(banner.title || '');
//         setEditSubTitle(banner.subtitle || '');
//         setEditItemName(banner.itemName || '');
//         setEditSubItemName(banner.subItemName || '');
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

//     const handleItemNameChange = (e) => {
//         setEditItemName(e.target.value);
//         console.log(e.target.value, 'value');
//         setErrorMessage('');
//     };

//     const handleSubItemNameChange = (e) => {
//         setEditSubItemName(e.target.value);
//         setErrorMessage('');
//     };

//     const handleSaveEdit = (id) => {
//         if (!editTitle.trim()) {
//             setErrorMessage('Please provide a title for the banner.');
//             return;
//         }

//         if (!editItemName) {
//             setErrorMessage('Please select a valid item category.');
//             return;
//         }
//         setBackdropOpen(true);

//         const payload = {
//             id,
//             title: editTitle,
//             subtitle: editSubTitle,
//             itemName: editItemName,
//             subItemName: editSubItemName || null,
//         };
//         console.log(payload, 'payload');

//         if (editFile instanceof File) {
//             payload.image = editFile;
//         }
//         setProgress(20)
//             updateCategoryBanner(payload, {
        
//             onSuccess: () => {

//                 setSuccessMessage('Category Banner updated successfully!');
//                 setSelectedId(null);
//                 setEditFile(null);
//                 setEditTitle('');
//                 setEditSubTitle('');
//                 setEditItemName('');
//                 setEditSubItemName('');
//                 setProgress(100);
//                 setTimeout(() => {setSuccessMessage('');
//                     setBackdropOpen(false);
//                     setProgress(0);
//                 },
//                      3000);
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
//         setEditSubItemName('');
//         setErrorMessage('');
//     };

//     const handleDelete = (id) => {
//         if (window.confirm('Are you sure you want to delete this banner?')) {
//             deleteCategoryBanner(id, {
//                 onSuccess: () => {
//                     setSuccessMessage('Category Banner deleted successfully!');
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
//             <div className={`manage-category-banner-container ${themeMode}`}>
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
// const headers= [
//     {key:'sno' ,label:'S.No'},
//     {key:'image_path' ,label:'Image'},
//     {key:'title' , label:'Title'},
//     {key:'subtitle' ,label:'SubTitle'},
//     {key:'itemname' ,label:'ItemCtrName'},
//     {key:'actions' , label:'Actions' ,align:'center'}
// ]
//     const tableData = banners.map((item, index) => ({
//         id: item.id,
//         sno: index + 1,
//         image_path: item.image_path,
//         title: item.title || "—",
//         subtitle: item.subtitle || "—",
//         itemname: item.itemName || "—",
//     }));
//     return (
//         <div className={`manage-category-banner-container ${themeMode}`}>
//             {/* <Card className="manage-category-banner-card">
//                 <CardContent>
//                     <Box className="header-section" mb={3}>
//                         <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'}>
//                             <Box>
//                                 <Typography variant={isMobile ? 'body' : 'h4'} className="header-title">
//                                     Manage Category Banners
//                                 </Typography>
                           
//                             </Box>
//                             <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
//                                 <Button
//                                     variant="contained"
//                                     startIcon={<Add />}
//                                     onClick={() => navigate('/admin/categorybanner/add')}
//                                     size={isSmallScreen ? 'small' : 'medium'}
//                                     className="btn primary"
//                                 >
//                                     {isSmallScreen ? 'Add' : 'Add Banner'}
//                                 </Button>
//                                 <Button
//                                     variant="outlined"
//                                     startIcon={<Refresh />}
//                                     onClick={handleRefreshClick}
//                                     size={isSmallScreen ? 'small' : 'medium'}
//                                     className="btn secondary"
//                                 >
//                                     {isSmallScreen ? 'Refresh' : 'Refresh'}
//                                 </Button>
//                             </Stack>
//                         </Box>
//                     </Box>

                 

//                     <Box mb={3}>
//                         <TextField
//                             fullWidth
//                             placeholder="Search banners by title or ID..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             InputProps={{
//                                 startAdornment: <Search className="search-icon" />,
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
//                                             <TableCell>Item Category</TableCell>
//                                             <TableCell>Sub Item Name</TableCell>
//                                             <TableCell align="center">Actions</TableCell>
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
//                                                             {banner.subtitle || 'No Subtitle'}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <TextField
//                                                             select
//                                                             value={editItemName} // this should be ID
//                                                             onChange={(e) => {
//                                                                 // const selectedName = e.target.value;
//                                                                 const { id, name } = e.target.value; // ✅ get both from the object

//                                                                 handleItemNameChange({ target: { value: name } }); // for the banner API
//                                                                 handleEditItemNameChange(id); // for subitems
//                                                                 handleSubItemNameChange({ target: { value: '' } });
//                                                             }}

//                                                         >
//                                                             <MenuItem value="">Select an item category</MenuItem>
//                                                             {itemCategories.map((category) => (
//                                                                 <MenuItem
//                                                                     key={category.ITEMCTRID}
//                                                                     value={{ id: category.ITEMCTRID, name: category.ITEMCTRNAME }} // ✅ store both
//                                                                     data-id={category.ITEMCTRID} // ✅ attach the ID as a data attribute
//                                                                 >
//                                                                     {category.ITEMCTRNAME} 
//                                                                 </MenuItem>
//                                                             ))}
//                                                         </TextField>
//                                                     ) : (
//                                                         <Typography variant="body2" className="table-text">
//                                                             {banner.itemName || "No Category"}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>

//                                                 <TableCell>
//                                                     {selectedId === banner.id ? (
//                                                         <TextField
//                                                             select
//                                                             value={editSubItemName} // this should store subitem ID
//                                                             onChange={handleSubItemNameChange}
//                                                             size="small"
//                                                             fullWidth
//                                                             className="form-input"
//                                                             disabled={!editItemName} // disable until an item category is selected
//                                                         >
//                                                             <MenuItem value="">Select a sub item name</MenuItem>
//                                                             {subItems.map((sub) => (
//                                                                 <MenuItem key={sub.SUBITEMID} value={sub.SUBITEMNAME}>
//                                                                     {sub.SUBITEMNAME}
//                                                                 </MenuItem>
//                                                             ))}
//                                                         </TextField>
//                                                     ) : (
//                                                         <Typography variant="body2" className="table-text">
//                                                             {banner.subItemName || 'No Sub Item'}
//                                                         </Typography>
//                                                     )}
//                                                 </TableCell>

 
                                                
//                                                 <TableCell align="center">
//                                                     {selectedId === banner.id ? (
//                                                         <Stack direction="row" spacing={1} justifyContent="center">
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
//             </Card> */}

//             <BannerTable 
//                 title="Manage Category Banner"  
//                 headers={headers} 
//                 data={tableData} 
//                 renderCell={(key, row) => {
//                     // Image column
//                     if (key === "image_path") {
//                         return (
//                             <img
//                                 src={getProductImages(row.image_path)}
//                                 alt={row.title}
//                                 width={60}
//                                 height={40}
//                                 className="rounded shadow-sm object-cover"
//                             />
//                         );
//                     }

//                     // Actions column
//                     if (key === "actions") {
//                         return (
//                             <div className="flex gap-2 justify-center">
//                                 <button
//                                     onClick={() => navigate('/admin/categorybanner/add', { state: { id: row.id, mode: 'edit' } })}
//                                     className="text-blue-600 hover:text-blue-800 transition-colors"
//                                     title="Edit"
//                                 >
//                                     <FaEdit size={16} />
//                                 </button>
//                                 <button
//                                     onClick={() => handleDelete(row.id)}
//                                     className="text-red-600 hover:text-red-800 transition-colors"
//                                     title="Delete"
//                                 >
//                                     <FaTrash size={16} />
//                                 </button>
//                             </div>
//                         );
//                     }

//                     // Default value display
//                     return row[key];
//                 }}
//                 loading={isLoading} 
//                 emptyMessage='No Banners Found'
                
//             />
//         </div>
//     );
// };

// export default ManageCategoryBanner;

import React, { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBannersQuery } from '../../../hooks/banners/categoryBanner/useCategoryBannerQuery';
import { useDeleteCategoryBannerMutation } from '../../../hooks/banners/categoryBanner/useCategoryBanner';
import { MyContext } from '../../../context/themeContext/themeContext';
import BannerTable from '../../../components/banner/manageBannerTable';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ManageCategoryBanner = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();

    const { data: bannersData, isLoading, refetch } = useBannersQuery();
    const { mutate: deleteCategoryBanner } = useDeleteCategoryBannerMutation();

    // Safely extract banners array with proper fallback
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

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteCategoryBanner(id, {
                onSuccess: () => refetch(),
            });
        }
    };

    // Safe table data creation - only map if banners is an array
    const tableData = useMemo(() => {
        if (!Array.isArray(banners)) return [];

        return banners.map((item, index) => ({
            id: item.id,
            sno: index + 1,
            image_path: item.image_path,
            title: item.title || "—",
            // subtitle: item.subtitle || "—",
            itemname: item.itemName || "—",
        }));
    }, [banners]);

    const headers = [
        { key: 'sno', label: 'S.No' },
        { key: 'image_path', label: 'Image' },
        { key: 'title', label: 'Title' },
        // { key: 'subtitle', label: 'SubTitle' },
        { key: 'itemname', label: 'ItemCtrName' },
        { key: 'actions', label: 'Actions', align: 'center' },
    ];
    const handleOnClick = () => {
        navigate('/admin/categorybanner/add')
    }
    return (
        <div className={`max-w-8xl  mx-auto mt-4 p-3 sm:p-3`}>
            <BannerTable
                title="Manage Category Banner"
                 button={banners.length <= 10 ? ("Add Banner") : ('')}
                onClick = {handleOnClick}
                headers={headers}
                data={tableData}
                renderCell={(key, row) => {
                    if (key === 'image_path') {
                        return (
                            <img
                                src={getProductImages(row.image_path)}
                                alt={row.title}
                                width={40}
                                height={40}
                                className="rounded shadow-sm object-cover"
                            />
                        );
                    }

                    if (key === 'actions') {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/admin/categorybanner/add', { state: { id: row.id, mode: 'edit' } })}
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
                emptyMessage="No Banners Found"
            />
        </div>
    );
};

export default ManageCategoryBanner;