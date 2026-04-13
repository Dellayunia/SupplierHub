import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useApp } from "../context/AppContext";
import { View, ActivityIndicator } from "react-native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

const Root = createStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isProfileSetup, isAuthReady } = useApp();

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0E1A", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#00D084" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        {!isAuthenticated || !isProfileSetup ? (
          <Root.Screen name="Auth" component={AuthStack} />
        ) : (
          <Root.Screen name="App" component={AppStack} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
