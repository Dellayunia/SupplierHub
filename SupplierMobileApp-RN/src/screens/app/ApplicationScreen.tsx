import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, SafeAreaView, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { Application } from "../../data/mockData";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: "time-outline" },
  accepted: { label: "Diterima", color: "#00D084", bg: "rgba(0,208,132,0.12)", icon: "checkmark-circle-outline" },
  rejected: { label: "Ditolak", color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: "close-circle-outline" },
};

export default function ApplicationScreen() {
  const navigation = useNavigation();
  const { applications } = useApp();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lamaran Saya</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{applications.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {applications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={60} color="#2D3748" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#4B5563", marginTop: 16 }}>
              Belum Ada Lamaran
            </Text>
            <Text style={{ fontSize: 13, color: "#374151", marginTop: 8, textAlign: "center", lineHeight: 20 }}>
              Mulai cari mitra bisnis di tab Peta Mitra dan ajukan kerja sama
            </Text>
          </View>
        ) : (
          applications.map((app) => {
            const st = STATUS_CONFIG[app.status];
            return (
              <TouchableOpacity key={app.id} style={styles.card} onPress={() => setSelectedApp(app)} activeOpacity={0.8}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: app.partnerImage }} style={styles.partnerImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partnerName} numberOfLines={1}>{app.partnerName}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <View style={[styles.categoryBadge, { backgroundColor: "rgba(59,130,246,0.12)" }]}>
                        <Text style={{ fontSize: 11, color: "#60A5FA", fontWeight: "600" }}>{app.partnerCategory}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: "#4B5563" }}>{app.date}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Ionicons name={st.icon as any} size={12} color={st.color} />
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <Text style={styles.messageText} numberOfLines={3}>{app.message}</Text>

                {/* Attached Products */}
                {app.attachedProducts && app.attachedProducts.length > 0 && (
                  <View style={styles.productsSection}>
                    <Text style={styles.productsLabel}>Katalog yang Dilampirkan ({app.attachedProducts.length}):</Text>
                    <View style={{ gap: 10, marginTop: 12 }}>
                      {app.attachedProducts.map((p) => (
                        <View key={p.id} style={styles.catalogItemRow}>
                          {p.photo ? (
                            <Image source={{ uri: p.photo }} style={styles.catalogItemImg} />
                          ) : (
                            <View style={styles.catalogItemIcon}><Ionicons name="cube" size={20} color="#60A5FA" /></View>
                          )}
                          <View style={{ flex: 1, justifyContent: "center" }}>
                            <Text style={styles.catalogItemName} numberOfLines={1}>{p.name}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <View style={styles.catalogPriceBadge}>
                                <Text style={styles.catalogPriceText}>Rp {p.price}</Text>
                              </View>
                              {p.unit ? <Text style={{ fontSize: 10, color: "#64748B" }}>/ {p.unit}</Text> : null}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal visible={!!selectedApp} animationType="slide" presentationStyle="pageSheet">
        {selectedApp && (
          <SafeAreaView style={[styles.container, { backgroundColor: "#161B2C" }]}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedApp(null)}>
                <Ionicons name="chevron-down" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Lamaran</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <Image source={{ uri: selectedApp.partnerImage }} style={{ width: 64, height: 64, borderRadius: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#F1F5F9" }}>{selectedApp.partnerName}</Text>
                  <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Terkirim: {selectedApp.date}</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { alignSelf: "flex-start", backgroundColor: STATUS_CONFIG[selectedApp.status].bg, marginBottom: 24, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 }]}>
                <Ionicons name={STATUS_CONFIG[selectedApp.status].icon as any} size={16} color={STATUS_CONFIG[selectedApp.status].color} />
                <Text style={[styles.statusText, { fontSize: 13, color: STATUS_CONFIG[selectedApp.status].color }]}>
                  Status: {STATUS_CONFIG[selectedApp.status].label}
                </Text>
              </View>

              {/* Proposal Text */}
              <View style={styles.detailBox}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 12 }}>DRAF PROPOSAL AI</Text>
                <Text style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 24 }}>{selectedApp.message}</Text>
              </View>

              {/* Attached Products */}
              {selectedApp.attachedProducts && selectedApp.attachedProducts.length > 0 && (
                <View style={[styles.detailBox, { marginTop: 16 }]}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 12 }}>
                    PRODUK DILAMPIRKAN ({selectedApp.attachedProducts.length})
                  </Text>
                  <View style={{ gap: 10 }}>
                    {selectedApp.attachedProducts.map((p) => (
                      <View key={p.id} style={[styles.catalogItemRow, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
                        {p.photo ? (
                          <Image source={{ uri: p.photo }} style={styles.catalogItemImg} />
                        ) : (
                          <View style={styles.catalogItemIcon}><Ionicons name="cube" size={20} color="#60A5FA" /></View>
                        )}
                        <View style={{ flex: 1, justifyContent: "center" }}>
                          <Text style={styles.catalogItemName} numberOfLines={1}>{p.name}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <View style={styles.catalogPriceBadge}>
                              <Text style={styles.catalogPriceText}>Rp {p.price}</Text>
                            </View>
                            {p.unit ? <Text style={{ fontSize: 10, color: "#64748B" }}>/ {p.unit}</Text> : null}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#F1F5F9", flex: 1 },
  countBadge: {
    width: 28, height: 28, borderRadius: 10, backgroundColor: "rgba(0,208,132,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  countText: { fontSize: 13, fontWeight: "700", color: "#00D084" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 32 },
  card: {
    borderRadius: 20, padding: 16, marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  partnerImg: { width: 52, height: 52, borderRadius: 14 },
  partnerName: { fontSize: 14, fontWeight: "700", color: "#F1F5F9" },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginVertical: 12 },
  messageText: { fontSize: 12, color: "#94A3B8", lineHeight: 20 },
  productsSection: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)",
  },
  productsLabel: { fontSize: 12, fontWeight: "700", color: "#F1F5F9" },
  catalogItemRow: {
    flexDirection: "row", gap: 12, padding: 10, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  catalogItemImg: { width: 44, height: 44, borderRadius: 10 },
  catalogItemIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.1)", justifyContent: "center", alignItems: "center" },
  catalogItemName: { fontSize: 13, fontWeight: "700", color: "#F1F5F9" },
  catalogPriceBadge: { backgroundColor: "rgba(0,208,132,0.12)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  catalogPriceText: { fontSize: 11, fontWeight: "700", color: "#00D084" },
  detailBox: {
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
});
