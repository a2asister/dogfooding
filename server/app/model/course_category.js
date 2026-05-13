module.exports = app => {
  const { INTEGER } = app.Sequelize;

  const CourseCategory = app.model.define('CourseCategory', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: INTEGER,
      field: 'course_id',
      allowNull: false,
    },
    categoryId: {
      type: INTEGER,
      field: 'category_id',
      allowNull: false,
    },
  }, {
    tableName: 'course_category',
    underscored: true,
  });

  return CourseCategory;
};
