// src/config/statusRoutes.js
export const STATUS_ROUTES = [
    { title: 'Today Orders', path: '/admin/order/today', key: '', values: [''] },
    { title: 'Pending Orders', path: '/admin/order/status/pending', key: 'PENDING', values: [''] },
    { title: 'Placed', path: '/admin/order/status/placed', key: 'PLACED', values: ['IN_PROCESSING', 'CANCELLED'] },
    { title: 'Quality Checking', path: '/admin/order/status/qc', key: 'IN_PROCESSING', values: ['PACKING', 'CANCELLED'] },
    { title: 'Packing', path: '/admin/order/status/packing', key: 'PACKING', values: ['PACKED', 'CANCELLED'] },
    { title: 'Packed', path: '/admin/order/status/packed', key: 'PACKED', values: ['SHIPPED', 'CANCELLED'] },
    { title: 'Dispatch', path: '/admin/order/status/shipped', key: 'SHIPPED', values: ['SHIPPED', 'CANCELLED'] },
    { title: 'In-Transit', path: '/admin/order/status/in-transit', key: 'IN_TRANSIT', values: ['SHIPPED', 'CANCELLED'] },
    { title: 'Delivered', path: '/admin/order/status/delivered', key: 'DELIVERED', values: ['SHIPPED', 'CANCELLED'] },
    { title: 'Cancelled', path: '/admin/order/status/cancelled', key: 'CANCELLED', values: ['SHIPPED', 'CANCELLED'] },
    { title: 'Returned', path: '/admin/order/status/returned', key: 'RETURNED', values: ['SHIPPED', 'CANCELLED'] },
    { title: 'Refunded', path: '/admin/order/status/refunded', key: 'REFUNDED', values: ['SHIPPED', 'CANCELLED'] },
];
