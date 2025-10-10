'use client';
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const defaultFilters = {
    itemName: '',
    subItemName: '',
    metalId: '',
    sizeId: '',
    tagKey: '',
    sizeName: '',
    catName: '',
    gender: '',
    sortBy: '',
    sortDirection: 'ASC',
    minGrandTotal: '',
    maxGrandTotal: '',
    priceRange: '',
    occasion: '',
    materialFinish: '',
    colorAccent: '',
    stoneType: '',
    availability: '',
    new_arrival: '',
    top_trending: false,
    featured_products: false,
    best_design: false,
    page: 0,
    pageSize: 12,
};

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState(defaultFilters);

    const updateFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    const value = useMemo(() => ({ filters, updateFilter, resetFilters, setFilters }), [filters]);

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
    return ctx;
};
