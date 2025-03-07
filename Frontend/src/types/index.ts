export interface Instructor {
  id: string;
  name: string;
  email: string;
  courses: string[];
}
export interface Course {
  _id: string;
  name: string;
  level: string;
  description: string;
  imageFile: File | null | string; // Required field
  batches: Batch[];
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}
export interface Lecture {
  id: string;
  courseId: string;
  instructorId: string;
  batchId: string;
  date: string;
  startTime: string;
  endTime: string;
}