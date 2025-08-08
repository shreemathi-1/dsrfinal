"use client";

import { useState, useEffect } from "react";

export default function AdminSettings() {
  // State for different settings sections
  const [activeSection, setActiveSection] = useState("general");
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "Tamil Nadu Police DSR System",
    systemVersion: "2.1.0",
    maintenanceMode: false,
    debugMode: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    }
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    ipWhitelist: [],
    sessionManagement: {
      concurrentSessions: 3,
      idleTimeout: 15,
      forceLogout: true
    },
    auditLogging: {
      enabled: true,
      retentionDays: 365,
      logLevel: "info"
    },
    encryption: {
      algorithm: "AES-256",
      keyRotation: 90
    }
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      enabled: true,
      smtpServer: "smtp.tnpolice.gov.in",
      smtpPort: 587,
      fromEmail: "noreply@tnpolice.gov.in",
      templates: {
        welcome: true,
        passwordReset: true,
        accountLocked: true,
        systemMaintenance: true
      }
    },
    smsNotifications: {
      enabled: false,
      provider: "twilio",
      apiKey: "",
      templates: {
        otp: true,
        alerts: false
      }
    },
    inAppNotifications: {
      enabled: true,
      sound: true,
      desktop: true
    }
  });

  // Backup settings state
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: {
      enabled: true,
      frequency: "daily",
      time: "02:00",
      retention: 30
    },
    manualBackup: {
      lastBackup: "2024-01-15 02:00:00",
      backupSize: "2.5 GB",
      status: "completed"
    },
    cloudBackup: {
      enabled: false,
      provider: "aws",
      bucket: "",
      region: "ap-south-1"
    }
  });

  // System health state
  const [systemHealth, setSystemHealth] = useState({
    cpu: 45,
    memory: 68,
    disk: 72,
    database: "healthy",
    uptime: "15 days, 8 hours",
    lastMaintenance: "2024-01-10"
  });

  // Handle general settings update
  const updateGeneralSettings = (key, value) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle security settings update
  const updateSecuritySettings = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle notification settings update
  const updateNotificationSettings = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Create system backup
  const createBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: {
        general: generalSettings,
        security: securitySettings,
        notifications: notificationSettings
      },
      systemHealth: systemHealth
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_settings_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('System backup created successfully!');
    setShowBackupModal(false);
  };

  // Export settings
  const exportSettings = () => {
    const settingsData = {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings,
      backup: backupSettings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Settings exported successfully!');
  };

  // Save all settings
  const saveAllSettings = () => {
    // In a real app, this would save to the database
    alert('All settings saved successfully!');
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset all settings to default values
      alert('Settings reset to defaults successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Settings
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={exportSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Settings
            </button>
            <button
              onClick={saveAllSettings}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save All
            </button>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: "general", name: "General", icon: "⚙️" },
            { id: "security", name: "Security", icon: "🔒" },
            { id: "notifications", name: "Notifications", icon: "🔔" },
            { id: "backup", name: "Backup & Restore", icon: "💾" },
            { id: "system", name: "System Health", icon: "📊" }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeSection === "general" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  value={generalSettings.systemName}
                  onChange={(e) => updateGeneralSettings("systemName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Version
                </label>
                <input
                  type="text"
                  value={generalSettings.systemVersion}
                  onChange={(e) => updateGeneralSettings("systemVersion", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={generalSettings.sessionTimeout}
                  onChange={(e) => updateGeneralSettings("sessionTimeout", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={generalSettings.maxLoginAttempts}
                  onChange={(e) => updateGeneralSettings("maxLoginAttempts", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Password Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Length
                  </label>
                  <input
                    type="number"
                    value={generalSettings.passwordPolicy.minLength}
                    onChange={(e) => updateGeneralSettings("passwordPolicy", {
                      ...generalSettings.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Days
                  </label>
                  <input
                    type="number"
                    value={generalSettings.passwordPolicy.expiryDays}
                    onChange={(e) => updateGeneralSettings("passwordPolicy", {
                      ...generalSettings.passwordPolicy,
                      expiryDays: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { key: "requireUppercase", label: "Require Uppercase" },
                  { key: "requireLowercase", label: "Require Lowercase" },
                  { key: "requireNumbers", label: "Require Numbers" },
                  { key: "requireSpecialChars", label: "Require Special Characters" }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={generalSettings.passwordPolicy[key]}
                      onChange={(e) => updateGeneralSettings("passwordPolicy", {
                        ...generalSettings.passwordPolicy,
                        [key]: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={generalSettings.maintenanceMode}
                  onChange={(e) => updateGeneralSettings("maintenanceMode", e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Maintenance Mode</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={generalSettings.debugMode}
                  onChange={(e) => updateGeneralSettings("debugMode", e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Debug Mode</span>
              </label>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeSection === "security" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Authentication</h3>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => updateSecuritySettings("twoFactorAuth", e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Session Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionManagement.concurrentSessions}
                    onChange={(e) => updateSecuritySettings("sessionManagement", {
                      ...securitySettings.sessionManagement,
                      concurrentSessions: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idle Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionManagement.idleTimeout}
                    onChange={(e) => updateSecuritySettings("sessionManagement", {
                      ...securitySettings.sessionManagement,
                      idleTimeout: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Audit Logging</h3>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.auditLogging.enabled}
                  onChange={(e) => updateSecuritySettings("auditLogging", {
                    ...securitySettings.auditLogging,
                    enabled: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Audit Logging</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Days
                  </label>
                  <input
                    type="number"
                    value={securitySettings.auditLogging.retentionDays}
                    onChange={(e) => updateSecuritySettings("auditLogging", {
                      ...securitySettings.auditLogging,
                      retentionDays: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Level
                  </label>
                  <select
                    value={securitySettings.auditLogging.logLevel}
                    onChange={(e) => updateSecuritySettings("auditLogging", {
                      ...securitySettings.auditLogging,
                      logLevel: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Email Notifications</h3>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications.enabled}
                  onChange={(e) => updateNotificationSettings("emailNotifications", {
                    ...notificationSettings.emailNotifications,
                    enabled: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Email Notifications</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    value={notificationSettings.emailNotifications.smtpServer}
                    onChange={(e) => updateNotificationSettings("emailNotifications", {
                      ...notificationSettings.emailNotifications,
                      smtpServer: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={notificationSettings.emailNotifications.smtpPort}
                    onChange={(e) => updateNotificationSettings("emailNotifications", {
                      ...notificationSettings.emailNotifications,
                      smtpPort: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">SMS Notifications</h3>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.smsNotifications.enabled}
                  onChange={(e) => updateNotificationSettings("smsNotifications", {
                    ...notificationSettings.smsNotifications,
                    enabled: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable SMS Notifications</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">In-App Notifications</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.inAppNotifications.enabled}
                    onChange={(e) => updateNotificationSettings("inAppNotifications", {
                      ...notificationSettings.inAppNotifications,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable In-App Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.inAppNotifications.sound}
                    onChange={(e) => updateNotificationSettings("inAppNotifications", {
                      ...notificationSettings.inAppNotifications,
                      sound: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Sound</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.inAppNotifications.desktop}
                    onChange={(e) => updateNotificationSettings("inAppNotifications", {
                      ...notificationSettings.inAppNotifications,
                      desktop: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Desktop Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Backup & Restore Settings */}
        {activeSection === "backup" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Automatic Backup</h3>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={backupSettings.autoBackup.enabled}
                  onChange={(e) => setBackupSettings(prev => ({
                    ...prev,
                    autoBackup: { ...prev.autoBackup, enabled: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Automatic Backup</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={backupSettings.autoBackup.frequency}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      autoBackup: { ...prev.autoBackup, frequency: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={backupSettings.autoBackup.time}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      autoBackup: { ...prev.autoBackup, time: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention (days)
                  </label>
                  <input
                    type="number"
                    value={backupSettings.autoBackup.retention}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      autoBackup: { ...prev.autoBackup, retention: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Manual Backup</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Backup</p>
                    <p className="text-sm text-gray-500">{backupSettings.manualBackup.lastBackup}</p>
                    <p className="text-xs text-gray-400">Size: {backupSettings.manualBackup.backupSize}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowBackupModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Backup
                    </button>
                    <button
                      onClick={() => alert("Restore functionality will be implemented")}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health */}
        {activeSection === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">CPU Usage</h3>
                <p className="text-2xl font-bold text-blue-900">{systemHealth.cpu}%</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${systemHealth.cpu}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Memory Usage</h3>
                <p className="text-2xl font-bold text-green-900">{systemHealth.memory}%</p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${systemHealth.memory}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Disk Usage</h3>
                <p className="text-2xl font-bold text-yellow-900">{systemHealth.disk}%</p>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${systemHealth.disk}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-800 mb-2">Database</h3>
                <p className="text-2xl font-bold text-purple-900 capitalize">{systemHealth.database}</p>
                <p className="text-xs text-purple-600 mt-1">Status</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-sm font-medium text-gray-900">{systemHealth.uptime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Maintenance</p>
                  <p className="text-sm font-medium text-gray-900">{systemHealth.lastMaintenance}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => alert("System maintenance will be scheduled")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Maintenance
              </button>
              <button
                onClick={() => alert("System logs will be downloaded")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Logs
              </button>
              <button
                onClick={resetToDefaults}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create System Backup</h3>
              <p className="text-gray-600 mb-6">
                This will create a complete backup of all system settings and configurations.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createBackup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 