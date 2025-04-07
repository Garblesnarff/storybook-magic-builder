
/**
 * Legacy function that exists for backward compatibility
 * Storage buckets are now created via SQL migration
 */
export const ensureStorageBuckets = async (): Promise<void> => {
  console.log('Storage buckets are pre-configured via SQL migration');
};

/**
 * Formats a debug message for logging storage operations
 * @param operation - The operation being performed
 * @param details - Additional details about the operation
 */
export const formatDebugMessage = (operation: string, details: Record<string, any>): string => {
  return `Storage operation: ${operation} - ${JSON.stringify(details)}`;
};
