import { Router } from 'express';
import * as communityController from '../controllers/community.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, communityController.createCommunity);
router.get('/:communityId', optionalAuthenticate, communityController.getCommunity);
router.get('/mine', authenticate, communityController.getUserCommunities);
router.get('/public/list', optionalAuthenticate, communityController.getPublicCommunities);
router.post('/:communityId/join', authenticate, communityController.joinCommunity);
router.post('/:communityId/leave', authenticate, communityController.leaveCommunity);
router.get('/:communityId/members', optionalAuthenticate, communityController.getCommunityMembers);
router.post('/:communityId/members/:userId/approve', authenticate, communityController.approveMember);
router.put('/:communityId', authenticate, communityController.updateCommunity);
router.post('/:communityId/pin/:noteId', authenticate, communityController.pinNote);
router.post('/:communityId/unpin/:noteId', authenticate, communityController.unpinNote);
router.delete('/:communityId', authenticate, communityController.deleteCommunity);

export default router;
