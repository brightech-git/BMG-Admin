
import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { motion, AnimatePresence, time } from 'framer-motion';
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
} from '../../../hooks/banners/offerBanner/useOfferBannerQuery';
import {
    useUpdateOfferBannerMutation,
    useDeleteOfferBannerMutation,
} from '../../../hooks/banners/offerBanner/useUploadOfferBanner';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageOfferBanner.css';

import { useItemNames } from '../../../hooks/itemName/useItemNames';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import { FaTrash ,FaEdit } from 'react-icons/fa';
import BannerTable from '../../../components/banner/manageBannerTable';
const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

const ManageOfferBanner = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSubTitle, setEditSubTitle] = useState('');
    const [editItemName, setEditItemName] = useState('');
    const [editSubItemName, setEditSubItemName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleItems, setVisibleItems] = useState(20);
    const [loadedData, setLoadedData] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const tableContainerRef = useRef(null);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

    const {items}=useItemNames();

    console.log(items,'items');

    const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
    const { mutate: updateOfferBanner, isLoading: isUpdating } = useUpdateOfferBannerMutation();
    const { mutate: deleteOfferBanner, isLoading: isDeleting } = useDeleteOfferBannerMutation();

    const banners = useMemo(() => bannersData?.data || [], [bannersData]);
    console.log(banners ,'offerbanner')

    const header = [
        {key:'sno',label:'S.No'},
        {key:'image_path' ,label:'Image'},
        // {key:'title',label:'Title'},
        // {key:'subtitle',label:'SubTitle'},
        {key:'itemname',label:'itemName'},
        {key:'actions',label:'Actions' , align:'center'},
    ]

    const tableData =
        loadedData.map((items ,idx) =>({
            id: items.id,
            sno: idx + 1,
            image_path:getProductImages(items.image_path),
            // title:items.title,
            // subtitle:items.subtitle ,
            itemname: items.item_name,
        }))
    
    console.log(banners ,'banner offers');


    useEffect(() => {
        if (banners.length > 0) {
            const filtered = banners.filter(
                (banner) =>
                    banner?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    banner?.id.toString().includes(searchQuery)
            );
            setLoadedData(filtered);
        } else {
            setLoadedData([]);
        }
    }, [banners, searchQuery]);

   
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteOfferBanner(id, {
                onSuccess: () => {
                    setSuccessMessage('Offer Banner deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to delete banner.');
                },
            });
        }
    };

    
    const handleOnClick = () => {
        navigate('/admin/offerbanner/add')
    }
    // if (error) {
    //     return (
    //         <div className={`manage-offer-banner-container ${themeMode}`}>
    //             <Box p={3}>
    //                 <Alert severity="error" className="alert error">
    //                     Failed to load banners. Please try again.
    //                 </Alert>
    //                 <Button
    //                     variant="contained"
    //                     onClick={() => refetch()}
    //                     className="btn primary"
    //                 >
    //                     Retry
    //                 </Button>
    //             </Box>
    //         </div>
    //     );
    // }
    return(
        <div className={`manage-offer-banner-container `}>
            <BannerTable headers={header} 
            data={tableData} 
                button={banners.length < 2 ? ("Add Banner") : ('')}
                onClick={handleOnClick}
            title='Manage Offer Banner'  
            emptyMessage='No Banners Found' renderCell={(key, row) => {
                                // Image column
                                if (key === "image_path") {
                                    return (
                                        <img
                                            src={getProductImages(row.image_path)}
                                            alt={row.title}
                                            style={{ width: 50, height: 45, objectFit: "contain"}}
                                            className="rounded  object-contain"
                                        />
                                    );
                                }
            
                                // Actions column
                                if (key === "actions") {
                                    return (
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() =>  navigate('/admin/offerbanner/add', { state: { id: row.id, mode: 'edit' } })}
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
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    );
                                }
            
                                // Default value display
                                return row[key];
                            }} />
                  </div>
    )
    // return (
    //     <div className={`manage-offer-banner-container ${themeMode}`}>
    //         <Card className="manage-offer-banner-card">
    //             <CardContent>
    //                 <Box className="header-section" mb={3}>
    //                     <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'}>
    //                         <Box>
    //                             <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
    //                                 Manage Offer Banners
    //                             </Typography>
                     
    //                         </Box>
    //                         <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
    //                             <Button
    //                                 variant="contained"
    //                                 startIcon={<Add />}
    //                                 onClick={() => navigate('/admin/offerbanner/add')}
    //                                 size={isSmallScreen ? 'small' : 'medium'}
    //                                 className="btn primary"
    //                             >
    //                                 {isSmallScreen ? 'Add' : 'Add Banner'}
    //                             </Button>
    //                             <Button
    //                                 variant="outlined"
    //                                 startIcon={<Refresh />}
    //                                 onClick={handleRefreshClick}
    //                                 size={isSmallScreen ? 'small' : 'medium'}
    //                                 className="btn secondary"
    //                             >
    //                                 {isSmallScreen ? 'Refresh' : 'Refresh'}
    //                             </Button>
    //                         </Stack>
    //                     </Box>
    //                 </Box>

    //                 {/* <Box className="summary-section" mb={3}>
    //                     <Box className="summary-content">
    //                         <Box className="summary-icon">
    //                             <Add />
    //                         </Box>
    //                         <Box>
    //                             <Typography variant="h6" className="summary-title">
    //                                 Banner Overview
    //                             </Typography>
    //                             <Typography variant="body2" className="summary-text">
    //                                 Total Banners: {loadedData.length} • Active Banners: {loadedData.filter(b => b.status === 'active').length}
    //                             </Typography>
    //                         </Box>
    //                     </Box>
    //                 </Box> */}

    //                 <Box mb={3}>
    //                     <TextField
    //                         fullWidth
    //                         placeholder="Search banners by title or ID..."
    //                         value={searchQuery}
    //                         onChange={(e) => setSearchQuery(e.target.value)}
    //                         InputProps={{
    //                             startAdornment: (
    //                                 <InputAdornment position="start">
    //                                     <Search className="search-icon" />
    //                                 </InputAdornment>
    //                             ),
    //                         }}
    //                         className="search-input"
    //                     />
    //                 </Box>

    //                 <AnimatePresence>
    //                     {errorMessage && (
    //                         <motion.div
    //                             initial={{ opacity: 0, height: 0 }}
    //                             animate={{ opacity: 1, height: 'auto' }}
    //                             exit={{ opacity: 0, height: 0 }}
    //                             transition={{ duration: 0.2 }}
    //                         >
    //                             <Alert severity="error" className="alert error">
    //                                 {errorMessage}
    //                             </Alert>
    //                         </motion.div>
    //                     )}
    //                     {successMessage && (
    //                         <motion.div
    //                             initial={{ opacity: 0, height: 0 }}
    //                             animate={{ opacity: 1, height: 'auto' }}
    //                             exit={{ opacity: 0, height: 0 }}
    //                             transition={{ duration: 0.2 }}
    //                         >
    //                             <Alert severity="success" className="alert success">
    //                                 {successMessage}
    //                             </Alert>
    //                         </motion.div>
    //                     )}
    //                 </AnimatePresence>

    //                 {isLoading ? (
    //                     <Box className="loading-container">
    //                         <CircularProgress className="loading-spinner" />
    //                     </Box>
    //                 ) : loadedData.length === 0 ? (
    //                     <Box className="empty-state">
    //                         <Alert severity="info" className="alert info">
    //                             {searchQuery ? 'No banners match your search' : 'No banners available'}
    //                         </Alert>
    //                     </Box>
    //                 ) : (
    //                     <>
    //                         <Box mb={2}>
    //                             <Typography variant="subtitle1" className="table-info">
    //                                 Showing {Math.min(visibleItems, loadedData.length)} of {loadedData.length} banners
    //                             </Typography>
    //                         </Box>
    //                         <TableContainer className="banner-table" ref={tableContainerRef}>
    //                             <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
    //                                 <TableHead>
    //                                     <TableRow>
    //                                         <TableCell>ID</TableCell>
    //                                         <TableCell>Image</TableCell>
    //                                         <TableCell>Title</TableCell>
    //                                         <TableCell>Subtitle</TableCell>
    //                                         <TableCell>Item Name</TableCell>
    //                                         <TableCell>Sub Item Name</TableCell>
    //                                         <TableCell align="center">Actions</TableCell>
    //                                     </TableRow>
    //                                 </TableHead>
    //                                 <TableBody>
    //                                     {loadedData.slice(0, visibleItems).map((banner) => (
    //                                         <TableRow key={banner.id} hover>
    //                                             <TableCell>
    //                                                 <Chip
    //                                                     label={`#${banner.id}`}
    //                                                     size="small"
    //                                                     className="id-chip"
    //                                                 />
    //                                             </TableCell>
    //                                             <TableCell>
    //                                                 {selectedId === banner.id ? (
    //                                                     <Box>
    //                                                         <input
    //                                                             type="file"
    //                                                             accept="image/*"
    //                                                             onChange={handleEditFileChange}
    //                                                             style={{ display: 'none' }}
    //                                                             id={`file-${banner.id}`}
    //                                                         />
    //                                                         <label htmlFor={`file-${banner.id}`}>
    //                                                             <Button
    //                                                                 component="span"
    //                                                                 variant="outlined"
    //                                                                 startIcon={<CloudUpload />}
    //                                                                 size="small"
    //                                                                 className="btn secondary"
    //                                                             >
    //                                                                 Choose Image
    //                                                             </Button>
    //                                                         </label>
    //                                                         {editFile && (
    //                                                             <Chip
    //                                                                 label={`Selected: ${editFile.name || 'Current Image'}`}
    //                                                                 size="small"
    //                                                                 className="file-chip"
    //                                                             />
    //                                                         )}
    //                                                     </Box>
    //                                                 ) : (
    //                                                     <Avatar
    //                                                         src={`${BASE_IMAGE_URL}${banner.image_path}`}
    //                                                         variant="rounded"
    //                                                         className="banner-image"
    //                                                         onClick={() => handlePreviewClick(banner)}
    //                                                     />
    //                                                 )}
    //                                             </TableCell>
    //                                             <TableCell>
    //                                                 {selectedId === banner.id ? (
    //                                                     <TextField
    //                                                         value={editTitle}
    //                                                         onChange={handleEditTitleChange}
    //                                                         placeholder="Enter banner title"
    //                                                         size="small"
    //                                                         fullWidth
    //                                                         className="form-input"
    //                                                     />
    //                                                 ) : (
    //                                                     <Typography variant="body2" className="table-text">
    //                                                         {banner.title || 'Untitled Banner'}
    //                                                     </Typography>
    //                                                 )}
    //                                             </TableCell>
    //                                             <TableCell>
    //                                                 {selectedId === banner.id ? (
    //                                                     <TextField
    //                                                         value={editSubTitle}
    //                                                         onChange={handleSubTitleChange}
    //                                                         placeholder="Enter banner subtitle"
    //                                                         size="small"
    //                                                         fullWidth
    //                                                         className="form-input"
    //                                                     />
    //                                                 ) : (
    //                                                     <Typography variant="body2" className="table-text">
    //                                                         {banner.subtitle || 'No Subtitle'}
    //                                                     </Typography>
    //                                                 )}
    //                                             </TableCell>
    //                                             <TableCell>
    //                                                 {selectedId === banner.id ? (
    //                                                     <TextField
    //                                                         select
    //                                                         value={editItemName}
    //                                                         onChange={handleItemName}
    //                                                         size="small"
    //                                                         fullWidth
    //                                                         className="form-input"
    //                                                     >
    //                                                         <MenuItem value="">Select Item Name</MenuItem>
    //                                                         <MenuItem value="OFFER">Offer</MenuItem>
    //                                                     </TextField>
    //                                                 ) : (
    //                                                     <Typography variant="body2" className="table-text">
    //                                                         {banner.item_name || 'No Item Name'}
    //                                                     </Typography>
    //                                                 )}
    //                                             </TableCell>
    //                                             <TableCell>
    //                                                 {selectedId === banner.id ? (
    //                                                     <TextField
    //                                                         select
    //                                                         value={editSubItemName}
    //                                                         onChange={handleSubItemName}
    //                                                         size="small"
    //                                                         fullWidth
    //                                                         className="form-input"
    //                                                     >
    //                                                         <MenuItem value="">Select Sub Item Name</MenuItem>
    //                                                         <MenuItem value="MEN">Men</MenuItem>
    //                                                         <MenuItem value="WOMEN">Women</MenuItem>
    //                                                         <MenuItem value="KIDS">Kids</MenuItem>
    //                                                     </TextField>
    //                                                 ) : (
    //                                                     <Typography variant="body2" className="table-text">
    //                                                         {banner.sub_item_name || 'No Sub Item Name'}
    //                                                     </Typography>
    //                                                 )}
    //                                             </TableCell>
    //                                             <TableCell align="center">
    //                                                 {selectedId === banner.id ? (
    //                                                     <Stack direction="row" spacing={1} justifyContent="center">
    //                                                         <Button
    //                                                             size="small"
    //                                                             variant="contained"
    //                                                             onClick={() => handleSaveEdit(banner.id)}
    //                                                             disabled={isUpdating}
    //                                                             className="btn primary"
    //                                                         >
    //                                                             {isUpdating ? <CircularProgress size={16} /> : 'Save'}
    //                                                         </Button>
    //                                                         <Button
    //                                                             size="small"
    //                                                             variant="outlined"
    //                                                             onClick={handleCancelEdit}
    //                                                             disabled={isUpdating}
    //                                                             className="btn secondary"
    //                                                         >
    //                                                             Cancel
    //                                                         </Button>
    //                                                     </Stack>
    //                                                 ) : (
    //                                                     <Stack direction="row" spacing={1} justifyContent="center">
    //                                                         <Tooltip title="View Details">
    //                                                             <IconButton
    //                                                                 size="small"
    //                                                                 onClick={() => handlePreviewClick(banner)}
    //                                                                 className="action-icon"
    //                                                             >
    //                                                                 <Visibility />
    //                                                             </IconButton>
    //                                                         </Tooltip>
    //                                                         <Tooltip title="Edit Banner">
    //                                                             <IconButton
    //                                                                 size="small"
    //                                                                 onClick={() => handleEditClick(banner)}
    //                                                                 disabled={isDeleting}
    //                                                                 className="action-icon"
    //                                                             >
    //                                                                 <Edit />
    //                                                             </IconButton>
    //                                                         </Tooltip>
    //                                                         <Tooltip title="Delete Banner">
    //                                                             <IconButton
    //                                                                 size="small"
    //                                                                 onClick={() => handleDelete(banner.id)}
    //                                                                 disabled={isDeleting}
    //                                                                 className="action-icon"
    //                                                             >
    //                                                                 <Delete />
    //                                                             </IconButton>
    //                                                         </Tooltip>
    //                                                     </Stack>
    //                                                 )}
    //                                             </TableCell>
    //                                         </TableRow>
    //                                     ))}
    //                                 </TableBody>
    //                             </Table>
    //                         </TableContainer>

    //                         {isLoadingMore && (
    //                             <Box className="loading-more">
    //                                 <CircularProgress size={20} className="loading-spinner" />
    //                                 <Typography className="loading-text">
    //                                     Loading more...
    //                                 </Typography>
    //                             </Box>
    //                         )}
    //                     </>
    //                 )}

    //                 <Dialog
    //                     open={previewModal}
    //                     onClose={() => setPreviewModal(false)}
    //                     maxWidth="md"
    //                     fullWidth
    //                     className="preview-dialog"
    //                 >
    //                     <DialogTitle className="dialog-title">
    //                         Banner Details Preview
    //                     </DialogTitle>
    //                     <DialogContent className="dialog-content">
    //                         {selectedBanner && (
    //                             <Box>
    //                                 <Box className="preview-header">
    //                                     <Typography variant="h6" className="preview-title">
    //                                         {selectedBanner.title || 'Untitled Banner'}
    //                                     </Typography>
    //                                     <Typography variant="body1" className="preview-id">
    //                                         ID: #{selectedBanner.id}
    //                                     </Typography>
    //                                     <Typography variant="body2" className="preview-date">
    //                                         Created: {new Date(selectedBanner.created_at).toLocaleString()}
    //                                     </Typography>
    //                                 </Box>
    //                                 <Box className="preview-image-container">
    //                                     <img
    //                                         src={`${BASE_IMAGE_URL}${selectedBanner.image_path}`}
    //                                         alt={selectedBanner.title || 'Banner'}
    //                                         className="preview-image"
    //                                     />
    //                                     <Typography variant="body2" className="preview-image-url">
    //                                         {BASE_IMAGE_URL}{selectedBanner.image_path}
    //                                     </Typography>
    //                                 </Box>
    //                             </Box>
    //                         )}
    //                     </DialogContent>
    //                     <DialogActions>
    //                         <Button
    //                             onClick={() => setPreviewModal(false)}
    //                             variant="contained"
    //                             className="btn primary"
    //                         >
    //                             Close
    //                         </Button>
    //                     </DialogActions>
    //                 </Dialog>
    //             </CardContent>
    //         </Card>
    //     </div>
    // );
};

export default ManageOfferBanner;