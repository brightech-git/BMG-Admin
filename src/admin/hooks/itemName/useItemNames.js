import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { itemService } from "../../service/itemService";

export const useItemNames = (itemId = null) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
            
                const data = await itemService.getItemNames(itemId);
         
                setItems(data || []);
            } catch (err) {
                console.error("❌ Error fetching items:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [itemId]);

    return { items, loading, error };
};


export const useSubItems = (itemId) =>{

    return useQuery({
        queryKey : ['subItems'],
        queryFn : ()=> itemService.getSubItems(itemId),
        enabled : !!itemId,
        select : (response) => response.data
    })
}