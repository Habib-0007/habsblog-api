import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Token from '../models/Token';
import { AppError } from '../middlewares/errorhandler.middleware';
import {
  RegisterUserInput,
  LoginUserInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UpdatePasswordInput,
  TokenPayload,
} from '../types/auth.types';
import { uploadImage, deleteImage } from '../config/fileupload.config';
import jwtUtils from '../utils/jwt.utils';

export const registerUser = async (
  userData: RegisterUserInput,
): Promise<IUser> => {
  const { name, email, password, avatar } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with that email', 400);
  }

  let avatarUrl = undefined;
  let avatarPublicId = undefined;

  if (avatar) {
    try {
      const uploadResult = await uploadImage(avatar, 'users/avatars');
      avatarUrl = uploadResult.secure_url;
      avatarPublicId = uploadResult.public_id;
    } catch (error) {
      throw new AppError('Avatar upload failed', 500);
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatarUrl,
    avatarPublicId,
  });

  return user;
};

export const loginUser = async (loginData: LoginUserInput): Promise<IUser> => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  return user;
};

export const generateAuthTokens = async (
  user: IUser,
): Promise<{ token: string; refreshToken: string }> => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    role: user.role,
  };

  const token = jwtUtils.generateToken(payload);
  const refreshToken = jwtUtils.generateRefreshToken(payload);

  await Token.create({
    userId: user._id,
    token: refreshToken,
    type: 'refresh',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { token, refreshToken };
};

export const forgotPassword = async (email: string): Promise<string> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('There is no user with that email', 404);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await Token.create({
    userId: user._id,
    token: user.resetPasswordToken,
    type: 'passwordReset',
    expiresAt: user.resetPasswordExpire,
  });

  return resetToken;
};

export const resetPassword = async (
  resetToken: string,
  { password }: ResetPasswordInput,
): Promise<void> => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const tokenDoc = await Token.findOne({
    token: resetPasswordToken,
    type: 'passwordReset',
    expiresAt: { $gt: Date.now() },
  });

  if (!tokenDoc) {
    throw new AppError('Invalid or expired token', 400);
  }

  const user = await User.findById(tokenDoc.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await Token.deleteOne({ _id: tokenDoc._id });
};

export const updateProfile = async (
  userId: string,
  updateData: UpdateProfileInput,
): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (updateData.avatar) {
    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    const uploadResult = await uploadImage(updateData.avatar, 'users/avatars');
    updateData.avatar = uploadResult.secure_url;
    user.avatarPublicId = uploadResult.public_id;
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.email) user.email = updateData.email;
  if (updateData.bio) user.bio = updateData.bio;
  if (updateData.avatar) user.avatar = updateData.avatar;

  await user.save();

  return user;
};

export const updatePassword = async (
  userId: string,
  { currentPassword, newPassword }: UpdatePasswordInput,
): Promise<void> => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<string> => {
  // Find token in database
  const tokenDoc = await Token.findOne({
    token: refreshToken,
    type: 'refresh',
    expiresAt: { $gt: Date.now() },
  });

  if (!tokenDoc) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  try {
    const decoded = jwtUtils.verifyToken(refreshToken);

    const newAccessToken = jwtUtils.generateToken({
      id: decoded.id,
      role: decoded.role,
    });

    return newAccessToken;
  } catch (error) {
    await Token.deleteOne({ _id: tokenDoc._id });
    throw new AppError('Invalid refresh token', 401);
  }
};

export const logout = async (
  userId: string,
  refreshToken: string,
): Promise<void> => {
  await Token.deleteOne({
    userId,
    token: refreshToken,
    type: 'refresh',
  });
};
