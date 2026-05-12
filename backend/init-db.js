const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/learning.db',
});

const sampleCourses = [
  { name: 'JavaScript 基础入门', subject: '前端开发', totalLessons: 20, completedLessons: 15, isCompleted: false },
  { name: 'React 组件开发', subject: '前端开发', totalLessons: 25, completedLessons: 8, isCompleted: false },
  { name: 'CSS 高级布局', subject: '前端开发', totalLessons: 15, completedLessons: 15, isCompleted: true },
  { name: 'Node.js 服务端开发', subject: '后端开发', totalLessons: 30, completedLessons: 12, isCompleted: false },
  { name: 'MySQL 数据库设计', subject: '后端开发', totalLessons: 18, completedLessons: 5, isCompleted: false },
  { name: '算法与数据结构', subject: '计算机科学', totalLessons: 40, completedLessons: 20, isCompleted: false },
  { name: '设计模式实践', subject: '计算机科学', totalLessons: 22, completedLessons: 0, isCompleted: false },
];

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const CourseModel = sequelize.define('course', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      totalLessons: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completedLessons: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isCompleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {
      timestamps: true,
      underscored: false,
    });

    await sequelize.sync({ force: true });
    console.log('表创建成功');

    for (const course of sampleCourses) {
      await CourseModel.create(course);
    }
    console.log('示例数据插入成功');

    await sequelize.close();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
