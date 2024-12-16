import { OptionalId } from "mongodb";

export type StudentModel = OptionalId<{
  name: string;
  email: string;
  enrolledCourses: string[];
}>;

export type TeacherModel = OptionalId<{
  name: string;
  email: string;
  coursesTaught: string[];
}>;

export type CourseModel = OptionalId<{
  title: string;
  description: string;
  teacherId: string;
  studentIds: string[];
}>;

export type Student = {
  id: string,
  name: string,
  email: string,
  enrolledCourses: string
}

export type Teacher = {
  id: string
  name: string;
  email: string;
  coursesTaught: string[];
}

export type Course = {
  id: string
  title: string;
  description: string;
  teacherId: string;
  studentIds: string[];
}