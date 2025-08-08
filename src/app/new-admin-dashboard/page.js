"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { complaintFields } from "../../data/complaintFields";
import AddUserModal from "../../components/forms/AddUserModal";
import { supabase } from "../../../supabaseClient";
import { useCallback } from "react";

// Import new components
import AdminHeader from "./components/AdminHeader";
import DashboardStats from "./components/DashboardStats";
import UserManagement from "./components/UserManagement";
import UserReports from "./components/UserReports";
import RolesPermissions from "./components/RolesPermissions";
import FormFieldManagement from "./components/FormFieldManagement";
import AdminSettings from "./components/AdminSettings";

export default function AdminDashboard() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 10;

  const router = useRouter();
  const { user, profile, loading, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [activeTab, setActiveTab] = useState("users");

  // User management state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [filterPreset, setFilterPreset] = useState(null); // For dashboard stat card filtering
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    userType: "officer",
    district: "",
    policeStation: "",
  });

  // Form field management state
  const [formFields, setFormFields] = useState(complaintFields);

  // Edit user (popup modal)
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  // Add User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Delete confirmation modal states
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Fetch users with pagination
  const fetchUsers = useCallback(async (page) => {
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${USERS_PER_PAGE}`
      );
      const data = await response.json();

      if (!response.ok) {
        console.error("Error loading users:", data.error);
        loadFallbackUsers();
        return;
      }

      if (data.users) {
        setUsers(data.users);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Unexpected error loading users:", err);
      loadFallbackUsers();
    }
  }, []);

  useEffect(() => {
    // // Redirect if not authenticated or not an admin
    if (!loading && !isAuthenticated) {
      router.push("/");
      return;
    }
    fetchUsers(currentPage);
  }, [isAuthenticated, profile, loading, router, currentPage, fetchUsers]);

  // Load users from API route
  const loadSampleUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        console.error("Error loading users:", data.error);
        // Fallback to sample data if API fails
        loadFallbackUsers();
        return;
      }

      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Unexpected error loading users:", err);
      // Fallback to sample data if API fails
      loadFallbackUsers();
    }
  };

  // Fallback sample users for demo
  const loadFallbackUsers = () => {
    const sampleUsers = [
      {
        id: 1,
        name: "Officer John Doe",
        email: "john.officer@tnpolice.gov.in",
        userType: "officer",
        district: "Chennai",
        policeStation: "T.Nagar",
        status: "Active",
        createdAt: "2024-01-01",
      },
      {
        id: 2,
        name: "DSR Admin Jane Smith",
        email: "jane.dsradmin@tnpolice.gov.in",
        userType: "dsr-admin",
        district: "All",
        policeStation: "All",
        status: "Active",
        createdAt: "2024-01-01",
      },
    ];
    setUsers(sampleUsers);
    console.info("Using fallback sample users due to API error");
  };

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not an admin
  if (!isAuthenticated) {
    return null;
  }

  // Helper function to get user display name
  const getUserDisplayName = () => {
    // First check for firstName + lastName in user metadata
    if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
      return `${user.user_metadata.firstName} ${user.user_metadata.lastName}`;
    }

    // Check if profile.full_name exists and is not just the email
    if (profile?.full_name && profile.full_name !== user?.email) {
      return profile.full_name;
    }

    // Check if user_type exists and create a display name from it
    if (profile?.user_type && profile.user_type !== "admin") {
      return profile.user_type === "dsr-admin"
        ? "DSR Admin"
        : profile.user_type === "admin"
        ? "Admin"
        : profile.user_type.charAt(0).toUpperCase() +
          profile.user_type.slice(1);
    }

    // Fallback to Admin
    return "Admin";
  };

  const handleLogout = async () => {
    await logout();
  };

  // Handle adding user from modal
  const handleAddUserFromModal = async (userData) => {
    try {
      // Create user via API route
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: userData.password,
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          team: userData.team, // Send team
          email: userData.email, // Send email
          department: userData.department,
          rankings: userData.rankings,
          userIdentifier: userData.userIdentifier,
          district: userData.district,
          policeStation: userData.policeStation,
          status: userData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user account");
      }

      // If user creation successful, add to local state for UI display
      const newUserData = {
        id: data.user?.id || userData.id, // Use Supabase user ID if available
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        team: userData.team, // Store team
        email: userData.email, // Store email
        rankings: userData.rankings,
        userIdentifier: userData.userIdentifier,
        department: userData.department, // Store department in local state
        district: userData.district,
        policeStation: userData.policeStation,
        status: userData.status || "Active", // Use status from form data
        createdAt: userData.createdAt,
        supabaseId: data.user?.id, // Store Supabase ID for reference
      };

      setUsers((prev) => [...prev, newUserData]);
      showSuccess(
        "User account created successfully! The user can now log in with their credentials."
      );
    } catch (error) {
      console.error("Error adding user:", error);

      // Show specific error messages
      let errorMessage = "Failed to add user. ";
      if (
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
      ) {
        errorMessage += "This email is already registered.";
      } else if (error.message.includes("password")) {
        errorMessage += "Password does not meet requirements.";
      } else if (error.message.includes("email")) {
        errorMessage += "Please check the email address format.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      showError(errorMessage);
    }
  };

  const handleDeleteUser = (userId) => {
    const userToDeleteData = users.find((user) => user.id === userId);
    setUserToDelete(userToDeleteData);
    setShowDeleteConfirmModal(true);
    setDeleteConfirmationText("");
  };

  const handleConfirmDeleteUser = async () => {
    if (deleteConfirmationText.toLowerCase() !== "yes") {
      showWarning('Please type "yes" to confirm deletion.');
      return;
    }

    try {
      // Find the user to get the Supabase ID
      const supabaseUserId = userToDelete?.supabaseId || userToDelete?.id;

      // Call the DELETE API
      const response = await fetch(
        `/api/admin/users?userId=${supabaseUserId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      // If API call successful, remove from local state
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));

      // Close modal and reset states
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      setDeleteConfirmationText("");

      showSuccess("User deleted successfully from the system!");
    } catch (error) {
      console.error("Error deleting user:", error);
      showError(`Failed to delete user: ${error.message}`);
    }
  };

  const handleCancelDeleteUser = () => {
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
    setDeleteConfirmationText("");
  };

  const handleEditUserClick = (user) => {
    setEditingUserId(user.id);
    setEditUserData({
      name: user.name,
      userType: user.userType,
      district: user.district,
      policeStation: user.policeStation,
      status: user.status,
    });
    setShowEditUserModal(true);
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditUserSave = async (userId) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...editUserData,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update user");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...editUserData } : user
        )
      );
      setEditingUserId(null);
      setShowEditUserModal(false);
      showSuccess("User updated successfully!");
    } catch (error) {
      showError(error.message || "Failed to update user");
    }
  };

  const handleEditUserCancel = () => {
    setEditingUserId(null);
    setEditUserData({});
    setShowEditUserModal(false);
  };

  const handleToggleUserStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status: newStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update status");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      showError(error.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader
        user={user}
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.user_metadata?.name}
          </h1>
          <p className="text-gray-600">
            Manage users, configure system settings, and maintain complaint form
            fields
          </p>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <DashboardStats
            users={users}
            officerCount={users.filter((u) => u.userType === "officer").length}
            setActiveTab={setActiveTab}
            setFilterPreset={setFilterPreset}
          />
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <UserManagement
            users={users}
            setUsers={setUsers}
            filteredUsers={filteredUsers}
            setFilteredUsers={setFilteredUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userTypeFilter={userTypeFilter}
            setUserTypeFilter={setUserTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            districtFilter={districtFilter}
            setDistrictFilter={setDistrictFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            setTotalPages={setTotalPages}
            showAddUserModal={showAddUserModal}
            setShowAddUserModal={setShowAddUserModal}
            handleAddUserFromModal={handleAddUserFromModal}
            handleDeleteUser={handleDeleteUser}
            handleEditUserClick={handleEditUserClick}
            handleEditUserCancel={handleEditUserCancel}
            handleEditUserSave={handleEditUserSave}
            handleEditUserChange={handleEditUserChange}
            handleToggleUserStatus={handleToggleUserStatus}
            editingUserId={editingUserId}
            setEditingUserId={setEditingUserId}
            editUserData={editUserData}
            setEditUserData={setEditUserData}
            showEditUserModal={showEditUserModal}
            setShowEditUserModal={setShowEditUserModal}
            filterPreset={filterPreset}
            setFilterPreset={setFilterPreset}
          />
        )}

        {/* User Reports Tab */}
        {activeTab === "user-reports" && <UserReports users={users} />}

        {/* Roles & Permissions Tab */}
        {activeTab === "roles-permissions" && <RolesPermissions />}

        {/* Form Fields Tab */}
        {activeTab === "form-fields" && (
          <FormFieldManagement
            formFields={formFields}
            setFormFields={setFormFields}
          />
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && <AdminSettings />}
      </main>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={handleAddUserFromModal}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative border-2 border-red-200">
            <button
              onClick={handleCancelDeleteUser}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
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

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete User Account
              </h3>

              <p className="text-gray-600 mb-6">
                You are about to permanently delete:
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold">
                      {userToDelete?.name
                        ? userToDelete.name.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-red-900">
                      {userToDelete?.firstName && userToDelete?.lastName
                        ? `${userToDelete.firstName} ${userToDelete.lastName}`
                        : userToDelete?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-red-600">
                      {userToDelete?.email}
                    </p>
                    <p className="text-xs text-red-500">
                      {userToDelete?.userType?.replace("-", " ").toUpperCase()}{" "}
                      • {userToDelete?.district}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-600 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-yellow-800">
                      Warning: This action cannot be undone!
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      The user will be permanently removed from the system and
                      all their data will be lost.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To confirm deletion, please type{" "}
                  <span className="text-red-600 font-bold">yes</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-semibold"
                  placeholder="Type 'yes' to confirm"
                  autoFocus
                />
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCancelDeleteUser}
                  className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  disabled={deleteConfirmationText.toLowerCase() !== "yes"}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    deleteConfirmationText.toLowerCase() === "yes"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
