module.exports = (app) => {
  app.beforeStart(async () => {
    const fs = require("fs");
    const path = require("path");
    const dataDir = path.join(app.baseDir, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    await app.model.sync({ force: false });

    const { Course, Category, CourseCategory } = app.model;

    const existingCourses = await Course.count();
    if (existingCourses === 0) {
      const categories = await Category.bulkCreate([
        { name: "编程", slug: "programming" },
        { name: "设计", slug: "design" },
        { name: "数学", slug: "math" },
        { name: "英语", slug: "english" },
        { name: "数据科学", slug: "data-science" },
        { name: "人工智能", slug: "ai" },
        { name: "前端", slug: "frontend" },
        { name: "后端", slug: "backend" },
      ]);

      const courses = await Course.bulkCreate([
        {
          title: "Vue3 实战指南",
          cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Vue.js%20framework%20learning%20course%20cover%20with%20purple%20theme&image_size=square_hd",
          description: "深入学习 Vue3 组合式 API 和响应式原理",
          instructor: "张老师",
          duration: "48课时",
          level: "中级",
        },
        {
          title: "React 高级开发",
          cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=React%20advanced%20development%20course%20cover%20blue%20tech%20style&image_size=square_hd",
          description: "掌握 React Hooks、状态管理和性能优化",
          instructor: "李老师",
          duration: "60课时",
          level: "高级",
        },
        {
          title: "UI/UX 设计入门",
          cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20UX%20design%20course%20cover%20creative%20colorful%20style&image_size=square_hd",
          description: "从零开始学习用户界面和体验设计",
          instructor: "王老师",
          duration: "36课时",
          level: "初级",
        },
        {
          title: "Python 数据科学",
          cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Python%20data%20science%20course%20cover%20green%20chart%20theme&image_size=square_hd",
          description: "使用 Python 进行数据分析和可视化",
          instructor: "陈老师",
          duration: "52课时",
          level: "中级",
        },
        {
          title: "深度学习基础",
          cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20learning%20AI%20course%20cover%20neural%20network%20futuristic&image_size=square_hd",
          description: "神经网络、CNN、RNN 原理与实践",
          instructor: "刘老师",
          duration: "72课时",
          level: "高级",
        },
        {
          title: "Node.js 后端开发",
          cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Node.js%20backend%20development%20course%20cover%20green%20server%20theme&image_size=square_hd",
          description: "构建高性能的 Node.js 服务端应用",
          instructor: "赵老师",
          duration: "56课时",
          level: "中级",
        },
      ]);

      await CourseCategory.bulkCreate([
        { course_id: courses[0].id, category_id: categories[0].id },
        { course_id: courses[0].id, category_id: categories[6].id },
        { course_id: courses[1].id, category_id: categories[0].id },
        { course_id: courses[1].id, category_id: categories[6].id },
        { course_id: courses[2].id, category_id: categories[1].id },
        { course_id: courses[3].id, category_id: categories[2].id },
        { course_id: courses[3].id, category_id: categories[4].id },
        { course_id: courses[3].id, category_id: categories[0].id },
        { course_id: courses[4].id, category_id: categories[4].id },
        { course_id: courses[4].id, category_id: categories[5].id },
        { course_id: courses[4].id, category_id: categories[2].id },
        { course_id: courses[5].id, category_id: categories[0].id },
        { course_id: courses[5].id, category_id: categories[7].id },
      ]);
    }
  });
};
