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
        <div className="w-full">
            {(title || subtitle) && (
                <div className="flex justify-between items-center mb-1">
                    <div>
                        {title && <h2 className="text-sm font-semibold">{title}</h2>}
                        {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
                    </div>
                    {button?.trim() && <div>
                        <button onClick={onClick} className="bg-white border p-1 text-xs primaryText">
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
