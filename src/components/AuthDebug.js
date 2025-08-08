"use client";

import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function AuthDebug() {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-red-600 transition-colors"
        >
          Debug Auth
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Authentication Debug</h2>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Auth State</h3>
              <div className="text-sm space-y-1">
                <p><strong>Loading:</strong> {loading.toString()}</p>
                <p><strong>Is Authenticated:</strong> {isAuthenticated.toString()}</p>
                <p><strong>User Type:</strong> {user?.user_type || 'null'}</p>
                <p><strong>Profile User Type:</strong> {profile?.user_type || 'null'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">User Object</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Profile Object</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">DSR Admin Check</h3>
              <div className="text-sm space-y-1">
                <p><strong>User Type Check:</strong> {user?.user_type === "dsr-admin" ? '✅' : '❌'}</p>
                <p><strong>Profile Type Check:</strong> {profile?.user_type === "dsr-admin" ? '✅' : '❌'}</p>
                <p><strong>Either Check:</strong> {(user?.user_type === "dsr-admin" || profile?.user_type === "dsr-admin") ? '✅' : '❌'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                >
                  Clear All Storage & Reload
                </button>
                <button
                  onClick={() => {
                    console.log('=== MANUAL AUTH DEBUG ===');
                    console.log('User:', user);
                    console.log('Profile:', profile);
                    console.log('Loading:', loading);
                    console.log('Is Authenticated:', isAuthenticated);
                    console.log('User Type:', user?.user_type);
                    console.log('Profile User Type:', profile?.user_type);
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                  Log to Console
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 