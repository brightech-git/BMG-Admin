import { useMutation ,useQuery } from "@tanstack/react-query";
import { comboService, allComboProducts ,updateCombo } from "../../service/comboProductsService";

export function useCombo(){
    return useMutation({
        mutationKey:["combos"],
        mutationFn: (payload)=>comboService(payload),
    })
}
export function useUpdateCombo(){
    return useMutation({
        mutationKey : ["combos"],
        mutationFn : (id,payload)=> updateCombo({id:id , payload:payload}), 
    })
}

export function useComboProcuts(){

    return useQuery({
        queryKey : ["combos"],
        queryFn: () => allComboProducts(),
        select : (res)=>res
    })
}