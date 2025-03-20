import express from 'express';
import * as adminController from '../controllers/admin.controller';
import { protect, authorize } from '../middlewares/auth.middlewares';
import {
  idParamValidator,
  paginationValidator,
} from '../utils/validators.utils';
import { validate } from '../middlewares/validate.middlewares';
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', validate(paginationValidator), adminController.getUsers);
router.get('/posts', validate(paginationValidator), adminController.getPosts);
router.get(
  '/comments',
  validate(paginationValidator),
  adminController.getComments,
);
router.put(
  '/users/:id/role',
  validate(idParamValidator()),
  adminController.updateUserRole,
);
router.delete(
  '/users/:id',
  validate(idParamValidator()),
  adminController.deleteUser,
);
router.get('/dashboard', adminController.getDashboardStats);

export default router;
