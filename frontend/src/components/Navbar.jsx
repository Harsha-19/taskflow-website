import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { getToken, logout } from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(getToken());
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl font-bold tracking-tight text-blue-600"
        >
          <img
            src="/logo.png"
            alt="TaskFlow Logo"
            className="h-8 w-auto dark:brightness-110 dark:contrast-125"
          />
          <span>TaskFlow</span>
        </Link>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300"
            >
              Dashboard
            </button>
          )}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
