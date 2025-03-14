
// Helper function to calculate name initials for avatar fallback
export const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Helper function to check if a navigation item is active
export const isPathActive = (currentPath: string, itemPath: string): boolean => {
  // Exact match
  if (currentPath === itemPath) return true;
  
  // Dashboard is active when viewing any job-related page
  if (itemPath === '/dashboard' && (
    currentPath.startsWith('/jobs/') || 
    currentPath === '/jobs'
  )) {
    return true;
  }
  
  // Check if current path starts with the nav item path (but avoid false positives)
  if (itemPath !== '/' && currentPath.startsWith(itemPath)) {
    // Make sure it's a full path segment match
    const nextChar = currentPath.charAt(itemPath.length);
    return nextChar === '' || nextChar === '/';
  }
  
  return false;
};

// Function to get a return URL from current location
export const getReturnUrl = (pathname: string): string => {
  // Don't return to auth pages or not found
  if (
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/404' || 
    pathname === '/reset-password'
  ) {
    return '/dashboard';
  }
  
  return pathname;
};
