"use client";

import { useState, useEffect } from "react";

export default function UserManagement({
  users,
  setUsers,
  filteredUsers,
  setFilteredUsers,
  searchTerm,
  setSearchTerm,
  userTypeFilter,
  setUserTypeFilter,
  statusFilter,
  setStatusFilter,
  districtFilter,
  setDistrictFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  setTotalPages,
  showAddUserModal,
  setShowAddUserModal,
  handleAddUserFromModal,
  handleDeleteUser,
  handleEditUserClick,
  handleEditUserCancel,
  handleEditUserSave,
  handleEditUserChange,
  handleToggleUserStatus,
  editingUserId,
  setEditingUserId,
  editUserData,
  setEditUserData,
  showEditUserModal,
  setShowEditUserModal,
  filterPreset,
  setFilterPreset,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const USERS_PER_PAGE = 10;

  // Handle filter preset from dashboard stats
  useEffect(() => {
    if (filterPreset) {
      if (filterPreset === "all") {
        setUserTypeFilter("all");
        setStatusFilter("all");
        setDistrictFilter("all");
        setSearchTerm("");
      } else {
        setUserTypeFilter(filterPreset);
        setStatusFilter("all");
        setDistrictFilter("all");
        setSearchTerm("");
      }
      // Clear the preset after applying
      setFilterPreset(null);
    }
  }, [
    filterPreset,
    setUserTypeFilter,
    setStatusFilter,
    setDistrictFilter,
    setSearchTerm,
    setFilterPreset,
  ]);

  // Filter users whenever users, searchTerm, or filters change
  useEffect(() => {
    let temp = [...users];
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          (u.userIdentifier && u.userIdentifier.toLowerCase().includes(term)) ||
          (u.district && u.district.toLowerCase().includes(term))
      );
    }
    if (userTypeFilter !== "all") {
      temp = temp.filter((u) => u.userType === userTypeFilter);
    }
    if (statusFilter !== "all") {
      temp = temp.filter((u) => u.status === statusFilter);
    }
    if (districtFilter !== "all") {
      temp = temp.filter((u) => u.district === districtFilter);
    }
    setFilteredUsers(temp);
  }, [
    users,
    searchTerm,
    userTypeFilter,
    statusFilter,
    districtFilter,
    setFilteredUsers,
  ]);

  // Add a paginatedUsers variable to slice filteredUsers for the current page
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Update totalPages whenever filteredUsers changes
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE)));
    // If currentPage is out of range after filtering, reset to 1
    if (currentPage > Math.ceil(filteredUsers.length / USERS_PER_PAGE)) {
      setCurrentPage(1);
    }
  }, [filteredUsers, setTotalPages, setCurrentPage, currentPage]);

  // Collect unique districts for filter dropdown
  const districtOptions = [
    ...new Set(users.map((u) => u.district).filter(Boolean)),
  ];

  return (
    <div className="space-y-8">
      {/* User Management Header with Add User Button */}
      <div className="bg-gradient-to-r from-blue-100 via-purple-50 to-blue-50 rounded-2xl shadow-2xl border border-gray-200">
        <div className="px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1 flex items-center gap-2">
              <span className="inline-block bg-blue-600 text-white rounded-full px-3 py-1 text-lg mr-2 shadow">
                Admin
              </span>
              User Management
              {userTypeFilter !== "all" && (
                <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full ml-2">
                  Filtered:{" "}
                  {userTypeFilter === "dsr-admin"
                    ? "DSR Admin"
                    : userTypeFilter.charAt(0).toUpperCase() +
                      userTypeFilter.slice(1)}
                </span>
              )}
            </h2>
            <p className="text-base text-gray-500 mt-1">
              Manage system users, roles, and permissions
              {userTypeFilter !== "all" && (
                <span className="text-blue-600 font-medium">
                  {" "}
                  • Currently showing{" "}
                  {userTypeFilter === "dsr-admin"
                    ? "DSR Admin"
                    : userTypeFilter.charAt(0).toUpperCase() +
                      userTypeFilter.slice(1)}{" "}
                  users
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200"
          >
            <svg
              className="w-6 h-6 mr-2"
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
            Add New User
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0 px-10 pt-6">
        {/* Search Field with Icon */}
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className={`w-5 h-5 ${
                searchTerm ? "text-green-500" : "text-blue-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, user identifier, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 border-2 rounded-xl text-base focus:outline-none focus:ring-2 bg-white shadow-sm transition-all duration-200 ${
              searchTerm
                ? "border-green-300 focus:ring-green-400 bg-green-50"
                : "border-blue-200 focus:ring-blue-400"
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Button and Dropdown */}
        <div className="relative">
          <button
            type="button"
            className={`flex items-center px-5 py-2 border rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all duration-200 ${
              userTypeFilter !== "all" ||
              statusFilter !== "all" ||
              districtFilter !== "all"
                ? "bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border-orange-300 text-orange-700"
                : "bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 border-blue-200 text-blue-700"
            }`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <svg
              className={`w-5 h-5 mr-2 ${
                userTypeFilter !== "all" ||
                statusFilter !== "all" ||
                districtFilter !== "all"
                  ? "text-orange-600"
                  : "text-blue-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z"
              />
            </svg>
            Filter
            {(userTypeFilter !== "all" ||
              statusFilter !== "all" ||
              districtFilter !== "all") && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
                {[
                  userTypeFilter !== "all" ? 1 : 0,
                  statusFilter !== "all" ? 1 : 0,
                  districtFilter !== "all" ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          {showFilters && (
            <div className="absolute z-20 mt-2 w-72 bg-white border border-blue-200 rounded-2xl shadow-2xl p-5 right-0 animate-fade-in">
              <div className="mb-4">
                <label
                  className={`block text-xs font-bold mb-1 ${
                    userTypeFilter !== "all"
                      ? "text-orange-700"
                      : "text-blue-700"
                  }`}
                >
                  User Type
                  {userTypeFilter !== "all" && (
                    <span className="ml-1 text-orange-500">●</span>
                  )}
                </label>
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                    userTypeFilter !== "all"
                      ? "border-orange-300 focus:ring-orange-400 bg-orange-50"
                      : "border-blue-200 focus:ring-blue-400"
                  }`}
                >
                  <option value="all">All User Types</option>
                  <option value="admin">Admin</option>
                  <option value="dsr-admin">DSR Admin</option>
                  <option value="officer">Officer</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className={`block text-xs font-bold mb-1 ${
                    statusFilter !== "all" ? "text-orange-700" : "text-blue-700"
                  }`}
                >
                  Status
                  {statusFilter !== "all" && (
                    <span className="ml-1 text-orange-500">●</span>
                  )}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                    statusFilter !== "all"
                      ? "border-orange-300 focus:ring-orange-400 bg-orange-50"
                      : "border-blue-200 focus:ring-blue-400"
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-6">
                <label
                  className={`block text-xs font-bold mb-1 ${
                    districtFilter !== "all"
                      ? "text-orange-700"
                      : "text-blue-700"
                  }`}
                >
                  District
                  {districtFilter !== "all" && (
                    <span className="ml-1 text-orange-500">●</span>
                  )}
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                    districtFilter !== "all"
                      ? "border-orange-300 focus:ring-orange-400 bg-orange-50"
                      : "border-blue-200 focus:ring-blue-400"
                  }`}
                >
                  <option value="all">All Districts</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-1 rounded-lg bg-gray-100 text-blue-700 text-xs font-bold hover:bg-blue-50 border border-blue-100"
                  onClick={() => {
                    setUserTypeFilter("all");
                    setStatusFilter("all");
                    setDistrictFilter("all");
                  }}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="px-4 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold hover:from-blue-700 hover:to-purple-700 shadow"
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm ||
        userTypeFilter !== "all" ||
        statusFilter !== "all" ||
        districtFilter !== "all") && (
        <div className="px-10 pt-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-orange-800">
                  Active Filters:
                </span>

                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 text-green-600 hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                )}

                {userTypeFilter !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    Type:{" "}
                    {userTypeFilter === "dsr-admin"
                      ? "DSR Admin"
                      : userTypeFilter.charAt(0).toUpperCase() +
                        userTypeFilter.slice(1)}
                    <button
                      onClick={() => setUserTypeFilter("all")}
                      className="ml-2 text-orange-600 hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                )}

                {statusFilter !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-2 text-orange-600 hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                )}

                {districtFilter !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    District: {districtFilter}
                    <button
                      onClick={() => setDistrictFilter("all")}
                      className="ml-2 text-orange-600 hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setUserTypeFilter("all");
                  setStatusFilter("all");
                  setDistrictFilter("all");
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mt-6">
        <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-100">
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
            {searchTerm ||
            userTypeFilter !== "all" ||
            statusFilter !== "all" ||
            districtFilter !== "all"
              ? "Filtered Users"
              : "All Users"}{" "}
            <span
              className={`text-base font-medium ${
                searchTerm ||
                userTypeFilter !== "all" ||
                statusFilter !== "all" ||
                districtFilter !== "all"
                  ? "text-orange-600"
                  : "text-gray-500"
              }`}
            >
              ({filteredUsers.length}
              {(searchTerm ||
                userTypeFilter !== "all" ||
                statusFilter !== "all" ||
                districtFilter !== "all") &&
              filteredUsers.length !== users.length
                ? ` of ${users.length}`
                : ""}
              )
            </span>
          </h2>
          {(searchTerm ||
            userTypeFilter !== "all" ||
            statusFilter !== "all" ||
            districtFilter !== "all") && (
            <div className="flex items-center space-x-2 text-sm text-orange-700">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z"
                />
              </svg>
              <span className="font-medium">Filters Active</span>
            </div>
          )}
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-100 via-white to-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User Identifier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <span>Actions</span>
                    <span
                      title="Delete User"
                      className="inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-500 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {paginatedUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`group transition-colors duration-150 border-b border-blue-50 last:border-b-0 ${
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"
                    } hover:bg-blue-100/60`}
                  >
                    {/* Name */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base font-semibold text-blue-900">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editUserData.name || ""}
                          onChange={handleEditUserChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="truncate max-w-[140px]">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.name || "N/A"}
                        </span>
                      )}
                    </td>
                    {/* User Identifier (not editable) */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base text-gray-700">
                      <span className="truncate block max-w-[180px]">
                        {user.userIdentifier
                          ? user.userIdentifier.includes("@")
                            ? user.userIdentifier.split("@")[0]
                            : user.userIdentifier
                          : "NA"}
                      </span>
                    </td>
                    {/* Team */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base text-gray-700">
                      {user.team || "NA"}
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base text-gray-700">
                      {user.email || "NA"}
                    </td>
                    {/* Phone Number */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base text-gray-700">
                      <span className="truncate block max-w-[120px]">
                        {user.phone || "NA"}
                      </span>
                    </td>
                    {/* District */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base text-gray-700">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          name="district"
                          value={editUserData.district || ""}
                          onChange={handleEditUserChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="truncate block max-w-[100px]">
                          {user.district ? user.district : "NA"}
                        </span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <select
                          name="status"
                          value={editUserData.status || "Active"}
                          onChange={handleEditUserChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                            user.status === "Active"
                              ? "bg-gradient-to-r from-green-100 to-teal-100 text-green-700"
                              : "bg-gradient-to-r from-red-100 to-pink-100 text-red-700"
                          }`}
                          title={user.status}
                        >
                          {user.status === "Active" ? (
                            <span className="mr-1">✔️</span>
                          ) : (
                            <span className="mr-1">⛔</span>
                          )}
                          {user.status}
                        </span>
                      )}
                    </td>
                    {/* Created (not editable) */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 align-middle whitespace-nowrap text-base font-medium">
                      <div className="flex items-center space-x-2">
                        {editingUserId === user.id ? (
                          <>
                            <button
                              onClick={() => handleEditUserSave(user.id)}
                              className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                              title="Save"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={handleEditUserCancel}
                              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                              title="Cancel"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditUserClick(user)}
                              className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-sm transition-transform hover:scale-110"
                              title="Edit User"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.232 5.232l3.536 3.536M9 13l6-6"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`px-3 py-1 text-xs rounded-lg font-semibold shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                user.status === "Active"
                                  ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 hover:from-red-200 hover:to-pink-200 focus:ring-red-300"
                                  : "bg-gradient-to-r from-green-100 to-teal-100 text-green-700 hover:from-green-200 hover:to-teal-200 focus:ring-green-300"
                              }`}
                              title={
                                user.status === "Active"
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {user.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 shadow-sm transition-transform hover:scale-110"
                              title="Delete User"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
            <button
              className="px-4 py-1 rounded-lg bg-gray-100 text-blue-700 text-base font-semibold hover:bg-blue-100 border border-blue-100 shadow disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-base text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-1 rounded-lg bg-gray-100 text-blue-700 text-base font-semibold hover:bg-blue-100 border border-blue-100 shadow disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              onClick={handleEditUserCancel}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditUserSave(editingUserId);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editUserData.name || ""}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  name="userType"
                  value={editUserData.userType || "officer"}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="dsr-admin">DSR Admin</option>
                  <option value="officer">Officer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={editUserData.district || ""}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Police Station
                </label>
                <input
                  type="text"
                  name="policeStation"
                  value={editUserData.policeStation || ""}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editUserData.status || "Active"}
                  onChange={handleEditUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleEditUserCancel}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
