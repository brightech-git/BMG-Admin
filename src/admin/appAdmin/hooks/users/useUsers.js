import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getAllMemberEnrolled } from '../../service/userService';

export const useAllUsers = () =>{
    return useQuery({
        queryKey: ["allUsers"],
        queryFn: getAllUsers,
    })
}

export const useAllEntrolledMembers = () =>{
    return useQuery({
        queryKey: ["allEnrolledMembers"],
        queryFn: getAllMemberEnrolled,
    })
}