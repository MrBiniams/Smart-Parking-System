export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

export const formatDate = (date: string | Date): string => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return String(date);
  }
};

export const getDayOfWeek = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}; 