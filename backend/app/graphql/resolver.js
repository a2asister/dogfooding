module.exports = {
  Query: {
    async courses(root, {}, ctx) {
      return await ctx.model.Course.findAll();
    },
    async course(root, { id }, ctx) {
      return await ctx.model.Course.findByPk(id);
    },
    async overallProgress(root, {}, ctx) {
      const courses = await ctx.model.Course.findAll();
      let totalCourses = courses.length;
      let completedCourses = 0;
      let totalLessons = 0;
      let completedLessons = 0;

      const subjectMap = {};

      courses.forEach(course => {
        totalLessons += course.totalLessons;
        completedLessons += course.completedLessons;
        if (course.isCompleted) completedCourses++;

        if (!subjectMap[course.subject]) {
          subjectMap[course.subject] = {
            subject: course.subject,
            totalCourses: 0,
            completedCourses: 0,
            totalLessons: 0,
            completedLessons: 0,
            courses: [],
          };
        }

        const subject = subjectMap[course.subject];
        subject.totalCourses++;
        subject.totalLessons += course.totalLessons;
        subject.completedLessons += course.completedLessons;
        if (course.isCompleted) subject.completedCourses++;
        subject.courses.push(course);
      });

      const subjects = Object.values(subjectMap).map(subject => ({
        ...subject,
        progress: subject.totalLessons > 0
          ? Math.round((subject.completedLessons / subject.totalLessons) * 100 * 100) / 100
          : 0,
      }));

      const progress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
        : 0;

      return {
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        progress,
        subjects,
      };
    },
    async subjectProgress(root, { subject }, ctx) {
      const courses = await ctx.model.Course.findAll({
        where: { subject },
      });

      if (courses.length === 0) return null;

      let totalCourses = courses.length;
      let completedCourses = 0;
      let totalLessons = 0;
      let completedLessons = 0;

      courses.forEach(course => {
        totalLessons += course.totalLessons;
        completedLessons += course.completedLessons;
        if (course.isCompleted) completedCourses++;
      });

      const progress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100
        : 0;

      return {
        subject,
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        progress,
        courses,
      };
    },
  },

  Mutation: {
    async createCourse(root, { name, subject, totalLessons }, ctx) {
      return await ctx.model.Course.create({
        name,
        subject,
        totalLessons,
        completedLessons: 0,
        isCompleted: false,
      });
    },

    async updateCourseProgress(root, { id, completedLessons }, ctx) {
      const course = await ctx.model.Course.findByPk(id);
      if (!course) throw new Error('Course not found');

      const clamped = Math.min(Math.max(completedLessons, 0), course.totalLessons);
      course.completedLessons = clamped;
      course.isCompleted = clamped === course.totalLessons;
      await course.save();
      return course;
    },

    async markCourseComplete(root, { id }, ctx) {
      const course = await ctx.model.Course.findByPk(id);
      if (!course) throw new Error('Course not found');

      course.completedLessons = course.totalLessons;
      course.isCompleted = true;
      await course.save();
      return course;
    },

    async deleteCourse(root, { id }, ctx) {
      const course = await ctx.model.Course.findByPk(id);
      if (!course) return false;
      await course.destroy();
      return true;
    },
  },

  Course: {
    progress(course) {
      if (course.totalLessons === 0) return 0;
      return Math.round((course.completedLessons / course.totalLessons) * 100 * 100) / 100;
    },
  },
};
