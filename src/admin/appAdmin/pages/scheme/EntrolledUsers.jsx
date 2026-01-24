import React from "react";
import { useAllEntrolledMembers } from "../../hooks/users/useUsers";
import AdvancedTable from "../../../components/table/ResponsiveTable";
import { numberFormatting } from "../../../../utils/formating/numberFormat";

const EntrolledUsers = () => {
    const { data: members, isLoading, isError, error, refetch } = useAllEntrolledMembers();

    const membersList = members?.users.map((member , index)=>({
        sno:index+1,
        ...member
    })

    ) ?? [];

    const headers = [

        { key: "sno", label: "SNO" },
        { key: "id", label: "User ID" },
        { key: "username", label: "Name" },
        { key: "email", label: "Email" },
        { key: "contactNumber", label: "Mobile" },
        { key: "walletBalance", label: "WalletBalance" },
    ];

    const renderCell = (key, row) => {
        switch (key) {
            case "walletBalance":
                return <span>{numberFormatting(row.walletBalance, 3)}</span>;
            

            default:
                return <span>{row[key] ?? "-"}</span>;
        }
    };

    return (
        <div className="max-w-8xl mx-auto p-3 mt-4">
            <div className="mb-4">
                <h2 className="text-sm sm:text-base font-semibold">Enrolled Members</h2>
            </div>

            <AdvancedTable
                headers={headers}
                data={membersList}
                isLoading={isLoading}
                isError={isError}
                emptyMessage="No Enrolled Members Found"
                renderCell={renderCell}
                onRetry={refetch}
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
            />
        </div>
    );
};
export default EntrolledUsers;