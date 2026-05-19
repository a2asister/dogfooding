import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as adminRoleController from '../controllers/adminRole.controller';
import * as adminUserController from '../controllers/adminUser.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/notes/pending', adminController.getPendingNotes);
router.post('/notes/:id/approve', adminController.approveNote);
router.post('/notes/:id/reject', adminController.rejectNote);
router.post('/notes/:id/take-down', adminController.takeDownNote);
router.get('/users', adminController.getUserList);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/configs', adminController.getSystemConfigs);
router.put('/configs', adminController.updateSystemConfig);

router.get('/roles', adminRoleController.getRoles);
router.get('/permissions', adminRoleController.getPermissions);
router.post('/roles', adminRoleController.createRole);
router.put('/roles/:id', adminRoleController.updateRole);
router.delete('/roles/:id', adminRoleController.deleteRole);

router.get('/admins', adminUserController.getAdminUsers);
router.post('/admins', adminUserController.createAdminUser);
router.put('/admins/:id', adminUserController.updateAdminUser);
router.delete('/admins/:id', adminUserController.deleteAdminUser);

export default router;
