import { Post } from "@/src/types/domain";

export const mockPosts: Post[] = [
  {
    id: "p1",
    authorId: "u2",
    content:
      "Psalm 119:105 reminds me that God often gives light for the next step, not the whole staircase. Today I choose obedience for the next step.",
    likesCount: 42,
    likedBy: ["u1"],
    commentsCount: 12,
    repostsCount: 5,
    repostedBy: [],
    createdAt: "2026-02-25T09:20:00Z",
    favoriteBy: ["u1"],
  },
  {
    id: "p2",
    authorId: "u3",
    content:
      "Christian fellowship grows strongest when we speak truth in love. What verse has shaped your speech this week?",
    likesCount: 33,
    likedBy: [],
    commentsCount: 9,
    repostsCount: 3,
    repostedBy: [],
    createdAt: "2026-02-26T11:00:00Z",
    favoriteBy: ["u1"],
  },
  {
    id: "p3",
    authorId: "u1",
    content:
      "John 15 challenges me daily: abiding is not passive, it is constant surrender and active dependence on Christ.",
    likesCount: 58,
    likedBy: [],
    commentsCount: 16,
    repostsCount: 7,
    repostedBy: [],
    createdAt: "2026-02-27T06:45:00Z",
    favoriteBy: [],
  },
];
