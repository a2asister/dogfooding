module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Category = app.model.define('category', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING(50),
      allowNull: false,
      unique: true,
    },
    color: {
      type: STRING(20),
      allowNull: true,
    },
  });

  Category.associate = function() {
    app.model.Category.belongsToMany(app.model.Course, {
      through: app.model.CourseCategory,
      foreignKey: 'category_id',
      otherKey: 'course_id',
      as: 'courses',
    });
  };

  return Category;
};
