import { usePrototypeStore } from "@/src/state/prototype-store";

export function usePrototypeSession() {
  const { session } = usePrototypeStore();

  return {
    ...session,
    isGuest: session.accountType === "guest",
  };
}
