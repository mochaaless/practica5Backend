import { Collection, ObjectId } from "mongodb";

export const resolvers = {
  Query: {
    students: async (_: unknown, __: unknown, context: { StudentsCollection: Collection }) => {
      return await context.StudentsCollection.find().toArray();
    },
    student: async (_: unknown, { id }: { id: string }, context: { StudentsCollection: Collection }) => {
      return await context.StudentsCollection.findOne({ _id: new ObjectId(id) });
    },
    teachers: async (_: unknown, __: unknown, context: { TeachersCollection: Collection }) => {
      return await context.TeachersCollection.find().toArray();
    },
    teacher: async (_: unknown, { id }: { id: string }, context: { TeachersCollection: Collection }) => {
      return await context.TeachersCollection.findOne({ _id: new ObjectId(id) });
    },
    courses: async (_: unknown, __: unknown, context: { CoursesCollection: Collection }) => {
      return await context.CoursesCollection.find().toArray();
    },
    course: async (_: unknown, { id }: { id: string }, context: { CoursesCollection: Collection }) => {
      return await context.CoursesCollection.findOne({ _id: new ObjectId(id) });
    },
  },
  Mutation: {
    createStudent: async (_: unknown, { name, email }: { name: string; email: string }, context: { StudentsCollection: Collection }) => {
      const result = await context.StudentsCollection.insertOne({ name, email, enrolledCourses: [] });
      return { _id: result.insertedId, name, email, enrolledCourses: [] };
    },
    createTeacher: async (_: unknown, { name, email }: { name: string; email: string }, context: { TeachersCollection: Collection }) => {
      const result = await context.TeachersCollection.insertOne({ name, email, coursesTaught: [] });
      return { _id: result.insertedId, name, email, coursesTaught: [] };
    },
    // createCourse: async (_: unknown, { title, description, teacherId }: { title: string; description: string; teacherId: string }, context: { CoursesCollection: Collection; TeachersCollection: Collection }) => {
    //   const teacher = await context.TeachersCollection.findOne({ _id: new ObjectId(teacherId) });
    //   if (!teacher) throw new Error("Teacher not found");
    //   const result = await context.CoursesCollection.insertOne({ title, description, teacherId, studentIds: [] });
    //   await context.TeachersCollection.updateOne({ _id: new ObjectId(teacherId) }, { $push: { coursesTaught: result.insertedId } });
    //   return { _id: result.insertedId, title, description, teacherId, studentIds: [] };
    // },
    // enrollStudentInCourse: async (_: unknown, { studentId, courseId }: { studentId: string; courseId: string }, context: { StudentsCollection: Collection; CoursesCollection: Collection }) => {
    //   await context.StudentsCollection.updateOne({ _id: new ObjectId(studentId) }, { $push: { enrolledCourses: courseId } });
    //   await context.CoursesCollection.updateOne({ _id: new ObjectId(courseId) }, { $push: { studentIds: studentId } });
    //   return await context.CoursesCollection.findOne({ _id: new ObjectId(courseId) });
    // },
    // removeStudentFromCourse: async (_: unknown, { studentId, courseId }: { studentId: string; courseId: string }, context: { StudentsCollection: Collection; CoursesCollection: Collection }) => {
    //   await context.StudentsCollection.updateOne({ _id: new ObjectId(studentId) }, { $pull: { enrolledCourses: courseId } });
    //   await context.CoursesCollection.updateOne({ _id: new ObjectId(courseId) }, { $pull: { studentIds: studentId } });
    //   return await context.CoursesCollection.findOne({ _id: new ObjectId(courseId) });
    // },
    // Additional mutations for updates and deletions can be implemented similarly
  },
};
