import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, FlatList, Image, Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { useApp } from "../../context/AppContext";
import { PARTNERS, Partner } from "../../data/mockData";
import { applySAW } from "../../utils/algorithms";
import { AppStackParamList } from "../../navigation/AppStack";

type Nav = StackNavigationProp<AppStackParamList>;

const BACKEND_URL = "http://172.20.10.2:3000"; // IP PC di jaringan hotspot
const CATEGORIES = ["Semua", "Cafe", "Toko", "Bengkel", "Restoran", "Bakeri", "Hotel"];
const { width } = Dimensions.get("window");

export default function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useApp();
  const [mode, setMode] = useState<"map" | "list">("map");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: user?.coordinates?.lat || -6.2,
    longitude: user?.coordinates?.lng || 106.816,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    const load = async () => {
      let lat = user?.coordinates?.lat;
      let lng = user?.coordinates?.lng;

      if (!lat || !lng) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            setRegion((r) => ({ ...r, latitude: lat!, longitude: lng! }));
          }
        } catch { /* skip */ }
      } else {
        setRegion((r) => ({ ...r, latitude: lat!, longitude: lng! }));
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
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = partners;
    if (selectedCategory !== "Semua")
      list = list.filter((p) => p.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
    if (search)
      list = list.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [partners, selectedCategory, search]);

  const handlePartnerPress = (partner: any) => {
    const full = PARTNERS.find((p) => p.id === partner.id) || partner;
    navigation.navigate("PartnerDetail", { partner: full });
  };

  return (
    <View style={styles.container}>
      {/* Search + Filter Row */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color="#4B5563" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari mitra bisnis..."
            placeholderTextColor="#4B5563"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={16} color="#00D084" />
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, selectedCategory === cat && { color: "white" }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          {(["map", "list"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
              activeOpacity={0.8}
            >
              <Ionicons name={m === "map" ? "map-outline" : "list-outline"} size={14} color={mode === m ? "white" : "#4B5563"} />
              <Text style={[styles.modeBtnText, mode === m && { color: "white" }]}>
                {m === "map" ? "Peta" : "List"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {mode === "map" ? (
          <>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation
            >
              {filtered.map((p) =>
                p.lat && p.lng ? (
                  <Marker
                    key={p.id}
                    coordinate={{ latitude: p.lat, longitude: p.lng }}
                    title={p.name}
                    description={p.category}
                    onPress={() => setSelectedId(p.id)}
                    pinColor={selectedId === p.id ? "#00D084" : "#3B82F6"}
                  />
                ) : null
              )}
            </MapView>

            {/* Partner list below map */}
            <View style={styles.listSection}>
              <Text style={styles.listHeader}>
                ⭐ Mitra Prioritas{" "}
                <Text style={{ color: "#4B5563", fontSize: 12 }}>({filtered.length})</Text>
              </Text>
              {filtered.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} isActive={selectedId === partner.id} onPress={() => handlePartnerPress(partner)} />
              ))}
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
              {filtered.length} mitra — diurutkan berdasarkan AI Score
            </Text>
            {filtered.map((partner, idx) => (
              <PartnerCardLarge key={partner.id} partner={partner} idx={idx} onPress={() => handlePartnerPress(partner)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PartnerCard({ partner, isActive, onPress }: { partner: any; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.partnerRow, isActive && styles.partnerRowActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: partner.image }} style={styles.partnerImg} />
      <View style={{ flex: 1 }}>
        <Text style={styles.partnerName} numberOfLines={1}>{partner.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={{ fontSize: 11, color: "#F59E0B", fontWeight: "600" }}>{partner.rating}</Text>
          <Text style={{ fontSize: 11, color: "#2D3748" }}>•</Text>
          <Text style={{ fontSize: 11, color: "#64748B" }}>{partner.distance} km • {partner.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PartnerCardLarge({ partner, idx, onPress }: { partner: any; idx: number; onPress: () => void }) {
  const score = partner.sawScore || 0;
  return (
    <TouchableOpacity style={styles.partnerRowLarge} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: partner.image }} style={styles.partnerImgLarge} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.partnerName, { fontSize: 14, fontWeight: "700" }]}>{partner.name}</Text>
            <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={11} color={s <= Math.floor(partner.rating) ? "#F59E0B" : "#2D3748"} />
              ))}
              <Text style={{ fontSize: 11, color: "#94A3B8", marginLeft: 4 }}>
                {partner.rating} ({partner.reviewCount || 0})
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Ionicons name="location-outline" size={11} color="#4B5563" />
              <Text style={{ fontSize: 11, color: "#64748B" }}>{partner.distance} km • {partner.category}</Text>
            </View>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: score >= 80 ? "rgba(0,208,132,0.12)" : "rgba(59,130,246,0.12)" }]}>
            <Text style={[styles.scoreText, { color: score >= 80 ? "#00D084" : "#60A5FA" }]}>{score}</Text>
            <Text style={{ fontSize: 8, color: "#4B5563", textAlign: "center" }}>Score</Text>
          </View>
        </View>
        {partner.description && (
          <Text style={{ fontSize: 11, color: "#4B5563", marginTop: 6 }} numberOfLines={1}>{partner.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  topBar: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10, backgroundColor: "#0B0F1A", zIndex: 10 },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#F1F5F9" },
  filterBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(0,208,132,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  chip: {
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: { backgroundColor: "#00D084", borderColor: "transparent" },
  chipText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  modeToggle: {
    flexDirection: "row", borderRadius: 16, padding: 4,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginTop: 10,
  },
  modeBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, borderRadius: 12, paddingVertical: 8 },
  modeBtnActive: { backgroundColor: "#00D084" },
  modeBtnText: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  map: { width: "100%", height: 320 },
  listSection: { paddingHorizontal: 16, paddingTop: 16 },
  listHeader: { fontSize: 14, fontWeight: "700", color: "#F1F5F9", marginBottom: 12 },
  partnerRow: {
    flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 12, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  partnerRowActive: { backgroundColor: "rgba(0,208,132,0.08)", borderColor: "rgba(0,208,132,0.3)" },
  partnerImg: { width: 50, height: 50, borderRadius: 12 },
  partnerName: { fontSize: 13, fontWeight: "600", color: "#F1F5F9" },
  partnerRowLarge: {
    flexDirection: "row", gap: 12, borderRadius: 18, padding: 12, marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  partnerImgLarge: { width: 72, height: 72, borderRadius: 14 },
  scoreBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center" },
  scoreText: { fontSize: 15, fontWeight: "700" },
});
