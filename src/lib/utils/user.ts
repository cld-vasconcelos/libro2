export const getInitials = (email: string): string => {
  // Get username part (before @)
  const username = email.split('@')[0];
  
  // If username has dots or underscores, treat them as word separators
  const parts = username.split(/[._]/);
  
  if (parts.length > 1) {
    // If we have multiple parts, take first letter of first two parts
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  // Otherwise take first two letters of username
  return username.slice(0, 2).toUpperCase();
};
