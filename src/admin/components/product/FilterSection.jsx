
import React, { useContext, useState } from 'react';
import { useItemNames } from '../../hooks/itemName/useItemNames';
import { MyContext } from '../../context/themeContext/themeContext';
import { useFilters } from '../../context/product/FilterContext';
import { Loader2, X, ArrowLeft, Filter, Search, Image, ImageOff, DollarSign, Tag } from 'lucide-react';

export default function FilterSection() {
    const { themeMode } = useContext(MyContext);
    const { filters, updateFilter, resetFilters } = useFilters();

    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState('filters');
    const [selectedItem, setSelectedItem] = useState(null);
    // const [selectedSubItems, setSelectedSubItems] = useState([]);

    // Fetch all items
    const { items: allItems, loading: loadingItems } = useItemNames(null);
    // Fetch subitems of selected item
    const { items: subItem, loading: loadingSub } = useItemNames(selectedItem?.ITEMCTRID || null);
    const subItems = subItem?.[0]?.subitems || [];

    const [tempSelectedItem, setTempSelectedItem] = useState(selectedItem);
    // const [tempSelectedSubItems, setTempSelectedSubItems] = useState([]);
    const [tempMinPrice, setTempMinPrice] = useState(filters.minGrandTotal);
    const [tempMaxPrice, setTempMaxPrice] = useState(filters.maxGrandTotal);
    const [tempMinPriceRange, setTempMaxPriceRange] = useState(filters.priceRange)
    const [tempSearch, setTempSearch] = useState(filters.search || '');
    const [tempWithImage, setTempWithImage] = useState(filters.withImage || '');
    const [tempTagKey, setTempTagKey] = useState(filters.tagKey || '');

    console.log('Selected SubItems:', subItems);

    // Price ranges
    const minPriceRanges = [
        { label: '₹0', value: 0 },
        { label: '₹1,000', value: 1000 },
        { label: '₹5,000', value: 5000 },
        { label: '₹10,000', value: 10000 }
    ];

    const maxPriceRanges = [
        { label: '₹10,000', value: 10000 },
        { label: '₹20,000', value: 20000 },
        { label: '₹30,000', value: 30000 },
        { label: '₹50,000+', value: 50000 }
    ];

    // Handle item selection and go to subitems
    const handleItemSelect = (item) => {
        setTempSelectedItem(item);
        // setTempSelectedSubItems([]); // if subitems reset
    };

    // Handle subitem checkbox
    // const handleSubItemToggle = (sub) => {
    //     const updated = selectedSubItems.includes(sub.SUBITEMID)
    //         ? selectedSubItems.filter(id => id !== sub.SUBITEMID)
    //         : [...selectedSubItems, sub.SUBITEMID];

    //     setSelectedSubItems(updated);

    //     const selectedNames = subItems
    //         .filter(s => updated.includes(s.SUBITEMID))
    //         .map(s => s.SUBITEMNAME);

    //     updateFilter('subItemName', selectedNames.join(','));
    // };

    // Handle price range selection
    const handlePriceRangeSelect = (type, value) => {
        if (type === 'min') setTempMinPrice(value);
        else setTempMaxPrice(value);
    };


    // Remove a chip (excluding page and pageSize)
    // Remove a single chip
    const removeChip = (key) => {
        if (key === 'itemName') {
            setTempSelectedItem(null);
            updateFilter('itemName', '');
        }
        // else if (key === 'subItemName') {
        //     setTempSelectedSubItems([]);
        //     updateFilter('subItemName', '');
        // }
        else if (key === "priceRange") {
            setTempMinPrice('');
            setTempMaxPrice('');
            updateFilter("priceRange", "");
        }

     
        else if (key === 'search') {
            setTempSearch('');
            updateFilter('search', '');
        }
        else if (key === 'withImage') {
            setTempWithImage('');
            updateFilter('withImage', '');
        }
        else if (key === 'tagKey') {
            setTempTagKey('');
            updateFilter('tagKey', '');
        }
    };

    // Clear all filters
    const clearAll = () => {
        setTempSelectedItem(null);
        // setTempSelectedSubItems([]);
        setTempMinPrice(null);
        setTempMaxPrice(null);
        setTempMaxPriceRange(null);
        setTempSearch('');
        setTempWithImage('');
        setTempTagKey('');

        resetFilters(); // resets the global filters
    };


    // Filter out page and pageSize from chips display
    const displayFilters = Object.entries(filters).filter(([key]) =>
        !['page', 'pageSize'].includes(key) && filters[key] !== '' && filters[key] != null
    );

    // Apply filters and close modal
    const applyFilters = () => {
        if (tempSelectedItem)
            updateFilter("itemName", tempSelectedItem.ITEMCTRNAME);
        else
            updateFilter("itemName", "");

       

        // price range as string
       

        updateFilter("search", tempSearch ?? "");
        updateFilter("withImage", tempWithImage ?? "");
        updateFilter("tagKey", tempTagKey ?? "");
        
        if ((tempMinPrice && !tempMaxPrice) || (!tempMinPrice && tempMaxPrice)) {
            alert("Please select BOTH Min and Max price.");
            return; // stop applying filters
        }
        if (tempMinPrice && tempMaxPrice) {
            updateFilter("priceRange", `${tempMinPrice}-${tempMaxPrice}`);
        } else {
            updateFilter("priceRange", "");
        }
        setShowModal(false);
    };

    return (
        <div
            className={`w-full  flex flex-col`}
            style={{ fontFamily: 'var(--font-primary, system-ui)' }}
        >
            {/* Header */}
          
                {/* <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h2 className="text-2xl font-bold" style={{ fontSize: 'var(--font-size-md, 24px)' }}>
                        Filters
                    </h2>
                    {displayFilters.length > 0 && (
                        <span
                            className="px-3 py-1 bg-blue-600 text-white rounded-full"
                            style={{ fontSize: 'var(--font-size-sm, 14px)' }}
                        >
                            {displayFilters.length} active
                        </span>
                    )}
                </div> */}

                <div className="flex justify-between items-center p-1 ">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    style={{
                        fontSize: 'var(--font-size-sm, 14px)',
                        borderRadius: 'var(--border-radius-md, 8px)'
                    }}
                >
                    <Filter size={18} />
                    Add Filters
                </button>
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{
                            fontSize: 'var(--font-size-sm, 14px)',
                            borderRadius: 'var(--border-radius-md, 8px)'
                        }}
                    >
                        Clear All
                    </button>
                    
                </div>
           

            {/* Active Filters Chips */} 
            {displayFilters.length !== 0  && 
            <div className="p-2 border-b dark:border-gray-700">
                <h3
                    className="font-semibold mb-2"
                    style={{ fontSize: 'var(--font-size-md, 20px)' }}
                >
                    Active Filters
                </h3>
                <div className="flex flex-wrap gap-3">
                    {displayFilters.length === 0 ? (
                        <p
                            className="text-gray-500 dark:text-gray-400"
                            style={{ fontSize: 'var(--font-size-sm, 14px)' }}
                        >
                            No filters applied
                        </p>
                    ) : (
                        displayFilters.map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-full  shadow-sm"
                                style={{ fontSize: '10px' }}
                            >
                                <span className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}
                                </span>
                                <button
                                    onClick={() => removeChip(key, value)}
                                    className="ml-1 hover:text-red-200 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>}

            
            {/* Enhanced Filter Modal - All filters here */}
            {showModal && (
             
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm sm:py-20 py-[3.75rem] ">
                    <div
                        className="bg-[var(--background-color)] dark:bg-gray-900
    w-full
    max-w-full      /* xs: default */
    sm:max-w-md      /* ≥640px */
    md:max-w-lg      /* ≥768px */
    lg:max-w-2xl     /* ≥1024px */
    xl:max-w-4xl     /* ≥1280px */
    2xl:max-w-6xl    /* ≥1536px */
    h-full
    flex flex-col"
                        
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-2 m-2 border-b ">
                            <div className="flex items-center gap-2">
                                {modalStep !== 'filters' && (
                                    <button
                                        onClick={() => setModalStep('filters')}
                                        className=" hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors "
                                        style={{ borderRadius: 'var(--border-radius-lg, 12px)' }}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                <h4
                                    className="font-semibold m-1" 
                                    style={{ fontSize: 'var(--font-size-md, 18px)' }}
                                >
                                    {modalStep === 'filters' && 'Advanced Filters'}
                                    {modalStep === 'items' && 'Select Item'}
                                    {/* {modalStep === 'subitems' && `Select Sub Items - ${selectedItem?.ITEMCTRNAME}`} */}
                                </h4>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-200   text-black rounded-full transition-colors"
                                style={{ borderRadius: 'var(--border-radius-lg, 12px)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content - All Filters */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {modalStep === 'filters' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold flex items-center gap-2" style={{ fontSize: 'var(--font-size-md, 16px)' }}>
                                            <Search size={18} />
                                            Search
                                        </h4>
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={tempSearch}
                                            onChange={(e) => setTempSearch(e.target.value)}
                                            className="bg-[var(--background-color)] w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 transition-all"
                                            style={{
                                                fontSize: 'var(--font-size-sm, 14px)',
                                                borderRadius: 'var(--border-radius-md, 8px)',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </div>


                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2" style={{ fontSize: 'var(--font-size-md, 16px)' }}>
                                            <Image size={18} />
                                            Image Filter
                                        </h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={tempWithImage === 'true'}
                                                    onChange={(e) => setTempWithImage(e.target.checked ? 'true' : '')}
                                                    className="w-3 h-3 accent-blue-600"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Image size={16} />
                                                    <span style={{ fontSize: 'var(--font-size-sm, 14px)' }}>With Images Only</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={tempWithImage === 'false'}
                                                    onChange={(e) => setTempWithImage(e.target.checked ? 'false' : '')}
                                                    className="w-3 h-3 accent-blue-600"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <ImageOff size={16} />
                                                    <span style={{ fontSize: 'var(--font-size-sm, 14px)' }}>Without Images</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>


                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2" style={{ fontSize: 'var(--font-size-md, 16px)' }}>
                                            <Tag size={18} />
                                            Tag Key
                                        </h4>
                                        <input
                                            type="text"
                                            placeholder="Enter tag key..."
                                            value={tempTagKey}
                                            onChange={(e) => setTempTagKey(e.target.value)}
                                            className="bg-[var(--background-color)] w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 transition-all"
                                            style={{
                                                fontSize: 'var(--font-size-sm, 14px)',
                                                borderRadius: 'var(--border-radius-md, 8px)'
                                            }}
                                        />
                                    </div>
                                      
                                    {/* Item & Subitems Selection */}
                                    <div className="space-y-3">
                                        <h4
                                            className="font-semibold"
                                            style={{ fontSize: 'var(--font-size-md, 16px)' }}
                                        >
                                            Item
                                             {/* & Subitems */}
                                        </h4>
                                        <button
                                            onClick={() => setModalStep('items')}
                                            className="w-full px-3 py-1 border-2 border-solid border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-blue-500  transition-all"
                                            style={{
                                                fontSize: 'var(--font-size-sm, 14px)',
                                                borderRadius: 'var(--border-radius-md, 8px)'
                                            }}
                                        >
                                            {selectedItem ? (
                                                <div>
                                                    <div className="font-medium">{selectedItem.ITEMCTRNAME}</div>
                                                    <div
                                                        
                                                        style={{ fontSize: 'var(--font-size-s, 10px)' }}
                                                    >
                                                        {/* {selectedSubItems.length} subitems selected */}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    
                                                    style={{ fontSize: 'var(--font-size-sm, 14px)' }}
                                                >
                                                    Select Filter
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                      {/* Price Range */}
                                        <div className="space-y-3">
                                            <h4
                                                className="font-semibold flex items-center gap-2"
                                                style={{ fontSize: 'var(--font-size-md, 16px)' }}
                                            >
                                                <DollarSign size={18} />
                                                Price Range
                                            </h4>

                                            {/* Manual Input */}
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div>
                                                    <label
                                                        className="font-medium mb-1 block"
                                                        style={{ fontSize: 'var(--font-size-xs, 13px)' }}
                                                    >
                                                        Min Price
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                    value={tempMinPrice ?? ''}
                                                    onChange={(e) => setTempMinPrice(e.target.value)}
                                                    className="bg-[var(--background-color)] bg w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                                                        style={{ fontSize: 'var(--font-size-sm, 14px)' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        className="font-medium mb-1 block"
                                                        style={{ fontSize: 'var(--font-size-xs, 13px)' }}
                                                    >
                                                        Max Price
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="100000"
                                                    value={tempMaxPrice ?? ''}
                                                    onChange={(e) => setTempMaxPrice(e.target.value)}
                                                    className=" bg-[var(--background-color)] w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                                                        style={{ fontSize: 'var(--font-size-sm, 14px)' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick Select Ranges */}
                                           
                                        <div className="flex flex-wrap gap-1">
                                            {minPriceRanges.map(range => (
                                                <button
                                                    key={`min-${range.value}`}
                                                    onClick={() => setTempMinPrice(range.value)}
                                                    className={`px-2 py-1 border rounded-md transition-all ${tempMinPrice === range.value
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    style={{ fontSize: 'var(--font-size-xxs, 12px)' }}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {maxPriceRanges.map(range => (
                                                <button
                                                    key={`max-${range.value}`}
                                                    onClick={() => setTempMaxPrice(range.value)}
                                                    className={`px-2 py-1 border rounded-md transition-all ${tempMaxPrice === range.value
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    style={{ fontSize: 'var(--font-size-xxs, 12px)' }}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>

                                      
                                        </div>
                                </div>
                            )}

                            {/* Items List */}
                            {modalStep === 'items' && (
                                <div className=" grid grid-cols-3 gap-3 ">
                                    {loadingItems ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="animate-spin" size={24} />
                                        </div>
                                    ) : (
                                        allItems.map(item => (
                                            <button
                                                key={item.ITEMCTRID}
                                                onClick={() => setTempSelectedItem(item)}
                                                className={`w-full px-3 py-2 border rounded-lg text-left transition-all ${tempSelectedItem?.ITEMCTRID === item.ITEMCTRID
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500'
                                                    }`}
                                                style={{ fontSize: 'var(--font-size-xs, 14px)', borderRadius: 'var(--border-radius-md, 8px)' }}
                                            >
                                                {item.ITEMCTRNAME}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Subitems List */}
                            {/* {modalStep === 'subitems' && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                                   
                                    {loadingSub ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="animate-spin" size={24} />
                                        </div>
                                    ) : subItems.length === 0 ? (
                                        <div
                                            className="text-center py-8 text-gray-500 dark:text-gray-400"
                                            style={{ fontSize: 'var(--font-size-xs, 12px)' }}
                                        >
                                            No subitems found for this item
                                        </div>
                                    ) : (
                                        subItems.map(sub => (
                                            <label
                                                key={`sub-${sub.SUBITEMID}`}
                                                className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                                style={{
                                                    fontSize: 'var(--font-size-xs, 12px)',
                                                    borderRadius: 'var(--border-radius-md, 8px)'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubItems.includes(sub.SUBITEMID)}
                                                    onChange={() => handleSubItemToggle(sub)}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                                <span>{sub.SUBITEMNAME}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            )} */}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-2 border-t dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                style={{
                                    fontSize: 'var(--font-size-xs, 14px)',
                                    borderRadius: 'var(--border-radius-md, 8px)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                style={{
                                    fontSize: 'var(--font-size-xs, 14px)',
                                    borderRadius: 'var(--border-radius-md, 8px)'
                                }}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
               
            )}
        </div>
    );
}