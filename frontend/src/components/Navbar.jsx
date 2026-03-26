import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl font-bold tracking-tight text-indigo-600"
        >
          <span>TaskFlow</span>
        </Link>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-300"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-300"
              >
                Login
              </Link>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
