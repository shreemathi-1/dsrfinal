// Clear Authentication State Script
// Run this in your browser console to clear all authentication data

console.log('Clearing authentication state...');

// Clear localStorage
localStorage.removeItem('supabase.auth.token');
localStorage.removeItem('supabase.auth.refreshToken');
localStorage.removeItem('supabase.auth.expires_at');
localStorage.removeItem('supabase.auth.expires_in');
localStorage.removeItem('supabase.auth.refresh_token');
localStorage.removeItem('supabase.auth.access_token');

// Clear sessionStorage
sessionStorage.clear();

// Clear any other potential auth-related items
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    localStorage.removeItem(key);
  }
});

console.log('Authentication state cleared. Please refresh the page.');

// Optional: Refresh the page
// window.location.reload(); 