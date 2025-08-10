// Current active user configuration (kept for backward compatibility)
export const CURRENT_USER = {
  user_id: "JPS-QN2NWT",
  display_name: "John Paul Smith",
  email: "john.smith@test.com"
};

// Helper to get current user ID
export const getCurrentUserId = (): string => {
  // This is now handled by the UserContext
  // This function is kept for backward compatibility but should not be used
  // Use the useUser hook instead
  return CURRENT_USER.user_id;
};