import React, { useState, useEffect, useRef } from "react";

export default function CCPSHeader({
  activeTab = "dashboard",
  setActiveTab,
  handleLogout,
  userName,
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const avatarRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);
  return (
    <header className="bg-blue-900 shadow-sm border-b w-full p-0 m-0">
      <div className="w-full m-0 pl-5 pr-5">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src="/tn-government-logo.png"
                alt="Tamil Nadu Government Logo"
                className="w-8 h-8 rounded-lg"
              />
              <h1 className="text-xl font-bold text-white">CCPS Dashboard</h1>
            </div>
          </div>
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => setActiveTab && setActiveTab("dashboard")}
              className={
                (activeTab === "dashboard"
                  ? "text-white font-medium pb-1"
                  : "text-white hover:text-gray-300 pb-1") +
                " text-sm px-2 transition-all duration-200 flex flex-col items-center"
              }
            >
              <span>Dashboard</span>
              {activeTab === "dashboard" && (
                <span className="block w-full h-0.5 bg-white rounded-t mt-1"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab("reports")}
              className={
                (activeTab === "reports"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent") +
                " text-sm px-2 transition-all duration-200"
              }
            >
              Reports
            </button>
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 shadow-lg"
                title={`${userName ?? "User"} - Click to open menu`}
              >
                <span className="text-white text-sm font-medium">C</span>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          C
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {userName ?? "User"}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          CCPS
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        // Implement profile view logic here
                        alert("Profile view coming soon");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
