import sequelize from '../config/database';
import User from './User';
import Grade from './Grade';
import Class from './Class';
import CourseCategory from './CourseCategory';
import Course from './Course';
import CourseSchedule from './CourseSchedule';
import ElectiveBatch from './ElectiveBatch';
import CourseSelection from './CourseSelection';
import CourseFavorite from './CourseFavorite';
import SystemConfig from './SystemConfig';

Grade.hasMany(Class, { foreignKey: 'gradeId', as: 'classes' });
Class.belongsTo(Grade, { foreignKey: 'gradeId', as: 'grade' });

Grade.hasMany(User, { foreignKey: 'gradeId', as: 'students' });
User.belongsTo(Grade, { foreignKey: 'gradeId', as: 'grade' });

Class.hasMany(User, { foreignKey: 'classId', as: 'students' });
User.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

CourseCategory.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
Course.belongsTo(CourseCategory, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Course, { foreignKey: 'teacherId', as: 'taughtCourses' });
Course.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

Course.hasMany(CourseSchedule, { foreignKey: 'courseId', as: 'schedules' });
CourseSchedule.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Course.hasMany(CourseSelection, { foreignKey: 'courseId', as: 'selections' });
CourseSelection.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(CourseSelection, { foreignKey: 'studentId', as: 'courseSelections' });
CourseSelection.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

ElectiveBatch.hasMany(CourseSelection, { foreignKey: 'batchId', as: 'selections' });
CourseSelection.belongsTo(ElectiveBatch, { foreignKey: 'batchId', as: 'batch' });

User.hasMany(CourseFavorite, { foreignKey: 'studentId', as: 'favorites' });
CourseFavorite.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(CourseFavorite, { foreignKey: 'courseId', as: 'favorites' });
CourseFavorite.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export {
  sequelize,
  User,
  Grade,
  Class,
  CourseCategory,
  Course,
  CourseSchedule,
  ElectiveBatch,
  CourseSelection,
  CourseFavorite,
  SystemConfig,
};
