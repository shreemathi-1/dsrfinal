"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session from Supabase on mount
  React.useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const userMetadata = data.session.user.user_metadata || {};
        setUser({
          ...data.session.user,
          user_type: userMetadata.user_type || "officer",
          full_name: data.session.user.email,
          district: userMetadata.district || "Unknown",
          police_station: userMetadata.police_station || "Unknown",
          department: userMetadata.department || "",
        });
      }
      setLoading(false);
    };
    restoreSession();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userMetadata = session.user.user_metadata || {};
        setUser({
          ...session.user,
          user_type: userMetadata.user_type || "officer",
          full_name: session.user.email,
          district: userMetadata.district || "Unknown",
          police_station: userMetadata.police_station || "Unknown",
          department: userMetadata.department || "",
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Dummy user

  const login = async (email, password, department) => {
  console.log('[LOGIN] Attempting login:', { email, password, department });
    try {
      setLoading(true);
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      console.log('[LOGIN] Supabase response:', { data, error });
      if (error) {
        // Fall back to hardcoded login for demo purposes
        return await fallbackLogin(email, password);
      }
      if (data?.user) {
        console.log('[LOGIN] Supabase user:', data.user);
        console.log('[LOGIN] Supabase user_metadata:', data.user.user_metadata);
        // user_metadata from /token?grant_type=password response
        const userMetadata = data.user.user_metadata || {};
        // Use department from user_metadata for department check
        const registeredDepartment = userMetadata.department || "";
        // Compare department in user_metadata with department selection (case-insensitive)
        // Allow headquarters selection for eligible departments
        const headquartersEligibleDepts = [
          'ncrp', 'moa', 'helpline center', 'sim and content blocking', 
          'ceir', 'jmis', 'sccic', 'cyber arangam'
        ];
        const selectedDept = department.trim().toLowerCase();
        const registeredDept = registeredDepartment.trim().toLowerCase();
        const isHeadquarters = selectedDept === 'headquarters';
        const isValidSelection =
          selectedDept === registeredDept ||
          (isHeadquarters && headquartersEligibleDepts.includes(registeredDept));
        console.log('[LOGIN] Department check:', { department, registeredDepartment, isValidSelection });
        if (department && registeredDepartment && !isValidSelection) {
          return {
            success: false,
            error: `Department mismatch: Your account is registered as '${registeredDepartment}', but you selected '${department}'. Please select the correct department.`,
          };
        }
        setUser({
          ...data.user,
          user_type: userMetadata.user_type || "officer",
          full_name: data.user.email,
          district: userMetadata.district || "Unknown",
          police_station: userMetadata.police_station || "Unknown",
          department: registeredDepartment,
        });
        // Navigate based on department (headquarters selection never routes to admin)
        setTimeout(() => {
          const normalizedDept = (userMetadata.department || "").toLowerCase();
          if (normalizedDept === "dsr") {
            router.push("/dsr-dashboard");
          } else if (normalizedDept === "ccps") {
            router.push("/ccps-dashboard");
          } else if (normalizedDept === "admin" && selectedDept === "admin") {
            // Only route to admin dashboard if both registered and selected are admin
            router.push("/new-admin-dashboard");
          } else if (headquartersEligibleDepts.includes(normalizedDept)) {
            // All headquarters eligible departments (even if selectedDept is 'headquarters') go to dsr-dashboard
            router.push("/dsr-dashboard");
          } else {
            router.push("/dsr-dashboard");
          }
        }, 100);
        return {
          success: true,
          user: { user_type: userMetadata.user_type || "officer" },
        };
      }
      return { success: false, error: "No user data received" };
    } catch (error) {
      console.error("Login error:", error);
      // Fall back to hardcoded login for demo purposes
      return await fallbackLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  const fallbackLogin = async (email, password) => {
    // Hardcoded users for demo purposes
    const testUsers = {
      "admin@tnpolice.gov.in": { password: "admin123", role: "admin", department: "admin" },
      "officer@tnpolice.gov.in": { password: "officer123", role: "officer", department: "dsr" },
      "dsr@tnpolice.gov.in": { password: "dsr123", role: "dsr-admin", department: "dsr" },
      "ccps@tnpolice.gov.in": { password: "ccps123", role: "ccps", department: "ccps" },
    };

    const user = testUsers[email.toLowerCase()];
    if (user && user.password === password) {
      // Set user data
      setUser({
        id: email,
        email: email,
        user_type: user.role,
        full_name: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} User`,
        district: "Demo District",
        police_station: "Demo Station",
        department: user.department || "",
      });

      // Route based on user role
      setTimeout(() => {
        switch (user.role) {
          case "officer":
            router.push("/dsr-dashboard");
            break;
          case "dsr-admin":
            router.push("/new-dsr-admin-dashboard");
            break;
          case "ccps":
            router.push("/ccps-dashboard");
            break;
          case "admin":
            router.push("/new-admin-dashboard");
            break;
          default:
            router.push("/dsr-dashboard");
        }
      }, 100);

      return { success: true };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log("Supabase logout error:", error.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear user state and redirect
    setUser(null);
    router.push("/");
  };

  const value = {
    user,
    profile: user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    userType: user?.user_type || null,
    district: user?.district || null,
    policeStation: user?.police_station || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
