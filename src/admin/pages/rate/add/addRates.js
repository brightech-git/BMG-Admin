
import { useState, useEffect, useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useCreateRateMutation } from '../../../hooks/rate/useRatesQuery';
import {
    Box, Typography, TextField, Button, Card, CardContent, Alert, Chip,
    CircularProgress, InputAdornment
} from '@mui/material';
import {
    CheckCircle as CheckIcon, Error as ErrorIcon, Add as AddIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddRates.css';

const AddRates = () => {
    const { themeMode } = useContext(MyContext);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    const [goldRate, setGoldRate] = useState('');
    const [silverRate, setSilverRate] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { mutate: createRate, isLoading, isError, error: mutationError, isSuccess } =
        useCreateRateMutation();

    useEffect(() => {
        if (isSuccess) {
            setSuccess('Rate created successfully!');
            const timer = setTimeout(() => {
                setSuccess(null);
                setGoldRate('');
                setSilverRate('');
                setCreatedBy('');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const gold = parseFloat(goldRate);
        const silver = parseFloat(silverRate);
        if (isNaN(gold) || gold <= 0) {
            setError('Gold rate must be a positive number');
            return;
        }
        if (isNaN(silver) || silver <= 0) {
            setError('Silver rate must be a positive number');
            return;
        }
        if (!createdBy.trim()) {
            setError('Created by is required');
            return;
        }
        if (createdBy.length > 50) {
            setError('Created by must be less than 50 characters');
            return;
        }

        const rateData = { goldRate: gold, silverRate: silver, createdBy };
        createRate(rateData, {
            onError: (err) => {
                console.error('Create rate error:', err);
                setError(err.response?.data?.message || 'Failed to create rate');
            },
        });
    };

    return (
        <div className={`add-rates-container ${themeMode}`}>
            <Card className="add-rates-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isSmallScreen ? 'h6' : 'h4'} className="header-title">
                            Add New Rate
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Enter gold and silver rates for the platform with comprehensive details
                        </Typography>
                    </Box>

                    {(isError || error) && (
                        <Alert
                            severity="error"
                            icon={<ErrorIcon />}
                            className="alert error"
                            onClose={() => setError(null)}
                        >
                            {error || mutationError?.message || 'Failed to create rate'}
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            severity="success"
                            icon={<CheckIcon />}
                            className="alert success"
                            onClose={() => setSuccess(null)}
                        >
                            {success}
                        </Alert>
                    )}

                    <Box className="input-container" mb={2}>
                        <Typography variant="body2" className="input-label">
                            <MoneyIcon /> Gold Rate (per gram) <span className="required">*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter gold rate"
                            value={goldRate}
                            onChange={(e) => setGoldRate(e.target.value)}
                            type="number"
                            step="0.01"
                            fullWidth
                            variant="outlined"
                            size="small"
                            className="rate-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box className="input-adornment">₹</Box>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box className="input-container" mb={2}>
                        <Typography variant="body2" className="input-label">
                            <MoneyIcon /> Silver Rate (per gram) <span className="required">*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter silver rate"
                            value={silverRate}
                            onChange={(e) => setSilverRate(e.target.value)}
                            type="number"
                            step="0.01"
                            fullWidth
                            variant="outlined"
                            size="small"
                            className="rate-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box className="input-adornment">₹</Box>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box className="input-container" mb={2}>
                        <Typography variant="body2" className="input-label">
                            <MoneyIcon /> Created By <span className="required">*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter your name"
                            value={createdBy}
                            onChange={(e) => setCreatedBy(e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                            className="rate-input"
                            inputProps={{ maxLength: 50 }}
                        />
                        <Box className="input-info">
                            <Typography variant="caption">{createdBy.length}/50 characters</Typography>
                        </Box>
                    </Box>

                    {(goldRate || silverRate) && (
                        <Box className="rate-summary" mb={2}>
                            <Box className="summary-header">
                                <Box className="summary-icon">
                                    <MoneyIcon />
                                </Box>
                                <Box>
                                    <Typography variant="h6" className="summary-title">
                                        Rate Summary
                                    </Typography>
                                    <Typography variant="body2" className="summary-text">
                                        {goldRate && `Gold: ₹${goldRate}`} {goldRate && silverRate && ' • '}
                                        {silverRate && `Silver: ₹${silverRate}`}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box className="summary-chips">
                                {goldRate && (
                                    <Chip
                                        label={`Gold: ₹${goldRate}`}
                                        size="small"
                                        className="chip gold"
                                    />
                                )}
                                {silverRate && (
                                    <Chip
                                        label={`Silver: ₹${silverRate}`}
                                        size="small"
                                        className="chip silver"
                                    />
                                )}
                            </Box>
                        </Box>
                    )}

                    <Box className="action-buttons" display="flex" justifyContent="center" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setGoldRate('');
                                setSilverRate('');
                                setCreatedBy('');
                                setError(null);
                            }}
                            disabled={isLoading}
                            className="btn secondary"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isLoading || !goldRate || !silverRate || !createdBy.trim()}
                            startIcon={isLoading ? <CircularProgress size={16} /> : <AddIcon />}
                            className="btn primary"
                        >
                            {isLoading ? 'Creating...' : 'Create Rate'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddRates;