import { useDayjs } from "#dayjs";

/**
 * Format date to default format of MMM D, YYYY
 * @param date
 * @returns
 */
export const formatDate = (date?: string | Date) => {
  if (!date) return "";

  const dayjs = useDayjs();
  return dayjs(date).format("MMM D, YYYY");
};

export const toDateWithTimeZone = (date: string | Date) => {
  const dayjs = useDayjs();
  return dayjs(date).format();
};
