import React from "react";

export default function AdminHeader({
  title = "Admin Dashboard",
  activeTab,
  setActiveTab,
  handleLogout,
}) {
  return (
    <header className="bg-blue-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src="/tn-government-logo.png"
                alt="Tamil Nadu Government Logo"
                className="w-8 h-8 rounded-lg"
              />
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
          </div>
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => setActiveTab && setActiveTab("user-management")}
              className={`$ {
                activeTab === "user-management"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab("roles-permissions")}
              className={`$ {
                activeTab === "roles-permissions"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab("dashboard-stats")}
              className={`$ {
                activeTab === "dashboard-stats"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              Dashboard Stats
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            {handleLogout && (
              <button
                onClick={handleLogout}
                className="text-sm text-white hover:text-gray-300 transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
