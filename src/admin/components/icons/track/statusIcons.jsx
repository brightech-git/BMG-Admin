// statusIcons.tsx
import {
    ShoppingBag,
    CheckCircle,
    Truck,
    MapPin,
    Home,
} from "lucide-react";

export const getStatusIcon = (icon) => {
    const icons = {
        "shopping-bag": ShoppingBag,
        "check-circle": CheckCircle,
        truck: Truck,
        "map-pin": MapPin,
        home: Home,
    };

    return icons[icon] || CheckCircle;
};
