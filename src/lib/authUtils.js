import { supabase } from './supabaseClient';

// Utility functions to handle authentication issues

export const clearAllAuthData = async () => {
  try {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      sessionStorage.clear();
    }
    
    console.log('All auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('Auth status check error:', error.message);
      return { hasSession: false, error: error.message };
    }
    
    return { 
      hasSession: !!session, 
      user: session?.user || null,
      error: null 
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return { hasSession: false, error: error.message };
  }
};

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.log('Session refresh error:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Session refresh failed:', error);
    return { success: false, error: error.message };
  }
}; 