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

export type AuthorRef = {
  id: number;
  username: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  followedByCurrentUser: boolean;
};

export type PostResponse = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorRef;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
};

export type Page<T> = {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
};

export type LikeResponse = {
  likeCount: number;
  likedByCurrentUser: boolean;
};

export type PublicUserProfileResponse = {
  id: number;
  username: string;
  displayName: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  followedByCurrentUser: boolean;
};

export type CommentResponse = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorRef;
};

export type FollowResponse = {
  userId: number;
  followerCount: number;
  followingCount: number;
  followedByCurrentUser: boolean;
};

export type UpdateProfileRequest = {
  displayName?: string;
  bio?: string;
  profilePictureUrl?: string;
};
