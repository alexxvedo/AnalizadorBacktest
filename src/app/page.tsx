"use client";

import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";

export default function Home() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
