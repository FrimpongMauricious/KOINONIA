import { useAuth } from "@/src/auth/auth-context";

export function usePrototypeSession() {
  const { status, user } = useAuth();
  return {
    accountType: status === "authenticated" ? "registered" : "guest",
    isGuest: status !== "authenticated",
    activeUserId: user?.id?.toString() ?? undefined,
    followingIds: [] as string[],
  };
}
