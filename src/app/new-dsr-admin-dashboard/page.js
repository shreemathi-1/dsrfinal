"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./components/Header";
import DashboardSection from "./components/DashboardSection";
import ReportsSection from "./components/ReportsSection";
import ReportGenerator from "./components/ReportGenerator";

export default function NewDSRAdminDashboard() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaints data
  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/complaints?limit=1000');
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaints data');
      }

      const data = await response.json();
      console.log('DSR Admin Dashboard: Fetched complaints data:', data);
      
      const complaintsData = data.complaints || [];
      setComplaints(complaintsData);
    } catch (error) {
      console.error('DSR Admin Dashboard: Error fetching complaints:', error);
      setError(error.message);
      // Set mock data if API fails
      const mockComplaints = generateMockComplaints();
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
      }
    };

  // Generate mock data for development/fallback
  const generateMockComplaints = () => {
    const mockData = [];
    const statuses = ['Open', 'Under Investigation', 'Pending', 'Resolved', 'Closed', 'FIR Registered', 'CSR Issued'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const categories = [
      'Financial Fraud', 'Identity Theft', 'Phishing', 'Ransomware', 'Social Media Crime',
      'Email Compromise', 'Debit Card Fraud', 'UPI Fraud', 'Internet Banking Fraud',
      'Loan App Fraud', 'Investment Scam', 'Trading Scam'
    ];
    
    for (let i = 1; i <= 150; i++) {
      mockData.push({
        id: i,
        complaintNumber: `CC-2024-${String(i).padStart(3, '0')}`,
        complainantName: `Complainant ${i}`,
        complainantEmail: `complainant${i}@example.com`,
        category: categories[Math.floor(Math.random() * categories.length)],
        subcategory: 'Various',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        description: `Sample complaint description for case ${i}`,
        fraudulentAmount: Math.floor(Math.random() * 1000000) + 10000,
        lienAmount: Math.floor(Math.random() * 500000),
        suspectName: Math.random() > 0.5 ? `Suspect ${i}` : '',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        dateFiled: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return mockData;
  };

  // Handle report generation
  const handleGenerateReport = (reportType) => {
    console.log('Generating report:', reportType);
    setSelectedReport(reportType);
    setActiveTab("reports");
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchComplaintsData();
  }, []);

  // Refresh data when page comes into focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('DSR Admin Dashboard: Page focused, refreshing complaints data...');
      fetchComplaintsData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Calculate stats from complaints data
  const calculateStats = () => {
    if (!complaints || complaints.length === 0) {
      return {
        total: 0,
        open: 0,
        underInvestigation: 0,
        resolved: 0,
        totalAmount: 0
      };
    }

    const total = complaints.length;
    const open = complaints.filter(c => c.status === 'Open' || c.status === 'Pending').length;
    const underInvestigation = complaints.filter(c => c.status === 'Under Investigation' || c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const totalAmount = complaints.reduce((sum, c) => sum + (c.fraudulentAmount || 0), 0);

    return {
      total,
      open,
      underInvestigation,
      resolved,
      totalAmount
    };
  };

  // Render tab content
  const renderTabContent = () => {
    const stats = calculateStats();
    
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardSection 
            stats={stats}
            complaints={complaints} 
            loading={loading}
            onGenerateReport={handleGenerateReport}
          />
        );

      case "analytics":
        return (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    Last 30 Days
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
                    Last 90 Days
                  </button>
                </div>
              </div>
              <p className="text-gray-600">Comprehensive cybercrime analytics and insights</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Complaints */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Complaints</p>
                    <p className="text-3xl font-bold">{complaints.length}</p>
                    <p className="text-blue-200 text-sm">+12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Financial Impact */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Financial Impact</p>
                    <p className="text-3xl font-bold">₹{complaints.reduce((sum, c) => sum + (c.fraudulentAmount || 0), 0).toLocaleString()}</p>
                    <p className="text-green-200 text-sm">+8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Resolution Rate */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Resolution Rate</p>
                    <p className="text-3xl font-bold">
                      {complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length / complaints.length) * 100) : 0}%
                    </p>
                    <p className="text-purple-200 text-sm">+5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* High Priority Cases */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">High Priority</p>
                    <p className="text-3xl font-bold">
                      {complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length}
                    </p>
                    <p className="text-red-200 text-sm">-3% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Status Distribution</h3>
                <div className="space-y-4">
                  {[
                    { status: 'Open', count: complaints.filter(c => c.status === 'Open').length, color: 'bg-yellow-500', percentage: complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Open').length / complaints.length) * 100) : 0 },
                    { status: 'Under Investigation', count: complaints.filter(c => c.status === 'Under Investigation').length, color: 'bg-blue-500', percentage: complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Under Investigation').length / complaints.length) * 100) : 0 },
                    { status: 'Resolved', count: complaints.filter(c => c.status === 'Resolved').length, color: 'bg-green-500', percentage: complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100) : 0 },
                    { status: 'Closed', count: complaints.filter(c => c.status === 'Closed').length, color: 'bg-gray-500', percentage: complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Closed').length / complaints.length) * 100) : 0 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{item.count}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Analysis */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Fraud Categories</h3>
                <div className="space-y-4">
                  {Object.entries(
                    complaints.reduce((acc, complaint) => {
                      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
                      return acc;
                    }, {})
                  )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][index]}`}></div>
                        <span className="text-sm font-medium text-gray-700 truncate">{category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{count}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Total Amount Lost</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₹{complaints.reduce((sum, c) => sum + (c.fraudulentAmount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Average Case Value</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₹{complaints.length > 0 ? Math.round(complaints.reduce((sum, c) => sum + (c.fraudulentAmount || 0), 0) / complaints.length).toLocaleString() : 0}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">High Value Cases</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {complaints.filter(c => (c.fraudulentAmount || 0) > 100000).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { month: 'Jan', complaints: 45, trend: '+12%' },
                  { month: 'Feb', complaints: 52, trend: '+15%' },
                  { month: 'Mar', complaints: 48, trend: '-8%' },
                  { month: 'Apr', complaints: complaints.length, trend: '+5%' }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{item.month}</span>
                      <span className={`text-xs font-medium ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{item.complaints}</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.complaints / 60) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <ReportsSection />
        );

      case "settings":
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">DSR Admin Settings</h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Auto-generate daily reports</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Email notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Include financial analysis</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">NCRP Integration</span>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">CCPS Database</span>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Helpline 1930</span>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Available</h3>
              <p className="text-sm text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        onGenerateReport={handleGenerateReport}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">
                Error loading dashboard data: {error}. Showing sample data.
              </p>
              <button
                onClick={fetchComplaintsData}
                className="ml-4 text-sm text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {profile?.full_name || 'DSR Admin'}
          </h1>
          <p className="text-gray-600">
            Monitor cybercrime trends and generate comprehensive reports for administrative oversight
          </p>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
