"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { EARankingTable } from "./EARankingTable";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <EARankingTable />
    </div>
  );
}
