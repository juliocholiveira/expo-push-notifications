import React, { useState, useEffect, useCallback } from "react";
import { Text, View, Button, Vibration, Platform } from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState({});

  const registerForPushNotificationsAsync = useCallback(async () => {
    try {
      if (Constants.isDevice) {
        const { status: existingStatus } = await Permissions.getAsync(
          Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;
        alert(existingStatus);
        if (existingStatus !== "granted") {
          const { status } = await Permissions.askAsync(
            Permissions.NOTIFICATIONS
          );
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }
        token = await Notifications.getExpoPushTokenAsync();
        alert(token);
        setExpoPushToken(token);
      } else {
        alert("Must use physical device for Push Notifications");
      }

      if (Platform.OS === "android") {
        Notifications.createChannelAndroidAsync("default", {
          name: "default",
          sound: true,
          priority: "max",
          vibrate: [0, 250, 250, 250],
        });
      }
    } catch (error) {
      alert(error.message);
    }
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    _notificationSubscription = Notifications.addListener(_handleNotification);
  }, []);

  const _handleNotification = useCallback((notification) => {
    //Vibration.vibrate();
    console.log(notification);
    setNotification(notification);
  }, []);

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
  const sendPushNotification = useCallback(async () => {
    try {
      alert(expoPushToken);
      const message = {
        to: expoPushToken,
        sound: "default",
        title: "Original Title",
        body: "And here is the body!",
        data: { data: "goes here" },
        _displayInForeground: true,
        channelId: "default",
      };
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      const data = await response.json();

      if (data.data.status === "error") {
        alert(data.data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  }, [expoPushToken]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>Version: 2</Text>
        <Text>Origin: {notification.origin}</Text>
        <Text>Data: {JSON.stringify(notification.data)}</Text>
        <Text>Data: {expoPushToken}</Text>
      </View>
      <Button
        title={"Press to Send Notification"}
        onPress={sendPushNotification}
      />
    </View>
  );
}
