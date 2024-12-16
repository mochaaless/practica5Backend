import { Collection, ObjectId } from "mongodb";

export const resolvers = {
  Query: {
    students: async (_: unknown, __: unknown, context: { StudentsCollection: Collection, CoursesCollection: Collection }) => {
      const students = await context.StudentsCollection.find().toArray();
      return students.map(student => ({
        ...student,
        id: student._id.toString(),
        enrolledCourses: student.enrolledCourses.map(courseId => context.CoursesCollection.findOne({ _id: new ObjectId(courseId) })),
      }));
    },
    student: async (_: unknown, { id }: { id: string }, context: { StudentsCollection: Collection, CoursesCollection: Collection }) => {
      const student = await context.StudentsCollection.findOne({ _id: new ObjectId(id) });
      if (!student) return null;
      return {
        ...student,
        id: student._id.toString(),
        enrolledCourses: student.enrolledCourses.map(courseId => context.CoursesCollection.findOne({ _id: new ObjectId(courseId) })),
      };
    },
    teachers: async (_: unknown, __: unknown, context: { TeachersCollection: Collection, CoursesCollection: Collection }) => {
      const teachers = await context.TeachersCollection.find().toArray();
      return teachers.map(teacher => ({
        ...teacher,
        id: teacher._id.toString(),
        coursesTaught: teacher.coursesTaught.map(courseId => context.CoursesCollection.findOne({ _id: new ObjectId(courseId) })),
      }));
    },
    teacher: async (_: unknown, { id }: { id: string }, context: { TeachersCollection: Collection, CoursesCollection: Collection }) => {
      const teacher = await context.TeachersCollection.findOne({ _id: new ObjectId(id) });
      if (!teacher) return null;
      return {
        ...teacher,
        id: teacher._id.toString(),
        coursesTaught: teacher.coursesTaught.map(courseId => context.CoursesCollection.findOne({ _id: new ObjectId(courseId) })),
      };
    },
    courses: async (_: unknown, __: unknown, context: { CoursesCollection: Collection, StudentsCollection: Collection, TeachersCollection: Collection }) => {
      const courses = await context.CoursesCollection.find().toArray();
      return courses.map(course => ({
        ...course,
        id: course._id.toString(),
        teacher: context.TeachersCollection.findOne({ _id: new ObjectId(course.teacherId) }),
        students: course.studentIds.map(studentId => context.StudentsCollection.findOne({ _id: new ObjectId(studentId) })),
      }));
    },
    course: async (_: unknown, { id }: { id: string }, context: { CoursesCollection: Collection, StudentsCollection: Collection, TeachersCollection: Collection }) => {
      const course = await context.CoursesCollection.findOne({ _id: new ObjectId(id) });
      if (!course) return null;
      return {
        ...course,
        id: course._id.toString(),
        teacher: context.TeachersCollection.findOne({ _id: new ObjectId(course.teacherId) }),
        students: course.studentIds.map(studentId => context.StudentsCollection.findOne({ _id: new ObjectId(studentId) })),
      };
    },
  },
  Mutation: {
    createStudent: async (_: unknown, { name, email }: { name: string; email: string }, context: { StudentsCollection: Collection }) => {
      const result = await context.StudentsCollection.insertOne({ name, email, enrolledCourses: [] });
      return { id: result.insertedId.toString(), name, email, enrolledCourses: [] };
    },
    createTeacher: async (_: unknown, { name, email }: { name: string; email: string }, context: { TeachersCollection: Collection }) => {
      const result = await context.TeachersCollection.insertOne({ name, email, coursesTaught: [] });
      return { id: result.insertedId.toString(), name, email, coursesTaught: [] };
    },
    createCourse: async (_: unknown, { title, description, teacherId }: { title: string; description: string; teacherId: string }, context: { CoursesCollection: Collection; TeachersCollection: Collection }) => {
      const teacher = await context.TeachersCollection.findOne({ _id: new ObjectId(teacherId) });
      if (!teacher) throw new Error("Teacher not found");
      const result = await context.CoursesCollection.insertOne({ title, description, teacherId, studentIds: [] });
      await context.TeachersCollection.updateOne({ _id: new ObjectId(teacherId) }, { $push: { coursesTaught: result.insertedId.toString() } });
      return { id: result.insertedId.toString(), title, description, teacherId, studentIds: [] };
    },
    updateStudent: async (_: unknown, { id, name, email }: { id: string; name?: string; email?: string }, context: { StudentsCollection: Collection }) => {
      const updatedStudent = await context.StudentsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...(name && { name }), ...(email && { email }) } },
        { returnDocument: "after" }
      );
      return updatedStudent.value ? { ...updatedStudent.value, id: updatedStudent.value._id.toString() } : null;
    },
    updateTeacher: async (_: unknown, { id, name, email }: { id: string; name?: string; email?: string }, context: { TeachersCollection: Collection }) => {
      const updatedTeacher = await context.TeachersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...(name && { name }), ...(email && { email }) } },
        { returnDocument: "after" }
      );
      return updatedTeacher.value ? { ...updatedTeacher.value, id: updatedTeacher.value._id.toString() } : null;
    },
    updateCourse: async (_: unknown, { id, title, description, teacherId }: { id: string; title?: string; description?: string; teacherId?: string }, context: { CoursesCollection: Collection }) => {
      const updatedCourse = await context.CoursesCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...(title && { title }), ...(description && { description }), ...(teacherId && { teacherId }) } },
        { returnDocument: "after" }
      );
      return updatedCourse.value ? { ...updatedCourse.value, id: updatedCourse.value._id.toString() } : null;
    },
    enrollStudentInCourse: async (_: unknown, { studentId, courseId }: { studentId: string; courseId: string }, context: { StudentsCollection: Collection; CoursesCollection: Collection }) => {
      await context.StudentsCollection.updateOne({ _id: new ObjectId(studentId) }, { $push: { enrolledCourses: courseId } });
      await context.CoursesCollection.updateOne({ _id: new ObjectId(courseId) }, { $push: { studentIds: studentId } });
      return await context.CoursesCollection.findOne({ _id: new ObjectId(courseId) });
    },
    removeStudentFromCourse: async (_: unknown, { studentId, courseId }: { studentId: string; courseId: string }, context: { StudentsCollection: Collection; CoursesCollection: Collection }) => {
      await context.StudentsCollection.updateOne({ _id: new ObjectId(studentId) }, { $pull: { enrolledCourses: courseId } });
      await context.CoursesCollection.updateOne({ _id: new ObjectId(courseId) }, { $pull: { studentIds: studentId } });
      return await context.CoursesCollection.findOne({ _id: new ObjectId(courseId) });
    },
    deleteStudent: async (_: unknown, { id }: { id: string }, context: { StudentsCollection: Collection }) => {
      const result = await context.StudentsCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    },
    deleteTeacher: async (_: unknown, { id }: { id: string }, context: { TeachersCollection: Collection }) => {
      const result = await context.TeachersCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    },
    deleteCourse: async (_: unknown, { id }: { id: string }, context: { CoursesCollection: Collection }) => {
      const result = await context.CoursesCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    },
  },
};
