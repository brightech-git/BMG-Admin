import { useState, useEffect, useRef, useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    useVideosQuery,
    useUpdateVideoMutation,
    useDeleteVideoMutation,
} from '../../../hooks/video/useVideoQuery';
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
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageVideos.css';

const BASE_VIDEO_URL = 'https://app.bmgjewellers.com';

const ManageVideos = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

    const [selectedId, setSelectedId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
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

    useEffect(() => {
        const handleTableScroll = () => {
            if (!tableContainerRef.current) return;

            const container = tableContainerRef.current;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingMore) {
                setIsLoadingMore(true);
                setTimeout(() => {
                    setVisibleItems(prev => Math.min(prev + 10, filteredVideos.length));
                    setIsLoadingMore(false);
                }, 300);
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
        setVisibleItems(10);
    };

    const handleRefreshClick = () => {
        refetch();
        setSuccessMessage('Videos refreshed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleEditClick = (video) => {
        setSelectedId(video.id);
        setEditFile(null);
        setErrorMessage('');
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('video.*')) {
            setErrorMessage('Please select a valid video file (MP4, WebM, QuickTime).');
            return;
        }

        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            setErrorMessage('File size exceeds maximum limit of 100MB.');
            return;
        }

        setEditFile(file);
        setErrorMessage('');
    };

    const handleSaveEdit = (id) => {
        if (!editFile) {
            setErrorMessage('Please select a video file to update.');
            return;
        }

        updateVideo({ id, video: editFile }, {
            onSuccess: () => {
                setSuccessMessage('Video updated successfully!');
                setSelectedId(null);
                setEditFile(null);
                setTimeout(() => setSuccessMessage(''), 3000);
                refetch();
            },
            onError: (error) => {
                setErrorMessage(error.response?.data?.error || 'Failed to update video.');
            }
        });
    };

    const handleCancelEdit = () => {
        setSelectedId(null);
        setEditFile(null);
        setErrorMessage('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            deleteVideo(id, {
                onSuccess: () => {
                    setSuccessMessage('Video deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to delete video.');
                }
            });
        }
    };

    const handlePreviewClick = (video) => {
        if (video.video_path) {
            window.open(`${BASE_VIDEO_URL}${video.video_path}`, '_blank');
        } else {
            setErrorMessage('Video path is unavailable.');
        }
    };

    if (error) {
        return (
            <div className={`manage-videos-container ${themeMode}`}>
                <Alert
                    severity="error"
                    onClose={() => refetch()}
                    className="alert error"
                >
                    Failed to load videos. Please try again.
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => refetch()}
                    className="btn primary"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className={`manage-videos-container ${themeMode}`}>
            <Card className="manage-videos-card">
                <CardContent>
                    <Box
                        display="flex"
                        flexDirection={isMobile ? 'column' : 'row'}
                        justifyContent="space-between"
                        alignItems={isMobile ? 'flex-start' : 'center'}
                        mb={3}
                    >
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Manage Videos
                        </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                            <TextField
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="search-field"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                                variant="outlined"
                                size="small"
                            />
                            <Button
                                variant="contained"
                                onClick={() => navigate('/admin/video/add')}
                                startIcon={<AddIcon />}
                                className="btn primary"
                            >
                                {isSmallScreen ? 'Add' : 'Add Video'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleRefreshClick}
                                startIcon={<RefreshIcon />}
                                className="btn secondary"
                            >
                                {isSmallScreen ? 'Refresh' : 'Refresh'}
                            </Button>
                        </Stack>
                    </Box>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            onClose={() => setErrorMessage('')}
                            className="alert error"
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert
                            severity="success"
                            onClose={() => setSuccessMessage('')}
                            className="alert success"
                        >
                            {successMessage}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : filteredVideos.length === 0 ? (
                        <Alert severity="info" className="alert info">
                            {searchQuery ? 'No videos match your search.' : 'No videos available.'}
                        </Alert>
                    ) : (
                        <>
                            <Typography variant="subtitle1" className="table-info">
                                Showing {Math.min(visibleItems, filteredVideos.length)} of {filteredVideos.length} videos
                            </Typography>
                            <TableContainer ref={tableContainerRef} className="table-container">
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'} className="table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="table-header" >ID</TableCell>
                                            <TableCell className="table-header">Video Preview</TableCell>
                                            <TableCell className="table-header">Title</TableCell>
                                            <TableCell className="table-header">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredVideos.slice(0, visibleItems).map((video) => (
                                            <TableRow key={video.id} className="table-row">
                                                <TableCell className="table-cell id">{video.id}</TableCell>
                                                <TableCell className="table-cell">
                                                    {selectedId === video.id ? (
                                                        <Box className="edit-container">
                                                            <input
                                                                type="file"
                                                                accept="video/mp4,video/webm,video/quicktime"
                                                                onChange={handleEditFileChange}
                                                                className="file-input"
                                                            />
                                                            {editFile && (
                                                                <Chip
                                                                    label={`Selected: ${editFile.name}`}
                                                                    className="chip"
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Box className="video-preview-container">
                                                            <video
                                                                src={video.video_path ? `${BASE_VIDEO_URL}${video.video_path}` : ''}
                                                                muted
                                                                controls={false}
                                                                className="video-preview"
                                                                onError={(e) => (e.target.poster = '/fallback-video.jpg')}
                                                            />
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell className="table-cell title">
                                                    {video.title || 'Untitled Video'}
                                                </TableCell>
                                                <TableCell className="table-cell actions">
                                                    {selectedId === video.id ? (
                                                        <Box className="action-button">
                                                            <Tooltip title="Save changes">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSaveEdit(video.id)}
                                                                    disabled={!editFile || isUpdating}
                                                                    className="icon-button save"
                                                                >
                                                                    {isUpdating ? <CircularProgress size={16} /> : <SaveIcon />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel editing">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={handleCancelEdit}
                                                                    disabled={isUpdating}
                                                                    className="icon-button cancel"
                                                                >
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box className="action-button">
                                                            <Tooltip title="Preview video">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handlePreviewClick(video)}
                                                                    className="icon-button preview"
                                                                >
                                                                    <VisibilityIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit video">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(video)}
                                                                    disabled={isDeleting}
                                                                    className="icon-button edit"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete video">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(video.id)}
                                                                    disabled={isDeleting}
                                                                    className="icon-button delete"
                                                                >
                                                                    {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {isLoadingMore && (
                                <Box className="loading-more">
                                    <CircularProgress size={20} />
                                    <Typography className="loading-text">
                                        Loading more videos...
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageVideos;