import Constants from "expo-constants";

export async function setupNotificationHandler(): Promise<void> {
  if (Constants.appOwnership === "expo") return;
  const Notifications = await import("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
