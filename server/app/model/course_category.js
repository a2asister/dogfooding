module.exports = (app) => {
  const { DataTypes } = app.Sequelize;

  const CourseCategory = app.model.define(
    "course_category",
    {
      course_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "courses",
          key: "id",
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "categories",
          key: "id",
        },
      },
    },
    {
      tableName: "course_categories",
      timestamps: false,
    }
  );

  return CourseCategory;
};
