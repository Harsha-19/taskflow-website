import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import "./index.css";
import App from "./App";
import { StatsProvider } from "@/context/StatsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <StatsProvider>
            <BrowserRouter>
              <App />
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                }}
              />
            </BrowserRouter>
          </StatsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
