import { Router } from 'express';
import { createCompany, getCompany, updateCompany } from '../controllers/company.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator';

const router = Router();

router.get('/:id', getCompany);
router.post('/', protect, restrictTo('employer'), validate(createCompanySchema), createCompany);
router.patch('/:id', protect, restrictTo('employer'), validate(updateCompanySchema), updateCompany);

export default router;
