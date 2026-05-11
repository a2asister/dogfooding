'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/api/notifications', controller.notification.list);
  router.post('/api/notifications', controller.notification.create);
  router.put('/api/notifications/:id/read', controller.notification.markAsRead);
  router.put('/api/notifications/read-all', controller.notification.markAllAsRead);
  router.delete('/api/notifications/:id', controller.notification.delete);
  router.delete('/api/notifications/batch', controller.notification.batchDelete);
  router.post('/api/notifications/push', controller.notification.queuePush);
};
