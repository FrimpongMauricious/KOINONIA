export type UserResponse = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
};

export type UserProfileResponse = UserResponse & {
  followerCount: number;
  followingCount: number;
  followedByCurrentUser: boolean;
};

export type AuthResponse = {
  token: string;
  user: UserResponse;
};

export type ApiError = {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  displayName?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
