import React, { createContext, useContext, useMemo, useState } from "react";

import { getStats } from "../services/api";

const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(null);

  async function refreshStats() {
    const nextStats = await getStats();
    setStats(nextStats);
    return nextStats;
  }

  const value = useMemo(
    () => ({ stats, setStats, refreshStats }),
    [stats]
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within StatsProvider");
  }
  return context;
}
