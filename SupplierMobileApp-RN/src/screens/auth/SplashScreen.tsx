import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "../../navigation/AuthStack";
import { useApp } from "../../context/AppContext";

type Nav = StackNavigationProp<AuthStackParamList, "Splash">;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isProfileSetup, isAuthReady } = useApp();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    const timer = setTimeout(() => {
      if (isAuthenticated && isProfileSetup) {
        // Navigate to App (handled by RootNavigator)
      } else if (isAuthenticated && !isProfileSetup) {
        navigation.replace("ProfileSetup");
      } else {
        navigation.replace("Login");
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [isAuthReady, isAuthenticated, isProfileSetup]);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });

  return (
    <View style={styles.container}>
      {/* Green radial glow */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim, alignItems: "center" }}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoHex} />
          <View style={styles.logoDot} />
        </View>

        <Text style={styles.brand}>SupplierHub</Text>
        <Text style={styles.tagline}>Temukan Mitra Terbaikmu</Text>
        {/* <Text style={styles.tagline2}>dengan Kecerdasan Buatan</Text> */}
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Memuat aplikasi...</Text>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingFill, { width: "70%" }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    top: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#00D084",
    opacity: 0.15,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "transparent",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00D084",
    shadowColor: "#00D084",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  logoHex: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: "#00D084",
  },
  logoDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00D084",
    shadowColor: "#00D084",
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  brand: {
    fontSize: 36,
    fontWeight: "900",
    color: "#00D084",
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
  },
  tagline2: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 48,
  },
  footerText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 10,
  },
  loadingBar: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingFill: {
    height: "100%",
    backgroundColor: "#00D084",
    borderRadius: 2,
  },
});
