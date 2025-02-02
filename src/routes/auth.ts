import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User, { type IUser } from '../models/User';
import { generateToken, sendResetPasswordEmail } from '../utils/auth';

const router = express.Router();

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (
      email: string,
      password: string,
      done: (err: any, user?: IUser | false, msg?: { message: string }) => void,
    ) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser(
  (user: any, done: (err: unknown, id?: unknown) => void) => {
    done(null, user._id);
  },
);

passport.deserializeUser(
  async (id: string, done: (err: unknown, user?: IUser | null) => void) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).json({ message: 'Username or email already exists' });
      return;
    }
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
    return;
  }
});

router.post(
  '/login',
  passport.authenticate('local'),
  (req: Request, res: Response): void => {
    res.json({ user: req.user });
    return;
  },
);

router.post('/logout', (req: Request, res: Response): void => {
  req.logout((err): void => {
    if (err) {
      res.status(500).json({ message: 'Error logging out' });
      return;
    }
    res.json({ message: 'Logged out successfully' });
    return;
  });
  return;
});

router.post(
  '/forgot-password',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      const resetToken = generateToken();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
      await sendResetPasswordEmail(user.email, resetToken);
      res.json({ message: 'Password reset email sent' });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error sending reset password email' });
      return;
    }
  },
);

router.post(
  '/reset-password',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
      }
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.json({ message: 'Password reset successfully' });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password' });
      return;
    }
  },
);

export default router;
