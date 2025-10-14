'use client';
import React, { useContext } from 'react';
import { Box, TextField, Button, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useFilters } from '../../context/product/FilterContext';
import { MyContext } from '../../context/themeContext/themeContext';

export default function FilterSection() {
    const { filters, updateFilter, resetFilters } = useFilters();
    const { themeMode } = useContext(MyContext);
    const theme = useTheme();

    // Responsive screen check
    const isSm = useMediaQuery(theme.breakpoints.down('sm'));
    const fieldSize = isSm ? 'small' : 'medium';

    const handleChange = (e) => updateFilter(e.target.name, e.target.value);

    // Input styles for dark/light mode
    const inputStyles = {
        '& .MuiInputBase-input': { color: themeMode === 'dark' ? '#fff' : '#000' },
        '& .MuiInputLabel-root': { color: themeMode === 'dark' ? '#fff' : '#000' },
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
            borderColor: themeMode === 'dark' ? '#555' : '#ccc',
        },
        '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
            borderColor: themeMode === 'dark' ? '#888' : '#888',
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: themeMode === 'dark' ? '#fff' : '#1976d2',
        },
    };

    // Convert filter keys to human-readable names
    const filterLabels = {
        itemName: 'Item Name',
        subItemName: 'Sub Item Name',
        tagKey: 'Tag Key',
        minGrandTotal: 'Min Price',
        maxGrandTotal: 'Max Price',
        priceRange: 'Price Range',
    };

    // Active filters (non-empty)
    const activeFilters = Object.entries(filters).filter(
        ([key, value]) =>
            value !== '' &&
            value !== null &&
            value !== undefined &&
            value !== 'undefined' &&
            value !== 'null' &&
            key !== 'page' &&
            key !== 'pageSize' &&
            key !== 'undefined' &&
            key !== undefined
    );

    return (
        <Box>
            {/* Filter Inputs */}
            <Box
                sx={{
                    display: 'grid',
                    gap: isSm ? 1.5 : 2,
                    gridTemplateColumns: `repeat(auto-fit, minmax(${isSm ? 140 : 200}px, 1fr))`,
                    mb: 2,
                    alignItems: 'center',
                }}
            >
                <TextField
                    label="Item Name"
                    name="itemName"
                    value={filters.itemName}
                    onChange={handleChange}
                    size={fieldSize}
                    sx={inputStyles}
                />
                <TextField
                    label="Sub Item Name"
                    name="subItemName"
                    value={filters.subItemName}
                    onChange={handleChange}
                    size={fieldSize}
                    sx={inputStyles}
                />
                <TextField
                    label="Tag Key"
                    name="tagKey"
                    value={filters.tagKey}
                    onChange={handleChange}
                    size={fieldSize}
                    sx={inputStyles}
                />
                <TextField
                    label="Min Price"
                    name="minGrandTotal"
                    value={filters.minGrandTotal}
                    onChange={handleChange}
                    type="number"
                    size={fieldSize}
                    sx={inputStyles}
                />
                <TextField
                    label="Max Price"
                    name="maxGrandTotal"
                    value={filters.maxGrandTotal}
                    onChange={handleChange}
                    type="number"
                    size={fieldSize}
                    sx={inputStyles}
                />
                <TextField
                    label="Price Range"
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleChange}
                    size={fieldSize}
                    sx={inputStyles}
                />
              
                {activeFilters.length > 0 && (
                    <Box sx = {{ display: 'flex'}} >
                    <Box sx={{ display: 'flex', flexWrap: isSm?'wrap':'no-wrap', gap: 1, mb: 2 }}>
                        {activeFilters.map(([key, value]) => (
                            <Chip
                                key={key}
                                label={`${filterLabels[key]}: ${value}`}
                                onDelete={() => updateFilter(key, '')}
                                size={isSm ? 'small' : 'medium'}
                                sx={{
                                    backgroundColor: themeMode === 'dark' ? '#333' : '#f0f0f0',
                                    color: themeMode === 'dark' ? '#fff' : '#000',
                                }}
                            />
                        ))}
                    </Box>
                      <Box>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size={fieldSize}
                        onClick={resetFilters}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            borderColor: themeMode === 'dark' ? '#888' : '#ccc',
                            color: themeMode === 'dark' ? '#fff' : '#000',
                            '&:hover': {
                                backgroundColor: themeMode === 'dark' ? '#333' : '#f0f0f0',
                                borderColor: themeMode === 'dark' ? '#fff' : '#888',
                            },
                        }}
                    >
                        Clear All
                    </Button>
                </Box>
                    </Box>
                )}
                {/* Clear All Button */}
              
            
            </Box>

         
            
        </Box>
    );
}
