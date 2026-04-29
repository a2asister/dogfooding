export type UserRole = 'admin' | 'teacher' | 'student';

export interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface CourseStatus {
  DRAFT: 'draft';
  PUBLISHED: 'published';
  ARCHIVED: 'archived';
}

export interface ElectiveBatchStatus {
  PENDING: 'pending';
  ACTIVE: 'active';
  ENDED: 'ended';
  CANCELLED: 'cancelled';
}

export interface DayOfWeek {
  MONDAY: 1;
  TUESDAY: 2;
  WEDNESDAY: 3;
  THURSDAY: 4;
  FRIDAY: 5;
  SATURDAY: 6;
  SUNDAY: 7;
}

export interface SelectionStatus {
  SELECTED: 'selected';
  DROPPED: 'dropped';
  COMPLETED: 'completed';
}
