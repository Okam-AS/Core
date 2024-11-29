
export class CategoryPublishRule {
  id?: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTimeInMinutes: number; // 0-1440
  endTimeInMinutes: number; // 0-1440
}