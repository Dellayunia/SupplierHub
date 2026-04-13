import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { AppStackParamList } from "../../navigation/AppStack";

type Nav = StackNavigationProp<AppStackParamList>;

const MENU_ITEMS: {
  icon: string; label: string; desc: string; route: keyof AppStackParamList;
}[] = [
  { icon: "person-outline", label: "Edit Profil", desc: "Ubah informasi bisnis Anda", route: "EditProfile" },
  { icon: "lock-closed-outline", label: "Keamanan Akun", desc: "Password dan keamanan", route: "Security" },
  { icon: "notifications-outline", label: "Notifikasi", desc: "Kelola notifikasi lamaran", route: "Notifications" },
  { icon: "help-circle-outline", label: "Bantuan", desc: "Pusat bantuan dan FAQ", route: "Help" },
  { icon: "information-circle-outline", label: "Tentang Aplikasi", desc: "SupplierHub v1.0.0", route: "About" },
];


export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout, applications } = useApp();

  const handleLogout = () => {
    Alert.alert("Keluar", "Apakah Anda yakin ingin keluar dari akun ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => { await logout(); },
      },
    ]);
  };

  const stats = {
    total: applications.length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    pending: applications.filter((a) => a.status === "pending").length,
  };

  const avatarText = (user?.businessName || user?.name || "U").substring(0, 2).toUpperCase();
  const isAvatarUrl = user?.avatar?.startsWith("http") || user?.avatar?.startsWith("file");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil Saya</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isAvatarUrl ? (
            <Image source={{ uri: user!.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{avatarText}</Text>
            </View>
          )}
          <Text style={styles.businessName}>{user?.businessName || "Nama Bisnis Belum Diisi"}</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.infoPills}>
            {user?.category && (
              <View style={styles.pill}>
                <Ionicons name="pricetag-outline" size={12} color="#00D084" />
                <Text style={styles.pillText}>{user.category}</Text>
              </View>
            )}
            {user?.location && (
              <View style={styles.pill}>
                <Ionicons name="location-outline" size={12} color="#60A5FA" />
                <Text style={[styles.pillText, { color: "#93C5FD" }]} numberOfLines={1}>{user.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Lamaran", value: stats.total, color: "#3B82F6" },
            { label: "Diterima", value: stats.accepted, color: "#00D084" },
            { label: "Proses", value: stats.pending, color: "#F59E0B" },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        {(user?.email || user?.description) && (
          <View style={styles.section}>
            {user?.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color="#00D084" />
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
            )}
            {user?.description && (
              <View style={[styles.infoRow, { alignItems: "flex-start" }]}>
                <Ionicons name="document-text-outline" size={16} color="#60A5FA" style={{ marginTop: 2 }} />
                <Text style={[styles.infoText, { flex: 1, lineHeight: 20 }]}>{user.description}</Text>
              </View>
            )}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => navigation.navigate(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={18} color="#00D084" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#F1F5F9" },
  profileCard: {
    alignItems: "center", marginHorizontal: 20, marginBottom: 16, borderRadius: 24, padding: 24,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  avatarImg: { width: 96, height: 96, borderRadius: 24, marginBottom: 12 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 24, backgroundColor: "#00D084",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: "white" },
  businessName: { fontSize: 20, fontWeight: "800", color: "#F1F5F9", textAlign: "center" },
  userName: { fontSize: 14, color: "#64748B", marginTop: 4 },
  infoPills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, justifyContent: "center" },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: "rgba(0,208,132,0.08)", borderWidth: 1, borderColor: "rgba(0,208,132,0.15)",
  },
  pillText: { fontSize: 12, color: "#6EE7B7", fontWeight: "600", maxWidth: 160 },
  statsRow: {
    flexDirection: "row", gap: 12, marginHorizontal: 20, marginBottom: 16,
  },
  statBox: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  section: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  infoText: { fontSize: 13, color: "#94A3B8" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  menuIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(0,208,132,0.08)",
    justifyContent: "center", alignItems: "center",
  },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#F1F5F9" },
  menuDesc: { fontSize: 12, color: "#64748B", marginTop: 2 },
  logoutBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10,
    marginHorizontal: 20, marginBottom: 20, borderRadius: 18, paddingVertical: 16,
    backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.15)",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
});
