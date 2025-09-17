import { useState, useEffect } from 'react';
import { useCreateRateMutation } from '../../../hooks/rate/useRatesQuery';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== ENHANCED STYLED COMPONENTS ==========
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

const ModernButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: buttonVariant === 'contained' ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 6px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    ...(color === 'primary' && {
        background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 100%)',
        }
    }),
    ...(color === 'secondary' && {
        background: 'linear-gradient(135deg, #F29F67 0%, #e08f5a 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #e08f5a 0%, #cc7a45 100%)',
        }
    }),
}));

const RateInputField = styled(TextField)(() => ({
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

const AddRates = () => {
    const [goldRate, setGoldRate] = useState('');
    const [silverRate, setSilverRate] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { mutate: createRate, isLoading, isError, error: mutationError, isSuccess } =
        useCreateRateMutation();

    // Reset success state after 5 seconds
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

        // Validation
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
        <Box
            p={3}
            sx={{
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: { xs: 2, sm: 4, md: 6 },
            }}
        >
            <ModernCard sx={{ 
                maxWidth: { xs: '100%', sm: 800, md: 900, lg: 1000 }, 
                width: '100%',
                margin: 'auto'
            }}>
                <CardContent sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
                    {/* Header Section */}
                    <Box textAlign="center" mb={5}>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                color: '#1E1E2C', 
                                fontWeight: 800, 
                                mb: 2,
                                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                                background: 'linear-gradient(135deg, #1E1E2C 0%, #eba748 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Add New Rate
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: '#6B7280', 
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}
                        >
                            Enter gold and silver rates for the platform with comprehensive details
                        </Typography>
                    </Box>

                    {/* Gold Rate Input */}
                    <Box mb={4}>
                        <Box sx={{ 
                            backgroundColor: 'rgba(235, 167, 72, 0.05)', 
                            p: 2, 
                            borderRadius: '12px',
                            border: '1px solid rgba(235, 167, 72, 0.1)'
                        }}>
                            <Typography
                                variant="body2"
                                sx={{ 
                                    color: '#1E1E2C', 
                                    fontWeight: 700, 
                                    mb: 2, 
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <MoneyIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Gold Rate (per gram)
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <RateInputField
                                placeholder="Enter gold rate"
                                value={goldRate}
                                onChange={(e) => setGoldRate(e.target.value)}
                                type="number"
                                step="0.01"
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{ color: '#F29F67', mr: 1 }}>
                                            ₹
                                        </Box>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Silver Rate Input */}
                    <Box mb={4}>
                        <Box sx={{ 
                            backgroundColor: 'rgba(235, 167, 72, 0.05)', 
                            p: 2, 
                            borderRadius: '12px',
                            border: '1px solid rgba(235, 167, 72, 0.1)'
                        }}>
                            <Typography
                                variant="body2"
                                sx={{ 
                                    color: '#1E1E2C', 
                                    fontWeight: 700, 
                                    mb: 2, 
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <MoneyIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Silver Rate (per gram)
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <RateInputField
                                placeholder="Enter silver rate"
                                value={silverRate}
                                onChange={(e) => setSilverRate(e.target.value)}
                                type="number"
                                step="0.01"
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{ color: '#34B1AA', mr: 1 }}>
                                            ₹
                                        </Box>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Created By Input */}
                    <Box mb={4}>
                        <Box sx={{ 
                            backgroundColor: 'rgba(235, 167, 72, 0.05)', 
                            p: 2, 
                            borderRadius: '12px',
                            border: '1px solid rgba(235, 167, 72, 0.1)'
                        }}>
                            <Typography
                                variant="body2"
                                sx={{ 
                                    color: '#1E1E2C', 
                                    fontWeight: 700, 
                                    mb: 2, 
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <MoneyIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Created By
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <RateInputField
                                placeholder="Enter your name"
                                value={createdBy}
                                onChange={(e) => setCreatedBy(e.target.value)}
                                fullWidth
                                variant="outlined"
                                inputProps={{ maxLength: 50 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                    {createdBy.length}/50 characters
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Rate Summary */}
                    {(goldRate || silverRate) && (
                        <Box mb={3}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                background: 'linear-gradient(135deg, #f0f6ff 0%, #e6f3ff 100%)',
                                borderRadius: '12px',
                                border: '1px solid rgba(59, 143, 243, 0.2)',
                                boxShadow: '0 2px 8px rgba(59, 143, 243, 0.1)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                        boxShadow: '0 4px 12px rgba(59, 143, 243, 0.3)'
                                    }}>
                                        <MoneyIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#1E1E2C', 
                                            fontWeight: 600,
                                            mb: 0.5
                                        }}>
                                            Rate Summary
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: '#6B7280',
                                            fontSize: '0.875rem'
                                        }}>
                                            {goldRate && `Gold: ₹${goldRate}`} {goldRate && silverRate && '•'} {silverRate && `Silver: ₹${silverRate}`}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {goldRate && (
                                        <Chip
                                            label={`Gold: ₹${goldRate}`}
                                            color="primary"
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(242, 159, 103, 0.1)',
                                                color: '#F29F67',
                                                fontWeight: 600
                                            }}
                                        />
                                    )}
                                    {silverRate && (
                                        <Chip
                                            label={`Silver: ₹${silverRate}`}
                                            color="secondary"
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(52, 177, 170, 0.1)',
                                                color: '#34B1AA',
                                                fontWeight: 600
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Error Messages */}
                    {(isError || error) && (
                        <Box mb={3}>
                            <Alert
                                severity="error"
                                icon={<ErrorIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#fff5f5',
                                    color: '#d32f2f',
                                    '& .MuiAlert-icon': { color: '#d32f2f' }
                                }}
                            >
                                {error || mutationError?.message || 'Failed to create rate'}
                            </Alert>
                        </Box>
                    )}

                    {/* Success Messages */}
                    {success && (
                        <Box mb={3}>
                            <Alert
                                severity="success"
                                icon={<CheckIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#f0f9ff',
                                    color: '#0d9488',
                                    '& .MuiAlert-icon': { color: '#0d9488' }
                                }}
                            >
                                {success}
                            </Alert>
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="center" gap={3} mt={6}>
                        <ModernButton
                            variant="outlined"
                            onClick={() => {
                                setGoldRate('');
                                setSilverRate('');
                                setCreatedBy('');
                                setError(null);
                            }}
                            disabled={isLoading}
                            sx={{
                                minWidth: '140px',
                                height: '56px',
                                borderColor: '#eba748',
                                color: '#eba748',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                '&:hover': {
                                    borderColor: '#e09a3a',
                                    color: '#e09a3a',
                                    backgroundColor: 'rgba(235, 167, 72, 0.05)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            Clear
                        </ModernButton>

                        <ModernButton
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            disabled={isLoading || !goldRate || !silverRate || !createdBy.trim()}
                            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
                            sx={{
                                minWidth: '220px',
                                height: '56px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 50%, #d48a2c 100%)',
                                boxShadow: '0 8px 24px rgba(235, 167, 72, 0.25)',
                                textTransform: 'none',
                                letterSpacing: '0.5px',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 50%, #c47a1c 100%)',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 12px 32px rgba(235, 167, 72, 0.4)',
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                    color: '#9e9e9e',
                                    transform: 'none',
                                    boxShadow: 'none',
                                },
                                '& .MuiButton-startIcon': {
                                    marginRight: '10px',
                                },
                            }}
                        >
                            {isLoading ? 'Creating...' : 'Create Rate'}
                        </ModernButton>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddRates;