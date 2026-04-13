import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import HomeScreen from "../screens/app/HomeScreen";
import ExploreScreen from "../screens/app/ExploreScreen";
import CatalogScreen from "../screens/app/CatalogScreen";
import ProfileScreen from "../screens/app/ProfileScreen";
import PartnerDetailScreen from "../screens/app/PartnerDetailScreen";
import ApplicationScreen from "../screens/app/ApplicationScreen";
import RecommendationScreen from "../screens/app/RecommendationScreen";
import EditProfileScreen from "../screens/app/EditProfileScreen";
import SecurityScreen from "../screens/app/SecurityScreen";
import NotificationScreen from "../screens/app/NotificationScreen";
import HelpScreen from "../screens/app/HelpScreen";
import AboutScreen from "../screens/app/AboutScreen";
import { Partner } from "../data/mockData";

// ─── Type definitions ─────────────────────────────────────────────────────────
export type AppStackParamList = {
  Tabs: undefined;
  PartnerDetail: { partner: Partner };
  Applications: undefined;
  Recommendations: undefined;
  EditProfile: undefined;
  Security: undefined;
  Notifications: undefined;
  Help: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Catalog: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const tabs = [
    { name: "Home", label: "Beranda", icon: "home" },
    { name: "Explore", label: "Peta Mitra", icon: "compass" },
    { name: "Catalog", label: "Katalog", icon: "cube" },
    { name: "Profile", label: "Profil", icon: "person" },
  ];

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isActive = state.index === index;
        const tab = tabs.find((t) => t.name === route.name);
        if (!tab) return null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeDot} />}
            <Ionicons
              name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
              size={22}
              color={isActive ? "#00D084" : "#64748B"}
            />
            <Text style={[styles.tabLabel, { color: isActive ? "#00D084" : "#64748B", fontWeight: isActive ? "700" : "500" }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(11,15,26,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
  },
  activeDot: {
    position: "absolute",
    top: -12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00D084",
    shadowColor: "#00D084",
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});

// ─── Tab Navigator ────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── App Stack (wraps tabs + modal screens) ───────────────────────────────────
export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#0B0F1A" } }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="PartnerDetail" component={PartnerDetailScreen} />
      <Stack.Screen name="Applications" component={ApplicationScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
