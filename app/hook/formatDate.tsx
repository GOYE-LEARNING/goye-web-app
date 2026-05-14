import { formatDistanceToNow } from "date-fns";

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Invalid Date";
  }
};

export const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Option 1: Using toLocaleTimeString (more customizable)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // set to false for 24-hour format
    });
    
    // Option 2: Simple hours and minutes
    // return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
  } catch {
    return "Invalid Date";
  }
};