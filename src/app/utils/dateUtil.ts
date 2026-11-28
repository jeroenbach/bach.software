import { useDayjs } from '#dayjs';

/**
 * Format date to default format of MMM D, YYYY
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDate(date?: string | Date) {
  if (!date)
    return '';

  const dayjs = useDayjs();
  return dayjs(date).format('MMM D, YYYY');
}

export function toDateWithTimeZone(date: string | Date) {
  const dayjs = useDayjs();
  return dayjs(date).format();
}
