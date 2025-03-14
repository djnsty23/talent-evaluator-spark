
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
