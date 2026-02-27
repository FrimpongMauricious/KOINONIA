# Koinonia (Prototype)

Koinonia is a Christian knowledge-sharing mobile app prototype based on the provided SRS.

Current phase: frontend-first, semi-working prototype using local mock data while backend APIs are pending.

## Run

1. Install dependencies

   ```bash
   npm install
   ```

2. Start Expo

   ```bash
   npx expo start
   ```

## Route Structure

```txt
app/
   _layout.tsx               # Root stack
   edit-profile.tsx          # Registered-user profile edit placeholder
   (auth)/
      _layout.tsx
      login.tsx
      register.tsx
   post/
      [id].tsx                # Post detail placeholder
   (tabs)/
      _layout.tsx
      index.tsx               # Feed
      discover.tsx
      compose.tsx
      favorites.tsx
      profile.tsx
```

## Domain and Mock Data Structure

```txt
src/
   types/
      domain.ts               # Core app entities (User, Post, Session)
   mocks/
      users.ts
      posts.ts
   state/
      session.ts              # Prototype guest/registered state shim
   features/
      feed/
         components/
            post-card.tsx
```

## SRS Coverage in Prototype

- Account management routes and UI placeholders: login, register, edit profile.
- Feed and post display placeholders: chronological mocked post list and post detail route.
- Text-only post creation with 1000-char limit enforced in `compose`.
- Interaction placeholders: likes/comments counters visible, repost/favorite gated for guests.
- Social placeholder: discover and profile include follower/following data.

## Next Implementation Steps

1. Add a real state layer (store + actions) for like/comment/repost/favorite/follow.
2. Wire authentication provider and protected routes.
3. Replace mocks with backend integrations (Spring Boot or Supabase).
4. Add validation, loading, empty, and error states per screen.
5. Add tests for domain logic and key UI flows.
