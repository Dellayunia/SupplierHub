import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { PARTNERS } from "../../data/mockData";
import { applySAW } from "../../utils/algorithms";
import { useApp } from "../../context/AppContext";
import { AppStackParamList } from "../../navigation/AppStack";

type Nav = StackNavigationProp<AppStackParamList>;
const BACKEND_URL = "http://172.20.10.2:3000"; // IP PC di jaringan hotspot

export default function RecommendationScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useApp();
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let lat = user?.coordinates?.lat;
      let lng = user?.coordinates?.lng;
      if (!lat || !lng) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const pos = await Location.getCurrentPositionAsync({});
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        } catch { /* skip */ }
      }
      try {
        const res = await axios.post(`${BACKEND_URL}/api/recommendations`, {
          lat: lat || -6.2,
          lng: lng || 106.816,
          category: user?.category || "",
        });
        setPartners(res.data || []);
      } catch {
        setPartners(applySAW(PARTNERS));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>⚡ Rekomendasi AI</Text>
          <Text style={styles.headerSub}>Diurutkan berdasarkan Algoritma SAW</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#00D084" size="large" />
          <Text style={styles.loadingText}>Memproses rekomendasi...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={16} color="#60A5FA" />
            <Text style={styles.infoText}>
              {partners.length} mitra ditemukan — Skor dihitung dari jarak (60%) dan rating (40%)
            </Text>
          </View>

          {partners.map((partner, idx) => {
            const score = partner.sawScore || 0;
            const isTop = idx < 3;
            return (
              <TouchableOpacity
                key={partner.id}
                style={[styles.card, isTop && styles.cardTop]}
                onPress={() => {
                  const full = PARTNERS.find((p) => p.id === partner.id) || partner;
                  navigation.navigate("PartnerDetail", { partner: full });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <Image source={{ uri: partner.image }} style={styles.img} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={{ fontSize: 12, color: "#F59E0B", fontWeight: "600" }}>{partner.rating}</Text>
                    <Text style={{ fontSize: 12, color: "#4B5563" }}>•</Text>
                    <Ionicons name="location" size={12} color="#64748B" />
                    <Text style={{ fontSize: 12, color: "#64748B" }}>{partner.distance} km</Text>
                  </View>
                  <Text style={styles.category}>{partner.category}</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: score >= 80 ? "rgba(0,208,132,0.15)" : score >= 60 ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)" }]}>
                  <Text style={[styles.scoreText, { color: score >= 80 ? "#00D084" : score >= 60 ? "#60A5FA" : "#F59E0B" }]}>{score}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#F1F5F9" },
  headerSub: { fontSize: 11, color: "#64748B", marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 14, color: "#64748B", marginTop: 16 },
  infoBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, padding: 12, marginBottom: 16,
    backgroundColor: "rgba(59,130,246,0.08)", borderWidth: 1, borderColor: "rgba(59,130,246,0.15)",
  },
  infoText: { fontSize: 12, color: "#94A3B8", flex: 1, lineHeight: 18 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 18, padding: 12, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  cardTop: { borderColor: "rgba(0,208,132,0.2)", backgroundColor: "rgba(0,208,132,0.04)" },
  rankCircle: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(0,208,132,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  rankText: { fontSize: 12, fontWeight: "700", color: "#00D084" },
  img: { width: 56, height: 56, borderRadius: 14 },
  name: { fontSize: 13, fontWeight: "700", color: "#F1F5F9" },
  category: {
    fontSize: 11, color: "#64748B", marginTop: 4, backgroundColor: "rgba(255,255,255,0.05)",
    alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  scoreBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center" },
  scoreText: { fontSize: 16, fontWeight: "800" },
  scoreLabel: { fontSize: 9, color: "#4B5563", marginTop: 2 },
});
