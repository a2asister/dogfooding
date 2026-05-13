module.exports = app => {
  const { router, controller } = app;

  router.get('/api/courses', controller.course.index);
  router.get('/api/courses/:id', controller.course.show);
  router.get('/api/categories', controller.category.index);
};
