import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

export function setupNotificationHandler(): void {
  if (isExpoGo()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
