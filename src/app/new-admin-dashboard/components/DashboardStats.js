"use client";

import { useNotification } from "../../../contexts/NotificationContext";

export default function DashboardStats({ users, officerCount, setActiveTab, setFilterPreset }) {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Bulk Operations functionality
  const handleBulkOperations = () => {
    // Create a file input for CSV upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Here you would implement CSV parsing and bulk user import
        showInfo(`Bulk import initiated for file: ${file.name}. This feature will be fully implemented with CSV parsing and validation.`);
      }
    };
    fileInput.click();
  };

  // Export User List functionality
  const handleExportUsers = () => {
    // Convert users data to CSV format
    const headers = ['Name', 'Email', 'User Type', 'District', 'Police Station', 'Status', 'Created At'];
    const csvData = users.map(user => [
      user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user.email,
      user.userType,
      user.district,
      user.policeStation,
      user.status,
      user.createdAt
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field || ''}"`).join(','))
      .join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('User list exported successfully!');
  };

  // Reset User Passwords functionality
  const handleResetPasswords = () => {
    const selectedUsers = users.filter(user => user.status === 'Active');
    if (selectedUsers.length === 0) {
      showWarning('No active users found to reset passwords for.');
      return;
    }
    
    const userList = selectedUsers.map(user => user.name || user.email).join('\n');
    const confirmReset = confirm(
      `Reset passwords for ${selectedUsers.length} active users?\n\nUsers:\n${userList}\n\nThis will send password reset emails to all active users.`
    );
    
    if (confirmReset) {
      // Here you would implement actual password reset logic
      showSuccess(`Password reset emails sent to ${selectedUsers.length} users. This feature will be fully implemented with email integration.`);
    }
  };

  // Send Notifications functionality
  const handleSendNotifications = () => {
    const notificationTypes = [
      { id: 'system', label: 'System Maintenance', icon: '🔧' },
      { id: 'update', label: 'System Update', icon: '🔄' },
      { id: 'reminder', label: 'Password Reminder', icon: '🔐' },
      { id: 'custom', label: 'Custom Message', icon: '📝' }
    ];
    
    const type = prompt(
      `Select notification type:\n${notificationTypes.map(t => `${t.icon} ${t.label}`).join('\n')}\n\nEnter type (system/update/reminder/custom):`
    );
    
    if (type && ['system', 'update', 'reminder', 'custom'].includes(type.toLowerCase())) {
      const message = prompt('Enter notification message:');
      if (message) {
        const targetUsers = users.filter(user => user.status === 'Active');
        showSuccess(`Notification sent to ${targetUsers.length} active users! Type: ${type}, Message: ${message}. This feature will be fully implemented with real-time notifications.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
          title="Click to view all users in User Management"
          onClick={() => {
            setActiveTab("users");
            setFilterPreset("all");
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              <p className="text-xs text-gray-500 mt-1">All registered users</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">↗ Click to filter</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
          title="Click to view officers in User Management"
          onClick={() => {
            setActiveTab("users");
            setFilterPreset("officer");
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Officers</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((u) => u.userType === "officer").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {
                  users.filter(
                    (u) => u.userType === "officer" && u.status === "Active"
                  ).length
                }{" "}
                active,{" "}
                {
                  users.filter(
                    (u) => u.userType === "officer" && u.status === "Inactive"
                  ).length
                }{" "}
                inactive
              </p>
              <p className="text-xs text-green-600 mt-1 font-medium">↗ Click to filter</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
          title="Click to view DSR Admins in User Management"
          onClick={() => {
            setActiveTab("users");
            setFilterPreset("dsr-admin");
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                DSR Admins
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((u) => u.userType === "dsr-admin").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Report administrators
              </p>
              <p className="text-xs text-yellow-600 mt-1 font-medium">↗ Click to filter</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
          title="Click to view Administrators in User Management"
          onClick={() => {
            setActiveTab("users");
            setFilterPreset("admin");
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Administrators
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((u) => u.userType === "admin").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                System administrators
              </p>
              <p className="text-xs text-red-600 mt-1 font-medium">↗ Click to filter</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add User Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Add User
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Add new officers, DSR admins, or administrators to the system
          </p>
          <button
            onClick={() => setActiveTab("users")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New User
          </button>
        </div>

        {/* User Management Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Users
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            View, edit, activate/deactivate user accounts and permissions
          </p>
          <button
            onClick={() => setActiveTab("users")}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Manage All Users
          </button>
        </div>

        {/* Bulk Operations Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Operations
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Import/export users, bulk updates, and batch operations
          </p>
          <button
            onClick={handleBulkOperations}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Bulk Import/Export
          </button>
        </div>
      </div>

      {/* User Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          User Analytics & Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Distribution Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              User Distribution
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Officers:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {users.filter((u) => u.userType === "officer").length} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      users.length > 0
                        ? (users.filter((u) => u.userType === "officer")
                            .length /
                            users.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">DSR Admins:</span>
                <span className="text-sm font-semibold text-green-600">
                  {users.filter((u) => u.userType === "dsr-admin").length} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      users.length > 0
                        ? (users.filter((u) => u.userType === "dsr-admin")
                            .length /
                            users.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admins:</span>
                <span className="text-sm font-semibold text-red-600">
                  {users.filter((u) => u.userType === "admin").length} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${
                      users.length > 0
                        ? (users.filter((u) => u.userType === "admin").length /
                            users.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent User Activities */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              Recent Activities
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">New officer added</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">User status updated</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">Bulk import completed</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("user-reports")}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                📊 View User Reports
              </button>
              <button
                onClick={handleExportUsers}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                📤 Export User List
              </button>
              <button
                onClick={handleResetPasswords}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                🔐 Reset User Passwords
              </button>
              <button
                onClick={handleSendNotifications}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                📧 Send Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
