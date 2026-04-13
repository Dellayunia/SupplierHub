import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { PARTNERS, Partner } from "../../data/mockData";
import { applySAW } from "../../utils/algorithms";
import { AppStackParamList } from "../../navigation/AppStack";

type Nav = StackNavigationProp<AppStackParamList>;

const BACKEND_URL = "http://172.20.10.2:3000"; // IP PC di jaringan hotspot

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, applications } = useApp();
  const [isSearching, setIsSearching] = useState(true);
  const [livePartners, setLivePartners] = useState<any[]>([]);

  const stats = {
    total: applications.length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    pending: applications.filter((a) => a.status === "pending").length,
  };

  // Fetch partners from backend using user location
  useEffect(() => {
    const fetchPartners = async () => {
      let lat = user?.coordinates?.lat;
      let lng = user?.coordinates?.lng;

      // If no stored coordinates, get current location
      if (!lat || !lng) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        } catch { /* use mock */ }
      }

      if (lat && lng) {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/recommendations`, {
            lat,
            lng,
            category: user?.category || "",
          });
          setLivePartners(res.data || []);
        } catch {
          // Fall back to static mock data with SAW
          const mockWithScore = applySAW(PARTNERS);
          setLivePartners(mockWithScore);
        }
      } else {
        const mockWithScore = applySAW(PARTNERS);
        setLivePartners(mockWithScore);
      }
      setIsSearching(false);
    };

    fetchPartners();
  }, [user?.coordinates]);

  const top3 = useMemo(() => livePartners.slice(0, 3), [livePartners]);

  const displayName = user?.businessName || user?.name || "Supplier";
  const avatarText = displayName.substring(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Selamat datang,</Text>
              <Text style={styles.userName}>{displayName} 👋</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => navigation.navigate("Applications")}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={20} color="#94A3B8" />
                {applications.length > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{Math.min(applications.length, 9)}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {user?.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("file")) ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarText}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            {[
              { label: "Total Lamaran", value: stats.total, color: "#3B82F6", icon: "send" },
              { label: "Diterima", value: stats.accepted, color: "#00D084", icon: "checkmark-circle" },
              { label: "Proses", value: stats.pending, color: "#F59E0B", icon: "time" },
            ].map((stat) => (
              <TouchableOpacity
                key={stat.label}
                style={styles.statCard}
                onPress={() => navigation.navigate("Applications")}
                activeOpacity={0.75}
              >
                <Ionicons name={stat.icon as any} size={16} color={stat.color} style={{ marginBottom: 6 }} />
                <Text style={[styles.statValue, { color: "#F1F5F9" }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={[styles.featureCard, { borderColor: "rgba(59,130,246,0.2)", backgroundColor: "rgba(59,130,246,0.08)" }]}
            onPress={() => navigation.navigate("Tabs", { screen: "Catalog" } as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.featureTitle, { color: "#60A5FA" }]}>Kelola{"\n"}Katalog</Text>
            <View style={[styles.featureBadge, { backgroundColor: "rgba(59,130,246,0.2)" }]}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#93C5FD" }}>Update Produk</Text>
            </View>
            <Ionicons name="cube" size={90} color="rgba(59,130,246,0.12)" style={styles.featureIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureCard, { borderColor: "rgba(0,208,132,0.2)", backgroundColor: "rgba(0,208,132,0.08)" }]}
            onPress={() => navigation.navigate("Tabs", { screen: "Explore" } as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.featureTitle, { color: "#00D084" }]}>Cari{"\n"}Mitra B2B</Text>
            <View style={[styles.featureBadge, { backgroundColor: "rgba(0,208,132,0.2)" }]}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#6EE7B7" }}>Gunakan Peta</Text>
            </View>
            <Ionicons name="compass" size={90} color="rgba(0,208,132,0.12)" style={styles.featureIcon} />
          </TouchableOpacity>
        </View>

        {/* AI Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate("Tabs", { screen: "Explore" } as any)}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.aiLabel}>⚡ AI RECOMMENDATION</Text>
            <Text style={styles.aiTitle}>
              {isSearching ? "Memindai Area..." : `${livePartners.length} Mitra Ditemukan`}
            </Text>
          </View>
          <View style={styles.aiBtnCircle}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
          <Ionicons name="flash" size={100} color="rgba(255,255,255,0.08)" style={styles.aiBg} />
        </TouchableOpacity>

        {/* Top Partners */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Mitra Prioritas</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: "Explore" } as any)}>
              <Text style={styles.seeAll}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {isSearching ? (
            <Text style={styles.emptyText}>Mencari mitra di area Anda...</Text>
          ) : top3.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada mitra di lokasi Anda.</Text>
          ) : (
            top3.map((partner, idx) => (
              <TouchableOpacity
                key={partner.id}
                style={styles.partnerRow}
                onPress={() => {
                  // Navigate to PartnerDetail — use mock data if it's a live partner without full details
                  const fullPartner = PARTNERS.find((p) => p.id === partner.id) || partner;
                  navigation.navigate("PartnerDetail", { partner: fullPartner });
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.rankBadge, { backgroundColor: idx === 0 ? "rgba(0,208,132,0.15)" : "rgba(255,255,255,0.05)" }]}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: idx === 0 ? "#00D084" : "#4B5563" }}>
                    #{idx + 1}
                  </Text>
                </View>
                <Image source={{ uri: partner.image }} style={styles.partnerImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerName} numberOfLines={1}>{partner.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={{ fontSize: 11, color: "#F59E0B", fontWeight: "600" }}>{partner.rating}</Text>
                    <Text style={{ fontSize: 11, color: "#4B5563" }}>•</Text>
                    <Ionicons name="location" size={11} color="#64748B" />
                    <Text style={{ fontSize: 11, color: "#64748B" }}>{partner.distance} km</Text>
                  </View>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: (partner.sawScore || 0) >= 80 ? "rgba(0,208,132,0.15)" : "rgba(59,130,246,0.15)" }]}>
                  <Text style={[styles.scoreText, { color: (partner.sawScore || 0) >= 80 ? "#00D084" : "#60A5FA" }]}>
                    {partner.sawScore || 0}
                  </Text>
                  <Text style={styles.scoreLabel}>AI Score</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  scroll: { flex: 1 },
  headerSection: {
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20,
    backgroundColor: "rgba(0,208,132,0.04)",
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 13, color: "#64748B" },
  userName: { fontSize: 20, fontWeight: "700", color: "#F1F5F9", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center",
  },
  notifBadge: {
    position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: "#EF4444", justifyContent: "center", alignItems: "center",
  },
  notifBadgeText: { fontSize: 9, color: "white", fontWeight: "700" },
  avatar: {
    width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center",
    backgroundColor: "#00D084",
  },
  avatarImage: { width: 44, height: 44, borderRadius: 14 },
  avatarText: { fontSize: 16, fontWeight: "700", color: "white" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 12, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 10, color: "#64748B", marginTop: 2 },
  featureGrid: { flexDirection: "row", gap: 14, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  featureCard: {
    flex: 1, borderRadius: 28, borderWidth: 1, padding: 20, height: 180, overflow: "hidden",
    justifyContent: "space-between",
  },
  featureTitle: { fontSize: 18, fontWeight: "800" },
  featureBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  featureIcon: { position: "absolute", bottom: -25, right: -25 },
  aiBanner: {
    marginHorizontal: 20, marginTop: 20, marginBottom: 4, borderRadius: 24, padding: 20,
    backgroundColor: "#00D084", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    overflow: "hidden",
  },
  aiLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "700", marginBottom: 4 },
  aiTitle: { fontSize: 16, fontWeight: "800", color: "white" },
  aiBtnCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  aiBg: { position: "absolute", right: -20, bottom: -20 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F1F5F9" },
  seeAll: { fontSize: 12, color: "#00D084", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#64748B", fontSize: 13, paddingVertical: 20 },
  partnerRow: {
    flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 18, padding: 12, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  rankBadge: { width: 28, height: 28, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  partnerImg: { width: 52, height: 52, borderRadius: 12 },
  partnerName: { fontSize: 13, fontWeight: "600", color: "#F1F5F9" },
  scoreBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center" },
  scoreText: { fontSize: 14, fontWeight: "700" },
  scoreLabel: { fontSize: 9, color: "#4B5563", marginTop: 2 },
});
