import express from 'express';
import * as postController from '../controllers/post.controller';
import { protect } from '../middlewares/auth.middlewares';
import { validate } from '../middlewares/validate.middlewares';
import {
  createPostValidator,
  updatePostValidator,
  idParamValidator,
  paginationValidator,
} from '../utils/validators.utils';
import { uploadSingleImage } from '../middlewares/upload.middlewares';

const router = express.Router();

router.get('/', validate(paginationValidator), postController.getPosts);
router.get('/:id', validate(idParamValidator()), postController.getPost);

router.use(protect);
router.post(
  '/',
  uploadSingleImage('coverImage'),
  validate(createPostValidator),
  postController.createPost,
);
router.put(
  '/:id',
  uploadSingleImage('coverImage'),
  protect,
  validate([...idParamValidator(), ...updatePostValidator]),
  postController.updatePost,
);
router.delete('/:id', validate(idParamValidator()), postController.deletePost);
router.put(
  '/:id/like',
  validate(idParamValidator()),
  postController.toggleLikePost,
);
router.get(
  '/user/drafts',
  validate(paginationValidator),
  postController.getUserDrafts,
);

export default router;
