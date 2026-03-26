import React, { createContext, useContext, useMemo, useState } from "react";
import api from "@/services/api";

const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function refreshStats() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.dashboard.getStats();
      const nextStats = response.data;
      setStats(nextStats);
      return nextStats;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({ stats, setStats, refreshStats, loading, error }),
    [stats, loading, error]
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
