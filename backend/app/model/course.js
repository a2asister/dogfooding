module.exports = app => {
  const { STRING, INTEGER, BOOLEAN } = app.Sequelize;

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
    subject: {
      type: STRING(50),
      allowNull: false,
    },
    totalLessons: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completedLessons: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isCompleted: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  return Course;
};
