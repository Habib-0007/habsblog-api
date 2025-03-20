import express from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middlewares';
import { validate } from '../middlewares/validate.middlewares';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../utils/validators.utils';
import { authLimiter } from '../middlewares/ratelimiter.middlewares';

const router = express.Router();

router.use(authLimiter);

router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);
router.post(
  '/forgot-password',
  validate(forgotPasswordValidator),
  authController.forgotPassword,
);
router.put(
  '/reset-password/:resetToken',
  validate(resetPasswordValidator),
  authController.resetPassword,
);
router.post('/refresh-token', authController.refreshToken);

router.use(protect);
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.put('/password', authController.updatePassword);
router.post('/logout', authController.logout);

export default router;
