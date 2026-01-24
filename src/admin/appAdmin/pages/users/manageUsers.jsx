import React,{useState} from "react";

/*---------------Hooks ---------------*/
import { useAllUsers } from "../../hooks/users/useUsers";

/*--------------- Component ---------------*/

import AdvancedTable from "../../../components/table/ResponsiveTable";

/*--------------- Utils ---------------*/
import {numberFormatting} from '../../../../utils/formating/numberFormat';


const ManageUsers = () =>{

    const {data:users , isLoading : usersLoading , isError :getUserError , refetch:refetchUsers} = useAllUsers();

    console.log(users ,'userslist');
    const userList = users?.users || [];

    const usersList = userList.map((user,i)=>({
        sNo : i+1,
        ...user
    }))??[];

    const headers = [
        { key: 'sNo', label: 'S.No' },
        { key: 'username', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'contactNumber', label: 'Phone' },
        { key: 'walletBalance', label: 'Wallet Balance' },
        { key: 'referralCode', label: 'Referral Code' },
        { key: 'termsAccepted', label: 'Terms Accepted', align: 'center' },
        { key: 'aadhaarVerified', label: 'Aadhaar Verified', align: 'center' },
        { key: 'kycVerified', label: 'KYC Verified', align: 'center' },
    ];

    const renderCell = (key, row) => {
        switch (key) {
            
            case 'termsAccepted':
            case 'aadhaarVerified':
            case 'kycVerified':
                return row[key] ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs items-center justify-center">
                        Yes
                    </span>
                ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs items-center justify-center">
                        No
                    </span>
                );

            case 'walletBalance':
                return (
                    <span className="font-semibold">

                            {numberFormatting(row.walletBalance ,3)}
                    </span>
                );

            default:
                return <span>{row[key] ?? '-'}</span>;
        }
    };


    return(


        <div className="max-w-8xl mx-auto p-3 mt-4 ">

            <div className="mb-2">
                <headers className="flex items-center justify-between bg-white mx-auto rounded-lg ">
                    <h2 className="text-sm sm:text-base font-semibold mx-2 my-1">Manage Users</h2>
                    
                    <button className="text-xs bg-gray-800 text-white px-2 py-1 rounded-lg mr-2 hover:bg-gray-700">
                        Refresh
                    </button>
                </headers>
            </div>

            <AdvancedTable 
                headers={headers}
                data={usersList}
                isLoading={usersLoading}
                isError={getUserError}
                emptyMessage="No Users Found"
                renderCell={renderCell}
                onRetry={refetchUsers}
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
            />
            <div className="mt-2">
                <p className="text-sm font-semibold bg-white p-1 rounded-lg">
                    Total Users : {numberFormatting(users?.totalCount, 0)}
                </p>
            </div>
        </div>
    )
}
export default ManageUsers;