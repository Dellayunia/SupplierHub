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

type Nav = StackNavigationProp<AuthStackParamList, "Register">;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Semua field harus diisi");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await register(name, email, password);
      navigation.replace("ProfileSetup");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar. Gunakan email lain.");
      } else {
        setError("Pendaftaran gagal. Periksa koneksi Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#0A0E1A" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoInner} />
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.brand}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Mulai perjalanan bisnis Anda</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Buat Akun Baru</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color="#00D084" />
            <TextInput
              style={styles.input}
              placeholder="Nama Anda"
              placeholderTextColor="#4B5563"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
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

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#00D084" />
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#4B5563"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.btnText}>DAFTAR SEKARANG</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={{ color: "#64748B", fontSize: 13 }}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#00D084", fontWeight: "700", fontSize: 13 }}>Masuk di sini</Text>
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
    width: 68, height: 68, borderRadius: 18, borderWidth: 2, borderColor: "#3B82F6",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
    shadowColor: "#3B82F6", shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    backgroundColor: "rgba(59,130,246,0.05)",
  },
  logoInner: { width: 32, height: 32, borderRadius: 6, borderWidth: 2.5, borderColor: "#3B82F6" },
  logoDot: {
    position: "absolute", width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#3B82F6", shadowColor: "#3B82F6", shadowOpacity: 1, shadowRadius: 6, elevation: 6,
  },
  brand: { fontSize: 28, fontWeight: "900", color: "#60A5FA", letterSpacing: 1 },
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
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6", shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnText: { fontSize: 15, fontWeight: "800", color: "white", letterSpacing: 0.5 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
});
