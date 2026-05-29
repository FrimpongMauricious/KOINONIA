import { createContext, ReactNode, useEffect, useRef, useState } from "react";

import { useAuth } from "@/src/auth/auth-context";
import { StreakCelebrationModal } from "@/src/features/streak/components/streak-celebration-modal";
import { StreakLostModal } from "@/src/features/streak/components/streak-lost-modal";
import { useMyStreak } from "@/src/features/streak/hooks/use-streak";

const StreakCelebrationContext = createContext({});

export function StreakCelebrationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: streak } = useMyStreak();

  const [visible, setVisible] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);

  const [lostModalVisible, setLostModalVisible] = useState(false);
  const [lostStreakLength, setLostStreakLength] = useState(0);

  const prevLastActivityRef = useRef<string | null>(null);
  const shownThisSessionRef = useRef(false);
  const shownLostThisSessionRef = useRef(false);

  useEffect(() => {
    if (!streak) return;

    const today = new Date().toISOString().split("T")[0];
    const lastActivity = streak.lastActivityDate;
    const prevLastActivity = prevLastActivityRef.current;

    // Celebration: user posted today for the first time this session
    if (!shownThisSessionRef.current && lastActivity === today) {
      const isFreshTransition = prevLastActivity !== null && prevLastActivity !== today;
      const isFirstLoadWithActivityToday = prevLastActivity === null && streak.currentStreak >= 1;

      if (isFreshTransition || isFirstLoadWithActivityToday) {
        setCelebrationStreak(streak.currentStreak);
        setVisible(true);
        shownThisSessionRef.current = true;
      }
    }

    // Lost streak: user had a meaningful streak but missed at least yesterday
    if (!shownLostThisSessionRef.current && lastActivity) {
      const lastActivityDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const daysSinceActivity = Math.floor(
        (todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (
        streak.longestStreak >= 3 &&
        daysSinceActivity >= 2 &&
        streak.currentStreak < streak.longestStreak
      ) {
        setLostStreakLength(streak.longestStreak);
        setLostModalVisible(true);
        shownLostThisSessionRef.current = true;
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
      <StreakLostModal
        visible={lostModalVisible}
        lostStreakLength={lostStreakLength}
        onDismiss={() => setLostModalVisible(false)}
      />
    </StreakCelebrationContext.Provider>
  );
}
