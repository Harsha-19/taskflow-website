import React from "react";
import { Link } from "react-router-dom";

export default function Footer({ showSectionLinks = false }) {
  const sectionLink = (hash, label) =>
    showSectionLinks ? (
      <a href={hash} className="hover:text-blue-600">
        {label}
      </a>
    ) : (
      <Link to={`/${hash}`} className="hover:text-blue-600">
        {label}
      </Link>
    );

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 dark:text-gray-400 md:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="TaskFlow Logo"
            className="h-8 w-auto dark:brightness-110 dark:contrast-125"
          />
          <p>&copy; 2026 TaskFlow. All rights reserved.</p>
        </div>

        <div className="flex gap-6">
          {sectionLink("#features", "Features")}
          {showSectionLinks ? (
            <a href="#pricing" className="hover:text-blue-600">
              Pricing
            </a>
          ) : (
            <Link to="/pricing" className="hover:text-blue-600">
              Pricing
            </Link>
          )}
          {sectionLink("#about", "About")}
        </div>
      </div>
    </footer>
  );
}
