import React from 'react';

export default function StatsCards({ stats, loading, onCardClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onCardClick('all')}
      >
        <h3 className="text-sm font-medium text-gray-500">Total Complaints</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">{stats.total || 0}</span>
        </div>
      </div>

      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onCardClick('pending')}
      >
        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</span>
        </div>
      </div>

      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onCardClick('resolved')}
      >
        <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-green-600">{stats.resolved || 0}</span>
        </div>
      </div>

      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onCardClick('closed')}
      >
        <h3 className="text-sm font-medium text-gray-500">Closed</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold text-blue-600">{stats.closed || 0}</span>
        </div>
      </div>
    </div>
  );
}
