import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    useVideosQuery,
    useUpdateVideoMutation,
    useDeleteVideoMutation,
} from "../../../hooks/video/useVideoQuery";
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, Stack, Card, CardContent,
    TextField, InputAdornment
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Save as SaveIcon, 
    Cancel as CancelIcon, 
    Add as AddIcon, 
    Refresh as RefreshIcon, 
    Search as SearchIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

const BASE_VIDEO_URL = "https://app.bmgjewellers.com";

// Styled components matching EstimationProductsPage
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    overflow: 'auto',
    background: '#ffffff',
    boxShadow: '0 8px 32px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    maxHeight: '60vh',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
        '& .MuiTableCell-head': {
            color: '#FFFFFF !important',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: '16px 12px',
            textAlign: 'left',
        }
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(242, 159, 103, 0.04)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(30, 30, 44, 0.06)',
        padding: '12px 16px',
        textAlign: 'left',
    },
    '& .MuiTableCell-body': {
        padding: '16px',
    },
}));

const ModernCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #3B8FF3 0%, #F29F67 50%, #34B1AA 100%)',
    },
}));

const SearchField = styled(TextField)(({ theme }) => ({
    width: '100%',
    maxWidth: 300,
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': { borderColor: 'rgba(30, 30, 44, 0.06)' },
        '&:hover fieldset': { borderColor: '#3B8FF3' },
        '&.Mui-focused fieldset': { borderColor: '#3B8FF3' },
    },
    [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: 'fit-content',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.75, 1.5),
        fontSize: '0.75rem',
    },
}));

const VideoPreview = styled('video')(() => ({
    width: '120px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    transition: 'transform 0.2s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
}));

const VideoPreviewContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(59, 143, 243, 0.04)',
    border: '1px solid rgba(59, 143, 243, 0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(59, 143, 243, 0.08)',
        borderColor: 'rgba(59, 143, 243, 0.2)',
    },
}));

const ManageVideos = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    
    const [selectedId, setSelectedId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [visibleItems, setVisibleItems] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const tableContainerRef = useRef(null);

    const { data: videosData, isLoading, error, refetch } = useVideosQuery();
    const { mutate: updateVideo, isLoading: isUpdating } = useUpdateVideoMutation();
    const { mutate: deleteVideo, isLoading: isDeleting } = useDeleteVideoMutation();

    const videos = videosData?.data || [];

    useEffect(() => {
        if (videos.length > 0) {
            setFilteredVideos(videos);
        }
    }, [videos]);

    // Lazy loading with scroll detection for table container
    useEffect(() => {
        const handleTableScroll = () => {
            if (!tableContainerRef.current) return;
            
            const container = tableContainerRef.current;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            // Load more when user is near bottom (within 100px)
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                if (visibleItems < filteredVideos.length && !isLoadingMore) {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setVisibleItems(prev => Math.min(prev + 10, filteredVideos.length));
                        setIsLoadingMore(false);
                    }, 300);
                }
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleTableScroll);
            return () => tableContainer.removeEventListener('scroll', handleTableScroll);
        }
    }, [visibleItems, filteredVideos.length, isLoadingMore]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterVideos(query);
    };

    const filterVideos = (query) => {
        const filtered = videos.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.id.toString().includes(query)
        );
        setFilteredVideos(filtered);
        setVisibleItems(10); // Reset to initial load
    };

    const handleRefreshClick = () => {
        refetch();
        setSuccessMessage("Videos refreshed successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleEditClick = (video) => {
        setSelectedId(video.id);
        setEditFile(null);
        setErrorMessage("");
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match("video.*")) {
            setErrorMessage("Please select a valid video file (MP4, WebM, QuickTime)");
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            setErrorMessage("File size exceeds maximum limit of 100MB");
            return;
        }

        setEditFile(file);
        setErrorMessage("");
    };

    const handleSaveEdit = (id) => {
        if (!editFile) {
            setErrorMessage("Please select a video file to update.");
            return;
        }

        updateVideo(
            { id, video: editFile },
            {
                onSuccess: () => {
                    setSuccessMessage("Video updated successfully!");
                    setSelectedId(null);
                    setEditFile(null);
                    setTimeout(() => setSuccessMessage(""), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || "Failed to update video.");
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setSelectedId(null);
        setEditFile(null);
        setErrorMessage("");
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            deleteVideo(id, {
                onSuccess: () => {
                    setSuccessMessage("Video deleted successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || "Failed to delete video.");
                },
            });
        }
    };

    const handlePreviewClick = (video) => {
        window.open(`${BASE_VIDEO_URL}${video.video_path}`, '_blank');
    };

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ borderRadius: '12px', backgroundColor: '#fff5f5', color: '#d32f2f' }}>
                    Failed to load videos. Please try again.
                </Alert>
                <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)' }}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box p={isMobile ? 1 : 3} sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
            <ModernCard>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ color: '#1E1E2C', fontWeight: 700 }}>
                            Manage Videos
                        </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                            <SearchField
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                size="small"
                            />
                            <ActionButton
                                variant="contained"
                                onClick={() => navigate('/video/add')}
                                startIcon={<AddIcon />}
                                sx={{
                                    borderRadius: '8px', 
                                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                    fontWeight: 600 
                                }}
                            >
                                {isSmallScreen ? 'Add' : 'Add Video'}
                            </ActionButton>
                            <ActionButton
                                variant="outlined"
                                onClick={handleRefreshClick}
                                startIcon={<RefreshIcon />}
                                sx={{
                                    borderRadius: '8px', 
                                    color: '#6B7280', 
                                    borderColor: '#6B7280',
                                    fontWeight: 600 
                                }}
                            >
                                {isSmallScreen ? 'Refresh' : 'Refresh'}
                            </ActionButton>
                        </Stack>
                    </Box>

                    {/* Error Messages */}
                    {errorMessage && (
                        <Box mb={3}>
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#fff5f5',
                                    color: '#d32f2f'
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        </Box>
                    )}

                    {/* Success Messages */}
                    {successMessage && (
                        <Box mb={3}>
                            <Alert
                                severity="success"
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#f0f9ff',
                                    color: '#0d9488'
                                }}
                            >
                                {successMessage}
                            </Alert>
                        </Box>
                    )}

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : filteredVideos.length === 0 ? (
                        <Box mb={3}>
                            <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                {searchQuery ? "No videos match your search" : "No videos available"}
                            </Alert>
                        </Box>
                    ) : (
                        <>
                            <Box mb={2}>
                                <Typography variant="subtitle1" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    Showing {Math.min(visibleItems, filteredVideos.length)} of {filteredVideos.length} videos
                                </Typography>
                            </Box>
                            <StyledTableContainer ref={tableContainerRef}>
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: '80px', width: '10%', fontWeight: 700, textAlign: 'center' }}>ID</TableCell>
                                            <TableCell sx={{ minWidth: '200px', width: '30%', fontWeight: 700, textAlign: 'center' }}>Video Preview</TableCell>
                                            <TableCell sx={{ minWidth: '200px', width: '30%', fontWeight: 700, textAlign: 'center' }}>Title</TableCell>
                                            <TableCell sx={{ minWidth: '150px', width: '30%', fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredVideos.slice(0, visibleItems).map((video) => (
                                            <TableRow key={video.id} hover>
                                                <TableCell sx={{ fontWeight: 600, color: '#3B8FF3', padding: '16px', textAlign: 'center' }}>
                                                    {video.id}
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    {selectedId === video.id ? (
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <input
                                                                type="file"
                                                                accept="video/mp4,video/webm,video/quicktime"
                                                                onChange={handleEditFileChange}
                                                                style={{ marginBottom: '8px' }}
                                                            />
                                                            {editFile && (
                                                                <Chip
                                                                    label={`Selected: ${editFile.name}`}
                                                                    color="primary"
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                                        color: '#3B8FF3',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                            <VideoPreviewContainer>
                                                                <VideoPreview
                                                                    src={`${BASE_VIDEO_URL}${video.video_path}`}
                                                                    muted
                                                                    controls={false}
                                                                    onError={(e) => (e.target.poster = "/fallback-video.jpg")}
                                                                />
                                                                <Box sx={{ textAlign: 'center' }}>
                                                                    <Typography variant="caption" sx={{ 
                                                                        color: '#6B7280',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        Click to preview
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ 
                                                                        color: '#3B8FF3',
                                                                        fontSize: '0.7rem',
                                                                        display: 'block',
                                                                        mt: 0.5
                                                                    }}>
                                                                        MP4 • Video
                                                                    </Typography>
                                                                </Box>
                                                            </VideoPreviewContainer>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    <Typography variant="body2" sx={{ 
                                                        fontWeight: 600, 
                                                        color: '#1E1E2C',
                                                        textAlign: 'center'
                                                    }}>
                                                        {video.title || 'Untitled Video'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    {selectedId === video.id ? (
                                                        <Box display="flex" gap={1} justifyContent="center">
                                                            <Tooltip title="Save changes">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSaveEdit(video.id)}
                                                                    disabled={!editFile || isUpdating}
                                                                    color="success"
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(76, 175, 80, 0.08)'
                                                                    }}
                                                                >
                                                                    {isUpdating ? (
                                                                        <CircularProgress size={16} color="inherit" />
                                                                    ) : (
                                                                        <SaveIcon fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel editing">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={handleCancelEdit}
                                                                    disabled={isUpdating}
                                                                    color="default"
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(158, 158, 158, 0.08)'
                                                                    }}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box display="flex" gap={1} justifyContent="center">
                                                            <Tooltip title="Preview video">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handlePreviewClick(video)}
                                                                    color="primary"
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(59, 143, 243, 0.08)'
                                                                    }}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit video">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(video)}
                                                                    disabled={isDeleting}
                                                                    color="primary"
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(59, 143, 243, 0.08)'
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete video">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(video.id)}
                                                                    disabled={isDeleting}
                                                                    color="error"
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                                                    }}
                                                                >
                                                                    {isDeleting ? (
                                                                        <CircularProgress size={16} color="inherit" />
                                                                    ) : (
                                                                        <DeleteIcon fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </StyledTableContainer>

                            {isLoadingMore && (
                                <Box mt={3} display="flex" justifyContent="center" alignItems="center">
                                    <CircularProgress size={20} sx={{ color: '#3B8FF3' }} />
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, ml: 1 }}>
                                        Loading more videos...
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default ManageVideos;