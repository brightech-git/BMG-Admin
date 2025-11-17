// import React, {
//     useState,
//     useEffect,
//     useRef,
//     useMemo,
//     useContext,
// } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useMediaQuery } from 'react-responsive';
// import { useNavigate } from 'react-router-dom';
// import { MyContext } from '../../../context/themeContext/themeContext';
// import {
//     Box,
//     Typography,
//     Button,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     CircularProgress,
//     Alert,
//     IconButton,
//     Chip,
//     Tooltip,
//     TextField,
//     Avatar,
//     Paper,
//     Select,
//     MenuItem,
//     FormControl,
// } from '@mui/material';
// import {
//     Visibility,
//     Edit,
//     Delete,
//     Add,
//     Refresh,
//     Search,
//     CloudUpload,
// } from '@mui/icons-material';

// import { useBannersQuery } from '../../../hooks/banners/mainBanner/useBannersQuery';
// import {
//     useUpdateBannerMutation,
//     useDeleteBannerMutation,
// } from '../../../hooks/banners/mainBanner/useUploadBannerMutation';
// import { useEcomMarketingAttributes } from '../../../hooks/market-options/useEcomMarketingAttributes';
// import { useItemNames } from '../../../hooks/itemName/useItemNames';
// import './ManageBanners.css';
// import BackdropProgress from '../../../components/backDrop/BackdropProgress';
// import BannerTable from '../../../components/banner/manageBannerTable';
// import { FaEdit,FaTrash } from 'react-icons/fa';

// const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

// const ManageBanner = () => {
//     const navigate = useNavigate();
//     const { themeMode } = useContext(MyContext);
//     const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

//     // ---------- STATE ----------
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
//     const [isLoadingMore, setIsLoadingMore] = useState(false);
//     const [showViewModal, setShowViewModal] = useState(false);
//     const [selectedBanner, setSelectedBanner] = useState(null);

//     const tableContainerRef = useRef(null);

//     // ---------- QUERIES ----------
//     const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
//     const { mutate: updateBanner, isPending: isUpdating } = useUpdateBannerMutation();
//     const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBannerMutation();

//     const banners = useMemo(() => bannersData?.data || [], [bannersData?.data]);

//     const { attributes } = useEcomMarketingAttributes();
//     const genderAttribute = attributes?.find((a) => a.description === 'Gender');
//     const genderOptions = genderAttribute
//         ? JSON.parse(genderAttribute.valuesJson)
//         : [];

//     const { items: itemNames } = useItemNames();
//     const [progress ,setProgress]=useState();
//     const [backdropOpen ,setBackdropOpen]=useState(false)

//     // ---------- FILTER ----------
//     const filtered = useMemo(() => {
//         if (!searchQuery) return banners;
//         const q = searchQuery.toLowerCase();
//         return banners.filter(
//             (b) =>
//                 (b.title && b.title.toLowerCase().includes(q)) ||
//                 b.id.toString().includes(q)
//         );
//     }, [banners, searchQuery]);

//     // ---------- INFINITE SCROLL ----------
//     useEffect(() => {
//         const el = tableContainerRef.current;
//         if (!el) return;

//         const onScroll = () => {
//             const { scrollTop, scrollHeight, clientHeight } = el;
//             if (
//                 scrollTop + clientHeight >= scrollHeight - 150 &&
//                 !isLoadingMore &&
//                 visibleItems < filtered.length
//             ) {
//                 setIsLoadingMore(true);
//                 setTimeout(() => {
//                     setVisibleItems((p) => Math.min(p + 20, filtered.length));
//                     setIsLoadingMore(false);
//                 }, 300);
//             }
//         };

//         el.addEventListener('scroll', onScroll);
//         return () => el.removeEventListener('scroll', onScroll);
//     }, [filtered.length, visibleItems, isLoadingMore]);

//     // ---------- MESSAGES ----------
//     useEffect(() => {
//         if (!successMessage && !errorMessage) return;
//         const t = setTimeout(() => {
//             setSuccessMessage('');
//             setErrorMessage('');
//         }, 3000);
//         return () => clearTimeout(t);
//     }, [successMessage, errorMessage]);

//     // ---------- HANDLERS ----------
//     const handleRefresh = () => {
//         refetch();
//         setSearchQuery('');
//     };

//     const handleView = (banner) => {
//         setSelectedBanner(banner);
//         setShowViewModal(true);
//     };

//     const handleEdit = (banner) => {
//         setSelectedId(banner.id);
//         setEditFile(null);
//         setEditTitle(banner.title || '');
//         setEditSubTitle(banner.subtitle || '');
//         setEditItemName(banner.itemname || '');
//         setEditGender(banner.gender || '');
//         setErrorMessage('');
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         if (!file.type.startsWith('image/')) {
//             setErrorMessage('Only image files are allowed');
//             return;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//             setErrorMessage('File must be < 5 MB');
//             return;
//         }
//         setEditFile(file);
//         setErrorMessage('');
//     };

//     const handleSave = (id) => {
//         if (!editFile && !editTitle.trim()) {
//             setErrorMessage('Provide at least a title or an image');
//             return;
//         }

//         setBackdropOpen(true)
//         setProgress(20)
//         updateBanner(
//             {
//                 id,
//                 image: editFile,
//                 title: editTitle,
//                 subtitle: editSubTitle,
//                 itemname: editItemName,
//                 gender: editGender,
//             },
//             {
//                 onSuccess: () => {
//                     setProgress(100);
//                     setSuccessMessage('Banner updated');
//                     resetEdit();
//                     refetch();
//                     setTimeout(() => {setSuccessMessage('');
//                         setBackdropOpen(false);
                     
//                      },3000)
//                 },
//                 onError: (err) => {
//                     setErrorMessage(
//                         (err.response && err.response.data && err.response.data.error) ||
//                         'Update failed'
//                     );
//                 },
//             }
//         );
//     };

//     const resetEdit = () => {
//         setSelectedId(null);
//         setEditFile(null);
//         setEditTitle('');
//         setEditSubTitle('');
//         setEditItemName('');
//         setEditGender('');
//         setErrorMessage('');
//     };

//     const handleDelete = (id) => {
//         if (!window.confirm('Delete this banner?')) return;
//         deleteBanner(id, {
//             onSuccess: () => {
//                 setSuccessMessage('Banner deleted');
//                 refetch();
//             },
//             onError: (err) => {
//                 setErrorMessage(
//                     (err.response && err.response.data && err.response.data.error) ||
//                     'Delete failed'
//                 );
//             },
//         });
//     };

//     // ---------- RENDER ----------
//     if (error) {
//         return (
//             <Box className={`manage-banner-container ${themeMode}`} p={3}>
//                 <Alert severity="error">
//                     Failed to load banners.{' '}
//                     <Button onClick={() => refetch()} size="small">
//                         Retry
//                     </Button>
//                 </Alert>
//             </Box>
//         );
//     }

//     return (

//         <>
//         <Box>
//                 <BackdropProgress open={backdropOpen} title="Processing..." body="" progress={progress} />
//         </Box>
//         <Box className={`manage-banner-container ${themeMode}`} p={isMobile ? 1 : 3}>
//             <Paper elevation={3} sx={{ p: 3 }}>
//                 {/* Header */}
//                 <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                     mb={2}
//                 >
//                     <Box>
//                         <Typography variant="h5">Manage Banners</Typography>
//                         <Typography variant="body2" color="text.secondary">
//                             View and edit all website banners
//                         </Typography>
//                     </Box>
//                     <Box display="flex" gap={1}>
//                         <Button
//                             variant="contained"
//                             color="success"
//                             startIcon={<Add />}
//                             onClick={() => navigate('/admin/banner/add')}
//                         >
//                             Add
//                         </Button>
//                         <Button
//                             variant="outlined"
//                             startIcon={<Refresh />}
//                             onClick={handleRefresh}
//                         >
//                             Refresh
//                         </Button>
//                     </Box>
//                 </Box>

//                     <BannerTable
//                         title="Manage Banners"
//                         headers={[
//                             { key: "sno", label: "S.No" },
//                             { key: "image_path", label: "Image" },
//                             { key: "title", label: "Title" },
//                             { key: "subtitle", label: "Subtitle" },
//                             { key: "itemname", label: "Item Name" },
//                             { key: "gender", label: "Gender" },
//                             { key: "actions", label: "Actions", align: "center" },
//                         ]}
//                         data={banners.map((item, index) => ({
//                             ...item,
//                             sno: index + 1
//                         }))}
//                         renderCell={(key, row) => {

//                             // 🔥 Image column
//                             // if (key === "image_path") {
//                             //     return (
//                             //         <img
//                             //             src={getProductImages(row.image_path)}
//                             //             width={60}
//                             //             className="rounded shadow-sm"
//                             //         />
//                             //     );
//                             // }

//                             // 🔥 Actions column
//                             if (key === "actions") {
//                                 return (
//                                     <div className="flex gap-2 justify-center">
//                                         <button
//                                             onClick={() => navigate(`/admin/banner/add?id=${row.id}`)}
//                                             className="text-blue-600 hover:text-blue-800"
//                                         >
//                                             <FaEdit size={14} />
//                                         </button>

//                                         <button
//                                             onClick={() => handleDelete(row.id)}
//                                             className="text-red-600 hover:text-red-800"
//                                         >
//                                             <FaTrash size={14} />
//                                         </button>
//                                     </div>
//                                 );
//                             }

//                             // default
//                             return row[key];
//                         }}
//                     />


//                 {/* Overview */}
//                 <Box display="flex" alignItems="center" gap={1} mb={2}>
//                     <Add fontSize="large" color="primary" />
//                     <div>
//                         <Typography variant="subtitle1">Banner Overview</Typography>
//                         <Typography variant="body2">
//                             Total: {filtered.length} • Active:{' '}
//                             {filtered.filter((b) => b.status === 'active').length}
//                         </Typography>
//                     </div>
//                 </Box>

//                 {/* Search */}
//                 <Box position="relative" mb={2}>
//                     <TextField
//                         fullWidth
//                         size="small"
//                         placeholder="Search by title or ID..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         InputProps={{
//                             startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
//                         }}
//                     />
//                 </Box>

//                 {/* Messages */}
//                 <AnimatePresence>
//                     {errorMessage && (
//                         <motion.div
//                             initial={{ opacity: 0, y: -10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -10 }}
//                         >
//                             <Alert severity="error" onClose={() => setErrorMessage('')}>
//                                 {errorMessage}
//                             </Alert>
//                         </motion.div>
//                     )}
//                     {successMessage && (
//                         <motion.div
//                             initial={{ opacity: 0, y: -10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -10 }}
//                         >
//                             <Alert severity="success" onClose={() => setSuccessMessage('')}>
//                                 {successMessage}
//                             </Alert>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {/* Loading / Empty */}
//                 {isLoading ? (
//                     <Box textAlign="center" py={4}>
//                         <CircularProgress />
//                         <Typography mt={1}>Loading banners…</Typography>
//                     </Box>
//                 ) : filtered.length === 0 ? (
//                     <Box textAlign="center" py={4}>
//                         <Typography variant="h6">No Banners Found</Typography>
//                         <Typography>
//                             {searchQuery ? 'Try a different search' : 'Add your first banner'}
//                         </Typography>
//                         <Button
//                             startIcon={<Refresh />}
//                             onClick={handleRefresh}
//                             sx={{ mt: 2 }}
//                         >
//                             Refresh
//                         </Button>
//                     </Box>
//                 ) : (
//                     <>
//                         <Typography variant="caption" display="block" mb={1}>
//                             Showing {Math.min(visibleItems, filtered.length)} of{' '}
//                             {filtered.length}
//                         </Typography>

//                         {/* ==== RESPONSIVE TABLE ==== */}
//                         <TableContainer
//                             ref={tableContainerRef}
//                             sx={{
//                                 maxHeight: 'calc(100vh - 340px)',
//                                 overflowX: 'auto',
//                                 '& th, & td': { whiteSpace: 'nowrap' },
//                             }}
//                         >
//                             <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
//                                 <TableHead>
//                                     <TableRow>
//                                         <TableCell>ID</TableCell>
//                                         <TableCell>Image</TableCell>
//                                         <TableCell>Title</TableCell>
//                                         <TableCell>Sub Title</TableCell>
//                                         <TableCell>Item Name</TableCell>
//                                         <TableCell>Gender</TableCell>
//                                         <TableCell align="center">Actions</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {filtered.slice(0, visibleItems).map((banner) => {
//                                         const isEditing = selectedId === banner.id;

//                                         return (
//                                             <motion.tr
//                                                 key={banner.id}
//                                                 initial={{ opacity: 0 }}
//                                                 animate={{ opacity: 1 }}
//                                                 transition={{ duration: 0.2 }}
//                                             >
//                                                 {/* ID */}
//                                                 <TableCell>
//                                                     <Chip label={`#${banner.id}`} size="small" />
//                                                 </TableCell>

//                                                 {/* Image */}
//                                                 <TableCell>
//                                                     {isEditing ? (
//                                                         <Box display="flex" flexDirection="column" gap={1}>
//                                                             <input
//                                                                 type="file"
//                                                                 accept="image/*"
//                                                                 onChange={handleFileChange}
//                                                                 style={{ display: 'none' }}
//                                                                 id={`file-${banner.id}`}
//                                                             />
//                                                             <label htmlFor={`file-${banner.id}`}>
//                                                                 <Button
//                                                                     component="span"
//                                                                     size="small"
//                                                                     startIcon={<CloudUpload />}
//                                                                     variant="outlined"
//                                                                 >
//                                                                     Choose
//                                                                 </Button>
//                                                             </label>
//                                                             {editFile && (
//                                                                 <Typography variant="caption" noWrap>
//                                                                     {editFile.name}
//                                                                 </Typography>
//                                                             )}
//                                                         </Box>
//                                                     ) : (
//                                                         <Avatar
//                                                             src={`${BASE_IMAGE_URL}${banner.image_path}`}
//                                                             variant="rounded"
//                                                             sx={{
//                                                                 width: 60,
//                                                                 height: 60,
//                                                                 cursor: 'pointer',
//                                                             }}
//                                                             onClick={() => handleView(banner)}
//                                                         />
//                                                     )}
//                                                 </TableCell>

//                                                 {/* Title */}
//                                                 <TableCell>
//                                                     {isEditing ? (
//                                                         <TextField
//                                                             size="small"
//                                                             value={editTitle}
//                                                             onChange={(e) => setEditTitle(e.target.value)}
//                                                             placeholder="Title"
//                                                             fullWidth
//                                                         />
//                                                     ) : (
//                                                         banner.title || '—'
//                                                     )}
//                                                 </TableCell>

//                                                 {/* Sub Title */}
//                                                 <TableCell>
//                                                     {isEditing ? (
//                                                         <TextField
//                                                             size="small"
//                                                             value={editSubTitle}
//                                                             onChange={(e) => setEditSubTitle(e.target.value)}
//                                                             placeholder="Sub title"
//                                                             fullWidth
//                                                         />
//                                                     ) : (
//                                                         banner.subtitle || '—'
//                                                     )}
//                                                 </TableCell>

//                                                 {/* Item Name */}
//                                                 <TableCell>
//                                                     {isEditing ? (
//                                                         <FormControl fullWidth size="small">
//                                                             <Select
//                                                                 value={editItemName}
//                                                                 onChange={(e) => setEditItemName(e.target.value)}
//                                                                 displayEmpty
//                                                             >
//                                                                 <MenuItem value="" disabled>
//                                                                     Select item
//                                                                 </MenuItem>
//                                                                 {itemNames?.map((it) => (
//                                                                     <MenuItem
//                                                                         key={it.ITEMCTRID}
//                                                                         value={it.ITEMCTRNAME}
//                                                                     >
//                                                                         {it.ITEMCTRNAME}
//                                                                     </MenuItem>
//                                                                 ))}
//                                                             </Select>
//                                                         </FormControl>
//                                                     ) : (
//                                                         banner.itemname || '—'
//                                                     )}
//                                                 </TableCell>

//                                                 {/* Gender */}
//                                                 <TableCell>
//                                                     {isEditing ? (
//                                                         <FormControl fullWidth size="small">
//                                                             <Select
//                                                                 value={editGender}
//                                                                 onChange={(e) => setEditGender(e.target.value)}
//                                                                 displayEmpty
//                                                             >
//                                                                 <MenuItem value="" disabled>
//                                                                     Select gender
//                                                                 </MenuItem>
//                                                                 {genderOptions.map((g) => (
//                                                                     <MenuItem key={g} value={g}>
//                                                                         {g}
//                                                                     </MenuItem>
//                                                                 ))}
//                                                             </Select>
//                                                         </FormControl>
//                                                     ) : (
//                                                         banner.gender || '—'
//                                                     )}
//                                                 </TableCell>

//                                                 {/* Actions */}
//                                                 <TableCell align="center">
//                                                     {isEditing ? (
//                                                         <>
//                                                             <Tooltip title="Save">
//                                                                 <IconButton
//                                                                     color="primary"
//                                                                     onClick={() => handleSave(banner.id)}
//                                                                     disabled={isUpdating}
//                                                                 >
//                                                                     {isUpdating ? (
//                                                                         <CircularProgress size={20} />
//                                                                     ) : (
//                                                                         <Edit />
//                                                                     )}
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                             <Tooltip title="Cancel">
//                                                                 <IconButton
//                                                                     onClick={resetEdit}
//                                                                     disabled={isUpdating}
//                                                                 >
//                                                                     <Delete />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <Tooltip title="View">
//                                                                 <IconButton onClick={() => handleView(banner)}>
//                                                                     <Visibility />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                             <Tooltip title="Edit">
//                                                                 <IconButton
//                                                                     onClick={() => handleEdit(banner)}
//                                                                     disabled={isDeleting}
//                                                                 >
//                                                                     <Edit />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                             <Tooltip title="Delete">
//                                                                 <IconButton
//                                                                     color="error"
//                                                                     onClick={() => handleDelete(banner.id)}
//                                                                     disabled={isDeleting}
//                                                                 >
//                                                                     <Delete />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                         </>
//                                                     )}
//                                                 </TableCell>
//                                             </motion.tr>
//                                         );
//                                     })}
//                                 </TableBody>
//                             </Table>
//                         </TableContainer>

//                         {/* Load-more */}
//                         {isLoadingMore && (
//                             <Box display="flex" justifyContent="center" py={2}>
//                                 <CircularProgress size={24} />
//                                 <Typography ml={1}>Loading more…</Typography>
//                             </Box>
//                         )}
//                     </>
//                 )}

//                 {/* ==== VIEW MODAL ==== */}
//                 <AnimatePresence>
//                     {showViewModal && selectedBanner && (
//                         <motion.div
//                             className="modal-overlay"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             onClick={() => setShowViewModal(false)}
//                         >
//                             <motion.div
//                                 className="modal-content"
//                                 initial={{ scale: 0.9 }}
//                                 animate={{ scale: 1 }}
//                                 exit={{ scale: 0.9 }}
//                                 onClick={(e) => e.stopPropagation()}
//                                 style={{
//                                     maxWidth: 600,
//                                     width: '90%',
//                                     background: themeMode === 'dark' ? '#333' : '#fff',
//                                     padding: 24,
//                                     borderRadius: 8,
//                                 }}
//                             >
//                                 <Typography variant="h6" mb={2}>
//                                     Banner Details – {selectedBanner.title || 'Untitled'}
//                                 </Typography>
//                                 <Box textAlign="center" mb={2}>
//                                     <img
//                                         src={`${BASE_IMAGE_URL}${selectedBanner.image_path}`}
//                                         alt={selectedBanner.title}
//                                         style={{
//                                             maxHeight: 300,
//                                             width: '100%',
//                                             objectFit: 'contain',
//                                             borderRadius: 4,
//                                         }}
//                                     />
//                                 </Box>
//                                 <Typography variant="body2">
//                                     <strong>ID:</strong> #{selectedBanner.id}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     <strong>Title:</strong> {selectedBanner.title || '—'}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     <strong>Sub Title:</strong> {selectedBanner.subtitle || '—'}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     <strong>Item Name:</strong> {selectedBanner.itemname || '—'}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     <strong>Gender:</strong> {selectedBanner.gender || '—'}
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     <strong>Created:</strong>{' '}
//                                     {new Date(selectedBanner.created_at).toLocaleString()}
//                                 </Typography>
//                                 <Box mt={3} textAlign="right">
//                                     <Button
//                                         variant="contained"
//                                         onClick={() => setShowViewModal(false)}
//                                     >
//                                         Close
//                                     </Button>
//                                 </Box>
//                             </motion.div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </Paper>
//         </Box>
//         </>
//     );
// };

// export default ManageBanner;

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBannersQuery } from "../../../hooks/banners/mainBanner/useBannersQuery";
import { useDeleteBannerMutation } from "../../../hooks/banners/mainBanner/useUploadBannerMutation";
import BannerTable from "../../../components/banner/manageBannerTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js";

const ManageBanner = () => {
    const navigate = useNavigate();

    const { data: bannersData, isLoading, refetch } = useBannersQuery();
    const { mutate: deleteBanner } = useDeleteBannerMutation();

    const banners = useMemo(() => bannersData?.data || [], [bannersData?.data]);

    const handleDelete = (id) => {
        if (window.confirm("Delete this banner?")) {
            deleteBanner(id, {
                onSuccess: () => {
                    refetch(); // Refresh the list after deletion
                }
            });
        }
    };

    // Format data for the table with serial numbers
    const tableData = banners.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.image_path,
        title: item.title || "—",
        subtitle: item.subtitle || "—",
        itemname: item.itemname || "—",
        gender: item.gender || "—",
    }));

    return (
        <div>
            <div className="max-w-8xl mx-auto mt-3  p-3 sm:p-4 sm:mt-4">
        <BannerTable
            title="Manage Banners"
            headers={[
                { key: "sno", label: "S.No" },
                { key: "image_path", label: "Image" },
                { key: "title", label: "Title" },
                { key: "subtitle", label: "Subtitle" },
                { key: "itemname", label: "Item Name" },
                { key: "gender", label: "Gender" },
                { key: "actions", label: "Actions", align: "center" },
            ]}
            data={tableData}
            renderCell={(key, row) => {
                // Image column
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

                // Actions column
                if (key === "actions") {
                    return (
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => navigate(`/admin/banner/add?id=${row.id}`)}
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

                // Default value display
                return row[key];
            }}
            loading={isLoading}
            emptyMessage="No banners found"
        />
        </div>
        </div>
    );
};

export default ManageBanner;