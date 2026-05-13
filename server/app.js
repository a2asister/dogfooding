module.exports = app => {
  app.beforeStart(async () => {
    await app.model.sync({ force: false });
    
    const courseCount = await app.model.Course.count();
    if (courseCount === 0) {
      await seedData(app);
    }
  });
};

async function seedData(app) {
  const categoryData = [
    { name: '前端开发', color: '#6366f1' },
    { name: '后端开发', color: '#10b981' },
    { name: '移动开发', color: '#f59e0b' },
    { name: '人工智能', color: '#ec4899' },
    { name: '数据分析', color: '#8b5cf6' },
    { name: '游戏开发', color: '#06b6d4' },
  ];
  
  const categories = [];
  for (const cat of categoryData) {
    categories.push(await app.model.Category.create(cat));
  }

  const courseData = [
    {
      name: 'Vue3 实战进阶',
      cover: 'https://picsum.photos/400/300?random=1',
      description: '深入学习 Vue3 Composition API、响应式原理、自定义指令等高级特性',
      instructor: '张老师',
      duration: '48课时',
    },
    {
      name: 'React Hooks 深度解析',
      cover: 'https://picsum.photos/400/300?random=2',
      description: '全面掌握 React Hooks 生态，从原理到实战的系统学习',
      instructor: '李老师',
      duration: '36课时',
    },
    {
      name: 'Node.js 微服务架构',
      cover: 'https://picsum.photos/400/300?random=3',
      description: '基于 Node.js 的微服务架构设计与实践，包含服务发现、负载均衡等',
      instructor: '王老师',
      duration: '52课时',
    },
    {
      name: 'Python 机器学习入门',
      cover: 'https://picsum.photos/400/300?random=4',
      description: '从零开始学习机器学习算法，涵盖监督学习、无监督学习等',
      instructor: '赵老师',
      duration: '40课时',
    },
    {
      name: 'Flutter 跨平台开发',
      cover: 'https://picsum.photos/400/300?random=5',
      description: '使用 Flutter 构建高性能跨平台移动应用，iOS + Android 一套代码',
      instructor: '陈老师',
      duration: '44课时',
    },
    {
      name: 'Unity 3D 游戏开发',
      cover: 'https://picsum.photos/400/300?random=6',
      description: '从基础到进阶，系统学习 Unity 引擎的游戏开发技术',
      instructor: '刘老师',
      duration: '60课时',
    },
  ];
  
  const courses = [];
  for (const course of courseData) {
    courses.push(await app.model.Course.create(course));
  }

  const relations = [
    { courseIndex: 0, categoryIndices: [0, 1] },
    { courseIndex: 1, categoryIndices: [0] },
    { courseIndex: 2, categoryIndices: [1] },
    { courseIndex: 3, categoryIndices: [3, 4] },
    { courseIndex: 4, categoryIndices: [2] },
    { courseIndex: 5, categoryIndices: [2, 5] },
  ];

  for (const rel of relations) {
    const course = courses[rel.courseIndex];
    const categoryIds = rel.categoryIndices.map(i => categories[i].id);
    await course.addCategories(categoryIds);
  }
}
