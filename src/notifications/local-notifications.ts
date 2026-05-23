import * as Notifications from "expo-notifications";

const MORNING_BODIES = [
  "Start your day in the Word. Share a verse or reflection with the community.",
  "What is God teaching you today? Post your daily devotion.",
  "A new day, a new opportunity to encourage a fellow believer.",
  "Your community is waiting. Share what's on your heart this morning.",
];

const EVENING_BODIES = [
  "You haven't posted yet today. One verse or comment keeps your streak alive!",
  "Your streak is at risk! Share something before midnight to keep it going.",
  "A quick comment or post is all it takes. Don't break your fellowship streak!",
  "The day isn't over yet — post or comment to keep your 🔥 streak alive.",
];

function randomMorningMessage(): string {
  return MORNING_BODIES[Math.floor(Math.random() * MORNING_BODIES.length)];
}

function randomEveningMessage(): string {
  return EVENING_BODIES[Math.floor(Math.random() * EVENING_BODIES.length)];
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDailyReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good morning! 🙏",
      body: randomMorningMessage(),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't lose your streak! 🔥",
      body: randomEveningMessage(),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
