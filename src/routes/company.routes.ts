import { Router } from 'express';
import { createCompany, getCompany, updateCompany, uploadLogo } from '../controllers/company.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator';
import { logoUpload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/:id', getCompany);
router.post('/', protect, restrictTo('employer'), validate(createCompanySchema), createCompany);
router.patch('/:id', protect, restrictTo('employer'), validate(updateCompanySchema), updateCompany);
router.patch('/:id/logo', protect, restrictTo('employer'), logoUpload.single('logo'), uploadLogo);

export default router;
