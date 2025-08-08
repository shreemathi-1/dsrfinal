"use client";

import { useState, useEffect } from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import Image from "next/image";

export default function AdminHeader({
  user,
  profile,
  activeTab,
  setActiveTab,
  handleLogout,
}) {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Helper function to get user initials
  const getUserInitials = (user, profile) => {
    // Try to get from user metadata first
    if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
      return `${user.user_metadata.firstName[0]}${user.user_metadata.lastName[0]}`.toUpperCase();
    }

    // Try to get from profile
    if (profile?.full_name) {
      const nameParts = profile.full_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${
          nameParts[nameParts.length - 1][0]
        }`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }

    // Try to get from user email
    if (user?.email) {
      return user.email[0].toUpperCase();
    }

    // Default fallback
    return "A";
  };

  const userInitials = getUserInitials(user, profile);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <header className="bg-blue-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src="/tn-government-logo.png"
                  alt="Tamil Nadu Government Logo"
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
          </div>

          <nav className="flex items-center space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="hide"
              // className={`${
              //   activeTab === "dashboard"
              //     ? "text-white font-medium border-b-2 border-white pb-1"
              //     : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              // } text-sm px-2 transition-all duration-200`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab("user-reports")}
              className={`${
                activeTab === "user-reports"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              User Reports
            </button>
            <button
              onClick={() => setActiveTab("roles-permissions")}
              className="hide"
              // className={`${
              //   activeTab === "roles-permissions"
              //     ? "text-white font-medium border-b-2 border-white pb-1"
              //     : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              // } text-sm px-2 transition-all duration-200`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab("form-fields")}
              className={`${
                activeTab === "form-fields"
                  ? "text-white font-medium border-b-2 border-white pb-1"
                  : "text-white hover:text-gray-300 hover:border-b-2 hover:border-gray-300 pb-1 border-b-2 border-transparent"
              } text-sm px-2 transition-all duration-200`}
            >
              Form Fields
            </button>

            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 shadow-lg"
                title={`${
                  profile?.full_name || user?.email || "Admin"
                } - Click to open menu`}
              >
                <span className="text-white text-sm font-semibold tracking-wide">
                  {userInitials}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-lg">
                          {userInitials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {user?.user_metadata?.firstName &&
                          user?.user_metadata?.lastName
                            ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
                            : profile?.full_name || user?.email}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {profile?.user_type || "Admin"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        showInfo("Profile settings will be implemented");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
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
                        setProfileDropdownOpen(false);
                        setActiveTab("settings");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Admin Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setActiveTab("users");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
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
                      <span>Manage Users</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg flex items-center space-x-3 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-red-500"
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
