import { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useRatesQuery, useUpdateRateMutation, useDeleteRateMutation } from '../../../hooks/rate/useRatesQuery';
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
    Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

// Styled components matching EstimationProductsPage
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #fdf1e8 0%, #f5e6d4 100%)',
        '& .MuiTableCell-head': {
            color: '#1a1a1a !important',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: '8px 12px',
        }
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(253, 241, 232, 0.3)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(30, 30, 44, 0.06)',
        padding: '8px 12px',
        fontSize: '0.8rem',
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

const SearchField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: '1rem',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#eba748',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#eba748',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#6B7280',
        fontWeight: 500,
    },
}));

const StatusChip = styled(Chip)(({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return {
                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(235, 167, 72, 0.3)',
                };
            case 'inactive':
                return {
                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(235, 167, 72, 0.3)',
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(235, 167, 72, 0.3)',
                };
        }
    };

    return {
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: '0.7rem',
        minWidth: '80px',
        height: '24px',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        ...getStatusStyles(status),
        '&:hover': {
            transform: 'scale(1.05)',
        },
    };
});

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: 'fit-content',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.75, 1.5),
        fontSize: '0.75rem',
    },
}));

const RateInputField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#fff',
        fontSize: '0.875rem',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
            borderWidth: '2px',
        },
    },
}));

const ManageRates = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    
    const [selectedId, setSelectedId] = useState(null);
    const [editGoldRate, setEditGoldRate] = useState('');
    const [editSilverRate, setEditSilverRate] = useState('');
    const [editCreatedBy, setEditCreatedBy] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRates, setFilteredRates] = useState([]);
    const [visibleItems, setVisibleItems] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const tableContainerRef = useRef(null);

    const { data: rates, isLoading, error: queryError, refetch } = useRatesQuery();
    const { mutate: updateRate, isLoading: isUpdating } = useUpdateRateMutation();
    const { mutate: deleteRate, isLoading: isDeleting } = useDeleteRateMutation();

    const ratesData = rates?.data || [];

    useEffect(() => {
        if (ratesData.length > 0) {
            setFilteredRates(ratesData);
        }
    }, [ratesData]);

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
                if (visibleItems < filteredRates.length && !isLoadingMore) {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setVisibleItems(prev => Math.min(prev + 10, filteredRates.length));
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
    }, [visibleItems, filteredRates.length, isLoadingMore]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterRates(query);
    };

    const filterRates = (query) => {
        const filtered = ratesData.filter(rate =>
            rate.createdBy.toLowerCase().includes(query.toLowerCase()) ||
            rate.id.toString().includes(query) ||
            rate.goldRate.toString().includes(query) ||
            rate.silverRate.toString().includes(query)
        );
        setFilteredRates(filtered);
        setVisibleItems(10); // Reset to initial load
    };

    const handleRefreshClick = () => {
        refetch();
        setSuccess('Rates refreshed successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleEditClick = (rate) => {
        setSelectedId(rate.id);
        setEditGoldRate(rate.goldRate.toString());
        setEditSilverRate(rate.silverRate.toString());
        setEditCreatedBy(rate.createdBy);
        setError(null);
    };

    const handleSaveEdit = (id) => {
        const gold = parseFloat(editGoldRate);
        const silver = parseFloat(editSilverRate);

        if (isNaN(gold)) {
            setError('Gold rate must be a number');
            return;
        }
        if (gold <= 0) {
            setError('Gold rate must be greater than 0');
            return;
        }
        if (isNaN(silver)) {
            setError('Silver rate must be a number');
            return;
        }
        if (silver <= 0) {
            setError('Silver rate must be greater than 0');
            return;
        }
        if (!editCreatedBy.trim()) {
            setError('Created by is required');
            return;
        }
        if (editCreatedBy.length > 50) {
            setError('Created by must be less than 50 characters');
            return;
        }

        const rateData = { goldRate: gold, silverRate: silver, createdBy: editCreatedBy };
        updateRate(
            { id, rateData },
            {
                onSuccess: () => {
                    setSuccess('Rate updated successfully!');
                    setSelectedId(null);
                    setTimeout(() => setSuccess(null), 3000);
                    refetch();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || 'Failed to update rate');
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setSelectedId(null);
        setError(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this rate?')) {
            deleteRate(id, {
                onSuccess: () => {
                    setSuccess('Rate deleted successfully!');
                    setTimeout(() => setSuccess(null), 3000);
                    refetch();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || 'Failed to delete rate');
                },
            });
        }
    };

    const formatCurrency = (value) => {
        return `₹${parseFloat(value || 0).toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    if (queryError) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ borderRadius: '12px', backgroundColor: '#fff5f5', color: '#d32f2f' }}>
                    Failed to load rates. Please try again.
                </Alert>
                <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)' }}>
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
                            Manage Rates
                        </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                            <SearchField
                                placeholder="Search rates..."
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
                                onClick={() => navigate('/admin/rates/add')}
                                startIcon={<AddIcon />}
                                sx={{
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
                                    color: 'white',
                                    fontWeight: 600 
                                }}
                            >
                                {isSmallScreen ? 'Add' : 'Add Rate'}
                            </ActionButton>
                            <ActionButton
                                variant="outlined"
                                onClick={handleRefreshClick}
                                startIcon={<RefreshIcon />}
                                sx={{
                                    borderRadius: '12px', 
                                    color: '#eba748', 
                                    borderColor: '#eba748',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: 'rgba(235, 167, 72, 0.05)',
                                    }
                                }}
                            >
                                {isSmallScreen ? 'Refresh' : 'Refresh'}
                            </ActionButton>
                        </Stack>
                    </Box>

                    {/* Error Messages */}
                    {error && (
                        <Box mb={3}>
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#fff5f5',
                                    color: '#d32f2f'
                                }}
                            >
                                {error}
                            </Alert>
                        </Box>
                    )}

                    {/* Success Messages */}
                    {success && (
                        <Box mb={3}>
                            <Alert
                                severity="success"
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#f0f9ff',
                                    color: '#0d9488'
                                }}
                            >
                                {success}
                            </Alert>
                        </Box>
                    )}

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : filteredRates.length === 0 ? (
                        <Box mb={3}>
                            <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                {searchQuery ? 'No rates match your search' : 'No rates available'}
                            </Alert>
                        </Box>
                    ) : (
                        <>
                            <Box mb={2}>
                                <Typography variant="subtitle1" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    Showing {Math.min(visibleItems, filteredRates.length)} of {filteredRates.length} rates
                                </Typography>
                            </Box>
                            <StyledTableContainer ref={tableContainerRef}>
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: '80px', width: '10%', fontWeight: 700, textAlign: 'center' }}>ID</TableCell>
                                            <TableCell sx={{ minWidth: '150px', width: '25%', fontWeight: 700, textAlign: 'center' }}>Gold Rate (₹/g)</TableCell>
                                            <TableCell sx={{ minWidth: '150px', width: '25%', fontWeight: 700, textAlign: 'center' }}>Silver Rate (₹/g)</TableCell>
                                            <TableCell sx={{ minWidth: '150px', width: '25%', fontWeight: 700, textAlign: 'center' }}>Created By</TableCell>
                                            <TableCell sx={{ minWidth: '120px', width: '15%', fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredRates.slice(0, visibleItems).map((rate) => (
                                            <TableRow key={rate.id} hover>
                                                <TableCell sx={{ fontWeight: 600, color: '#3B8FF3', padding: '16px', textAlign: 'center' }}>
                                                    {rate.id}
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    {selectedId === rate.id ? (
                                                        <RateInputField
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editGoldRate}
                                                            onChange={(e) => setEditGoldRate(e.target.value)}
                                                            size="small"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box sx={{ color: '#F29F67', mr: 1 }}>
                                                                        ₹
                                                                    </Box>
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label={formatCurrency(rate.goldRate)}
                                                            color="primary"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(235, 167, 72, 0.1)',
                                                                color: '#eba748',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    {selectedId === rate.id ? (
                                                        <RateInputField
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editSilverRate}
                                                            onChange={(e) => setEditSilverRate(e.target.value)}
                                                            size="small"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box sx={{ color: '#34B1AA', mr: 1 }}>
                                                                        ₹
                                                                    </Box>
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label={formatCurrency(rate.silverRate)}
                                                            color="secondary"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(235, 167, 72, 0.1)',
                                                                color: '#eba748',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    {selectedId === rate.id ? (
                                                        <RateInputField
                                                            type="text"
                                                            value={editCreatedBy}
                                                            onChange={(e) => setEditCreatedBy(e.target.value)}
                                                            size="small"
                                                            inputProps={{ maxLength: 50 }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ 
                                                            fontWeight: 600, 
                                                            color: '#1E1E2C',
                                                            textAlign: 'center'
                                                        }}>
                                                            {rate.createdBy}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ padding: '16px', textAlign: 'center' }}>
                                                    {selectedId === rate.id ? (
                                                        <Box display="flex" gap={1} justifyContent="center">
                                                            <Tooltip title="Save changes">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSaveEdit(rate.id)}
                                                                    disabled={isUpdating}
                                                                    color="success"
                                                                    sx={{
                                                                        borderRadius: '12px',
                                                                        backgroundColor: 'rgba(235, 167, 72, 0.1)',
                                                                        color: '#eba748',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(235, 167, 72, 0.2)',
                                                                        }
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
                                                                        borderRadius: '12px',
                                                                        backgroundColor: 'rgba(235, 167, 72, 0.1)',
                                                                        color: '#eba748',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(235, 167, 72, 0.2)',
                                                                        }
                                                                    }}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box display="flex" gap={1} justifyContent="center">
                                                            <Tooltip title="Edit rate">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(rate)}
                                                                    disabled={isDeleting}
                                                                    color="primary"
                                                                    sx={{
                                                                        borderRadius: '12px',
                                                                        backgroundColor: 'rgba(235, 167, 72, 0.1)',
                                                                        color: '#eba748',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(235, 167, 72, 0.2)',
                                                                        }
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete rate">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(rate.id)}
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
                                    <CircularProgress size={20} sx={{ color: '#eba748' }} />
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, ml: 1 }}>
                                        Loading more rates...
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

export default ManageRates;