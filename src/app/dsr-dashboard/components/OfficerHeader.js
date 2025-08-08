export default function OfficerHeader({
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
              <h1 className="text-xl font-bold text-white">
                Officer Dashboard
              </h1>
            </div>
          </div>
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`${
                activeTab === "dashboard"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("complaint-form")}
              className={`${
                activeTab === "complaint-form"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              File Complaint
            </button>
            <button
              onClick={() => setActiveTab("view-complaints")}
              className={`${
                activeTab === "view-complaints"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              View Complaints
            </button>
            <button
              onClick={() => setActiveTab("bulk-upload")}
              className={`${
                activeTab === "bulk-upload"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              Bulk Upload
            </button>
            <button
              onClick={() => window.location.pathname = '/dsr-dashboard/reports'}
              className={`${
                typeof window !== 'undefined' && window.location.pathname.startsWith('/dsr-dashboard/reports')
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              Reports
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">O</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-white hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
