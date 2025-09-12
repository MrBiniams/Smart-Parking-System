import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

export const getTimeRemaining = (startTimeStr: string, endTimeStr: string, now: dayjs.Dayjs) => {
  const startTime = dayjs(startTimeStr);
  const endTime = dayjs(endTimeStr);
  let diff;

  if (startTime.isAfter(now)) {
    diff = endTime.diff(startTime);
  } else if (startTime.isBefore(now) && endTime.isAfter(now)) {
    diff = endTime.diff(now);
  } else {
    return '0h 0m 0s';
  }

  const duration = dayjs.duration(diff);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${hours}h ${minutes}m ${seconds}s`;
};

export default dayjs; 