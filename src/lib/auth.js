// Dummy authentication functions
// No external database required

// Dummy user data
const dummyUsers = {
  'officer@tnpolice.gov.in': {
    id: '1',
    email: 'officer@tnpolice.gov.in',
    password: 'officer123',
    full_name: 'Police Officer',
    user_type: 'Officer',
    district: 'Chennai',
    police_station: 'Anna Nagar'
  },
  'admin@tnpolice.gov.in': {
    id: '2',
    email: 'admin@tnpolice.gov.in',
    password: 'admin123',
    full_name: 'System Administrator',
    user_type: 'Admin',
    district: 'Chennai',
    police_station: 'Central Office'
  },
  'dsr@tnpolice.gov.in': {
    id: '3',
    email: 'dsr@tnpolice.gov.in',
    password: 'dsr123',
    full_name: 'DSR Administrator',
    user_type: 'DSR Admin',
    district: 'Coimbatore',
    police_station: 'Race Course'
  },
  'ccps@tnpolice.gov.in': {
    id: '4',
    email: 'ccps@tnpolice.gov.in',
    password: 'ccps123',
    full_name: 'CCPS Administrator',
    user_type: 'CCPS Admin',
    district: 'Chennai',
    police_station: 'Central Office'
  }
};

// Sign in user (dummy)
export const signIn = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = dummyUsers[email];
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userProfile } = user;
  return { 
    user: userProfile, 
    session: { id: 'dummy-session' }, 
    profile: userProfile 
  };
};

// Sign out user (dummy)
export const signOut = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return true;
};

// Get current user (dummy)
export const getCurrentUser = async () => {
  // In a real app, this would check for stored session
  return null;
};

// Get current session (dummy)
export const getCurrentSession = async () => {
  return null;
};

// Listen to auth state changes (dummy)
export const onAuthStateChange = (callback) => {
  // Return a dummy subscription object
  return {
    data: {
      subscription: {
        unsubscribe: () => {}
      }
    }
  };
};

// Reset password (dummy)
export const resetPassword = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Password reset email sent to ${email}`);
  return true;
};

// Update password (dummy)
export const updatePassword = async (newPassword) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Password updated successfully');
  return true;
};

// Check if user has required role
export const hasRole = (userProfile, requiredRole) => {
  if (!userProfile) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userProfile.user_type);
  }
  
  return userProfile.user_type === requiredRole;
};

// Check if user can access district data
export const canAccessDistrict = (userProfile, districtName) => {
  if (!userProfile) return false;
  
  // Admins and DSR admins can access all districts
  if (['Admin', 'DSR Admin'].includes(userProfile.user_type)) {
    return true;
  }
  
  // Officers can only access their assigned district
  if (userProfile.user_type === 'Officer') {
    return userProfile.district === districtName;
  }
  
  return false;
};

// Get user type for routing
export const getUserTypeForRouting = (userProfile) => {
  if (!userProfile) return null;
  return userProfile.user_type;
}; 