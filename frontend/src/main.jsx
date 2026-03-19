import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { StatsProvider } from "./context/StatsContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <StatsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StatsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
