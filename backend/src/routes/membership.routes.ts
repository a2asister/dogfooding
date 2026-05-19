import { Router } from 'express';
import * as membershipController from '../controllers/membership.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', optionalAuthenticate, membershipController.getMembershipPlans);
router.post('/plans', authenticate, membershipController.createMembershipPlan);
router.put('/plans/:planId', authenticate, membershipController.updateMembershipPlan);
router.delete('/plans/:planId', authenticate, membershipController.deleteMembershipPlan);
router.get('/me', authenticate, membershipController.getUserMembership);
router.get('/my', authenticate, membershipController.getUserMembership);
router.get('/history', authenticate, membershipController.getMembershipHistory);
router.post('/cancel-auto-renew', authenticate, membershipController.cancelAutoRenew);
router.get('/check-access', authenticate, membershipController.checkFeatureAccess);
router.post('/purchase', authenticate, membershipController.purchaseMembership);
router.get('/benefits', optionalAuthenticate, membershipController.getMembershipBenefits);
router.get('/expiring', authenticate, membershipController.getExpiringMemberships);

router.post('/content-protection', authenticate, membershipController.createContentProtection);
router.get('/content-protection/:noteId', optionalAuthenticate, membershipController.getNoteContentProtection);
router.post('/content-protection/:noteId/remove', authenticate, membershipController.removeContentProtection);
router.get('/content-protection', authenticate, membershipController.getProtectedNotes);
router.post('/content-protection/analyze', optionalAuthenticate, membershipController.analyzeContentProtection);

router.post('/private-note', authenticate, membershipController.setNotePrivate);

export default router;
