
import { useEffect, useState } from "react";
import { useParams ,useNavigate  } from "react-router-dom";
import { useTrackOrderById } from "../../hooks/order/useTrackOrder";
import OrderTrackingWrapper from "../../wrapper/track/OrderTrackingTimeline";
import { ORDER_DETAIL_BUUTON } from "../../data/track/trackDetailButtons";
import AdvancedTable from "../../components/table/ResponsiveTable";
import dayjs from "dayjs";

function TrackOrder() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [activeView ,setActiveView] = useState('HISTORY');
    const [orderedItems , setOrderedItems] = useState([]);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useTrackOrderById(orderId);

   const handleViewChange = (viewKey) => {
        setActiveView(viewKey);
    };


    useEffect(() => {
        if (!orderId) {
            navigate("/orders", { replace: true });
        }
    }, [orderId, navigate]);

    const itemHeaderColumn =[

        { key: 'productId', label: 'Product ID' },
        { key:'productName' , label: 'Product Name' },
        {  key:'price' , label: 'Price' },
        { key:'image_path' , label: 'Image' ,align:'center'},

    ] ;

    const timelineHeaderColumn = [

        { key: 'status', label: 'Status' },
        { key: 'updated_at', label: 'Time' },
        { key: 'remarks', label: 'Remark' },

    ];



    const renderItemData = (key, item) => {
        switch (key) {
            case "productId":
                return (
                    <span className="text-xs font-medium">
                        {item.itemid}-{item.tagno}
                    </span>
                );

            case "price":
                return (
                    <span className="text-xs">
                        ₹{Number(item.price).toFixed(2)}
                    </span>
                );

            case "image_path":
                return (
                    <div className="flex items-center justify-center">
                        <img
                            src={item.image_path}
                            alt={item.productName}
                            className="w-5 sm:w-10 h-5 sm:h-10 object-cover rounded"
                        />
                    </div>
                   
                );

            default:
                return (
                    <span className="text-xs">
                        {item[key] ?? "-"}
                    </span>
                );
        }
    };

    const renderTimeLineData = (key , item) =>{
        switch(key){
            case "updated_at":
                return (
                    <span className="text-xs">
                        {item.updated_at
                            ? dayjs(item.updated_at).format("DD MMM YYYY, hh:mm A")
                            : "-"}
                    </span>
                );


            default:
                return (
                    <span className="text-xs">
                        {item[key] ?? " "}
                    </span>
                );
        }
      
    }


    return(
        <div className="max-w-full m-2 p-2">
            <div className="flex flex-col gap-2">
                <header className="mt-3">
                    <h6 className="text-xs sm:text-base"> Tracking Details : {orderId} </h6>
                </header>
                <main className="bg-white">
                    <OrderTrackingWrapper currentStatus={data?.current_status}/>
                </main>
                <footer className="bg-white border-t">
                    <div className="flex justify-around text-xs sm:text-sm">
                        {ORDER_DETAIL_BUUTON.map(item => (
                            <div
                                key={item.key}
                                onClick={() => setActiveView(item.key)}
                                className={`cursor-pointer px-4 py-3 relative
          ${activeView === item.key
                                        ? "text-[var(--primary-color)] font-medium"
                                        : "text-gray-500"
                                    }
        `}
                            >
                                {item.label}

                                {activeView === item.key && (
                                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[var(--primary-color)]" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div>
                        {activeView === "HISTORY" && (
                            <div className="p-3">

                                <AdvancedTable
                                    headers={timelineHeaderColumn}
                                    data={data?.history || []}
                                    fontSizeRow="text-xs"
                                    isLoading={isLoading}
                                    isError={isError}
                                    emptyMessage="No Order Items Found"
                                    renderCell={renderTimeLineData}
                                    onRetry={refetch}
                                    fontSizeHeader="text-sm"
                                    headerText="text-white"
                                    headerBg="bg-[var(--info-color)]"
                                />
                            </div>
                        )}

                        {activeView === "ORDER-DETAIL" && (
                            <div className="p-3">

                                {/* Order items */}
                                
                                <AdvancedTable
                                    headers={itemHeaderColumn}
                                    data={data?.items || []}
                                    fontSizeRow="text-xs"
                                    isLoading={isLoading}
                                    isError={isError}
                                    emptyMessage="No Order Items Found"
                                    renderCell={renderItemData}
                                    onRetry={refetch}
                                    fontSizeHeader="text-sm"
                                    headerText="text-white"
                                    headerBg="bg-[var(--info-color)]"
                                />
                            </div>
                        )}

                        {activeView === "CUSTOMER-DETAIL" && (
                            <div className="p-3 text-xs text-gray-500">
                                Customer details coming soon…
                            </div>
                        )}
                    </div>
                </footer>
      
                   
        

                

            </div>
        </div>
    )
}
export default TrackOrder;