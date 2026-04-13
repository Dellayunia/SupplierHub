import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function SecurityScreen() {
  const navigation = useNavigation();

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert("Form Tidak Lengkap", "Semua field harus diisi.");
      return;
    }
    if (newPass.length < 6) {
      Alert.alert("Password Terlalu Pendek", "Password baru minimal 6 karakter.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Tidak Cocok", "Password baru dan konfirmasi tidak sama.");
      return;
    }
    if (newPass === currentPass) {
      Alert.alert("Sama", "Password baru tidak boleh sama dengan password lama.");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not logged in");

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPass);
      Alert.alert("Berhasil ✅", "Password berhasil diubah. Silakan login kembali.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        Alert.alert("Password Salah", "Password saat ini yang Anda masukkan salah.");
      } else if (err.code === "auth/too-many-requests") {
        Alert.alert("Terlalu Banyak Percobaan", "Coba lagi beberapa menit kemudian.");
      } else {
        Alert.alert("Gagal", "Tidak dapat mengubah password. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keamanan Akun</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#60A5FA" />
          <Text style={styles.infoText}>
            Untuk mengubah password, masukkan password lama Anda terlebih dahulu sebagai verifikasi identitas.
          </Text>
        </View>

        {/* Current Password */}
        <Text style={styles.label}>PASSWORD SAAT INI</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color="#00D084" />
          <TextInput
            style={styles.input}
            placeholder="Masukkan password lama"
            placeholderTextColor="#4B5563"
            secureTextEntry={!showCurrent}
            value={currentPass}
            onChangeText={setCurrentPass}
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Password Baru</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* New Password */}
        <Text style={styles.label}>PASSWORD BARU</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-open-outline" size={18} color="#00D084" />
          <TextInput
            style={styles.input}
            placeholder="Min. 6 karakter"
            placeholderTextColor="#4B5563"
            secureTextEntry={!showNew}
            value={newPass}
            onChangeText={setNewPass}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={[styles.label, { marginTop: 16 }]}>KONFIRMASI PASSWORD BARU</Text>
        <View style={[styles.inputRow, {
          borderColor: confirmPass && newPass !== confirmPass
            ? "rgba(239,68,68,0.4)"
            : "rgba(255,255,255,0.08)",
        }]}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#00D084" />
          <TextInput
            style={styles.input}
            placeholder="Ulangi password baru"
            placeholderTextColor="#4B5563"
            secureTextEntry={!showConfirm}
            value={confirmPass}
            onChangeText={setConfirmPass}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>
        {confirmPass && newPass !== confirmPass && (
          <Text style={styles.errorHint}>Password tidak cocok</Text>
        )}
        {confirmPass && newPass === confirmPass && confirmPass.length >= 6 && (
          <Text style={styles.successHint}>✓ Password cocok</Text>
        )}

        {/* Password Strength Tips */}
        <View style={styles.tipsBox}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", marginBottom: 8 }}>
            💡 Tips Password Kuat:
          </Text>
          {[
            "Minimal 8 karakter",
            "Kombinasi huruf besar dan kecil",
            "Sertakan angka atau simbol",
          ].map((t) => (
            <View key={t} style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
              <Text style={{ color: "#4B5563", fontSize: 12 }}>•</Text>
              <Text style={{ color: "#64748B", fontSize: 12 }}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, (isLoading || newPass !== confirmPass || !currentPass) && styles.btnDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading || newPass !== confirmPass || !currentPass}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="white" />
            : <><Ionicons name="shield-checkmark" size={18} color="white" />
              <Text style={styles.btnText}>Ubah Password</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#F1F5F9" },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  scroll: { padding: 20, paddingBottom: 48 },
  infoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 16, padding: 14, marginBottom: 24,
    backgroundColor: "rgba(59,130,246,0.08)", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)",
  },
  infoText: { fontSize: 13, color: "#94A3B8", flex: 1, lineHeight: 20 },
  label: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, paddingHorizontal: 16, height: 54,
  },
  input: { flex: 1, fontSize: 14, color: "#F1F5F9" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  errorHint: { fontSize: 11, color: "#F87171", marginTop: 6 },
  successHint: { fontSize: 11, color: "#00D084", marginTop: 6 },
  tipsBox: {
    borderRadius: 14, padding: 14, marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  btn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10,
    borderRadius: 16, paddingVertical: 16, marginTop: 24, backgroundColor: "#00D084",
    shadowColor: "#00D084", shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { backgroundColor: "rgba(255,255,255,0.06)", shadowOpacity: 0 },
  btnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
