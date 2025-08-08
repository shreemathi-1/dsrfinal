"use client";
import React from "react";
import Table1_ComplaintsNCRPCCPS from "../dsr-dashboard/components/tables/Table1_ComplaintsNCRPCCPS";
import Table2_AmountLostFrozen from "../dsr-dashboard/components/tables/Table2_AmountLostFrozen";
import Table3_StagesOfCases from "../dsr-dashboard/components/tables/Table3_StagesOfCases";
import Table4_NCRPComplaints from "../dsr-dashboard/components/tables/Table4_NCRPComplaints";
import Table5_CCTNSComplaints from "../dsr-dashboard/components/tables/Table5_CCTNSComplaints";
import Table6_TrendingMO from "../dsr-dashboard/components/tables/Table6_TrendingMO";

export default function NCRPDashboard({ selectedDate }) {
  // You can pass selectedDate from parent or use local state
  return (
    <div className="max-w-[95%] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">NCRP Dashboard</h1>
      <div className="space-y-8">
        <Table1_ComplaintsNCRPCCPS date={selectedDate} />
        <Table2_AmountLostFrozen date={selectedDate} />
        <Table3_StagesOfCases date={selectedDate} />
        <Table4_NCRPComplaints date={selectedDate} />
        <Table5_CCTNSComplaints date={selectedDate} />
        <Table6_TrendingMO date={selectedDate} />
      </div>
    </div>
  );
}
