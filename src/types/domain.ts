export type AccountType = "guest" | "registered";

export interface User {
  id: string;
  handle: string;
  displayName: string;
  followersCount: number;
  followingCount: number;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  repostsCount: number;
  repostedBy: string[];
  createdAt: string;
  favoriteBy: string[];
}

export interface SessionState {
  accountType: AccountType;
  activeUserId?: string;
  followingIds: string[];
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type CommentsByPost = Record<string, PostComment[]>;
