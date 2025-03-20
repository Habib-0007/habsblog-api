export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface TokenPayload {
  id: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    bio?: string;
  };
  message?: string;
}
