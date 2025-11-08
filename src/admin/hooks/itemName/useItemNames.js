import { useState, useEffect } from "react";
import { itemService } from "../../service/itemService";

export const useItemNames = (itemctrId = null) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                console.log("📦 Fetching item names for:", itemctrId);
                const data = await itemService.getItemNames(itemctrId);
                console.log("✅ Item data fetched:", data);
                setItems(data || []);
            } catch (err) {
                console.error("❌ Error fetching items:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [itemctrId]);

    return { items, loading, error };
};
