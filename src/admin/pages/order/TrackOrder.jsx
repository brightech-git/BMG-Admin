
import { useEffect, useState } from "react";
import { useParams ,useNavigate  } from "react-router-dom";
import { useTrackOrderById } from "../../hooks/order/useTrackOrder";
import OrderTrackingWrapper from "../../wrapper/track/OrderTrackingTimeline";
import { ORDER_DETAIL_BUTTON } from "../../data/track/trackDetailButtons";
import AdvancedTable from "../../components/table/ResponsiveTable";
import dayjs from "dayjs";
import { FiArrowLeft } from "react-icons/fi";


function TrackOrder() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [activeView ,setActiveView] = useState('HISTORY');

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useTrackOrderById(orderId);

   const handleViewChange = (viewKey) => {
        setActiveView(viewKey);
    };

    console.log(data ,'order tracking')
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
        
        { key: 'updated_at', label: 'Completed At' },
        { key: 'remarks', label: 'Remark' },

    ];

    const customerAddress = [
        { key:'customerId' , label:'Customer'},
        { key:'phone' , label:'Contact No'},
        {key:'address' , label:'Address'},
        {key:'state' , label:'State'},
    ]




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
            case "status":
                return (
                    <span className="text-xs">
                        {item.status
                            ? item.label
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
const renderCustomerDetails = (key ,item) => {
    switch(key){
        case "customerId":
            return (
                <span className=" flex text-xs gap-2">
                    <span>{item.customerId}</span> - 
                    <span>{item.name}</span>
                </span>
            );
        case "phone":
            return (
                <span className="text-xs">
                    {item.phone}
                </span>
            );
        case "address":
            return (
                <span className="flex flex-col gap-0 text-xs m-0 " >
                    <p className="m-0">{item.addressLine}</p>
                    <p className="m-0" >{item.city}</p>
                    <p className="m-0">{item.pincode}</p>
                    <p className="m-0"> {item.state}</p>
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
                    <h6 className="flex items-center gap-2 text-xs sm:text-base"><span onClick={()=>navigate(-1)}> <FiArrowLeft /></span> Tracking Details : {orderId} </h6>
                </header>
                <main className="bg-white">
                    <OrderTrackingWrapper currentStatus={data?.current_status} />
                </main>
                <footer className="bg-white border-t">
                    <div className="flex justify-around text-xs sm:text-sm">
                        {ORDER_DETAIL_BUTTON.map(item => (
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
                            <>
                            <div className="p-3">

                                {/* Customer Details */}
                                
                                <AdvancedTable
                                    headers={customerAddress}
                                    data={data?.delivery_address? [data?.delivery_address]: [] }
                                    fontSizeRow="text-xs"
                                    isLoading={isLoading}
                                    isError={isError}
                                    emptyMessage="Customer Details Not Found"
                                    renderCell={renderCustomerDetails}
                                    onRetry={refetch}
                                    fontSizeHeader="text-sm"
                                    headerText="text-white"
                                    headerBg="bg-[var(--info-color)]"
                                />
                            </div>
                            </>
                        )}
                    </div>
                </footer>
      
    

            </div>
        </div>
    )
}
export default TrackOrder;