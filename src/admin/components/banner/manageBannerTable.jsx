import React from "react";
import AdvancedTable from "../table/ResponsiveTable";

const BannerTable = ({
    title = "",
    subtitle = "",
    headers = [],        
    data = [],           
    renderCell = null, 
    emptyMessage = ''  ,
    loading = false,
    button,
    onClick,
    error
}) => {
    return (
        <div className="w-full p-1">
            {(title || subtitle) && (
                <div className="flex justify-between items-center mb-2">
                    <div>
                        {title && <h2 className="text-sm sm:text-base font-semibold text-[var(--primary-color)]">{title}</h2>}
                        {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
                    </div>
                    {button?.trim() && <div>
                        <button onClick={onClick} className="bg-white border border-[var(--primary-text-color)] px-3 py-1.5 font-semibold text-xs sm:text-sm text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--primary-text-color)] rounded transition-all duration-300">
                            {button}
                        </button>
                    </div>}
                    
                </div>
            )}

            <AdvancedTable
                headers={headers}
                data={data}
                renderCell={renderCell} // 🔥 EVERYTHING controlled by parent
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
                actionColumn="actions"
                emptyMessage={emptyMessage} 
                isLoading={loading}  
                isError={error}    
                 
            />
        </div>
    );
};

export default BannerTable;
