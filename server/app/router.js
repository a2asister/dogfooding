module.exports = (app) => {
  const { router, controller } = app;

  router.get("/api/courses", controller.course.list);
  router.get("/api/courses/:id", controller.course.detail);
  router.get("/api/categories", controller.category.list);
};
