import { OptionalId } from "mongodb";

export type VueloModel = OptionalId<{
  name: string;
  email: string
  enrolledCourses: CoursesModel[];
}>;


type CoursesModel = OptionalId<{
  name: string
  email: string
  coursesTaught: [Course!]!
}>;

type CourseModel = OptionalId<{
  title: string
  description: string
  teacher: Teacher!
  students: [Student!]!
}