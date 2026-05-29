import { createContext, ReactNode, useEffect, useRef, useState } from "react";

import { useAuth } from "@/src/auth/auth-context";
import { StreakCelebrationModal } from "@/src/features/streak/components/streak-celebration-modal";
import { useMyStreak } from "@/src/features/streak/hooks/use-streak";

const StreakCelebrationContext = createContext({});

export function StreakCelebrationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: streak } = useMyStreak();

  const [visible, setVisible] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);

  const prevLastActivityRef = useRef<string | null>(null);
  const shownThisSessionRef = useRef(false);

  useEffect(() => {
    if (!streak || shownThisSessionRef.current) return;

    const today = new Date().toISOString().split("T")[0];
    const lastActivity = streak.lastActivityDate;
    const prevLastActivity = prevLastActivityRef.current;

    if (lastActivity === today) {
      const isFreshTransition = prevLastActivity !== null && prevLastActivity !== today;
      const isFirstLoadWithActivityToday = prevLastActivity === null && streak.currentStreak >= 1;

      if (isFreshTransition || isFirstLoadWithActivityToday) {
        setCelebrationStreak(streak.currentStreak);
        setVisible(true);
        shownThisSessionRef.current = true;
      }
    }

    prevLastActivityRef.current = lastActivity;
  }, [streak]);

  const userName = user?.displayName ?? user?.username ?? "";

  return (
    <StreakCelebrationContext.Provider value={{}}>
      {children}
      <StreakCelebrationModal
        visible={visible}
        currentStreak={celebrationStreak}
        userName={userName}
        onDismiss={() => setVisible(false)}
      />
    </StreakCelebrationContext.Provider>
  );
}
