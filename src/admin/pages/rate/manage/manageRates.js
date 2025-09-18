import { useState, useRef, useEffect, useContext } from 'react';
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
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageRates.css';

const ManageRates = () => {
    const { themeMode } = useContext(MyContext);
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
                    setVisibleItems(prev => Math.min(prev + 10, filteredRates.length));
                    setIsLoadingMore(false);
                }, 300);
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
        setVisibleItems(10);
    };

    const handleRefreshClick = () => {
        refetch();
        setSuccess('Rates refreshed successfully!');
        setTimeout(() => setSuccess(null), 3000);
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
                    setEditGoldRate('');
                    setEditSilverRate('');
                    setEditCreatedBy('');
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
        setEditGoldRate('');
        setEditSilverRate('');
        setEditCreatedBy('');
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
            <div className={`manage-rates-container ${themeMode}`}>
                <Alert
                    severity="error"
                    onClose={() => refetch()}
                    className="alert error"
                >
                    Failed to load rates. Please try again.
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
        <div className={`manage-rates-container ${themeMode}`}>
            <Card className="manage-rates-card">
                <CardContent>
                    <Box
                        display="flex"
                        flexDirection={isMobile ? 'column' : 'row'}
                        justifyContent="space-between"
                        alignItems={isMobile ? 'flex-start' : 'center'}
                        mb={3}
                    >
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Manage Rates
                        </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                            <TextField
                                placeholder="Search rates..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="search-field"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                size="small"
                            />
                            <Button
                                variant="contained"
                                onClick={() => navigate('/admin/rates/add')}
                                startIcon={<AddIcon />}
                                className="btn primary"
                            >
                                {isSmallScreen ? 'Add' : 'Add Rate'}
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

                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => setError(null)}
                            className="alert error"
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            severity="success"
                            onClose={() => setSuccess(null)}
                            className="alert success"
                        >
                            {success}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : filteredRates.length === 0 ? (
                        <Alert severity="info" className="alert info">
                            {searchQuery ? 'No rates match your search.' : 'No rates available.'}
                        </Alert>
                    ) : (
                        <>
                            <Typography variant="subtitle1" className="table-info">
                                Showing {Math.min(visibleItems, filteredRates.length)} of {filteredRates.length} rates
                            </Typography>
                            <TableContainer ref={tableContainerRef} className="table-container">
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'} className="table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="table-header">ID</TableCell>
                                            <TableCell className="table-header">Gold Rate (₹/g)</TableCell>
                                            <TableCell className="table-header">Silver Rate (₹/g)</TableCell>
                                            <TableCell className="table-header">Created By</TableCell>
                                            <TableCell className="table-header">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredRates.slice(0, visibleItems).map((rate) => (
                                            <TableRow key={rate.id} className="table-row">
                                                <TableCell className="table-cell id">{rate.id}</TableCell>
                                                <TableCell className="table-cell">
                                                    {selectedId === rate.id ? (
                                                        <TextField
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editGoldRate}
                                                            onChange={(e) => setEditGoldRate(e.target.value)}
                                                            size="small"
                                                            className="rate-input"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box component="span" className="currency-symbol">
                                                                        ₹
                                                                    </Box>
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label={formatCurrency(rate.goldRate)}
                                                            className="chip"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell className="table-cell">
                                                    {selectedId === rate.id ? (
                                                        <TextField
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editSilverRate}
                                                            onChange={(e) => setEditSilverRate(e.target.value)}
                                                            size="small"
                                                            className="rate-input"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box component="span" className="currency-symbol">
                                                                        ₹
                                                                    </Box>
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label={formatCurrency(rate.silverRate)}
                                                            className="chip"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell className="table-cell created-by">
                                                    {selectedId === rate.id ? (
                                                        <TextField
                                                            type="text"
                                                            value={editCreatedBy}
                                                            onChange={(e) => setEditCreatedBy(e.target.value)}
                                                            size="small"
                                                            className="rate-input"
                                                            inputProps={{ maxLength: 50 }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" className="created-by-text">
                                                            {rate.createdBy}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell className="table-cell actions">
                                                    {selectedId === rate.id ? (
                                                        <Box className="action-button">
                                                            <Tooltip title="Save changes">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSaveEdit(rate.id)}
                                                                    disabled={isUpdating}
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
                                                            <Tooltip title="Edit rate">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(rate)}
                                                                    disabled={isDeleting}
                                                                    className="icon-button edit"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete rate">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(rate.id)}
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
                                        Loading more rates...
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

export default ManageRates;