import express from 'express';
import * as commentController from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middlewares';
import { validate } from '../middlewares/validate.middlewares';
import {
  createCommentValidator,
  updateCommentValidator,
  idParamValidator,
  paginationValidator,
} from '../utils/validators.utils';
import { uploadMultipleImages } from '../middlewares/upload.middlewares';

const router = express.Router();

router.get('/', validate(paginationValidator), commentController.getComments);
router.get('/:id', validate(idParamValidator()), commentController.getComment);

router.use(protect);
router.post(
  '/',
  uploadMultipleImages('images', 3),
  validate(createCommentValidator),
  commentController.createComment,
);
router.put(
  '/:id',
  uploadMultipleImages('images', 3),
  validate([...idParamValidator(), ...updateCommentValidator]),
  commentController.updateComment,
);
router.delete(
  '/:id',
  validate(idParamValidator()),
  commentController.deleteComment,
);
router.put(
  '/:id/like',
  validate(idParamValidator()),
  commentController.toggleLikeComment,
);

export default router;
