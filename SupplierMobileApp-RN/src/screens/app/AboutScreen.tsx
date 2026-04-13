import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Linking, Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const APP_VERSION = "1.0.0";
const BUILD = "2026.04";

const TECH_STACK = [
  { label: "Framework", value: "React Native (Expo SDK 54)" },
  { label: "Auth", value: "Firebase Authentication" },
  { label: "Database", value: "Cloud Firestore" },
  { label: "Peta", value: "Google Maps + react-native-maps" },
  { label: "AI Proposal", value: "Google Gemini API" },
  { label: "Rekomendasi", value: "SAW Algorithm + Google Places" },
];

const LINKS = [
  { icon: "globe-outline", label: "Website", url: "https://supplierai.id", color: "#60A5FA" },
  { icon: "logo-instagram", label: "Instagram", url: "https://instagram.com/supplierai", color: "#E1306C" },
  { icon: "mail-outline", label: "Email Support", url: "mailto:support@supplierai.id", color: "#00D084" },
];

export default function AboutScreen() {
  const navigation = useNavigation();

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert("Tidak bisa membuka link", url);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Logo & Branding */}
        <View style={styles.brandCard}>
          <View style={styles.logoBox}>
            <View style={styles.logoInner} />
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.brandName}>SupplierHub</Text>
          <Text style={styles.brandTagline}>Platform B2B Berbasis Kecerdasan Buatan</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{APP_VERSION}</Text>
            <View style={styles.versionDivider} />
            <Text style={styles.versionText}>Build {BUILD}</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <Text style={styles.missionText}>
            SupplierHub membantu para supplier Indonesia menemukan mitra bisnis (B2B) yang tepat menggunakan teknologi AI — lebih cepat, lebih cerdas, lebih terhubung.
          </Text>
        </View>

        {/* Tech Stack */}
        <Text style={styles.sectionLabel}>TEKNOLOGI YANG DIGUNAKAN</Text>
        <View style={styles.card}>
          {TECH_STACK.map((item, idx) => (
            <View
              key={item.label}
              style={[styles.techRow, idx < TECH_STACK.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }]}
            >
              <Text style={styles.techLabel}>{item.label}</Text>
              <Text style={styles.techValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>HUBUNGI KAMI</Text>
        <View style={styles.card}>
          {LINKS.map((link, idx) => (
            <TouchableOpacity
              key={link.label}
              style={[
                styles.linkRow,
                idx < LINKS.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
              ]}
              onPress={() => openLink(link.url)}
              activeOpacity={0.8}
            >
              <View style={[styles.linkIcon, { backgroundColor: `${link.color}18` }]}>
                <Ionicons name={link.icon as any} size={18} color={link.color} />
              </View>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Ionicons name="open-outline" size={14} color="#4B5563" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal */}
        <View style={styles.legalCard}>
          <Text style={styles.legalText}>
            © {new Date().getFullYear()} SupplierHub. Seluruh hak cipta dilindungi undang-undang.
          </Text>
          <Text style={[styles.legalText, { marginTop: 4 }]}>
            Dibuat dengan ❤️ untuk UMKM Indonesia.
          </Text>
        </View>
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
  brandCard: {
    alignItems: "center", borderRadius: 24, padding: 28, marginBottom: 16,
    backgroundColor: "rgba(0,208,132,0.04)", borderWidth: 1, borderColor: "rgba(0,208,132,0.12)",
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20, borderWidth: 2, borderColor: "#00D084",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
    shadowColor: "#00D084", shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    backgroundColor: "rgba(0,208,132,0.05)",
  },
  logoInner: { width: 34, height: 34, borderRadius: 8, borderWidth: 2.5, borderColor: "#00D084" },
  logoDot: {
    position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: "#00D084",
    shadowColor: "#00D084", shadowOpacity: 1, shadowRadius: 6, elevation: 6,
  },
  brandName: { fontSize: 28, fontWeight: "900", color: "#00D084", letterSpacing: 1 },
  brandTagline: { fontSize: 13, color: "#64748B", marginTop: 6, textAlign: "center" },
  versionBadge: {
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
  },
  versionText: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
  versionDivider: { width: 1, height: 12, backgroundColor: "rgba(255,255,255,0.15)" },
  missionCard: {
    borderRadius: 18, padding: 18, marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  missionText: { fontSize: 14, color: "#94A3B8", lineHeight: 24, textAlign: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#4B5563", letterSpacing: 0.5, marginBottom: 10 },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden",
  },
  techRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  techLabel: { fontSize: 13, color: "#64748B" },
  techValue: { fontSize: 13, color: "#F1F5F9", fontWeight: "600", textAlign: "right", flex: 1, marginLeft: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  linkIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  linkLabel: { flex: 1, fontSize: 14, color: "#F1F5F9", fontWeight: "600" },
  legalCard: { alignItems: "center", marginTop: 24 },
  legalText: { fontSize: 11, color: "#374151", textAlign: "center" },
});
