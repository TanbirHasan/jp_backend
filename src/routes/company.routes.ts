import { Router } from 'express';
import { createCompany, getCompany, updateCompany, uploadLogo } from '../controllers/company.controller';
import { followCompany, unfollowCompany, getFollowerCount, getFollowedCompanies } from '../controllers/follow.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator';
import { logoUpload } from '../middlewares/upload.middleware';

const router = Router();

// /following must be before /:id — otherwise Express matches "following" as an ID
router.get('/following', protect, restrictTo('job_seeker'), getFollowedCompanies);

router.get('/:id', getCompany);
router.get('/:id/followers', getFollowerCount);
router.post('/', protect, restrictTo('employer'), validate(createCompanySchema), createCompany);
router.post('/:id/follow', protect, restrictTo('job_seeker'), followCompany);
router.delete('/:id/follow', protect, restrictTo('job_seeker'), unfollowCompany);
router.patch('/:id', protect, restrictTo('employer'), validate(updateCompanySchema), updateCompany);
router.patch('/:id/logo', protect, restrictTo('employer'), logoUpload.single('logo'), uploadLogo);

export default router;
