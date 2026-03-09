import React from "react";
import { FiUsers, FiClipboard, FiDollarSign } from "react-icons/fi";
import SchemeSummaryCards from "./SchemeCart/SchemeCart";

const KPIcards = ({ dashData }) => {

  const totalCollection =
    dashData?.schemeSummary?.reduce(
      (sum, item) => sum + (item.colAmount || 0),
      0
    ) || 0;

  const kpiData = [
    {
      title: "Active Schemes",
      value: dashData?.totalActiveSchemeCount?.totalActiveSchemeCount,
      icon: <FiClipboard />,
      bgColor: "bg-primary",
    },
    {
      title: "Members Enrolled",
      value: dashData?.totalCount?.totalCount,
      icon: <FiUsers />,
      bgColor: "bg-secondary",
    },
    {
      title: "Total Scheme Collection",
      value: "₹" + totalCollection.toLocaleString(),
      icon: <FiDollarSign />,
      bgColor: "bg-success",
    },
  ];

  return (
    <>
      <SchemeSummaryCards schemeSummary={dashData?.schemeSummary} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {kpiData.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between px-4 py-4 rounded-lg shadow-md text-white ${item.bgColor}`}
          >
            <div>
              <p className="text-sm">{item.title}</p>
              <p className="text-xl font-bold mt-1">{item.value}</p>
            </div>

            <div className="text-2xl">{item.icon}</div>
          </div>
        ))}

      </div>
    </>
  );
};

export default KPIcards;