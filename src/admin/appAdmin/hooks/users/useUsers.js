import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers,getAllUsersFilter, getAllMemberEnrolled } from '../../service/userService';

export const useAllUsers = () =>{
    return useQuery({
        queryKey: ["allUsers"],
        queryFn: getAllUsers,
    })
}

export const useFilterAllUsers = (param) =>{
    return useQuery({
        queryKey: ["allUsers",param],
        queryFn:()=> getAllUsersFilter(param),
    })
}
export const useAllEntrolledMembers = () =>{
    return useQuery({
        queryKey: ["allEnrolledMembers"],
        queryFn: getAllMemberEnrolled,
    })
}