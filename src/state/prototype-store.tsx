import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { mockPosts } from "@/src/mocks/posts";
import { mockUsers } from "@/src/mocks/users";
import {
    AccountType,
    CommentsByPost,
    Post,
    PostComment,
    SessionState,
    User,
} from "@/src/types/domain";

export const FORCE_REGISTERED_TEST_MODE = true;

interface PrototypeStoreValue {
  session: SessionState;
  posts: Post[];
  commentsByPost: CommentsByPost;
  users: User[];
  activeUser?: User;
  setAccountType: (accountType: AccountType) => void;
  toggleLike: (postId: string) => void;
  toggleFavorite: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  addComment: (postId: string, content?: string) => void;
  createPost: (content: string) => boolean;
  toggleFollow: (targetUserId: string) => void;
}

const INITIAL_SESSION: SessionState = {
  accountType: FORCE_REGISTERED_TEST_MODE ? "registered" : "guest",
  activeUserId: "u1",
  followingIds: [],
};

const PrototypeStoreContext = createContext<PrototypeStoreValue | undefined>(
  undefined,
);

const STORAGE_POSTS_KEY = "koinonia:prototype:posts";
const STORAGE_COMMENTS_KEY = "koinonia:prototype:comments";

function applyToggleByUser(list: string[], userId: string) {
  if (list.includes(userId)) {
    return list.filter((id) => id !== userId);
  }

  return [...list, userId];
}

export function PrototypeStoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(INITIAL_SESSION);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [commentsByPost, setCommentsByPost] = useState<CommentsByPost>({});
  const [users, setUsers] = useState<User[]>(mockUsers);
  const storageReadyRef = useRef(true);

  const readStorageItem = useCallback(async (key: string) => {
    if (!storageReadyRef.current) {
      return null;
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch {
      storageReadyRef.current = false;
      return null;
    }
  }, []);

  const writeStorageItem = useCallback(async (key: string, value: string) => {
    if (!storageReadyRef.current) {
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      storageReadyRef.current = false;
    }
  }, []);

  useEffect(() => {
    async function hydratePersistedState() {
      try {
        const [persistedPosts, persistedComments] = await Promise.all([
          readStorageItem(STORAGE_POSTS_KEY),
          readStorageItem(STORAGE_COMMENTS_KEY),
        ]);

        if (persistedPosts) {
          setPosts(JSON.parse(persistedPosts) as Post[]);
        }

        if (persistedComments) {
          setCommentsByPost(JSON.parse(persistedComments) as CommentsByPost);
        }
      } catch {
        setPosts(mockPosts);
        setCommentsByPost({});
      }
    }

    hydratePersistedState();
  }, [readStorageItem]);

  useEffect(() => {
    void writeStorageItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  }, [posts, writeStorageItem]);

  useEffect(() => {
    void writeStorageItem(STORAGE_COMMENTS_KEY, JSON.stringify(commentsByPost));
  }, [commentsByPost, writeStorageItem]);

  const activeUser = useMemo(
    () => users.find((user) => user.id === session.activeUserId),
    [session.activeUserId, users],
  );

  const setAccountType = useCallback((accountType: AccountType) => {
    setSession((prev) => ({
      ...prev,
      accountType: FORCE_REGISTERED_TEST_MODE ? "registered" : accountType,
    }));
  }, []);

  const toggleLike = useCallback(
    (postId: string) => {
      if (session.accountType === "guest" || !session.activeUserId) {
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const liked = post.likedBy.includes(session.activeUserId!);
          return {
            ...post,
            likesCount: liked ? post.likesCount - 1 : post.likesCount + 1,
            likedBy: applyToggleByUser(post.likedBy, session.activeUserId!),
          };
        }),
      );
    },
    [session.accountType, session.activeUserId],
  );

  const toggleFavorite = useCallback(
    (postId: string) => {
      if (session.accountType === "guest" || !session.activeUserId) {
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            favoriteBy: applyToggleByUser(
              post.favoriteBy,
              session.activeUserId!,
            ),
          };
        }),
      );
    },
    [session.accountType, session.activeUserId],
  );

  const toggleRepost = useCallback(
    (postId: string) => {
      if (session.accountType === "guest" || !session.activeUserId) {
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const reposted = post.repostedBy.includes(session.activeUserId!);
          return {
            ...post,
            repostsCount: reposted
              ? post.repostsCount - 1
              : post.repostsCount + 1,
            repostedBy: applyToggleByUser(
              post.repostedBy,
              session.activeUserId!,
            ),
          };
        }),
      );
    },
    [session.accountType, session.activeUserId],
  );

  const addComment = useCallback(
    (postId: string, content?: string) => {
      const authorId = session.activeUserId ?? "u1";
      const now = new Date();
      const comment: PostComment = {
        id: `c-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
        postId,
        authorId,
        content: content?.trim() ? content.trim() : "Mock test comment",
        createdAt: now.toISOString(),
      };

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [comment, ...(prev[postId] ?? [])],
      }));

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            commentsCount: post.commentsCount + 1,
          };
        }),
      );
    },
    [session.activeUserId],
  );

  const createPost = useCallback(
    (content: string) => {
      if (session.accountType === "guest" || !session.activeUserId) {
        return false;
      }

      const trimmed = content.trim();
      if (!trimmed || trimmed.length > 1000) {
        return false;
      }

      const now = new Date();
      const post: Post = {
        id: `p-${now.getTime()}`,
        authorId: session.activeUserId,
        content: trimmed,
        likesCount: 0,
        likedBy: [],
        commentsCount: 0,
        repostsCount: 0,
        repostedBy: [],
        createdAt: now.toISOString(),
        favoriteBy: [],
      };

      setPosts((prevPosts) => [post, ...prevPosts]);
      return true;
    },
    [session.accountType, session.activeUserId],
  );

  const toggleFollow = useCallback(
    (targetUserId: string) => {
      if (
        session.accountType === "guest" ||
        !session.activeUserId ||
        session.activeUserId === targetUserId
      ) {
        return;
      }

      const isFollowing = session.followingIds.includes(targetUserId);

      setSession((prev) => ({
        ...prev,
        followingIds: isFollowing
          ? prev.followingIds.filter((id) => id !== targetUserId)
          : [...prev.followingIds, targetUserId],
      }));

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === targetUserId) {
            return {
              ...user,
              followersCount: isFollowing
                ? user.followersCount - 1
                : user.followersCount + 1,
            };
          }

          if (user.id === session.activeUserId) {
            return {
              ...user,
              followingCount: isFollowing
                ? user.followingCount - 1
                : user.followingCount + 1,
            };
          }

          return user;
        }),
      );
    },
    [session.accountType, session.activeUserId, session.followingIds],
  );

  const value = useMemo(
    () => ({
      session,
      posts,
      commentsByPost,
      users,
      activeUser,
      setAccountType,
      toggleLike,
      toggleFavorite,
      toggleRepost,
      addComment,
      createPost,
      toggleFollow,
    }),
    [
      session,
      posts,
      commentsByPost,
      users,
      activeUser,
      setAccountType,
      toggleLike,
      toggleFavorite,
      toggleRepost,
      addComment,
      createPost,
      toggleFollow,
    ],
  );

  return (
    <PrototypeStoreContext.Provider value={value}>
      {children}
    </PrototypeStoreContext.Provider>
  );
}

export function usePrototypeStore() {
  const context = useContext(PrototypeStoreContext);
  if (!context) {
    throw new Error(
      "usePrototypeStore must be used within PrototypeStoreProvider",
    );
  }

  return context;
}
