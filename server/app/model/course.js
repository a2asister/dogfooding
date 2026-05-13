module.exports = app => {
  const { STRING, TEXT, INTEGER } = app.Sequelize;

  const Course = app.model.define('course', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING(100),
      allowNull: false,
    },
    cover: {
      type: STRING(255),
      allowNull: false,
    },
    description: {
      type: TEXT,
      allowNull: true,
    },
    instructor: {
      type: STRING(50),
      allowNull: true,
    },
    duration: {
      type: STRING(20),
      allowNull: true,
    },
  });

  Course.associate = function() {
    app.model.Course.belongsToMany(app.model.Category, {
      through: app.model.CourseCategory,
      foreignKey: 'course_id',
      otherKey: 'category_id',
      as: 'categories',
    });
  };

  return Course;
};
