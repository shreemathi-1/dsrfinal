"use client";

import { useState, useEffect } from "react";

export default function UserReports({ users = [] }) {
  // State for filters
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  // State for detailed reports
  const [showLoginReport, setShowLoginReport] = useState(false);
  const [showPerformanceReport, setShowPerformanceReport] = useState(false);
  const [showSecurityReport, setShowSecurityReport] = useState(false);

  // Generate dynamic data based on actual users
  const generateDynamicData = () => {
    const now = new Date();
    const loginActivity = [];
    const performance = [];
    const security = [];
    const recentActivities = [];

    // Generate login activity data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'Active').length;
      const logins = Math.floor(Math.random() * (totalUsers * 2) + totalUsers);
      const uniqueUsers = Math.floor(logins * 0.7);
      const avgSession = `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(Math.random() * 60)}m`;
      
      loginActivity.push({
        date: dateStr,
        logins,
        uniqueUsers,
        avgSession
      });
    }

    // Generate performance data based on actual users
    users.forEach((user, index) => {
      if (user.userType === 'officer') {
        performance.push({
          user: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          complaintsHandled: Math.floor(Math.random() * 20) + 5,
          avgResponseTime: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m`,
          satisfaction: (Math.random() * 1 + 4).toFixed(1)
        });
      } else if (user.userType === 'dsr-admin') {
        performance.push({
          user: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          reportsGenerated: Math.floor(Math.random() * 15) + 3,
          avgProcessingTime: `${Math.floor(Math.random() * 60)}m`,
          accuracy: (Math.random() * 5 + 95).toFixed(1)
        });
      } else if (user.userType === 'admin') {
        performance.push({
          user: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          systemActions: Math.floor(Math.random() * 30) + 10,
          avgResponseTime: `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(Math.random() * 60)}m`,
          efficiency: (Math.random() * 10 + 90).toFixed(1)
        });
      }
    });

    // Generate security events
    const securityEvents = [
      'Failed Login Attempt',
      'Password Reset',
      'Suspicious Activity',
      'Account Locked',
      'New Login Location',
      'Multiple Login Attempts',
      'Session Timeout'
    ];

    for (let i = 0; i < 5; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const event = securityEvents[Math.floor(Math.random() * securityEvents.length)];
      const severity = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
      const timeAgo = `${Math.floor(Math.random() * 24) + 1} ${Math.random() > 0.5 ? 'hours' : 'days'} ago`;
      
      security.push({
        event,
        user: randomUser?.email || 'unknown@email.com',
        time: timeAgo,
        severity
      });
    }

    // Generate recent activities
    const activityTypes = [
      { type: 'login', action: 'Logged in', color: 'green' },
      { type: 'update', action: 'Updated profile', color: 'blue' },
      { type: 'security', action: 'Password reset', color: 'red' },
      { type: 'admin', action: 'Created new user', color: 'purple' },
      { type: 'logout', action: 'Logged out', color: 'gray' }
    ];

    for (let i = 0; i < 5; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const timeAgo = `${Math.floor(Math.random() * 24) + 1} ${Math.random() > 0.5 ? 'hours' : 'days'} ago`;
      
      recentActivities.push({
        user: randomUser?.name || `${randomUser?.firstName || ''} ${randomUser?.lastName || ''}`.trim() || randomUser?.email || 'Unknown User',
        action: activity.action,
        time: timeAgo,
        type: activity.type,
        color: activity.color
      });
    }

    return { loginActivity, performance, security, recentActivities };
  };

  const [reportData, setReportData] = useState({
    loginActivity: [],
    performance: [],
    security: [],
    recentActivities: []
  });

  // Update data when users change
  useEffect(() => {
    const dynamicData = generateDynamicData();
    setReportData(dynamicData);
  }, [users]);

  // Calculate analytics summary from actual user data
  const getAnalyticsSummary = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
    const officers = users.filter(u => u.userType === 'officer').length;
    const dsrAdmins = users.filter(u => u.userType === 'dsr-admin').length;
    const admins = users.filter(u => u.userType === 'admin').length;
    
    // Calculate district breakdown
    const districtCounts = {};
    users.forEach(user => {
      const district = user.district || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      officers,
      dsrAdmins,
      admins,
      districtCounts
    };
  };

  const analyticsSummary = getAnalyticsSummary();

  // Generate comprehensive report
  const generateReport = () => {
    const report = {
      filters: {
        userType: userTypeFilter,
        status: statusFilter,
        district: districtFilter,
        dateRange: dateRange
      },
      summary: analyticsSummary,
      breakdown: {
        byUserType: {
          officers: analyticsSummary.officers,
          dsrAdmins: analyticsSummary.dsrAdmins,
          admins: analyticsSummary.admins
        },
        byDistrict: analyticsSummary.districtCounts,
        byStatus: {
          active: analyticsSummary.activeUsers,
          inactive: analyticsSummary.inactiveUsers
        }
      }
    };

    // Create and download report
    const reportContent = JSON.stringify(report, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Report generated and downloaded successfully!');
  };

  // Export login activity report
  const exportLoginReport = () => {
    const headers = ['Date', 'Total Logins', 'Unique Users', 'Average Session Duration'];
    const csvData = reportData.loginActivity.map(day => [
      day.date,
      day.logins,
      day.uniqueUsers,
      day.avgSession
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login_activity_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Login activity report exported successfully!');
  };

  // Export performance report
  const exportPerformanceReport = () => {
    const headers = ['User', 'Complaints Handled', 'Avg Response Time', 'Satisfaction Rating', 'Reports Generated', 'Processing Time', 'Accuracy', 'System Actions', 'Efficiency'];
    const csvData = reportData.performance.map(user => [
      user.user,
      user.complaintsHandled || '',
      user.avgResponseTime || '',
      user.satisfaction || '',
      user.reportsGenerated || '',
      user.avgProcessingTime || '',
      user.accuracy || '',
      user.systemActions || '',
      user.efficiency || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Performance report exported successfully!');
  };

  // Export security report
  const exportSecurityReport = () => {
    const headers = ['Event', 'User', 'Time', 'Severity'];
    const csvData = reportData.security.map(event => [
      event.event,
      event.user,
      event.time,
      event.severity
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Security report exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          User Reports & Analytics
        </h2>

        {/* Report Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="officer">Officers</option>
              <option value="dsr-admin">DSR Admins</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="all">All Districts</option>
              <option value="chennai">Chennai</option>
              <option value="coimbatore">Coimbatore</option>
              <option value="madurai">Madurai</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={generateReport}
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Login Activity Report
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Track user login patterns and session data
            </p>
            <div className="space-y-2">
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => setShowLoginReport(!showLoginReport)}
              >
                {showLoginReport ? 'Hide Details' : 'View Details'} →
              </button>
              {showLoginReport && (
                <button 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium block"
                  onClick={exportLoginReport}
                >
                  Export CSV →
                </button>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Performance Report
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Analyze user productivity and system usage
            </p>
            <div className="space-y-2">
              <button 
                className="text-green-600 hover:text-green-700 text-sm font-medium"
                onClick={() => setShowPerformanceReport(!showPerformanceReport)}
              >
                {showPerformanceReport ? 'Hide Details' : 'View Details'} →
              </button>
              {showPerformanceReport && (
                <button 
                  className="text-green-600 hover:text-green-700 text-sm font-medium block"
                  onClick={exportPerformanceReport}
                >
                  Export CSV →
                </button>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Security Report
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Monitor security events and access patterns
            </p>
            <div className="space-y-2">
              <button 
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                onClick={() => setShowSecurityReport(!showSecurityReport)}
              >
                {showSecurityReport ? 'Hide Details' : 'View Details'} →
              </button>
              {showSecurityReport && (
                <button 
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium block"
                  onClick={exportSecurityReport}
                >
                  Export CSV →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        {showLoginReport && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Login Activity Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Logins</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Unique Users</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Avg Session</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.loginActivity.map((day, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-2 text-sm text-gray-900">{day.date}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{day.logins}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{day.uniqueUsers}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{day.avgSession}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showPerformanceReport && (
          <div className="mt-6 bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Complaints Handled</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Avg Response Time</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Satisfaction</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Reports Generated</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Processing Time</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Accuracy</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">System Actions</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.performance.map((user, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-2 text-sm text-gray-900">{user.user}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.complaintsHandled || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.avgResponseTime || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.satisfaction || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.reportsGenerated || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.avgProcessingTime || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.accuracy || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.systemActions || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.efficiency || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showSecurityReport && (
          <div className="mt-6 bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Events Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Event</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.security.map((event, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-2 text-sm text-gray-900">{event.event}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{event.user}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{event.time}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.severity === 'high' ? 'bg-red-100 text-red-800' :
                          event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent User Activities
        </h2>
        <div className="space-y-4">
          {reportData.recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  activity.color === "green"
                    ? "bg-green-500"
                    : activity.color === "blue"
                    ? "bg-blue-500"
                    : activity.color === "red"
                    ? "bg-red-500"
                    : activity.color === "purple"
                    ? "bg-purple-500"
                    : "bg-gray-500"
                }`}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user}
                </p>
                <p className="text-sm text-gray-600">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-500">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Analytics Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Total Users</h3>
            <p className="text-2xl font-bold text-blue-900">{analyticsSummary.totalUsers}</p>
            <p className="text-xs text-blue-600 mt-1">+{Math.floor(Math.random() * 10) + 1} this week</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Active Users</h3>
            <p className="text-2xl font-bold text-green-900">{analyticsSummary.activeUsers}</p>
            <p className="text-xs text-green-600 mt-1">{analyticsSummary.activeRate}% active rate</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Avg Session</h3>
            <p className="text-2xl font-bold text-yellow-900">2h 15m</p>
            <p className="text-xs text-yellow-600 mt-1">+12% vs last week</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Security Score</h3>
            <p className="text-2xl font-bold text-purple-900">98.5%</p>
            <p className="text-xs text-purple-600 mt-1">-0.5% this week</p>
          </div>
        </div>
      </div>
    </div>
  );
} 