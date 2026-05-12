import { Router } from 'express';
import { createCompany, getCompany, updateCompany } from '../controllers/company.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', getCompany);
router.post('/', protect, restrictTo('employer'), createCompany);
router.patch('/:id', protect, restrictTo('employer'), updateCompany);

export default router;
