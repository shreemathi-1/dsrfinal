"use client";

import { useState, useEffect } from "react";

export default function RolesPermissions() {
  // State for role management
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUserAssignmentModal, setShowUserAssignmentModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // State for new role creation
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: []
  });

  // State for user assignment
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Comprehensive permissions list
  const allPermissions = [
    { id: "user_management", name: "User Management", category: "Administration" },
    { id: "create_users", name: "Create Users", category: "Administration" },
    { id: "delete_users", name: "Delete Users", category: "Administration" },
    { id: "edit_user_roles", name: "Edit User Roles", category: "Administration" },
    { id: "view_all_complaints", name: "View All Complaints", category: "Complaints" },
    { id: "manage_own_complaints", name: "Manage Own Complaints", category: "Complaints" },
    { id: "edit_complaints", name: "Edit Complaints", category: "Complaints" },
    { id: "delete_complaints", name: "Delete Complaints", category: "Complaints" },
    { id: "generate_reports", name: "Generate Reports", category: "Reports" },
    { id: "view_analytics", name: "View Analytics", category: "Reports" },
    { id: "export_data", name: "Export Data", category: "Reports" },
    { id: "system_configuration", name: "System Configuration", category: "System" },
    { id: "bulk_operations", name: "Bulk Operations", category: "System" },
    { id: "form_field_management", name: "Form Field Management", category: "System" },
    { id: "notification_management", name: "Notification Management", category: "System" },
    { id: "security_settings", name: "Security Settings", category: "System" },
    { id: "regional_management", name: "Regional Management", category: "Administration" },
    { id: "district_oversight", name: "District Oversight", category: "Administration" }
  ];

  // Role definitions with permissions
  const [roles, setRoles] = useState({
    admin: {
      name: "Admin",
      description: "Full system access and user management capabilities",
      color: "red",
      permissions: [
        "user_management", "create_users", "delete_users", "edit_user_roles",
        "view_all_complaints", "manage_own_complaints", "edit_complaints", "delete_complaints",
        "generate_reports", "view_analytics", "export_data",
        "system_configuration", "bulk_operations", "form_field_management",
        "notification_management", "security_settings", "regional_management", "district_oversight"
      ]
    },
    "dsr-admin": {
      name: "DSR Admin",
      description: "Regional administration and complaint oversight",
      color: "green",
      permissions: [
        "create_users", "view_all_complaints", "manage_own_complaints", "edit_complaints",
        "generate_reports", "view_analytics", "export_data",
        "regional_management", "district_oversight"
      ]
    },
    officer: {
      name: "Officer",
      description: "Front-line complaint handling and investigation",
      color: "blue",
      permissions: [
        "manage_own_complaints", "edit_complaints"
      ]
    }
  });

  // Sample users for assignment (in real app, this would come from props)
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", currentRole: "officer" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", currentRole: "dsr-admin" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", currentRole: "officer" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", currentRole: "admin" }
  ]);

  // Handle role selection
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEditingRole(roles[roleKey]);
  };

  // Handle permission toggle
  const togglePermission = (permissionId) => {
    if (!editingRole) return;
    
    const updatedPermissions = editingRole.permissions.includes(permissionId)
      ? editingRole.permissions.filter(p => p !== permissionId)
      : [...editingRole.permissions, permissionId];
    
    setEditingRole({
      ...editingRole,
      permissions: updatedPermissions
    });
  };

  // Save role changes
  const saveRoleChanges = () => {
    if (!editingRole) return;
    
    setRoles(prev => ({
      ...prev,
      [selectedRole]: editingRole
    }));
    
    setShowPermissionModal(false);
    setEditingRole(null);
    setSelectedRole(null);
    
    alert('Role permissions updated successfully!');
  };

  // Create new role
  const createNewRole = () => {
    if (!newRole.name || !newRole.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    const roleKey = newRole.name.toLowerCase().replace(/\s+/g, '-');
    setRoles(prev => ({
      ...prev,
      [roleKey]: {
        name: newRole.name,
        description: newRole.description,
        color: "purple",
        permissions: newRole.permissions
      }
    }));
    
    setNewRole({ name: "", description: "", permissions: [] });
    setShowRoleModal(false);
    
    alert('New role created successfully!');
  };

  // Assign users to roles
  const assignUsersToRole = () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to assign');
      return;
    }
    
    // In a real app, this would update the database
    alert(`Assigned ${selectedUsers.length} users to ${selectedRole} role`);
    setShowUserAssignmentModal(false);
    setSelectedUsers([]);
  };

  // Export role configuration
  const exportRoleConfig = () => {
    const config = {
      roles: roles,
      permissions: allPermissions,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role_config_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Role configuration exported successfully!');
  };

  // Get permission status for matrix
  const getPermissionStatus = (roleKey, permissionId) => {
    return roles[roleKey]?.permissions.includes(permissionId) || false;
  };

  // Get users by role
  const getUsersByRole = (roleKey) => {
    return users.filter(user => user.currentRole === roleKey);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Roles & Permissions Management
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowRoleModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create New Role
            </button>
            <button
              onClick={exportRoleConfig}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Config
            </button>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(roles).map(([roleKey, role]) => (
            <div key={roleKey} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 bg-${role.color}-100 rounded-lg flex items-center justify-center mr-3`}>
                  <svg
                    className={`w-6 h-6 text-${role.color}-600`}
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {role.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>{role.permissions.length} Permissions</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span>{getUsersByRole(roleKey).length} Users</span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleRoleSelect(roleKey);
                    setShowPermissionModal(true);
                  }}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Manage Permissions
                </button>
                <button
                  onClick={() => {
                    handleRoleSelect(roleKey);
                    setShowUserAssignmentModal(true);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Users
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4">
            Permission Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                    Permission
                  </th>
                  {Object.keys(roles).map(roleKey => (
                    <th key={roleKey} className="text-center py-2 px-4 text-sm font-medium text-gray-700">
                      {roles[roleKey].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allPermissions.map((permission, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {permission.name}
                      <div className="text-xs text-gray-500">{permission.category}</div>
                    </td>
                    {Object.keys(roles).map(roleKey => (
                      <td key={roleKey} className="text-center py-2 px-4">
                        <span
                          className={`w-4 h-4 rounded-full inline-block ${
                            getPermissionStatus(roleKey, permission.id) ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Total Roles</h3>
            <p className="text-2xl font-bold text-blue-900">{Object.keys(roles).length}</p>
            <p className="text-xs text-blue-600 mt-1">Active roles in system</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Total Permissions</h3>
            <p className="text-2xl font-bold text-green-900">{allPermissions.length}</p>
            <p className="text-xs text-green-600 mt-1">Available permissions</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Total Users</h3>
            <p className="text-2xl font-bold text-yellow-900">{users.length}</p>
            <p className="text-xs text-yellow-600 mt-1">Users with roles</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Most Used Role</h3>
            <p className="text-2xl font-bold text-purple-900">Officer</p>
            <p className="text-xs text-purple-600 mt-1">2 users assigned</p>
          </div>
        </div>
      </div>

      {/* Permission Management Modal */}
      {showPermissionModal && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Manage Permissions - {editingRole.name}
              </h3>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {Object.entries(allPermissions.reduce((acc, permission) => {
                 const category = permission.category;
                 if (!acc[category]) acc[category] = [];
                 acc[category].push(permission);
                 return acc;
               }, {})).map(([category, permissions]) => (
                 <div key={category} className="space-y-4">
                   <h4 className="font-semibold text-gray-800 border-b pb-2">{category}</h4>
                   <div className="space-y-2">
                     {permissions.map(permission => (
                       <label key={permission.id} className="flex items-center space-x-3 cursor-pointer">
                         <input
                           type="checkbox"
                           checked={editingRole.permissions.includes(permission.id)}
                           onChange={() => togglePermission(permission.id)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                         <span className="text-sm text-gray-700">{permission.name}</span>
                       </label>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveRoleChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Permissions</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {allPermissions.map(permission => (
                    <label key={permission.id} className="flex items-center space-x-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({...newRole, permissions: [...newRole.permissions, permission.id]});
                          } else {
                            setNewRole({...newRole, permissions: newRole.permissions.filter(p => p !== permission.id)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewRole}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Assignment Modal */}
      {showUserAssignmentModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Assign Users to {roles[selectedRole].name} Role
              </h3>
              <button
                onClick={() => setShowUserAssignmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select users to assign to the {roles[selectedRole].name} role:
              </p>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                {users.map(user => (
                  <label key={user.id} className="flex items-center space-x-3 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">Current: {user.currentRole}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowUserAssignmentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={assignUsersToRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 