export const convertConnectingData = (data?: string[]): { id: string }[] => {
  if (data && Array.isArray(data) && data.length > 0) {
    return data.map((item: string) => ({ id: item }));
  }
  return [];
};

export function isTodayBetween(startDate: Date, endDate: Date): boolean {
  const today = new Date();
  return today >= startDate && today <= endDate;
}
