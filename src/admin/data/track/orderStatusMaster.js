// orderStatusMaster.ts
export const ORDER_STATUS_MASTER = [
    {
        key: "CREATED",
        label: "Order Created",
        sequence: 1,
        icon: "shopping-bag",
    },
    {
        key: "PLACED",
        label: "Order Confirmed",
        sequence: 2,
        icon: "shopping-bag",
    },
    {
        key: "PACKED",
        label: "Order Packed",
        sequence: 3,
        icon: "shopping-bag",
    },
    {
        key: "SHIPPED",
        label: "Shipped",
        sequence: 4,
        icon: "truck",
    },
    {
        key: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        sequence: 5,
        icon: "map-pin",
    },
    {
        key: "DELIVERED",
        label: "Delivered",
        sequence: 6,
        icon: "home",
    },
];
