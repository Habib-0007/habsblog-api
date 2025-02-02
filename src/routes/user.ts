import express, { Request, Response } from 'express';
import User from '../models/User';
import { uploadToCloudinary } from '../utils/cloudinary';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get(
  '/profile',
  isAuthenticated,
  async (req: any, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile' });
      return;
    }
  },
);

router.put(
  '/profile',
  isAuthenticated,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { username, email } = req.body;
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      user.username = username || user.username;
      user.email = email || user.email;
      await user.save();
      res.json({ message: 'Profile updated successfully', user });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile' });
      return;
    }
  },
);

router.post(
  '/profile-picture',
  isAuthenticated,
  async (req: any, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      const result = await uploadToCloudinary(file.buffer);
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      user.profilePicture = result.secure_url;
      await user.save();
      res.json({ message: 'Profile picture updated successfully', user });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile picture' });
      return;
    }
  },
);

export default router;
