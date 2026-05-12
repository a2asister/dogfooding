module.exports = (app) => {
  const { DataTypes } = app.Sequelize;

  const Course = app.model.define(
    "course",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cover: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      instructor: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      level: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "courses",
    }
  );

  Course.associate = function () {
    app.model.Course.belongsToMany(app.model.Category, {
      through: app.model.CourseCategory,
      foreignKey: "course_id",
      otherKey: "category_id",
      as: "categories",
    });
  };

  return Course;
};
