import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import KPIcards from "../components/KPIcards";
import TransactionsTable from "../components/TransactionsTable";
import { getDashBoardDetails } from "../service/appDashboardService";
import ActiveSchemesPage from "../components/ActiveSchemePage";

const Dashboard = () => {

  const today = new Date();

  const [fromDate, setFromDate] = useState(
    localStorage.getItem("fromDate")
      ? new Date(localStorage.getItem("fromDate"))
      : new Date("2026-01-01")
  );

  const [toDate, setToDate] = useState(
    localStorage.getItem("toDate")
      ? new Date(localStorage.getItem("toDate"))
      : today
  );

  const [dashData, setDashData] = useState(null);

  const formatForAPI = (date) => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {

    const apiFrom = formatForAPI(fromDate);
    const apiTo = formatForAPI(toDate);

    localStorage.setItem("fromDate", apiFrom);
    localStorage.setItem("toDate", apiTo);

    const params = {
      fromDate: apiFrom,
      toDate: apiTo,
      schemeAdminDb: "BMPSAVINGS",
      schemeTranDb: "BMPSH0708",
    };

    async function fetchData() {
      const data = await getDashBoardDetails(params);
      setDashData(data);
    }

    fetchData();

  }, [fromDate, toDate]);

  return (
    <div className="bg-background-color p-4 max-w-8xl mt-6">

      {/* DATE FILTER */}
      <div className="flex gap-6 mb-6">

        <div className="flex flex-col">
          <label className="text-sm">From Date</label>

          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="dd-MM-yyyy"
            className="border p-2 rounded"
          />

        </div>

        <div className="flex flex-col">
          <label className="text-sm">To Date</label>

          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="dd-MM-yyyy"
            className="border p-2 rounded"
          />

        </div>

      </div>

      {/* KPI */}
      <KPIcards dashData={dashData} />

      {/* TRANSACTIONS */}
      <TransactionsTable dashData={dashData} />
      <ActiveSchemesPage dashData={dashData} />

    </div>
  );
};

export default Dashboard;