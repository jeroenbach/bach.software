import dayjs from "dayjs";

/**
 * Format date to default format of MMM D, YYYY
 * @param date
 * @returns
 */
export const formatDate = (date?: string | Date) => {
  return date ? dayjs(date).format("MMM D, YYYY") : "";
};
