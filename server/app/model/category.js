module.exports = (app) => {
  const { DataTypes } = app.Sequelize;

  const Category = app.model.define(
    "category",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "categories",
    }
  );

  Category.associate = function () {
    app.model.Category.belongsToMany(app.model.Course, {
      through: app.model.CourseCategory,
      foreignKey: "category_id",
      otherKey: "course_id",
      as: "courses",
    });
  };

  return Category;
};
