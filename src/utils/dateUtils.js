/**
 * Formats a date string into a readable format (MM/DD/YYYY)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date string to show only the time (HH:MM AM/PM)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time
 */
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Determines if a date is within the last N days
 * @param {string} dateString - ISO date string
 * @param {number} days - Number of days to check
 * @returns {boolean} True if date is within the specified days
 */
export const isWithinDays = (dateString, days) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const differenceInTime = now.getTime() - date.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    
    return differenceInDays <= days;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
};

/**
 * Determines if a date is within the current month
 * @param {string} dateString - ISO date string
 * @returns {boolean} True if date is within the current month
 */
export const isCurrentMonth = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  } catch (error) {
    console.error('Error checking if date is in current month:', error);
    return false;
  }
}; 