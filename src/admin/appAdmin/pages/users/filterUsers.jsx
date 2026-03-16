import React, { useState } from "react";

/*---------------Hooks ---------------*/
import { useFilterAllUsers } from "../../hooks/users/useUsers";

/*--------------- Component ---------------*/
import AdvancedTable from "../../../components/table/ResponsiveTable";

/*--------------- Utils ---------------*/
import { numberFormatting } from "../../../../utils/formating/numberFormat";
import { format } from "date-fns";

const ManageUsers = () => {
  const [filters, setFilters] = useState({
    createdFrom: "",
    createdTo: "",
    joinFrom: "",
    joinTo: "",
    schemeStatus: "",
    mobile: "",
  });

  const {
    data: users,
    isLoading: usersLoading,
    isError: getUserError,
    refetch: refetchUsers,
  } = useFilterAllUsers(filters);

  const userList = users?.users || [];

  const usersList =
    userList.map((user, i) => ({
      sNo: i + 1,
      ...user,
    })) ?? [];

  const headers = [
    { key: "sNo", label: "S.No" },
    { key: "username", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Phone" },
    { key: "groupCode", label: "Group Code" },
    { key: "createdAt", label: "Created" },
    { key: "schemeStatus", label: "Status" },
    { key: "joinDate", label: "Joined" },
    { key: "personalId", label: "personalId" },
    { key: "regNo", label: "RegNo" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    refetchUsers();
  };

  const clearFilters = () => {
    setFilters({
      createdFrom: "",
      createdTo: "",
      joinFrom: "",
      joinTo: "",
      schemeStatus: "",
      mobile: "",
    });
  };

  const renderCell = (key, row) => {
    switch (key) {
      case "joinDate":
      case "createdAt":
        const value = row[key];

        if (!value) {
          return <span className="font-semibold">-</span>;
        }

        return (
          <span className="font-semibold">
            {format(new Date(value), "dd-MM-yyyy hh:mm a")}
          </span>
        );

      default:
        return <span>{row[key] ?? "-"}</span>;
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-3 mt-4">
      {/* FILTER SECTION */}

      <div className="bg-white p-3 rounded-lg mb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Created From */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Created From</label>
          <input
            type="date"
            name="createdFrom"
            value={filters.createdFrom}
            onChange={handleChange}
            className="border p-1 rounded text-xs"
          />
        </div>

        {/* Created To */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Created To</label>
          <input
            type="date"
            name="createdTo"
            value={filters.createdTo}
            onChange={handleChange}
            className="border p-1 rounded text-xs"
          />
        </div>

        {/* Join From */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Join From</label>
          <input
            type="date"
            name="joinFrom"
            value={filters.joinFrom}
            onChange={handleChange}
            className="border p-1 rounded text-xs"
          />
        </div>

        {/* Join To */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Join To</label>
          <input
            type="date"
            name="joinTo"
            value={filters.joinTo}
            onChange={handleChange}
            className="border p-1 rounded text-xs"
          />
        </div>

        {/* Scheme Status */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Status</label>
          <select
            name="schemeStatus"
            value={filters.schemeStatus}
            onChange={handleChange}
            className="border p-1 rounded text-xs"
          >
            <option value="">All</option>
            <option value="JOINED">Joined</option>
            <option value="NOT_JOINED">Not Joined</option>
          </select>
        </div>

        {/* Mobile */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={filters.mobile}
            onChange={handleChange}
            placeholder="Enter Mobile"
            className="border p-1 rounded text-xs"
          />
        </div>
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
  );
};

export default ManageUsers;
