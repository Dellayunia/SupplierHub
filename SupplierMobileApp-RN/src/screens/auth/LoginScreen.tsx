import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../navigation/AuthStack";
import { useApp } from "../../context/AppContext";

type Nav = StackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isProfileSetup } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      // Navigation handled by RootNavigator based on auth state
    } catch (err: any) {
      setError("Email atau password yang Anda masukkan salah!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#0A0E1A" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoInner} />
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.brand}>SupplierHub</Text>
          <Text style={styles.subtitle}>Selamat datang kembali!</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#00D084" />
            <TextInput
              style={styles.input}
              placeholder="email@bisnis.com"
              placeholderTextColor="#4B5563"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#00D084" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: 6 }}>
            <Text style={{ fontSize: 12, color: "#00D084" }}>Lupa password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.btn, isLoading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.btnText}>MASUK</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={{ color: "#64748B", fontSize: 13 }}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={{ color: "#00D084", fontWeight: "700", fontSize: 13 }}>Daftar di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: "center", paddingTop: 60, paddingBottom: 32 },
  logoWrap: {
    width: 68, height: 68, borderRadius: 18, borderWidth: 2, borderColor: "#00D084",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
    shadowColor: "#00D084", shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    backgroundColor: "rgba(0,208,132,0.05)",
  },
  logoInner: { width: 32, height: 32, borderRadius: 6, borderWidth: 2.5, borderColor: "#00D084" },
  logoDot: {
    position: "absolute", width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#00D084", shadowColor: "#00D084", shadowOpacity: 1, shadowRadius: 6, elevation: 6,
  },
  brand: { fontSize: 28, fontWeight: "900", color: "#00D084", letterSpacing: 1 },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  card: {
    marginHorizontal: 20, borderRadius: 24, padding: 24,
    backgroundColor: "rgba(19,25,41,0.8)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#F1F5F9", marginBottom: 20 },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: "#F87171" },
  label: { fontSize: 12, color: "#94A3B8", fontWeight: "600", marginBottom: 6 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, paddingHorizontal: 16, height: 52,
  },
  input: { flex: 1, fontSize: 14, color: "#F1F5F9" },
  btn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    borderRadius: 16, paddingVertical: 16, marginTop: 24,
    backgroundColor: "#00D084",
    shadowColor: "#00D084", shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnText: { fontSize: 15, fontWeight: "800", color: "white", letterSpacing: 0.5 },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
});
