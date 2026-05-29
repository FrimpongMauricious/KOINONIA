import Constants from "expo-constants";

function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

async function getNotificationsModule() {
  if (isExpoGo()) return null;
  return await import("expo-notifications");
}

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

const LAST_HOUR_BODIES = [
  "1 hour left! Don't let your streak slip away tonight. 🔥",
  "Final hour to save your streak! Post or comment now.",
  "Your streak is on the line. 60 minutes until midnight.",
  "Last call — keep your streak alive! Tap to post a quick reflection.",
  "Don't lose your fellowship streak. The day ends in an hour.",
  "Almost midnight! A short comment is all it takes to save your streak.",
];

function randomMorningMessage(): string {
  return MORNING_BODIES[Math.floor(Math.random() * MORNING_BODIES.length)];
}

function randomEveningMessage(): string {
  return EVENING_BODIES[Math.floor(Math.random() * EVENING_BODIES.length)];
}

function randomLastHourMessage(): string {
  return LAST_HOUR_BODIES[Math.floor(Math.random() * LAST_HOUR_BODIES.length)];
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDailyReminders(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

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

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Last hour! 🔥",
      body: randomLastHourMessage(),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 23,
      minute: 0,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
